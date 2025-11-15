import firestore from '@react-native-firebase/firestore';

// 기존 코드 예시
export const getUser = async (id) => {
  const doc = await firestore().collection('users').doc(id).get();
  return doc.exists ? doc.data() : null;
};

export const createUser = async ({ id, profileExtra }) => {
  await firestore().collection('users').doc(id).set(profileExtra);
};


export const checkDuplicateUser = async (field, value) => {
  const snapshot = await firestore()
    .collection('users')
    .where(field, '==', value)
    .get();

    console.log(snapshot);

  return !snapshot.empty;
};

const usersCollection = firestore().collection("users");

// ✔ subjects 가져오기 (문자열 배열)
export async function getSubjects(uid) {
  const doc = await usersCollection.doc(uid).get();
  if (!doc.exists) return [];

  const data = doc.data();

  if (!Array.isArray(data.subject)) return [];

  // 문자열 배열 → StudyList UI 형태로 변환
  return data.subject.map((name, index) => ({
    id: index.toString(),     // index 기반 ID
    name,                     // 문자열 그대로
    time: "00:00:00",         // 기본값
    selected: index === 0,    // 기본 0번 선택
  }));
}

// ✔ subjects 업데이트
export async function updateSubjects(uid, subjects) {
  // UI 배열 → 문자열 배열로 변환
  const firestoreFormat = subjects.map((s) => s.name);

  await usersCollection.doc(uid).update({
    subject: firestoreFormat,
  });
}
