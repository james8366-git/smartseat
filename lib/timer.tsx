// timer.ts — TRUE FINAL VERSION
// ✔ studylogs = Map(uuid → time)
// ✔ stats.daily = Map(uuid → time)
// ✔ users.subject flush
// ✔ runningSubjectSince reset
// ✔ no Array version remains

import firestore from "@react-native-firebase/firestore";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

/* -----------------------------------------------------
 * todayTotalTime 재계산 (합계 기반)
 * ----------------------------------------------------- */
export async function updateTodayTotalTime(uid: string) {
  if (!uid) return;

  const userRef = firestore().collection("users").doc(uid);
  const snap = await userRef.get();
  const data = snap.data();
  if (!data?.subject) return;

  const sum = Object.values(data.subject).reduce((acc: any, s: any) => {
    const t = typeof s.time === "number" ? s.time : 0;
    return acc + t;
  }, 0);

  await userRef.update({ todayTotalTime: sum });
}

/* -----------------------------------------------------
 * flushSubject — diff(초) 계산 후 users.subject 누적
 * ----------------------------------------------------- */
export async function flushSubject({
  uid,
  subjectId,
  runningSubjectSince,
}: {
  uid: string;
  subjectId: string;
  runningSubjectSince: FirebaseFirestoreTypes.Timestamp;
}) {
  if (!uid || !subjectId || !runningSubjectSince) return 0;

  const now = firestore.Timestamp.now();
  const start = runningSubjectSince.toDate().getTime() / 1000;
  const end = now.toDate().getTime() / 1000;
  const diff = Math.max(0, Math.floor(end - start)); // 초 단위

  const userRef = firestore().collection("users").doc(uid);
  const snap = await userRef.get();
  const user = snap.data();
  if (!user?.subject) return diff;

  const baseTime = user.subject?.[subjectId]?.time ?? 0;

  console.log(
  "🔥 flushSubject 실행됨",
  "\nuid:", uid,
  "\nsubjectId:", subjectId,
  "\nrunningSince:", runningSubjectSince?.toDate(),
  "\ndiff(초):", diff
);


  await userRef.update({
    [`subject.${subjectId}.time`]: baseTime + diff,
  });

  return diff;
}

/* -----------------------------------------------------
 * finishAllSessions — 좌석 세션 종료 시 기록
 * ----------------------------------------------------- */
export async function finishAllSessions({
  uid,
  selectedSubject,
  runningSubjectSince,
  seatId,
  student_number,
}: {
  uid: string;
  selectedSubject: string;
  runningSubjectSince: FirebaseFirestoreTypes.Timestamp | null;
  seatId: string;
  student_number: string;
}) {
  if (!uid || !selectedSubject || !runningSubjectSince) return;

  

  const now = firestore.Timestamp.now();

  /* 1) flush — diff 계산 + users.subject 누적 */
  const elapsed = await flushSubject({
    uid,
    subjectId: selectedSubject,
    runningSubjectSince,
  });
  

  const inc = elapsed ?? 0;

  /* -----------------------------------------------------------------------
   * 2) studylogs — Map(uuid → elapsed)
   * ----------------------------------------------------------------------- */
  const studylogId = firestore().collection("studylogs").doc().id;
  const logRef = firestore().collection("studylogs").doc(studylogId);


  await logRef.set(
    {
      studylogId,
      uid,
      seatId,
      student_number,
      createdAt: now,
      lastSeated: now,
      occupiedAt: runningSubjectSince,

      // ★ MAP 구조 (정답)
      subjects: {
        [selectedSubject]: inc,
      },

      totalTime: inc,
    },
    { merge: true }
  );

  /* -----------------------------------------------------------------------
   * 3) stats.daily 누적
   * ----------------------------------------------------------------------- */
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const dateKey = `${yyyy}-${mm}-${dd}`;

  const statsRef = firestore()
    .collection("stats")
    .doc(uid)
    .collection("daily")
    .doc(dateKey);

  await statsRef.set(
    {
      dailyTotalTime: firestore.FieldValue.increment(inc),
      subjects: {
        [selectedSubject]: firestore.FieldValue.increment(inc),
      },
    },
    { merge: true }
  );

  /* -----------------------------------------------------------------------
   * 4) runningSubjectSince 초기화
   * ----------------------------------------------------------------------- */
  await firestore().collection("users").doc(uid).update({
    runningSubjectSince: null,
  });
}
