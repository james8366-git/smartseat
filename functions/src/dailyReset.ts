import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

/** 매일 자정 00:00에 실행 */
export const dailyReset = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "Asia/Seoul",
    region: "asia-northeast3",
  },
  async () => {
    logger.info("🔥 Running daily reset...");

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    const todayKey = `${yyyy}-${mm}-${dd}`;

    const users = await db.collection("users").get();

    for (const doc of users.docs) {
      const uid = doc.id;
      const data = doc.data();

      const subjects = data.subject ?? {};
      const total = data.todayTotalTime ?? 0;

      // 1) stats/{uid}/daily/{yyyy-mm-dd} 저장
      await db
        .collection("stats")
        .doc(uid)
        .collection("daily")
        .doc(todayKey)
        .set({
          subjects,
          todayTotalTime: total,
          createdAt: admin.firestore.Timestamp.now(),
        });

      // 2) subject.time 0으로 만들기
      const resetSubjects: any = {};
      for (const key of Object.keys(subjects)) {
        resetSubjects[key] = {
          ...subjects[key],
          time: 0,
        };
      }

      // 3) 유저 값 초기화
      await db.collection("users").doc(uid).update({
        subject: resetSubjects,
        todayTotalTime: 0,
      });

      logger.info(`Reset user ${uid}`);
    }

    logger.info("🎉 Daily reset complete!");
  }
);
