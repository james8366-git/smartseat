import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

// 랭킹 / 통계
export { dailyStats } from "./ranking/dailyStats";
export { studyLogUpdate } from "./ranking/studyLogUpdate";
export { updateRankings } from "./ranking/updateRankings";

// 예약 관련
export { reserveEnd } from "./reservation/onReserveEnd";
export { reserveStart } from "./reservation/onReserveStart";

// 착석, 이탈 관련
export { abnormalPressure } from "./seating/onAbnormalPressure";
export { seatIdleCheck } from "./seating/seatIdleCheck";
export { seatStatusChange } from "./seating/onSeatStatusChange";
export { syncSensorToSeat } from "./seating/syncSensorToSeat";