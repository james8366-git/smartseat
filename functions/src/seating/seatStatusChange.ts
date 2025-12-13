// seatStatusChange.ts — FINAL v6 FIXED
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

function getKSTDateIdFromTimestamp(ts: admin.firestore.Timestamp) {
  const kst = new Date(ts.toDate().getTime() + 9 * 60 * 60 * 1000);

  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, "0");
  const dd = String(kst.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}


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

    logger.info("before.status", before.status);
    logger.info("after.status", after.status);


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
        lastFlushedAt: now,
      });

      // firstStudyAt 기록
      const uid = after.uid;
      logger.info(uid);
      if (uid) {
        const dateId = getKSTDateIdFromTimestamp(now);


        const statRef = db
          .collection("stats")
          .doc(uid)
          .collection("daily")
          .doc(dateId);

        const statSnap = await statRef.get();
        logger.info(statSnap);
        

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

    if (!before.seatStudyStart) {
        await seatRef.update({ seatStudyStart: now });
            logger.info(
            `✔ seat ${seatId} seatStudyStart 최초 저장됨: ${now.toDate()}`
        );
    }

  }
);
