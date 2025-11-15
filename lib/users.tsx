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
    return doc.data().seatId ?? "";
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

export async function clearSeat(uid) {
  await firestore()
    .collection("users")
    .doc(uid)
    .update({
      seatId: "",      
    });
}