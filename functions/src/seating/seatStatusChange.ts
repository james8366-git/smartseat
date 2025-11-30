import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

/**
 * 좌석 상태 변화 감지 (empty ⇄ occupied)
 * --------------------------------------------------------
 * ✔ 프론트 flush()는 과목시간 저장
 * ✔ 서버는 studylog 기록(입실/퇴실/총시간)만 관리
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

    const seatRef = afterSnap.ref;
    if (!seatRef) return;

    const now = admin.firestore.Timestamp.now();
    const seatId = event.params.seatId;

    // 🔥 좌석 문서 기준 (student_number 가 uid 역할)
    const uid = after.student_number as string | undefined;
    const studylogId = after.studylogId as string | undefined;

    // uid or studylogId 없으면 종료
    if (!uid || !studylogId) {
      logger.warn(`⚠ uid 또는 studylogId 없음 → uid=${uid}, studylogId=${studylogId}`);
      return;
    }

    const studylogRef = db.collection("studylogs").doc(studylogId);

    /* ===========================
     * 1) empty → occupied (착석)
     * =========================== */
    if (before.status === "empty" && after.status === "occupied") {
      logger.info(`🟢 착석 감지 seat=${seatId} user=${uid}`);

      await seatRef.update({
        isStudying: true,
        occupiedAt: now,
        lastSeated: now,
      });

      await studylogRef.set(
        {
          seatId,
          occupiedAt: now,
          lastSeated: now,
        },
        { merge: true }
      );

      return;
    }

    /* ===========================
     * 2) occupied → empty (자리비움)
     * =========================== */
    if (before.status === "occupied" && after.status === "empty") {
      logger.info(`🔴 이석 감지 seat=${seatId} user=${uid}`);

      await seatRef.update({
        isStudying: false,
        lastSeated: now,
      });

      const logSnap = await studylogRef.get();
      if (!logSnap.exists) return;

      const log = logSnap.data() as any;
      const occupiedAt = log.occupiedAt as admin.firestore.Timestamp | undefined;

      if (!occupiedAt) {
        logger.warn(`⚠ occupiedAt 없음 studylogId=${studylogId}`);
        return;
      }

      // 사용시간 계산
      const diffSec = Math.floor(
        (now.toMillis() - occupiedAt.toMillis()) / 1000
      );

      logger.info(`⏱ 이용시간 ${diffSec}초 (seat=${seatId}, user=${uid})`);

      await studylogRef.update({
        totalTime: admin.firestore.FieldValue.increment(diffSec),
        lastSeated: now,
      });

      return;
    }
  }
);
