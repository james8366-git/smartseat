// syncStatsDaily.ts — FINAL FIXED
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const syncStatsDaily = onDocumentUpdated(
  {
    document: "users/{uid}",
    region: "asia-northeast3",
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const uid = event.params.uid;

    if (!after) return;

    // ✨ 한국시간(KST)으로 날짜 계산
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    const yyyy = kst.getFullYear();
    const mm = String(kst.getMonth() + 1).padStart(2, "0");
    const dd = String(kst.getDate()).padStart(2, "0");

    const dateId = `${yyyy}-${mm}-${dd}`;


    const statRef = db.collection("stats").doc(uid).collection("daily").doc(dateId);
    const statSnap = await statRef.get();

    // 🔵 문서가 없으면 최초 1회 기본값 생성
    if (!statSnap.exists) {
      await statRef.set({
        dailyTotalTime: 0,
        subjects: {},
        firstStudyAt: null,
        goalNotified : false,
      });
    }

    // 🔵 subjects 변할 때만 저장
    if (JSON.stringify(before?.subject) !== JSON.stringify(after.subject)) {
      const subjectSecs: Record<string, number> = {};
      Object.entries(after.subject ?? {}).forEach(([id, s]: any) => {
        subjectSecs[id] = s?.time ?? 0; // 그대로 초로 저장
      });

      await statRef.set({ subjects: subjectSecs }, { merge: true });
    }

    // 🔵 todayTotalTime 변할 때만 저장
    if (before?.todayTotalTime !== after.todayTotalTime) {
      await statRef.set(
        { dailyTotalTime: after.todayTotalTime },
        { merge: true }
      );
    }
  }
);
