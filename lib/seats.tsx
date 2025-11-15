// lib/seats.tsx
import firestore from '@react-native-firebase/firestore';

/** 방(roomId) 기준 좌석 목록 가져오기 */
export async function getSeatsByRoom(roomId) {
  const snapshot = await firestore()
    .collection("seats")
    .where("room", "==", roomId)
    .get();

  return snapshot.docs.map((doc) => ({
    seatId: doc.id,               // 🔥 seatId 필드는 문서 id!
    ...doc.data(),
  }));
}


/** 방(roomId) 기준 좌석 수 */
export async function getSeatCountByRoom(roomId: string) {
  const snapshot = await firestore()
    .collection('seats')
    .where('room', '==', roomId)
    .get();

  return snapshot.size;
}

/** roomId → 한글 열람실 이름 */
export function roomIdToName(roomId: string) {
  switch (roomId) {
    case '11':
      return '제1열람실';
    case '21':
      return '제2-1열람실';
    case '22':
      return '제2-2열람실';
    case '23':
      return '제2-2열람실 (대학원생 전용)';
    default:
      return roomId;
  }
}

/**
 * 좌석 예약 트랜잭션
 * - seats/{seatDocId} 갱신
 * - users/{uid}/seatId 갱신
 * - studylogs/{uid} 생성(or merge)
 */
export async function reserveSeat({
  seatDocId,
  roomId,
  seatNumber,
  user,
}: {
  seatDocId: string;
  roomId: string;
  seatNumber: number | string;
  user: {
    uid: string;
    student_number: string;
    subject?: string[]; // users 문서의 subject 배열
  };
}) {
  const db = firestore();

  const seatRef = db.collection('seats').doc(seatDocId);
  const userRef = db.collection('users').doc(user.uid);
  const studyRef = db.collection('studylogs').doc(user.uid);

  await db.runTransaction(async (tx) => {
    const [seatSnap, userSnap] = await Promise.all([
      tx.get(seatRef),
      tx.get(userRef),
    ]);

    if (!seatSnap.exists) {
      throw new Error('NO_SEAT');
    }

    const seatData: any = seatSnap.data();
    const userData: any = userSnap.data();

    // 1) 자리가 이미 점유/예약된 경우
    if (seatData.status && seatData.status !== 'none') {
      throw new Error('SEAT_ALREADY_RESERVED');
    }

    // 2) 유저가 이미 자리 가지고 있는 경우
    if (userData?.seatId && userData.seatId !== '') {
      throw new Error('USER_ALREADY_HAS_SEAT');
    }

    const now = new Date();
    const addZero = (n: number) => String(n).padStart(2, '0');

    const reservedSt = `${addZero(now.getHours())}:${addZero(
      now.getMinutes(),
    )}`;

    const end = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const reservedEd = `${addZero(end.getHours())}:${addZero(end.getMinutes())}`;

    const roomName = roomIdToName(roomId);
    const seatLabel = `${roomName}-${seatNumber}번`;

    // seats/{seatId} 업데이트
    tx.update(seatRef, {
      student_number: user.student_number,
      status: 'empty', // 예약 상태
      reservedSt,
      reservedEd,
      lastSeated: firestore.FieldValue.serverTimestamp(),
    });

    // users/{uid} seatId 업데이트
    tx.update(userRef, {
      seatId: seatLabel,
    });

    // studylogs/{uid} 생성(또는 병합)

    tx.set(
      studyRef,
      {
        uid: user.uid,
        lastSeated: firestore.FieldValue.serverTimestamp(),
        occupiedAt: firestore.FieldValue.serverTimestamp(),
        seatId: seatLabel,
        student_number: user.student_number,
        totalTime: 0,
        subject: (user.subject ?? []).map((name: string) => ({
          studyTime: '0',
          subjectName: name,
        })),
      },
      { merge: true },
    );
  });
}

export const clearSeatStatus = async (seatDocId: string) => {
  await firestore().collection("seats").doc(seatDocId).update({
    reservedSt: "",
    reservedEd: "",
    status: "none",
    student_number: "",
  });
};