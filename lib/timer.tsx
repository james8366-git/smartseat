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
  subjectId,               // ← id 기반
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
      const target = subjectMap[subjectId]; // ← id key로 찾음
      if (!target) return;

      const prev = toSafeSeconds(target.time);
      const startSec = Math.floor(runningSubjectSince.toDate().getTime() / 1000);
      const nowSec = Math.floor(Date.now() / 1000);

      const diff = Math.max(0, nowSec - startSec);

      tx.update(userRef, {
        [`subject.${subjectId}.time`]: prev + diff,
      });
    });
  } catch (e) {
    console.log("❌ flushSubject ERROR:", e);
  }
}

/**
 * 새 과목 시작 → selectedSubject = id
 */
export async function beginSubject({
  uid,
  newSubjectId,
}: {
  uid: string;
  newSubjectId: string;
}) {
  if (!uid || !newSubjectId) return;

  const userRef = firestore().collection("users").doc(uid);

  try {
    await userRef.update({
      selectedSubject: newSubjectId,
      runningSubjectSince: firestore.Timestamp.now(),
    });
  } catch (e) {
    console.log("❌ beginSubject ERROR:", e);
  }
}

/**
 * 과목 변경 시
 * 1) 기존 과목 flush(id)
 * 2) 새 과목 begin(id)
 */
export async function switchSubject({
  uid,
  oldSubjectId,
  newSubjectId,
  runningSubjectSince,
}: {
  uid: string;
  oldSubjectId: string;
  newSubjectId: string;
  runningSubjectSince: FirebaseFirestoreTypes.Timestamp | null;
}) {
  if (!uid) return;

  // flush previous
  if (oldSubjectId && runningSubjectSince) {
    await flushSubject({
      uid,
      subjectId: oldSubjectId,
      runningSubjectSince,
    });
  }

  // begin new
  await beginSubject({
    uid,
    newSubjectId,
  });
}

/**
 * empty / none / object / 반납
 * 1) 현재 과목 flush(id)
 * 2) runningSubjectSince 초기화
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

  if (selectedSubject && runningSubjectSince) {
    await flushSubject({
      uid,
      subjectId: selectedSubject, // ← id
      runningSubjectSince,
    });
  }

  const userRef = firestore().collection("users").doc(uid);

  try {
    await userRef.update({
      runningSubjectSince: null,
    });
  } catch (e) {
    console.log("❌ finishAllSessions ERROR:", e);
  }
}
