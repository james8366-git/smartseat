import * as admin from "firebase-admin";
import { insertNovStats } from "./insertNovStats";
import { setAdmin } from "./admin";

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

// export { seatIdleCheck } from "./seating/seatIdleCheck";
export {seatIdle_anomalyCheck} from "./seating/seatIdle_anomalyCheck"
export { seatStatusChange } from "./seating/seatStatusChange";
export {insertNovStats} from "./insertNovStats";
export {syncSensorToSeat} from "./seating/syncSensorToSeat"
export {goalAchieved} from "./ranking/goalAchieved";
// export {studyTimer} from "./studyTimer";
export { syncStatsDaily } from './seating/syncStatsDaily';
export {dailyReset} from "./dailyReset";
// export { syncSensorToSeat } from "./seating/syncSensorToSeat";

//관리자 관련
export {setAdmin} from './admin';