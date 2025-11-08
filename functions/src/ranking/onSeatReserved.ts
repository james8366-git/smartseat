import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

const db = admin.firestore();

//좌석 상태가 empty -> reserved로 바뀔 때 실행
export const onSeatReserved = functions.firestore
    .document("seat/{seatId}")
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const seatId = context.params.seatId;

        //empty -> reserved
        if(before.status === "empty" && after.status === "reserved"){
            const{
                reserveSt,
                reserveEd,
                room,
                student_number
            } = after;

            try{
                //예약 정보 확인
                const reserveSnap = await db
                    .collection("reservelogs")
                    .where("seatId", "==", seatId)
                    .orderBy("reserveSt", "desc")
                    .limit(1)
                    .get();
                if (reserveSnap.empty){
                    console.warn(
                        `예약 로그를 찾을 수 없습니다: seatId=${seatId}, student_number=${student_number}`
                    );
                    //잘못된 예약 상태 좌석 초기화
                    await db.collection("seat").doc(seatId).update({
                        status: "empty",
                        student_number: null,
                    });
                    return;
                }

                const reserveData = reserveSnap.docs[0].data();

                console.log(
                    `예약 정보 확인 완료: ${seatId}, 예약 시간 ${reserveData.reserveSt} ~ ${reserveData.reserveEd}`
                );

                //user/{userId} seatId update
                const userQuery = await db
                    .collection("users")
                    .where("student_number", "==", student_number)
                    .limit(1)
                    .get();
                if(!userQuery.empty){
                    const userDoc = userQuery.docs[0];
                    await userDoc.ref.update({
                        seatId: seatId,
                    });
                    console.log(`사용자 seatId 업데이트 완료: ${student_number}`);
                } else{
                    console.warn(`해당 학번의 사용자가 없습니다: ${student_number}`);
                }

                console.log(`에약 연동 완료: ${seatId}`);
            } catch(error){
                console.error("onSeatReserved 오류", error);
            }
        }
    });