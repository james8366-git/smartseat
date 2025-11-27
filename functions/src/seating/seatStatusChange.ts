import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * 좌석 상태 변화 감지 (v2)
 * empty → occupied : 착석
 * occupied → empty : 자리비움
 */
export const seatStatusChange = onDocumentUpdated(
  {
    document: "seats/{seatId}",
    region: "asia-northeast3",
  },
  async (event) => {
    const before = event.data?.before.data() as any;
    const after  = event.data?.after.data() as any;
    const seatId = event.params.seatId;

    if (!before || !after) return;

    const now = admin.firestore.Timestamp.now();

    // ⭐ 모든 로직은 studylogId를 기준으로 동작
    const studylogId = after.studylogId as string | undefined;
    if (!studylogId) {
      logger.warn(`seat=${seatId} 에 studylogId 없음. 로그 업데이트 생략.`);
      return;
    }

    const studylogRef = db.collection("studylogs").doc(studylogId);

    /* ------------------------------
       1) 착석 감지 (empty → occupied)
    ------------------------------ */
    if (before.status === "empty" && after.status === "occupied") {
      // 좌석 문서 상태 업데이트
      await event.data?.after.ref.update({
        occupiedAt: now,
        lastChecked: now,
        isStudying: true,
      });

      // studylog 업데이트 (착석 시간 기록 / 재착석이면 덮어쓰기)
      await studylogRef.set(
        {
          seatId,
          occupiedAt: now,
          lastSeated: now,
        },
        { merge: true }
      );

      logger.log(`📘 착석 처리 seat=${seatId}, studylogId=${studylogId}`);
      return;
    }

    /* ------------------------------
       2) 자리 비움 감지 (occupied → empty)
    ------------------------------ */
    if (before.status === "occupied" && after.status === "empty") {
      // 좌석 문서 상태 업데이트
      await event.data?.after.ref.update({
        lastSeated: now,
        lastChecked: now,
        isStudying: false,
      });

      // studylog 가져오기
      const logSnap = await studylogRef.get();
      if (!logSnap.exists) {
        logger.warn(
          `자리비움 이벤트지만 studylog 없음 seat=${seatId}, studylogId=${studylogId}`
        );
        return;
      }

      const log = logSnap.data() as any;
      const occupiedAt = log.occupiedAt as admin.firestore.Timestamp | undefined;
      const total = (log.totalTime as number | undefined) ?? 0;

      if (occupiedAt) {
        const diff = now.toMillis() - occupiedAt.toMillis(); // ms 경과 시간

        await studylogRef.update({
          totalTime: total + diff,
          lastSeated: now,
        });

        logger.log(
          `⏱ 총 공부 시간 업데이트 seat=${seatId}, studylogId=${studylogId} / +${diff}ms / total=${total + diff}ms`
        );
      } else {
        logger.warn(
          `occupiedAt 없음 → 시간 계산 불가 seat=${seatId}, studylogId=${studylogId}`
        );
      }

      return;
    }

    return;
  }
);
