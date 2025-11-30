// lib/timer.ts
import firestore from "@react-native-firebase/firestore";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

// 안전한 초 변환
function toSafeSeconds(v: any): number {
  if (typeof v !== "number" || v < 0) return 0;
  return v;
}

/** 
 * DB subject.time 에 diff(초)를 누적한다.
 */
export async function flushSubject({
  uid,
  subjectId,
  runningSubjectSince,
}: {
  uid: string;
  subjectId: string;
  runningSubjectSince: FirebaseFirestoreTypes.Timestamp | null;
}) {
  if (!uid || !subjectId || !runningSubjectSince) return;

  const userRef = firestore().collection("users").doc(uid);

  try {
    await firestore().runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const data = snap.data() as any;
      if (!data) return;

      const subjectMap = data.subject || {};
      const target = subjectMap[subjectId];
      if (!target) return;

      const prev = toSafeSeconds(target.time);
      const startSec = Math.floor(runningSubjectSince.toDate().getTime() / 1000);
      const nowSec = Math.floor(Date.now() / 1000);

      const diff = Math.max(0, nowSec - startSec); // 이번 세션 공부한 총 초

      tx.update(userRef, {
        [`subject.${subjectId}.time`]: prev + diff,
      });
    });
  } catch (e) {
    console.log("❌ flushSubject ERROR:", e);
  }
}

/**
 * 새 과목 시작 → selectedSubject 변경 + runningSubjectSince = now
 */
export async function beginSubject({
  uid,
  newSubject,
}: {
  uid: string;
  newSubject: string;
}) {
  if (!uid || !newSubject) return;

  const userRef = firestore().collection("users").doc(uid);

  try {
    await userRef.update({
      selectedSubject: newSubject,
      runningSubjectSince: firestore.Timestamp.now(),
    });
  } catch (e) {
    console.log("❌ beginSubject ERROR:", e);
  }
}

/**
 * 과목 변경 시(공부 → 알고리즘)
 * 1) 기존 과목 flush
 * 2) 새 과목 begin
 */
export async function switchSubject({
  uid,
  oldSubject,
  newSubject,
  runningSubjectSince,
}: {
  uid: string;
  oldSubject: string;
  newSubject: string;
  runningSubjectSince: FirebaseFirestoreTypes.Timestamp | null;
}) {
  if (!uid) return;

  // 기존 과목 flush
  if (oldSubject && runningSubjectSince) {
    await flushSubject({
      uid,
      subjectId: oldSubject,
      runningSubjectSince,
    });
  }

  // 새 과목 시작
  await beginSubject({
    uid,
    newSubject,
  });
}

/**
 * empty 또는 none 이 될 때:
 * 1) 현재 과목 flush
 * 2) runningSubjectSince = null 로 리셋
 */
export async function finishAllSessions({
  uid,
  selectedSubject,
  runningSubjectSince,
}: {
  uid: string;
  selectedSubject: string | null;
  runningSubjectSince: FirebaseFirestoreTypes.Timestamp | null;
}) {
  if (!uid) return;

  // flush
  if (selectedSubject && runningSubjectSince) {
    await flushSubject({
      uid,
      subjectId: selectedSubject,
      runningSubjectSince,
    });
  }

  // runningSubjectSince 제거
  const userRef = firestore().collection("users").doc(uid);

  try {
    await userRef.update({
      runningSubjectSince: null,
    });
  } catch (e) {
    console.log("❌ finishAllSessions ERROR:", e);
  }
}
