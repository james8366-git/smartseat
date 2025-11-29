import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

export const seatStatusChange = onDocumentUpdated(
  {
    document: "seats/{seatId}",
    region: "asia-northeast3",
  },
  async (event) => {
    const beforeSnap = event.data?.before;
    const afterSnap = event.data?.after;

    // 🔥 안전 장치: snapshot 둘 다 있어야 함
    if (!beforeSnap || !afterSnap) return;

    const before = beforeSnap.data() as any;
    const after = afterSnap.data() as any;

    // 🔥 seatRef 반드시 존재하도록 보장
    const seatRef = afterSnap.ref;
    if (!seatRef) return;

    const now = admin.firestore.Timestamp.now();

    const uid = after.uid as string | undefined;
    const studylogId = after.studylogId as string | undefined;

    // uid 및 studylogId 없으면 처리 불가
    if (!uid || !studylogId) return;

    const userRef = db.collection("users").doc(uid);
    const studylogRef = db.collection("studylogs").doc(studylogId);
    const seatId = event.params.seatId;

    /*  
     * ===========================================================
     * 1) 착석 이벤트: "empty" → "occupied"
     * ===========================================================
     */
    if (before.status === "empty" && after.status === "occupied") {
      await seatRef.update({
        occupiedAt: now,
        lastChecked: now,
        isStudying: true,
      });

      await studylogRef.set(
        {
          seatId,
          occupiedAt: now,
          lastSeated: now,
        },
        { merge: true }
      );

      return;
    }

    /*  
     * ===========================================================
     * 2) 자리비움 이벤트: "occupied" → "empty"
     * ===========================================================
     */
    if (before.status === "occupied" && after.status === "empty") {
      await seatRef.update({
        lastChecked: now,
        isStudying: false,
      });

      // studylog 데이터 가져오기
      const logSnap = await studylogRef.get();
      if (!logSnap.exists) return;

      const log = logSnap.data() as any;
      const occupiedAt = log.occupiedAt as admin.firestore.Timestamp | undefined;
      if (!occupiedAt) return;

      // 🔥 지난 시간 계산 (초 단위)
      const diffSec = Math.floor(
        (now.toMillis() - occupiedAt.toMillis()) / 1000
      );

      // 🔥 사용자 정보 가져오기
      const userSnap = await userRef.get();
      if (!userSnap.exists) return;

      const userData = userSnap.data() as any;
      if (!userData?.subject) return;

      // 🔥 현재 선택된 과목 찾기 (users.subject 구조 기반)
      const selectedId = Object.keys(userData.subject).find(
        (key) => userData.subject[key].selected === true
      );

      if (!selectedId) {
        logger.warn(`⚠ 선택된 과목 없음 uid=${uid}`);
        return;
      }

      const subjectField = `subject.${selectedId}.time`;

      // 🔥 사용자 total + 과목 time + studylog.totalTime 모두 증가
      await Promise.all([
        userRef.update({
          TotalStudyTime: admin.firestore.FieldValue.increment(diffSec),
          [subjectField]: admin.firestore.FieldValue.increment(diffSec),
        }),
        studylogRef.update({
          totalTime: admin.firestore.FieldValue.increment(diffSec),
          lastSeated: now,
        }),
      ]);

      return;
    }
  }
);
