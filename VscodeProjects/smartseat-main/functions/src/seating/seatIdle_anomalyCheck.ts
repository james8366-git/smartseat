import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

const db = admin.firestore();
const fcm = admin.messaging();

export const seatIdle_anomalyCheck = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "Asia/Seoul",
    region: "asia-southeast1",
  },
  async (event) => {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - 90 * 60 * 1000);
    const thresholdTs = admin.firestore.Timestamp.fromDate(thresholdDate);

    console.log("seatIdleCheck 실행");

    try {
      // 1) empty 90분 초과 좌석 조회 (자리비움 지속)
      const emptySnap = await db
        .collection("seats")
        .where("status", "==", "empty")
        .where("lastSeated", "<=", thresholdTs)
        .get();

      // 2) object 90분 초과 좌석 조회 (이상압력 지속)
      const objectSnap = await db
        .collection("seats")
        .where("status", "==", "object")
        .where("abnormalPressure", "<=", thresholdTs)
        .get();

      // 3) 예약이 없는 데 압력이 감지된 좌석 조회
      const noneSnap = await db
        .collection("seats")
        .where("status", "==", "unauthorized")
        .get();

      console.log(`empty 90분 초과: ${emptySnap.size}`);
      console.log(`object 90분 초과: ${objectSnap.size}`);
      console.log(`무단 점유 좌석: ${noneSnap.size}`);

      // 관리자 목록
      const adminSnap = await db
        .collection("users")
        .where("isadmin", "==", true)
        .get();

      const adminTokens = adminSnap.docs
        .map((d) => d.data().fcmToken)
        .filter(Boolean);

      if (adminTokens.length === 0) {
        console.log("관리자 FCM 없음 → 종료");
        return;
      }

      // 알림 보낼 대상 합치기
      const targets = [];

      emptySnap.forEach((doc) =>
        targets.push({ id: doc.id, data: doc.data(), type: "empty" })
      );
      objectSnap.forEach((doc) =>
        targets.push({ id: doc.id, data: doc.data(), type: "object" })
      );
      noneSnap.forEach((doc) =>
        targets.push({ id: doc.id, data: doc.data(), type: "unauthorized" })
      );

      for (const t of targets) {
        const seatId = t.id;
        const seat = t.data;
        const type = t.type;

        const room = seat.room;
        const seatNumber = String(seat.seat_number || "");

        console.log(`알림 대상 seat=${seatId}, type=${type}`);

        // DB 기록용
        await db.collection("notifications").add({
          seatId,
          type,
          room,
          seatNumber,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // FCM 메시지
        const message =
          type === "empty"
            ? {
                title: "장시간 자리 비움",
                body: `제1열람실 ${seatNumber}번 좌석이 90분 이상 비어 있습니다.`,
              }
            : type === "object"
            ? {
                title: "이상 압력 감지",
                body: `제1열람실 ${seatNumber}번 좌석에서 이상 압력이 90분 이상 지속되었습니다.`,
              }
            : type === "unauthorized"
            ? {
                title: "무단 점유 감지",
                body: `제1열람실 ${seatNumber}번 좌석에서 무단 점유가 감지되었습니다.`,
              }
            : {
                title: "좌석 상태 알림",
                body: `제1열람실 ${seatNumber}번 좌석 상태가 변경되었습니다.`,
              };

        // 전송
        for (const token of adminTokens) {
          await fcm.send({
            token,
            notification: message,
            data: { seatId, type },
          });
        }

        console.log(`FCM 발송 완료 seat=${seatId}`);
      }

      console.log("seatStatusCheck 완료");
    } catch (err) {
      console.error("seatStatusCheck 오류", err);
    }
  }
);