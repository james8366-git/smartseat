const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.reserveSeat = functions.https.onCall(async (data, context) => {
  const { userUid, seatId, subject, seatLabel } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const seatRef = admin.firestore().collection('seats').doc(seatId);
  const userRef = admin.firestore().collection('users').doc(userUid);
  const studyRef = admin.firestore().collection('studylogs').doc(userUid);

  const now = new Date();

  const HH = now.getHours().toString().padStart(2, "0");
  const MM = now.getMinutes().toString().padStart(2, "0");
  const reservedSt = `${HH}:${MM}`;

  const end = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const HH2 = end.getHours().toString().padStart(2, "0");
  const MM2 = end.getMinutes().toString().padStart(2, "0");
  const reservedEd = `${HH2}:${MM2}`;

  return admin.firestore().runTransaction(async tx => {
    const seatSnap = await tx.get(seatRef);
    const userSnap = await tx.get(userRef);

    if (!seatSnap.exists) {
      throw new functions.https.HttpsError('not-found', '좌석이 존재하지 않습니다.');
    }

    const seatData = seatSnap.data();
    const userData = userSnap.data();

    if (seatData.status !== 'none') {
      throw new functions.https.HttpsError('already-exists', '이미 선점된 자리입니다.');
    }

    if (userData.seatId && userData.seatId !== '') {
      throw new functions.https.HttpsError('failed-precondition', '이미 자리를 예약한 유저입니다.');
    }

    // 1) seats 업데이트
    tx.update(seatRef, {
      status: "empty",
      reservedSt,
      reservedEd,
      student_number: userData.student_number,
      lastSeated: now,
    });

    // 2) users 업데이트
    tx.update(userRef, {
      seatId: seatId,
      seatLabel: seatLabel,
    });

    // 3) studylogs 생성/갱신
    tx.set(
      studyRef,
      {
        uid: userUid,
        lastSeated: now,
        occupiedAt: now,
        seatLabel: seatLabel,
        student_number: userData.student_number,
        totalTime: 0,
        subject: [
          {
            subjectName: subject,
            studyTime: '0',
          },
        ],
      },
      { merge: true }
    );
  });
});
