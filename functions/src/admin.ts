// functions/src/admin.ts
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

admin.initializeApp();

/**
 * 관리자 권한 부여
 * 호출 예:
 * https://asia-northeast3-smartseat.cloudfunctions.net/setAdmin?uid=USER_UID
 */
export const setAdmin = onRequest(
  { region: "asia-northeast3" },   // ⭐ 이 줄이 핵심
  async (req, res) => {
    try {
      const uid = req.query.uid as string;

      if (!uid) {
        res.status(400).send("uid required");
        return;
      }

      await admin.auth().setCustomUserClaims(uid, {
        isadmin: true,
      });

      res.send(`✅ ${uid} 관리자 권한 부여 완료`);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e.message);
    }
  }
);
