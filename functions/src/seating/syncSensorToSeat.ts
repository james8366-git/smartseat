import { onValueWritten } from "firebase-functions/v2/database";
import * as admin from "firebase-admin";

const db = admin.firestore();

type SensorState = "human" | "empty" | "object" | string;
type SeatStatus =
  | "none"
  | "empty"
  | "occupied"
  | "object"
  | "unauthorized";

export const syncSensorToSeat = onValueWritten(
  {
    ref: "sensors/{seatId}/status",
    region: "asia-southeast1",
  },
  async (event) => {
    const seatId = event.params.seatId;

    // 명확한 타입 강제
    const newSensorState = (event.data.after.val() ?? "") as SensorState;
    const before = (event.data.before.val() ?? "") as SensorState;

    console.log(
      `syncSensorToSeat 실행 | seatId=${seatId}, before=${before}, after=${newSensorState}`
    );

    // 값이 변화 없으면 종료
    if (newSensorState === before) {
      console.log("변경 없음 → 종료");
      return;
    }

    // Firestore 좌석 문서 가져오기
    const seatDoc = await db.collection("seats").doc(seatId).get();
    if (!seatDoc.exists) {
      console.log("좌석 문서 없음 → 종료");
      return;
    }

    const seat = seatDoc.data();
    if (!seat) {
      console.log("좌석 데이터 없음 → 종료");
      return;
    }

    const status = seat.status as SeatStatus;

    // newStatus는 확실하게 SeatStatus 타입이어야 한다
    let newStatus: SeatStatus | "" = "";

    if (newSensorState === "human") newStatus = "occupied";
    if (newSensorState === "empty") newStatus = "empty";
    if (newSensorState === "object") newStatus = "object";

    // 무단 점유 감지
    if (
      status === "none" &&
      (newSensorState === "human" || newSensorState === "object")
    ) {
      newStatus = "unauthorized";
    }

    // 무단 점유 → empty 로 돌아오면 none으로 복귀
    if (status === "unauthorized" && newSensorState === "empty") {
      newStatus = "none";
    }

    // newStatus가 결정되지 않은 경우
    if (!newStatus) {
      console.log(`알 수 없는 상태 → ${newSensorState}`);
      return;
    }

    // Firestore 업데이트
    await db.collection("seats").doc(seatId).update({
      status: newStatus,
    });

    console.log(`seat/${seatId} status=${newStatus} 업데이트 완료`);
  }
);
