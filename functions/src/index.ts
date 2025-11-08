import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

// 예약 관련
export { onSeatReserved } from "./reservation/onSeatReserved";
export { onReserveTimeout } from "./reservation/onReserveTimeout";

// 착석 관련
export { onSeatOccupied } from "./seating/onSeatOccupied";
export { onSeatEmptied } from "./seating/onSeatEmptied";

// 랭킹 / 통계
export { updateRankings } from "./ranking/updateRankings";