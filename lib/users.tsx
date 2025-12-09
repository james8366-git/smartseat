// users.tsx — FINAL VERIFIED VERSION
import firestore from "@react-native-firebase/firestore";

const usersCollection = firestore().collection("users");

/* --------------------------------------------------------
 * 1) getUser — (App.tsx, RootStack에서 반드시 필요)
 * -------------------------------------------------------- */
export const getUser = async (uid) => {
  const doc = await usersCollection.doc(uid).get();
  if (!doc.exists) return null;
  return { uid: doc.id, ...doc.data() };
};

/* --------------------------------------------------------
 * 2) 신규 유저 생성
 * -------------------------------------------------------- */
export const createUser = async ({ id, profileExtra }) => {
  await usersCollection.doc(id).set({
    id,
    subject: {
      base: {
        name: "공부",
        time: 0,
      },
    },
    selectedSubject: "base",
    ...profileExtra,
  });
};

/* --------------------------------------------------------
 * Subject 타입
 * -------------------------------------------------------- */
export type Subject = {
  id: string;
  name: string;
  time: number;
};

/* --------------------------------------------------------
 * 3) subject MAP → Array 변환
 * -------------------------------------------------------- */
export const getSubjects = async (uid) => {
  const snap = await usersCollection.doc(uid).get();
  const data = snap.data();

  const map = data?.subject ?? {};

  return Object.entries(map).map(([id, val]) => ({
    id,
    name: val?.name ?? "",
    time: typeof val?.time === "number" ? val.time : 0,
  }));
};

/* --------------------------------------------------------
 * 4) subjects Array → MAP 변환 후 저장
 * -------------------------------------------------------- */
export const updateSubjects = async (uid, subjectsArray) => {
  const map = {};

  subjectsArray.forEach((s) => {
    map[s.id] = {
      name: s.name,
      time: s.time ?? 0,
    };
  });

  await usersCollection.doc(uid).update({
    subject: map,
  });
};

/* --------------------------------------------------------
 * 5) 선택 과목 업데이트
 * -------------------------------------------------------- */
export const updateSelectedSubject = async (uid, subjectId) => {
  await usersCollection.doc(uid).update({
    selectedSubject: subjectId,
  });
};

/* --------------------------------------------------------
 * 6) 좌석 라벨 초기화 (기존 기능 유지)
 * -------------------------------------------------------- */
export const clearSeat = async (uid) => {
  await usersCollection.doc(uid).update({
    seatLabel: "",
  });
};

/* --------------------------------------------------------
 * 7) 오늘 누적 공부시간 가져오기
 * -------------------------------------------------------- */
// export const getTodayTotalTime = async (uid) => {
//   const now = new Date();
//   const yyyy = now.getFullYear();
//   const mm = String(now.getMonth() + 1).padStart(2, "0");
//   const dd = String(now.getDate()).padStart(2, "0");

//   const todayKey = `${yyyy}-${mm}-${dd}`;

//   const snap = await firestore()
//     .collection("studylogs")
//     .doc(uid)
//     .collection("daily")
//     .doc(todayKey)
//     .get();

//   if (!snap.exists) return 0;

//   return snap.data()?.dailyTotalTime ?? 0;
// };
