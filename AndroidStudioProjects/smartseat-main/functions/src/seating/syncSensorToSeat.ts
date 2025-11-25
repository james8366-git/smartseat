import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

//RTDB의 좌석 상태 센서값을 Firestore에 저장
export const syncSensorToSeat = functions.database
    .ref("/sensors/{seatId}/state")
    .onWrite(async (change, context) => {
        const seatId = context.params.seatId;
        const newSensorState = change.after.val();

        let newStatus = "";
        if (newSensorState === "human") newStatus = "occupied";
        if (newSensorState === "empty") newStatus = "empty";
        if (newSensorState === "object") newStatus = "object";

        await db.collection("seats").doc(seatId).update({
            status: newStatus
        });
    });