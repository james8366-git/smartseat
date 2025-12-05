// dailyReset.ts — INDUSTRY-GRADE DAILY RESET VERSION
// 자정에 실행되어 오늘 공부시간(subject.time)을 0으로 초기화
// 단, 공부 중인 경우 runningSubjectSince는 유지하여 타이머가 자연스럽게 내일로 이어지게 한다.

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

/** diff 계산 함수 */
function diffSeconds(startTs: admin.firestore.Timestamp) {
  const start = startTs.toDate().getTime() / 1000;
  const now = Date.now() / 1000;
  return Math.max(0, Math.floor(now - start));
}

export const dailyReset = onSchedule(
  {
    schedule: "0 0 * * *",  // 매일 자정 00:00
    timeZone: "Asia/Seoul",
    region: "asia-northeast3",
  },
  async () => {
    logger.info("🔥 Daily reset started...");

    const usersSnap = await db.collection("users").get();
    const batch = db.batch();

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      const subject = data.subject || {};
      const selectedSubject = data.selectedSubject;
      const runningSince: admin.firestore.Timestamp | null =
        data.runningSubjectSince ?? null;

      const updatedSubject: any = {};

      /* ---------------------------------------------------------
       * ① 공부 중이라면 diff를 flush하여 어제 공부시간으로 확정 저장
       * --------------------------------------------------------- */
      if (runningSince && selectedSubject && subject[selectedSubject]) {
        const diff = diffSeconds(runningSince);
        const prev = subject[selectedSubject].time ?? 0;

        updatedSubject[selectedSubject] = {
          ...subject[selectedSubject],
          time: prev + diff,   // flush
        };
      }

      /* ---------------------------------------------------------
       * ② 모든 과목의 time을 0으로 초기화 → 오늘 공부시간 reset
       *    (flush된 값은 날아가지 않음)
       * --------------------------------------------------------- */
      Object.entries(subject).forEach(([id, s]: any) => {
        // 위에서 flush한 값이 있으면 그걸 우선 사용
        const flushed = updatedSubject[id]?.time ?? s.time ?? 0;

        updatedSubject[id] = {
          ...s,
          time: 0,  // 오늘 공부시간 리셋
          // 총 누적시간(totalTime)을 나중에 도입할 경우 여기에 totalTime 추가 가능
        };
      });

      /* ---------------------------------------------------------
       * ③ runningSubjectSince는 유지한다.
       *    공부가 자정 이후에도 자연스럽게 이어지도록 하기 위함.
       * --------------------------------------------------------- */

      batch.update(doc.ref, {
        subject: updatedSubject,
        // runningSubjectSince 그대로 유지 (절대 초기화 X)
        // selectedSubject도 그대로 유지
        goalNotified: false,
      });
    }

    await batch.commit();
    logger.info("🔥 Daily reset completed without errors.");
  }
);
