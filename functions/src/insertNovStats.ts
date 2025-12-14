import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { goalAchieved } from "./ranking/goalAchieved";

admin.initializeApp();
const db = admin.firestore();

export const insertNovStats = functions.https.onRequest(
  { region: "asia-northeast3" },
  async (req, res) => {
    try {
      const uid = "YrHEqk0GSjYHwy5mafSprhCqDvx1";
      const subjectId = "43ecdd48-11d8-4abb-93b3-c1859c5ead22";

      const year = 2025;
      const month = 11;

      for (let day = 1; day <= 30; day++) {
        const dd = String(day).padStart(2, "0");
        const dateId = `${year}-${String(month).padStart(2, "0")}-${dd}`;

        const dailySec = 1800 * day;

        const firstStudyAt = new Date(
          `${dateId}T06:00:00+09:00`
        );

        /* ===============================
         * 🔥 변경 핵심 로직
         * =============================== */
        const goalMinutes = 360;
        const isGoalAchieved = day >= 12; // ⭐ 12일부터 true

        await db
          .collection("stats")
          .doc(uid)
          .collection("daily")
          .doc(dateId)
          .set(
            {
              dailyTotalTime: dailySec,
              firstStudyAt: admin.firestore.Timestamp.fromDate(firstStudyAt),

              subjects: {
                base: 0,
                [subjectId]: dailySec,
              },

              /* 🔥 추가/고정 필드 */
              goalMinutes,
              isGoalAchieved,

              goalNotified: admin.firestore.FieldValue.delete(),
            },
            { merge: true }
          );
      }

      res.send("Inserted November stats with goalMinutes=360, goalNotified split.");
    } catch (err: any) {
      console.error(err);
      res.status(500).send(err.message);
    }
  }
);
