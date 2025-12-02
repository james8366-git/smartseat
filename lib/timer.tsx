// timer.ts — FULL FINAL v7
// ✔ todayTotalTime 재계산 함수 export
// ✔ flush 시에는 과목만 업데이트하고
// ✔ finishAllSessions 시 todayTotalTime 자동 갱신
// ✔ useDeleteSubject에서도 updateTodayTotalTime 사용 가능

import firestore from "@react-native-firebase/firestore";

/* -----------------------------------------------------
 * ⭐ todayTotalTime 재계산 함수 (외부에서도 호출 가능)
 * ----------------------------------------------------- */
export async function updateTodayTotalTime(uid: string) {
  if (!uid) return;

  const userRef = firestore().collection("users").doc(uid);
  const snap = await userRef.get();
  const data = snap.data();
  if (!data?.subject) return;

  // 모든 과목 time 합산
  const sum = Object.values(data.subject).reduce((acc: any, s: any) => {
    const t = typeof s.time === "number" ? s.time : 0;
    return acc + t;
  }, 0);

  await userRef.update({
    todayTotalTime: sum,
  });
}

/* -----------------------------------------------------
 * flushSubject — 특정 과목에 diff 누적
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
  if (!uid || !subjectId || !runningSubjectSince) return;

  const now = firestore.Timestamp.now();
  const start = runningSubjectSince.toDate().getTime() / 1000;
  const end = now.toDate().getTime() / 1000;
  const diff = Math.max(0, Math.floor(end - start));

  const userRef = firestore().collection("users").doc(uid);
  const snap = await userRef.get();
  const user = snap.data();
  if (!user || !user.subject) return;

  const baseTime = user.subject?.[subjectId]?.time ?? 0;

  await userRef.update({
    [`subject.${subjectId}.time`]: baseTime + diff,
  });
}

/* -----------------------------------------------------
 * finishAllSessions — 좌석 이탈 / 앱 백그라운드 시 최종 flush
 * ----------------------------------------------------- */
export async function finishAllSessions({
  uid,
  selectedSubject,
  runningSubjectSince,
}: {
  uid: string;
  selectedSubject: string;
  runningSubjectSince: FirebaseFirestoreTypes.Timestamp | null;
}) {
  if (!uid || !selectedSubject || !runningSubjectSince) return;

  // 1) flush 해당 과목에 누적
  await flushSubject({
    uid,
    subjectId: selectedSubject,
    runningSubjectSince,
  });

  // 2) ⭐ 오늘 총 공부시간 자동 업데이트
  await updateTodayTotalTime(uid);

  // 3) runningSubjectSince 초기화
  await firestore().collection("users").doc(uid).update({
    runningSubjectSince: null,
  });
}
