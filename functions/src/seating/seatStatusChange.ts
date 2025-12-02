// seatStatusChange.ts — FINAL v5
// ✔ 타이머는 프론트 담당
// ✔ 좌석 상태 + studylog 상태만 정확히 기록

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

    const studylogId = after.studylogId;
    const logRef =
      studylogId && db.collection("studylogs").doc(studylogId);

    /* -------------------------------
     * empty/none/object → occupied
     * ------------------------------- */
    if (afterStatus === "occupied" && beforeStatus !== "occupied") {
      logger.info(`seat ${seatId}: -> occupied`);

      await seatRef.update({
        isStudying: true,
        occupiedAt: now,
      });

      if (studylogId) {
        await logRef!.set(
          {
            occupiedAt: now,
            lastSeated: now,
          },
          { merge: true }
        );
      }

      return;
    }

    /* -------------------------------
     * occupied → empty/none/object
     * ------------------------------- */
    if (beforeStatus === "occupied" && afterStatus !== "occupied") {
      logger.info(`seat ${seatId}: occupied -> ${afterStatus}`);

      await seatRef.update({
        isStudying: false,
        lastSeated: now,
        occupiedAt: null,
      });

      if (studylogId) {
        await logRef!.set(
          {
            lastSeated: now,
          },
          { merge: true }
        );
      }

      return;
    }
  }
);
