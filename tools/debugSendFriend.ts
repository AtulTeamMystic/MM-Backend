import * as admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/v2/https";
import { sendFriendRequestByUid } from "../src/Socials/friends.js";

const app = admin.apps.length > 0 ? admin.app() : admin.initializeApp();
const db = app.firestore();

const seedProfile = async (uid: string, profile: Record<string, unknown>) => {
  await db.doc(`Players/${uid}/Profile/Profile`).set(
    {
      displayName: profile.displayName ?? uid,
      avatarId: profile.avatarId ?? 1,
      level: profile.level ?? 1,
      trophies: profile.trophies ?? 0,
    },
    { merge: true },
  );
};

const main = async () => {
  const fromUid = process.env.FROM_UID ?? "debug_from";
  const toUid = process.env.TO_UID ?? "debug_to";
  const authUid = process.env.AUTH_UID ?? "debug_admin";

  await Promise.all([
    seedProfile(fromUid, { displayName: "From Debug", trophies: 1234 }),
    seedProfile(toUid, { displayName: "To Debug", trophies: 4321 }),
  ]);

  const response = await sendFriendRequestByUid({
    data: {
      fromUid,
      toUid,
      message: "debug-send",
    },
    auth: {
      uid: authUid,
      token: { firebase: { sign_in_provider: "custom" } },
    },
  } as CallableRequest<Record<string, unknown>>);

  console.log("Function response:", response);

  const doc = await db.doc(`Players/${toUid}/Social/Requests`).get();
  console.log("Target incoming requests:", doc.data()?.incoming ?? []);
};

main()
  .then(() => {
    console.log("Debug friend request completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Debug friend request failed:", error);
    process.exit(1);
  });
