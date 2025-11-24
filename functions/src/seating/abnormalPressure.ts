// import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";

// const db = admin.firestore();

// export const abnormalPressure = functions.database
//     .ref("/sensors/{seatId}/state")
//     .onWrite(async (change, context) => {
//         const seatId = context.params.seatId;
//         const before = change.before.val();
//         const after = change.after.val();

//         // object 상태가 아니면 종료
//         if (after !== "object") return null;

//         console.log(`센서 object 감지됨 → seatId=${seatId}`);

//         const now = admin.firestore.FieldValue.serverTimestamp();

//         const seatRef = db.collection("seats").doc(seatId);
//         const seatDoc = await seatRef.get();

//         if (!seatDoc.exists) {
//             console.log(`Firestore에 좌석 ${seatId} 문서 없음`);
//             return null;
//         }

//         const seatData = seatDoc.data();

//         // 이미 object 상태면 중복 처리 방지
//         if (seatData?.status === "object") {
//             console.log(`좌석 ${seatId}은 이미 object 상태`);
//             return null;
//         }

//         //Firestore seat 문서 업데이트
//         await seatRef.update({
//             status: "object",
//             lastSeated: now,
//             isStudying: false,
//             abnormalPressure: now,
//         });

//         console.log(`seat/${seatId} Firestore 상태 object 처리 완료`);

//         //studylogs 마지막 로그 종료 처리
//         const logsSnap = await db.collection("studylogs")
//             .where("seatId", "==", seatId)
//             .orderBy("occupiedAt", "desc")
//             .limit(1)
//             .get();

//         if (!logsSnap.empty) {
//             await logsSnap.docs[0].ref.update({
//                 lastSeated: now
//             });

//             console.log(`studylogs lastSeated 저장 seat=${seatId}`);
//         }

//         //관리자에게 FCM 알림


//         return null;
//     });