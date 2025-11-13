import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { REGION } from "../shared/region";

const db = admin.firestore();

export const searchPlayer = onCall({ region: REGION }, async (request) => {
  const { name } = request.data as { name: string };
  if (typeof name !== "string" || name.length < 1) {
    throw new HttpsError("invalid-argument", "Name must be a non-empty string.");
  }
  const nameLower = name.toLowerCase();

  // If searching for a prefix (1-2 chars), return up to 10 players whose displayName starts with prefix
  if (name.length <= 2) {
    const usernamesQuery = db.collection("Usernames")
      .where(admin.firestore.FieldPath.documentId(), ">=", nameLower)
      .where(admin.firestore.FieldPath.documentId(), "<", nameLower + "~")
      .limit(10);
    const usernamesSnap = await usernamesQuery.get();
    const results = [];
    for (const doc of usernamesSnap.docs) {
      const usernameData = doc.data();
      const uid = usernameData?.uid;
      if (!uid) continue;
      const profileDoc = await db.doc(`Players/${uid}/Profile/Profile`).get();
      if (profileDoc.exists) {
        const profile = profileDoc.data();
        if (profile) {
          results.push({
            uid,
            displayName: profile.displayName ?? "",
            avatarId: profile.avatarId ?? 0,
            level: profile.level ?? 0,
            trophies: profile.trophies ?? 0,
          });
        }
      }
    }
    return { success: true, results };
  }

  // If searching for an exact name
  const usernameDoc = await db.collection("Usernames").doc(nameLower).get();
  if (!usernameDoc.exists) {
    return { success: false, message: "user not found" };
  }
  const usernameData = usernameDoc.data();
  const uid = usernameData?.uid;
  if (!uid) {
    return { success: false, message: "user not found" };
  }
  const profileDoc = await db.doc(`Players/${uid}/Profile/Profile`).get();
  if (!profileDoc.exists) {
    return { success: false, message: "user not found" };
  }
  const profile = profileDoc.data();
  if (!profile) {
    return { success: false, message: "user not found" };
  }
  return {
    success: true,
    player: {
      uid,
      displayName: profile.displayName ?? "",
      avatarId: profile.avatarId ?? 0,
      level: profile.level ?? 0,
      trophies: profile.trophies ?? 0,
    },
  };
});
