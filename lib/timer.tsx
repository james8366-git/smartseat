import firestore from "@react-native-firebase/firestore";

/* -----------------------------------------------------
 * todayTotalTime 재계산
 * ----------------------------------------------------- */
export async function updateTodayTotalTime(uid: string , diff: number) {
    if (!uid || diff <= 0) return;

    const userRef = firestore().collection("users").doc(uid);

    await userRef.update(
        {
            todayTotalTime: firestore.FieldValue.increment(diff),
        }
    );
}

/* -----------------------------------------------------
 * flushSubject — lastFlushedAt → now diff 누적
 * ----------------------------------------------------- */
export async function flushSubject({
  uid,
  subjectId,
  lastFlushedAt,
}: {
  uid: string;
  subjectId: string;
  lastFlushedAt: FirebaseFirestoreTypes.Timestamp;
}) {
    if (!uid || !subjectId || !lastFlushedAt) return;

    const now = firestore.Timestamp.now();

    const start = lastFlushedAt.toDate().getTime() / 1000;
    const end = now.toDate().getTime() / 1000;
    const diff = Math.max(0, Math.floor(end - start));
    if (diff <= 0) return;

    const userRef = firestore().collection("users").doc(uid);
    //  base 읽지 말고 increment 사용
    await userRef.update({
        [`subject.${subjectId}.time`]: firestore.FieldValue.increment(diff),
    });

    //  diff를 함께 반환
    return { newTs: now, diff };
    
}
