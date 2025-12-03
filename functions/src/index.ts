import * as admin from "firebase-admin";

process.env.FIREBASE_FUNCTIONS_DEFAULT_REGION = "asia-northeast3";

admin.initializeApp();

// 랭킹 / 통계
// export { dailyStats } from "./ranking/dailyStats";
// export { monthlyStats } from "./ranking/monthlyStats";
// export { studyLogUpdate } from "./ranking/studyLogUpdate";
// export { updateRankings } from "./ranking/updateRankings";

// 예약 관련
export { reserveEnd } from "./reservation/reserveEnd";
// export { reserveStart } from "./reservation/reserveStart";

// // 착석, 이탈 관련
// export { abnormalPressure } from "./seating/abnormalPressure";
// export { seatIdleCheck } from "./seating/seatIdleCheck";
export { seatStatusChange } from "./seating/seatStatusChange";
// export {studyTimer} from "./studyTimer";
export {dailyReset} from "./dailyReset";
// export { syncSensorToSeat } from "./seating/syncSensorToSeat";