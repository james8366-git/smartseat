// // saveStudylog.ts — FINAL (C안 구현)

// import { onDocumentUpdated } from "firebase-functions/v2/firestore";
// import * as admin from "firebase-admin";
// import * as logger from "firebase-functions/logger";

// admin.initializeApp();
// const db = admin.firestore();

// export const saveStudylog = onDocumentUpdated(
//   {
//     document: "seats/{seatId}",
//     region: "asia-northeast3",
//   },
//   async (event) => {
//     const before = event.data?.before.data();
//     const after = event.data?.after.data();
//     const seatId = event.params.seatId;

//     if (!before || !after) return;

//     // -------------------------------------------------------
//     // 좌석 반납 = none
//     // -------------------------------------------------------
//     if (after.status !== "none") return;

//     logger.info(`세션 종료 감지 seat=${seatId}`);

//     const studylogId = before.studylogId;
//     const uid = before.uid;

//     if (!studylogId || !uid) {
//       logger.warn("studylogId 또는 uid 없음 → 저장 불가");
//       return;
//     }

//     // -------------------------------------------------------
//     // C안 핵심: seats.sessionSubjects 로딩
//     // -------------------------------------------------------
//     const sessionSubjects = before.sessionSubjects ?? {};

//     // 총합
//     const total = Object.values(sessionSubjects).reduce((acc: any, v: any) => {
//       return acc + (typeof v === "number" ? v : 0);
//     }, 0);

//     // -------------------------------------------------------
//     // studylogs 세션 저장
//     // -------------------------------------------------------
//     await db.collection("studylogs").doc(studylogId).set(
//       {
//         subjects: sessionSubjects,
//         totalTime: total,
//         endedAt: admin.firestore.Timestamp.now(),
//       },
//       { merge: true }
//     );

//     logger.info(`studylogs/${studylogId} 저장 완료 (총 ${total}초)`);

//     // seats.sessionSubjects 초기화
//     await db.collection("seats").doc(seatId).update({
//       sessionSubjects: admin.firestore.FieldValue.delete(),
//     });
//   }
// );
