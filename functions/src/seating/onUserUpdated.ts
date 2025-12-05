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

    const now = admin.firestore.Timestamp.now();
    const yyyy = now.toDate().getFullYear();
    const mm = String(now.toDate().getMonth() + 1).padStart(2, "0");
    const dd = String(now.toDate().getDate()).padStart(2, "0");
    const dateId = `${yyyy}-${mm}-${dd}`;

    const statRef = db.collection("stats").doc(uid).collection("daily").doc(dateId);

    // ⭐ subjects 저장 — 타입 명시 FIX
    if (after.subject) {
      const subjectSecs: Record<string, number> = {};

      Object.entries(after.subject).forEach(([id, s]: any) => {
        subjectSecs[id] = s?.time ?? 0;
      });

      await statRef.set(
        {
          subjects: subjectSecs,
        },
        { merge: true }
      );
    }

    // ⭐ todayTotalTime 저장
    if (typeof after.todayTotalTime === "number") {
      await statRef.set(
        {
          dailyTotalTime: after.todayTotalTime * 60,
        },
        { merge: true }
      );
    }
  }
);
