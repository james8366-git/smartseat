import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

//착석, 이탈을 감지 하여 occupiedAt, lastSeated에 시간 기록, isStudying 업데이트
export const seatStatusChange = functions.firestore
    .document("seats/{seatId}")
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const seatId = context.params.seatId;

        const now = admin.firestore.FieldValue.serverTimestamp();

        // 착석 감지 (empty → occupied)
        if (before.status === "empty" && after.status === "occupied") {

            await change.after.ref.update({
                occupiedAt: now,
                lastChecked: now,
                isStudying: true,
            });

            await db.collection("studylogs").add({
                seatId,
                student_number: after.student_number,
                room: after.room,
                occupiedAt: admin.firestore.FieldValue.serverTimestamp(),
                subject: [],
                totalTime: 0,
            });

            console.log(`착석 감지 seat=${seatId}`);
        }

        // 자리 비움 감지 (occupied → empty)
        if (before.status === "occupied" && after.status === "empty") {

            await change.after.ref.update({
                lastSeated: now,
                lastChecked: now,
                isStudying: false,
            });

            const logsSnap = await db.collection("studylogs")
                .where("seatId", "==", seatId)
                .orderBy("occupiedAt", "desc")
                .limit(1)
                .get();

            if (!logsSnap.empty) {
                await logsSnap.docs[0].ref.update({
                    lastSeated: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            console.log(`자리 비움 seat=${seatId}`);
        }

        //물체 감지
        if( before.status !== object && after.status === object ) {

            await change.after.ref.update({
                lastChecked: now,
                isStudying: false,
            });

            console.log(`물제 감지 seat=${seatId}`);
        }

        return null;
    });
