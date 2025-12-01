import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

/**
 * 좌석 상태 변화 감지 (occupied 중심)
 * --------------------------------------------------------
 * ✔ 클라이언트 flush()는 과목 시간 업데이트만 수행
 * ✔ 서버는 studylog.totalTime + 입·퇴실 시각 기록만 관리
 * --------------------------------------------------------
 */
export const seatStatusChange = onDocumentUpdated(
  {
    document: "seats/{seatId}",
    region: "asia-northeast3",
  },
  async (event) => {
    const beforeSnap = event.data?.before;
    const afterSnap = event.data?.after;

    if (!beforeSnap || !afterSnap) return;

    const before = beforeSnap.data() as any;
    const after = afterSnap.data() as any;

    const seatId = event.params.seatId;
    const seatRef = afterSnap.ref;

    const now = admin.firestore.Timestamp.now();

    // uid(studying user) + studylogId
    const uid = after.student_number as string | undefined;
    const studylogId = after.studylogId as string | undefined;

    // 유저가 없는 좌석 변화면 무시
    if (!uid || !studylogId) return;

    const studylogRef = db.collection("studylogs").doc(studylogId);

    /* ----------------------------------------------------
     * 1) occupied 상태로 새롭게 진입한 경우 (착석)
     * before occupied X → after occupied O
     * ---------------------------------------------------- */
    if (before.status !== "occupied" && after.status === "occupied") {
      logger.info(`🟢 착석 감지 seat=${seatId} user=${uid}`);

      const payload = {
        seatId,
        occupiedAt: now, // 새 착석 시각
        lastSeated: now,
      };

      // 좌석 문서 갱신
      await seatRef.update({
        isStudying: true,
        occupiedAt: now,
        lastSeated: now,
      });

      // studylog 갱신
      await studylogRef.set(payload, { merge: true });

      return;
    }

    /* ----------------------------------------------------
     * 2) occupied 상태에서 벗어나는 경우 (이석 / 반납)
     * before occupied O → after occupied X
     * ---------------------------------------------------- */
    if (before.status === "occupied" && after.status !== "occupied") {
      logger.info(`🔴 이석 감지 seat=${seatId} user=${uid}`);

      // 좌석 갱신
      await seatRef.update({
        isStudying: false,
        lastSeated: now,
      });

      // studylog 조회
      const logSnap = await studylogRef.get();
      if (!logSnap.exists) return;

      const log = logSnap.data() as any;
      const occupiedAt = log.occupiedAt as admin.firestore.Timestamp | undefined;

      if (!occupiedAt) {
        logger.warn(`⚠ occupiedAt 없음 studylogId=${studylogId}`);
        return;
      }

      // 이번 세션 사용시간 계산
      const diffSec = Math.floor(
        (now.toMillis() - occupiedAt.toMillis()) / 1000
      );

      logger.info(
        `⏱ 좌석 이용시간 ${diffSec}초 seat=${seatId} user=${uid}`
      );

      // 누적 totalTime 증가 + 마지막 이석 시각 갱신
      await studylogRef.update({
        totalTime: admin.firestore.FieldValue.increment(diffSec),
        lastSeated: now,
      });

      return;
    }
  }
);
