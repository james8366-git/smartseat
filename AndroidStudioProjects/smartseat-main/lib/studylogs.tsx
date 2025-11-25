// lib/studylogs.ts

/*import firestore from "@react-native-firebase/firestore";

export async function getTodayTotalTime(uid) {
  const snapshot = await firestore()
    .collection("studylogs")
    .where("uid", "==", uid)
    .limit(1)
    .get();

  if (snapshot.empty) return 0;
  return snapshot.docs[0].data().totalTime ?? 0;
}*/

// lib/studylogs.ts
import firestore from "@react-native-firebase/firestore";

export async function getTodayTotalTime(uid) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 오늘 0시

  const snapshot = await firestore()
    .collection("studylogs")
    .where("uid", "==", uid)
    .where("createdAt", ">=", today)
    .get();

  if (snapshot.empty) return 0;

  let totalMs = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    totalMs += data.totalTime ?? 0; // ms 단위 누적
  });

  // ms → minutes 변환
  const totalMinutes = Math.floor(totalMs / 1000 / 60);

  return totalMinutes;
}



