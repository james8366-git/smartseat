import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const studyTimer = onSchedule(  {
    region: "asia-northeast3",
    schedule: "* * * * *",
  }, async () => {
  const seatsSnap = await db
    .collection("seats")
    .where("status", "==", "occupied")
    .get();

  const batch = db.batch();
  const now = admin.firestore.Timestamp.now();

  for (const seatDoc of seatsSnap.docs) {
    const seat = seatDoc.data() as any;
    const seatRef = seatDoc.ref;

    const studylogId = seat.studylogId;
    if (!studylogId) continue;

    const studylogRef = db.collection("studylogs").doc(studylogId);
    const studylogSnap = await studylogRef.get();

    if (!studylogSnap.exists) continue;

    const studylog = studylogSnap.data() as {
      totalTime?: number;
      uid?: string;
      subject?: { subjectName: string; studyTime: number | string }[];
    };

    if (!studylog) continue;
    if (!studylog.uid) continue;

    // ---- 1) totalTime 갱신 ----
    const newTotal = (studylog.totalTime ?? 0) + 1;
    batch.update(studylogRef, { totalTime: newTotal });

    // ---- 2) seat.totalTime 갱신 ----
    batch.update(seatRef, {
      totalTime: (seat.totalTime ?? 0) + 1,
      lastChecked: now,
    });

    // ---- 3) user.TotalStudyTime += 1 ----
    const userRef = db.collection("users").doc(studylog.uid);
    batch.update(userRef, {
      TotalStudyTime: admin.firestore.FieldValue.increment(1),
    });

    // ---- 4) 과목별 studyTime 갱신 ----
    const subjects = studylog.subject ?? [];

    if (subjects.length > 0) {
      const selectedSubject = subjects[0].subjectName;

      const updatedSubjects = subjects.map((s) => {
        if (s.subjectName === selectedSubject) {
          return {
            ...s,
            studyTime: Number(s.studyTime ?? 0) + 1,
          };
        }
        return s;
      });

      batch.update(studylogRef, { subject: updatedSubjects });
    }
  }

  await batch.commit();
});
