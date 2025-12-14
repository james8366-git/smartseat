import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

const db = admin.firestore();
const fcm = admin.messaging();

function getKSTDateId(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);

  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, "0");
  const dd = String(kst.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export const goalAchieved = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "Asia/Seoul",
    region: "asia-northeast3",
  },
  async (event) => {
    console.log("goalAchieved 실행");
  
    try {
        const userSnap = await db.collection("users").get();
        const today = getKSTDateId();

        for (const doc of userSnap.docs) {
        const user = doc.data();
        const userId = doc.id;

        const goal = user.goals;
        const goalSec = goal * 60;
        const total = user.todayTotalTime;
        const fcmToken = user.fcmToken;
        const student_number = user.student_number;

        if(!fcmToken) continue;

        if(total < goalSec) continue;

        if (user.goalNotified === true) continue;

        console.log(`${student_number} 목표 ${goal}분 달성`);

        //FCM 전송
        await fcm.send({
            token: fcmToken,
            notification: {
                title: "목표 달성",
                body: `오늘의 목표 ${ goal }분이 달성되었습니다!`,
            },
            data: {
                type: "goalAchieved",
                userId,
            },
        });

        /* --------------------------------------------------
         * 2️⃣ users.goalnotified 갱신 🔥
         * -------------------------------------------------- */
        await db.collection("users").doc(userId).update({
          goalNotified: true,
        });

        /* --------------------------------------------------
         * 4️⃣ notifications 로그
         * -------------------------------------------------- */
        await db.collection("notifications").add({
          userId,
          goals: goal,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        /* --------------------------------------------------
         * 3️⃣ 오늘 stats.goalNotified 기록 🔥🔥
         * -------------------------------------------------- */
        const statRef = db
          .collection("stats")
          .doc(userId)
          .collection("daily")
          .doc(today);

        await statRef.set(
          {
            isGoalAchieved: true,
            todayTotalTime: total,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
    }

      console.log("goalAchieved 완료");
    } catch (err) {
      console.error("goalAchieved 오류", err);
    }
  }
);
