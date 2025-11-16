import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

//예약 시간이 끝나면 seat의 status를 none으로 변경, 좌석 정보 초기화
export const reserveEnd = functions.pubsub
    .schedule("every 1 minutes")
    .onRun(async () => {
        const now = new Date();
        const current = now.toTimeString().slice(0, 5);

        const seatsSnap = await db.collection("seats")
            .where("reserveEd", "==", current)
            .get();

        for (const doc of seatsSnap.docs) {
            const seatId = doc.id;
            const data = doc.data();

            //studylogs의 lastSeated 시간 저장
            const logsSnap = await db.collection("studylogs")
                .where("seatId", "==", seatId)
                .orderBy("occupiedAt", "desc")
                .limit(1)
                .get();

            if (!logsSnap.empty){
                await logsSnap.docs[0].ref.update({
                    lastSeated: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            // 유저 seatId 제거
            const userSnap = await db.collection("users")
                .where("seatId", "==", seatId)
                .limit(1)
                .get();

            if (!userSnap.empty) {
                await userSnap.docs[0].ref.update({ seatId: null });
            }

            // 좌석 초기화
            await doc.ref.update({
                status: "none",
                reserveSt: null,
                reserveEd: null,
                student_number: null,
                occupiedAt: null,
                lastSeated: null,
                lastChecked: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`예약 종료: seat ${seatId}`);
        }

        return null;
    });
