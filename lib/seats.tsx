import firestore from '@react-native-firebase/firestore';

/** 방(roomId) 좌석 개수 가져오기 */
export async function getSeatCountByRoom(roomId: string) {
  const snapshot = await firestore()
    .collection('seats')
    .where('room', '==', roomId)
    .get();

  return snapshot.size;
}

/** 방(roomId)의 좌석 목록 가져오기 (seat_number 기준 정렬) */
export async function getSeatsByRoom(roomId: string) {
  const snapshot = await firestore()
    .collection('seats')
    .where('room', '==', roomId)
    .orderBy('seat_number', 'asc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
