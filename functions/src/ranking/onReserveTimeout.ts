// import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
// admin.initializeApp();

// const db = admin.firestore();

// //예약 시간 만료 좌석 empty로 변경, 5분 마다 실행
// export const onReserveTimeout = functions.pubsub
//     .schedule("every 5 minutes")
//     .onRun(async () => {
//         const now = new Date();
//         console.log("예약 만료 검사 시작:", now.toIOString());

//         try{
//             //만료 되지 않은 예약 중 reserveEd가 지난 예약 조회
//             const logsSnap = await db
//                 .collection("reservelogs")
//                 .where("status", "==", "reserved")
//                 .get();

//             if (logsSnap.empty){
//                 console.log("유효한 예약이 없습니다");
//                 return null;
//             }

//             for (const logData of logsSnap.docs){
//                 const logData = log.data();
//                 const { seatId, reserveEd, student_number } = logData;
//                 if (!seatId || !reserveEd || !student_number) continue;

//                 //HH:MM -> Date
//                 const [hour, minute] = reserveEd.split(":").map(Number);
//                 const reserveEnd = new Date();
//                 reserveEnd.setHours(hour, minute, 0, 0);

//                 //만료 처리
//                 if(now > reserveEd) {
//                     console.log(`예약 만료 처리: seat=${seatId}, student=${student_number}`);

//                     //seats/{seatId} status 초기화
//                     await doc.ref.update({
//                         status: "empty",
//                         student_number: null,
//                         reserveSt: null,
//                         reserveEd: null,
//                     });
//                     //사용자 seatId 초기화
//                     const seatRef = db.collection("seats").doc(seatId);
//                         await seatRef.update({
//                             status: "empty",
//                             student_number: null,
//                             reserveSt: null,
//                             reserveEd: null,
//                         });

//                     //users/{userId} seatId 초기화
//                     const userSnap = await db
//                         .collection("users")
//                         .where("student_number", "==", student_number)
//                         .limit(1)
//                         .get();

//                     if (!userSnap.empty) {
//                         await userSnap.docs[0].ref.update({
//                             seatId: null,
//                         });
//                     }
//                 }
//             }
//         console.log("예약 만료 검사 완료");
//         } catch(error){
//             console.error("onReserveTimeout 오류", error);
//         }
//     return null;
//     });