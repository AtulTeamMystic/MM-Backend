import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { callableOptions } from "../shared/callableOptions.js";
import { db } from "../shared/firestore.js";

const normalizeName = (value: string | undefined): string => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value.trim();
};

export const searchPlayer = onCall(
  callableOptions(),
  async (request) => {
    const rawName =
      (typeof request.data?.query === "string" ? request.data.query : null) ??
      (typeof request.data?.name === "string" ? request.data.name : null);

    const name = normalizeName(rawName);
    if (!name) {
      throw new HttpsError("invalid-argument", "Name must be a non-empty string.");
    }

    const nameLower = name.toLowerCase();

    if (name.length <= 2) {
      const usernamesQuery = db
        .collection("Usernames")
        .where(admin.firestore.FieldPath.documentId(), ">=", nameLower)
        .where(admin.firestore.FieldPath.documentId(), "<", `${nameLower}~`)
        .limit(10);
      const usernamesSnap = await usernamesQuery.get();
      const results: Array<{
        uid: string;
        displayName: string;
        avatarId: number;
        level: number;
        trophies: number;
      }> = [];

      for (const doc of usernamesSnap.docs) {
        const usernameData = doc.data() ?? {};
        const uid = typeof usernameData.uid === "string" ? usernameData.uid : null;
        if (!uid) {
          continue;
        }
        const profileDoc = await db.doc(`Players/${uid}/Profile/Profile`).get();
        if (!profileDoc.exists) {
          continue;
        }
        const profile = profileDoc.data() ?? {};
        results.push({
          uid,
          displayName: typeof profile.displayName === "string" ? profile.displayName : "",
          avatarId: typeof profile.avatarId === "number" ? profile.avatarId : 0,
          level: typeof profile.level === "number" ? profile.level : 0,
          trophies: typeof profile.trophies === "number" ? profile.trophies : 0,
        });
      }

      return { success: true, results };
    }

    const usernameDoc = await db.collection("Usernames").doc(nameLower).get();
    if (!usernameDoc.exists) {
      return { success: false, message: "user not found" };
    }
    const usernameData = usernameDoc.data() ?? {};
    const uid = typeof usernameData.uid === "string" ? usernameData.uid : null;
    if (!uid) {
      return { success: false, message: "user not found" };
    }
    const profileDoc = await db.doc(`Players/${uid}/Profile/Profile`).get();
    if (!profileDoc.exists) {
      return { success: false, message: "user not found" };
    }
    const profile = profileDoc.data() ?? {};
    return {
      success: true,
      player: {
        uid,
        displayName: typeof profile.displayName === "string" ? profile.displayName : "",
        avatarId: typeof profile.avatarId === "number" ? profile.avatarId : 0,
        level: typeof profile.level === "number" ? profile.level : 0,
        trophies: typeof profile.trophies === "number" ? profile.trophies : 0,
      },
    };
  },
);

export const searchPlayers = searchPlayer;
