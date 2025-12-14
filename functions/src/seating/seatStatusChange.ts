import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

export const seatStatusChange = onDocumentUpdated(
  {
    document: "seats/{seatId}",
    region: "asia-northeast3",
  },
  async (event) => {
        const before = event.data?.before.data();
        const after = event.data?.after.data();
        const seatId = event.params.seatId;

        if (!before || !after) return;

        const beforeStatus = before.status ?? "none";
        const afterStatus = after.status ?? "none";

        const now = admin.firestore.Timestamp.now();
        const seatRef = event.data?.after.ref;
        if (!seatRef) return;

        /* ========================================================
        * CASE A) empty 상태가 새로 시작된 경우 (예약했지만 착석하지 않음 포함)
        * empty 시작 시점 = lastSeated 로 기록 
        * ======================================================== */
        if (afterStatus === "empty" && beforeStatus !== "empty") {
        logger.info(`seat ${seatId}: -> empty (rest start)`);

        await seatRef.update({
            isStudying: false,
            lastSeated: now, 
        });

        return;
        }

        /* ========================================================
        * CASE C) 좌석 착석: 상태 → occupied
        * 여기서 쉬는시간 누적(seatRestTime) + users.todayRestTime
        * ======================================================== */
        if (afterStatus === "occupied" && beforeStatus !== "occupied") {

        const studentNumber = after.student_number;
        
        // firstStudyAt 저장
        
        const uid = after.uid;

        if (uid) {
            const yyyy = now.toDate().getFullYear();
            const mm = String(now.toDate().getMonth() + 1).padStart(2, "0");
            const dd = String(now.toDate().getDate()).padStart(2, "0");
            const dateId = `${yyyy}-${mm}-${dd}`;

            const statRef = db
            .collection("stats")
            .doc(uid)
            .collection("daily")
            .doc(dateId);

            const statSnap = await statRef.get();
            if (!statSnap.exists || !statSnap.data()?.firstStudyAt) {

                const userSnap = await db.collection("users").doc(uid).get();
                const goalMinutes = userSnap.data()?.goal ?? 0;
            await statRef.set(
                { 
                    firstStudyAt: now,
                    ... (goalMinutes ? {goalMinutes} : {})
            }, { merge: true });
            }
        }

        // 최초 seatStudyStart 기록
        if (beforeStatus !== "occupied" && afterStatus === "occupied" 
            &&!before.seatStudyStart) {


            await seatRef.update(
                { 
                    seatStudyStart: now ,
                }
            );
        }

        return;
        }


        /* ========================================================
        * CASE D) occupied → 비착석 (empty, none 등)
        * → 이탈 시점 기록(lastSeated)
        * ======================================================== */
        if (beforeStatus === "occupied" && afterStatus !== "occupied") {
        logger.info(`seat ${seatId}: occupied -> ${afterStatus}`);

        await seatRef.update({
            isStudying: false,
            lastSeated: now,
        });

        return;
        }
    }
);
