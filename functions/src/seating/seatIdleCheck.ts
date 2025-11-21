import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

//5분마다 자리 비움 확인
export const seatIdleCheck = functions.pubsub
    .schedule("every 5 minutes")
    .onRun(async () => {

        const now = new Date();
        const thresholdDate = new Date(now.getTime() -90*60*1000);
        const thresholdTs = admin.firestore.Timestamp.fromDate(thresholdDate);

        try {
            const seatsSnap = await db.collection("seats")
                .where("status", "==", "empty")
                .where("lastSeated", "<=", thresholdTs)
                .get();

            if (seatsSnap.empty) {
                console.log("90분 이상 empty 상태인 좌석 없음");
                return null;
            }

            for (const doc of seatsSnap.docs)
                const seatId = doc.id;
                const seatData = doc.data();

            //관리자에게 FCM 알림 전송


        } catch (err) {
            console.error("seatIdleCheck 오류", err);
        }
        return null;
    });