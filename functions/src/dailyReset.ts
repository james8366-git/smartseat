// dailyReset.ts — FINAL (lastFlushedAt 기반)

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

export const dailyReset = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "Asia/Seoul",
    region: "asia-northeast3",
  },
  async () => {
    logger.info("🔥 Daily reset (lastFlushedAt-based) started");

    const seatsSnap = await db
      .collection("seats")
      .where("status", "==", "occupied")
      .get();

    const batch = db.batch();

    const endOfYesterday = new Date();
    endOfYesterday.setHours(23, 59, 59, 999);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const yesterdayKey = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    })();

    for (const seatDoc of seatsSnap.docs) {
      const seat = seatDoc.data();
      const uid = seat.uid;
      const subjectId = seat.subjectId;
      const lastFlushedAt = seat.lastFlushedAt;

      if (!uid || !subjectId || !lastFlushedAt) continue;

      const diff =
        Math.floor(
          (endOfYesterday.getTime() -
            lastFlushedAt.toDate().getTime()) /
            1000
        );

      if (diff > 0) {
        const userRef = db.collection("users").doc(uid);

        batch.update(userRef, {
          [`subject.${subjectId}.time`]:
            admin.firestore.FieldValue.increment(diff),
          todayTotalTime:
            admin.firestore.FieldValue.increment(diff),
        });

        const dailyRef = db
          .collection("stats")
          .doc(uid)
          .collection("daily")
          .doc(yesterdayKey);

        batch.set(
          dailyRef,
          {
            dailyTotalTime:
              admin.firestore.FieldValue.increment(diff),
          },
          { merge: true }
        );
      }

      // 날짜 경계 이동
      batch.update(seatDoc.ref, {
        lastFlushedAt:
          admin.firestore.Timestamp.fromDate(startOfToday),
      });
    }

    /* ------------------------------------------------
     * 오늘 시간 리셋
     * ------------------------------------------------ */
    const usersSnap = await db.collection("users").get();

    for (const doc of usersSnap.docs) {
      const subject = doc.data().subject ?? {};
      const reset: any = {};

      Object.entries(subject).forEach(([id, s]: any) => {
        reset[id] = { ...s, time: 0 };
      });

      batch.update(doc.ref, {
        subject: reset,
        todayTotalTime: 0,
      });
    }

    await batch.commit();
    logger.info("🔥 Daily reset completed");
  }
);
