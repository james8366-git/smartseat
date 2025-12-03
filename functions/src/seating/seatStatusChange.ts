// seatStatusChange.ts — FINAL v2 (A안 + firstStudyAt + stats.daily 지원)
// ✔ 프론트(timer.ts)가 시간 누적 담당
// ✔ 서버는 좌석 상태 변경 감지 + firstStudyAt 기록 + 보조 정보만 반영
// ✔ studylogId 있는 경우 studylogs/{id} 에 보조 필드 저장

import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

export const seatStatusChange = onDocumentUpdated(
  {
    document: "seats/{seatId}",
    region: "asia-northeast3",
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const seatId = event.params.seatId;

    if (!before || !after) return;

    const beforeStatus = before.status ?? "none";
    const afterStatus = after.status ?? "none";

    const now = admin.firestore.Timestamp.now();
    const seatRef = event.data?.after.ref;
    if (!seatRef) return;

    // ----------------------------------------------------------
    // ★ CHANGED: studylogs/{id} 에서 uid 가져오기
    // ----------------------------------------------------------
    const studylogId = after.studylogId;
    let uid: string | null = null;
    let logRef = null;

    if (studylogId) {
      logRef = db.collection("studylogs").doc(studylogId);
      const logSnap = await logRef.get();

      if (logSnap.exists) {
        uid = logSnap.data()?.uid ?? null;
      }
    }

    /* ==============================================================
     * Case 1) empty/none/object → occupied  (착석)
     * =============================================================*/
    if (afterStatus === "occupied" && beforeStatus !== "occupied") {
      logger.info(`seat ${seatId}: -> occupied`);

      // seats 업데이트
      await seatRef.update({
        isStudying: true,
        occupiedAt: now,
      });

      // studylog 보조 필드 업데이트
      if (logRef) {
        await logRef.set(
          {
            occupiedAt: now,
            lastSeated: now,
          },
          { merge: true }
        );
      }

      // ----------------------------------------------------------
      // ★ CHANGED: stats/{uid}/daily/{date} → firstStudyAt 기록
      // ----------------------------------------------------------
      if (uid) {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const dateKey = `${yyyy}-${mm}-${dd}`;

        const dailyRef = db
          .collection("stats")
          .doc(uid)
          .collection("daily")
          .doc(dateKey);

        const dailySnap = await dailyRef.get();

        // firstStudyAt이 없는 경우에만 기록
        if (!dailySnap.exists || !dailySnap.data()?.firstStudyAt) {
          await dailyRef.set(
            {
              firstStudyAt: now,
            },
            { merge: true }
          );
        }
      }

      return;
    }

    /* ==============================================================
     * Case 2) occupied → empty/none/object  (이탈)
     * =============================================================*/
    if (beforeStatus === "occupied" && afterStatus !== "occupied") {
      logger.info(`seat ${seatId}: occupied -> ${afterStatus}`);

      await seatRef.update({
        isStudying: false,
        lastSeated: now,
        occupiedAt: null,
      });

      if (logRef) {
        await logRef.set(
          {
            lastSeated: now,
          },
          { merge: true }
        );
      }

      // 서버는 절대 study time 누적하지 않는다!
      return;
    }
  }
);
