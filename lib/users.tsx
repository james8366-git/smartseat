import firestore from '@react-native-firebase/firestore';

const usersCollection = firestore().collection("users");

// 유저 전체 로드
export const getUser = async (uid) => {
  const doc = await usersCollection.doc(uid).get();
  if (!doc.exists) return null;
  return { uid: doc.id, ...doc.data() };
};

// 신규 유저 생성
export const createUser = async ({ id, profileExtra }) => {
  await usersCollection.doc(id).set({
    id,
    subject: {
      base: {                      // 🔥 기본 과목 id = base
        name: "공부",
        selected: true,            // 처음 가입 시 기본 선택
        time: 0,
      },
    },
    selectedSubject: "공부",
    ...profileExtra,
  });
};
export type Subject = {
  id: string;
  name: string;
  selected: boolean;
  time: number; // 누적 초
};

// subjects 불러오기 (Map → Array)
export async function getSubjects(uid: string): Promise<Subject[]> {
  const snap = await usersCollection.doc(uid).get();
  const data = snap.data() as any | undefined;

  const subjectMap = (data?.subject ?? {}) as Record<string, any>;

  return Object.entries(subjectMap).map(([id, value]) => ({
    id,
    name: value?.name ?? "",
    selected: !!value?.selected,
    time:
      typeof value?.time === "number" && !Number.isNaN(value.time)
        ? value.time
        : 0,
  }));
}

// ★ Subject[] → users/{uid}.subject(map) 으로 저장
export async function updateSubjects(uid: string, subjects: Subject[]) {
  const map: Record<string, any> = {};

  subjects.forEach((s) => {
    map[s.id] = {
      name: s.name,
      selected: s.selected,
      time: s.time ?? 0, // 🔥 반드시 time 저장
    };
  });

  await usersCollection.doc(uid).update({ subject: map });
}

// 좌석 해제 용도
export async function clearSeat(uid) {
  await usersCollection.doc(uid).update({
    seatLabel: "",
  });
}

// 오늘 전체 공부 시간 가져오기
export const getTodayTotalTime = async (uid) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const todayKey = `${yyyy}-${mm}-${dd}`;

  const doc = await firestore()
    .collection("studylogs")
    .doc(uid)
    .collection("daily")
    .doc(todayKey)
    .get();

  if (!doc.exists) return 0;

  return doc.data()?.dailyTotalTime ?? 0;
};
