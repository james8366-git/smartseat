// import { onSchedule } from "firebase-functions/v2/scheduler";
// import * as admin from "firebase-admin";

// admin.initializeApp();
// const db = admin.firestore();

// export const studyTimer = onSchedule(
//   {
//     region: "asia-northeast3",
//     schedule: "* * * * *", // every minute
//   },
//   async () => {
//     const now = admin.firestore.Timestamp.now();

//     const seatsSnap = await db
//       .collection("seats")
//       .where("status", "==", "occupied")
//       .get();

//     const batch = db.batch();

//     for (const seatDoc of seatsSnap.docs) {
//       const seat = seatDoc.data() as any;
//       const seatRef = seatDoc.ref;

//       const studylogId = seat.studylogId;
//       if (!studylogId) continue;

//       const studylogRef = db.collection("studylogs").doc(studylogId);
//       const studylogSnap = await studylogRef.get();
//       if (!studylogSnap.exists) continue;

//       const studylog = studylogSnap.data() as any;
//       const uid = studylog.uid;
//       if (!uid) continue;

//       // 🔥 사용자 정보
//       const userRef = db.collection("users").doc(uid);
//       const userSnap = await userRef.get();
//       if (!userSnap.exists) continue;

//       const user = userSnap.data() as any;
//       if (!user?.subject) continue;

//       // 🔥 현재 선택된 과목 ID 찾기
//       const selectedId = Object.keys(user.subject).find(
//         (key) => user.subject[key].selected === true
//       );
//       if (!selectedId) continue;

//       const fieldForSubject = `subject.${selectedId}.time`;

//       // 🔵 batch 업데이트
//       batch.update(studylogRef, {
//         totalTime: admin.firestore.FieldValue.increment(1),
//       });

//       batch.update(seatRef, {
//         totalTime: admin.firestore.FieldValue.increment(1),
//         lastSeated: now,
//       });

//       batch.update(userRef, {
//         todayTotalTime: admin.firestore.FieldValue.increment(1),
//         [fieldForSubject]: admin.firestore.FieldValue.increment(1),
//       });
//     }

//     await batch.commit();
//   }
// );
