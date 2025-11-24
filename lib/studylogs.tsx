// lib/studylogs.ts

import firestore from "@react-native-firebase/firestore";

export async function getTodayTotalTime(uid) {
  const snapshot = await firestore()
    .collection("studylogs")
    .where("uid", "==", uid)
    .limit(1)
    .get();

  if (snapshot.empty) return 0;
  return snapshot.docs[0].data().totalTime ?? 0;
}

export async function addSubjectToStudylog(uid: string, seatId: string, newSubject: string) {
  const snap = await firestore()
    .collection("studylogs")
    .where("uid", "==", uid)
    .where("seatId", "==", seatId)
    .orderBy("occupiedAt", "desc")
    .limit(1)
    .get();

  if (snap.empty) return;

  const docRef = snap.docs[0].ref;

  await docRef.update({
    subject: firestore.FieldValue.arrayUnion({
      subjectName: newSubject,
      studyTime: "0",
    }),
  });
}