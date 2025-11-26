import { onCall, HttpsError } from "firebase-functions/v2/https";
import type { CallableRequest } from "firebase-functions/v2/https";
import { callableOptions } from "../shared/callableOptions.js";
import { refreshLeaderboards } from "../Socials/leaderboardJob.js";
import { refreshClanLeaderboard } from "../clan/leaderboardJob.js";

const requireAuth = (request: CallableRequest): string => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  return uid;
};

export const refreshGlobalLeaderboardNow = onCall(
  callableOptions(),
  async (request) => {
    requireAuth(request);
    const result = await refreshLeaderboards();
    return { ok: true, ...result };
  },
);

export const refreshClanLeaderboardNow = onCall(
  callableOptions(),
  async (request) => {
    requireAuth(request);
    const result = await refreshClanLeaderboard();
    return { ok: true, ...result };
  },
);
