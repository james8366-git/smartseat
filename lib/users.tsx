import firestore from '@react-native-firebase/firestore';

// 기존 코드 예시
export const getUser = async (id) => {
  const doc = await firestore().collection('users').doc(id).get();
  if (!doc.exists) return null;

  return {
    uid: doc.id,
    ...doc.data(),
  };
};

export const createUser = async ({ id, profileExtra }) => {
  await firestore()
    .collection('users')
    .doc(id)
    .set({
        id,
      ...profileExtra,  
    });
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

export async function getSeatId(uid) {
    const doc = await firestore().collection("users").doc(uid).get();
    if (!doc.exists){
        return "";
    } 
    return doc.data().seatLabel ?? "";
}

// ✔ subjects 가져오기 (문자열 배열)
export async function getSubjects(uid) {
  const doc = await usersCollection.doc(uid).get();
  if (!doc.exists) return [];

  const data = doc.data();

  if (!Array.isArray(data.subject)) return [];


  return data.subject.map((name, index) => ({
    id: index.toString(),     
    name,                     
    time: "00:00:00",         
    selected: index === 0,    
  }));
}

// ✔ subjects 업데이트
export async function updateSubjects(uid, subjects) {

  const firestoreFormat = subjects.map((s) => s.name);

  await usersCollection.doc(uid).update({
    subject: firestoreFormat,
  });
}

export async function updateSelectedSubject(uid: string, subjectName: string) {
  await firestore()
    .collection("users")
    .doc(uid)
    .update({
      selectedSubject: subjectName,
    });
}

export async function clearSeat(uid) {
  await firestore()
    .collection("users")
    .doc(uid)
    .update({
      seatLabel: "",      
    });
}


// HomeScreen의 totalTime 가져오기.

export const getTodayTotalTime = async (uid: string) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayKey = `${yyyy}-${mm}-${dd}`; // 예: 2025-11-25

    const doc = await firestore()
        .collection("studylogs")
        .doc(uid)
        .collection("daily")
        .doc(todayKey)
        .get();

    if (!doc.exists) return 0;

    // Firestore 데이터 형태: { dailyTotalTime: 20, date: "2025-11-25" }
    return doc.data()?.dailyTotalTime ?? 0;
};
