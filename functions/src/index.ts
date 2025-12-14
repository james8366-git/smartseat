import * as admin from "firebase-admin";
process.env.FIREBASE_FUNCTIONS_DEFAULT_REGION = "asia-northeast3";

admin.initializeApp();


// 예약 관련
export { reserveEnd } from "./reservation/reserveEnd";

// // 착석, 이탈 관련

export {seatIdle_anomalyCheck} from "./seating/seatIdle_anomalyCheck"
export { seatStatusChange } from "./seating/seatStatusChange";
export {insertNovStats} from "./insertNovStats";
export {syncSensorToSeat} from "./seating/syncSensorToSeat"
export {goalAchieved} from "./ranking/goalAchieved";

export { syncStatsDaily } from './seating/syncStatsDaily';
export {dailyReset} from "./dailyReset";


//관리자 관련
export {setAdmin} from './admin';