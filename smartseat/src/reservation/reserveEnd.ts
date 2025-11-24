import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ⏱ 예약 종료 (Cron: every 1 minute)
export const reserveEnd = onSchedule("every 1 minutes", async (event) => {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const current = kst.toTimeString().slice(0, 5);

  logger.log("현재시간(KST):", current);

  const seatsSnap = await db
    .collection("seats")
    .where("reservedEd", "==", current)
    .get();

  for (const doc of seatsSnap.docs) {
    const seatId = doc.id;
    const data = doc.data();
    const seatLabel = data.seatLabel;

    // 🔹 studylogs 업데이트
    const logsSnap = await db
      .collection("studylogs")
      .where("seatLabel", "==", seatLabel)
      .orderBy("occupiedAt", "desc")
      .limit(1)
      .get();

    if (!logsSnap.empty) {
      await logsSnap.docs[0].ref.update({
        lastSeated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // 🔹 users seatId 제거
    const userSnap = await db
      .collection("users")
      .where("seatLabel", "==", seatLabel)
      .limit(1)
      .get();

    if (!userSnap.empty) {
      await userSnap.docs[0].ref.update({ seatId: null });
    }

    // 🔹 좌석 초기화
    await doc.ref.update({
      status: "none",1
      reserveSt: null,
      reserveEd: null,
      student_number: null,
      occupiedAt: null,
      lastSeated: null,
      lastChecked: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.log(`예약 종료 완료: seat ${seatId}`);
  }

  return;
});
