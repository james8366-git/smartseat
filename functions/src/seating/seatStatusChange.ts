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

            const reserveSt = after.reserveSt;
            const reserveEd = after.reserveEd;

            await change.after.ref.update({
                occupiedAt: now,
                lastChecked: now,
                isStudying: true,
            })

            //이미 로그가 존재 하는지 확인
            const existingLogSnap = await db.collection("studyLogs")
                .where("seatId", "==", seatId)
                .where("reserveSt", "==", reserveSt)
                .where("reserveEd", "==", reserEd)
                .limit(1)
                .get();

            if (existingLogSnap.empty) {
                //없다면 새로 생성
                await db.collection("studylogs").add({
                      seatId,
                      student_number: after.student_number,
                      reserveSt,
                      reserveEd,
                      occupiedAt: admin.firestore.FieldValue.serverTimestamp(),
                      subject: [],
                      totalTime: 0,
                    });

                    console.log(`새 스터디 로그 생성 seat=${seatId}`);
                  } else {
                    //이미 있으면 시간만 업데이트
                    await existingLogSnap.docs[0].ref.update({
                      occupiedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });

                    console.log(`기존 스터디 로그 재사용 seat=${seatId}`);
                  }
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
                const logRef = logsSnap.docs[0].ref;
                const logData = logsSnap.docs[].data();

                const occupiedAt = logData.occupiedAt;
                const totalTime = logData.totalTime || 0;

                if(occupiedAt) {
                    const sessionMs = now.toMillis() - occupiedAt.ToMillis();
                    const updateTotal = totalTime + sessionMs;

                    await logRef.update({
                        lastSeated: admin.firestore.FieldValue.serverTimestamp(),
                        totalTime = updateTotal,
                    });

                console.log(`총 공부 시간 업데이트 seat=${seatId}
                    / +${sessionMs}ms / total=${updatedTotal}ms`);
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
