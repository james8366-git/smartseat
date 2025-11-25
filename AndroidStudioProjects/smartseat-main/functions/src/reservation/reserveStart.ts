import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const reserveStart = functions.https.onCall(async(data, context) =>{

    const {seatLabel, room, seat_number} = data;
    const userId = context.auth.uid;

    //사용자 정보 조회
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    if(!userData){
        throw new functions.https.HttpsError(
            "not-found",
            "사용자 정보를 찾을 수 없습니다."
        );
    }

    const student_number = userData.student_number;

    //seatLabel로 seatId 찾기
    const seatSnap = await.db
        .collection("seats")
        .where("seatLabel", "==", seatLabel)
        .limit(1)
        .get();

    if (seatSnap.empty) {
        throw new functions.https.HttpsError(
          "not-found",
          "해당 좌석을 찾을 수 없습니다."
        );
    }

    //이미 예약된 좌석 인지 체크
      if (seatData.status !== "none") {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "이미 예약된 좌석입니다."
        );
      }

      //예약 시간 계산
      const now = new Date();
      const reserveEnd = new Date(now.getTime() + 6 * 60 * 60 * 1000);

      //seats 문서 업데이트
      await seatRef.update({
        status: "empty",
        student_number: student_number,
        room: room,
        seatNumber: seat_number,
        reserveSt: admin.firestore.Timestamp.fromDate(now),
        reserveEd: admin.firestore.Timestamp.fromDate(reserveEnd),
        lastChecked: admin.firestore.FieldValue.serverTimestamp(),
      });

      //users 문서 업데이트
      await userRef.update({
        seatLabel: seatLabel,
      });

      return {
        success: true,
        seatId,
        seatLabel,
        reserveEnd,
      };
    });
