// seatStatusChange.ts — FINAL v6 FIXED
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

    /* ---------------------------------------
     * empty/none/object → occupied
     * --------------------------------------- */
    if (afterStatus === "occupied" && beforeStatus !== "occupied") {
      logger.info(`seat ${seatId}: -> occupied`);

      await seatRef.update({
        isStudying: true,
        occupiedAt: now,
      });

      // firstStudyAt 기록
      const uid = after.uid;
      if (uid) {
        const yyyy = now.toDate().getFullYear();
        const mm = String(now.toDate().getMonth() + 1).padStart(2, "0");
        const dd = String(now.toDate().getDate()).padStart(2, "0");
        const dateId = `${yyyy}-${mm}-${dd}`;

        const statRef = db
          .collection("stats")
          .doc(uid)
          .collection("daily")
          .doc(dateId);

        const statSnap = await statRef.get();

        if (!statSnap.exists || !statSnap.data()?.firstStudyAt) {
          await statRef.set(
            {
              firstStudyAt: now,
            },
            { merge: true }
          );
        }
      }

      return;
    }

    /* ---------------------------------------
     * occupied → empty/none/object
     * --------------------------------------- */
    if (beforeStatus === "occupied" && afterStatus !== "occupied") {
      logger.info(`seat ${seatId}: occupied -> ${afterStatus}`);

      await seatRef.update({
        isStudying: false,
        lastSeated: now,
        occupiedAt: null,
      });

      return;
    }
  }
);
