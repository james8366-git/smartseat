import firestore from '@react-native-firebase/firestore';

export const usersCollection = firestore().collection('users');

export function createUser({id, profileExtra}){
    return usersCollection.doc(id).set({
        id,
        ...profileExtra,
        createdAt: firestore.FieldValue.serverTimestamp(),
    },
    {merge: true});
}

export async function getUser(id){
    const doc = await usersCollection.doc(id).get();
    return doc.data();
}