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
