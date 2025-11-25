import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const userDailyStats = functions.pubsub
  .schedule("0 0 * * *") // 매일 자정
  .timeZone("Asia/Seoul")
  .onRun(async () => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayStr = `${yyyy}-${mm}-${dd}`;
    const monthStr = `${yyyy}-${mm}`;

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // 어제 공부한 studylogs
    const logsSnap = await db
      .collection("studylogs")
      .where("occupiedAt", ">=", admin.firestore.Timestamp.fromDate(yesterday))
      .where("occupiedAt", "<", admin.firestore.Timestamp.fromDate(today))
      .get();

    // 사용자별 누적 시간 저장용
    const userDaily: Record<string, number> = {};

    logsSnap.forEach((doc) => {
      const data = doc.data();
      const userId = data.student_number;   // student_number = userId
      const time = data.totalTime || 0;

      if (!userDaily[userId]) userDaily[userId] = 0;
      userDaily[userId] += time;
    });

    // 사용자별 stats 업데이트
    for (const userId of Object.keys(userDaily)) {

      const dailyTotal = userDaily[userId];

      const ref = db.collection("stats").doc(userId);

      // 1) daily 저장
      await ref.set({
        userId: userId,
        daily: {
          date: todayStr,
          dailyTotalTime: dailyTotal
        }
      }, { merge: true });

      // 2) monthly 캘린더 저장
      await ref.set({
        monthly: {
          [monthStr]: {
            [dd]: dailyTotal
          }
        }
      }, { merge: true });
    }

    console.log("User daily & monthly stats 업데이트");
    return null;
  });