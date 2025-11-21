import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { callableOptions } from "../shared/callableOptions.js";
import { REGION } from "../shared/region.js";
import { db } from "../shared/firestore.js";
import { clansCollection, requireAuth } from "./helpers.js";

const RECOMMENDED_POOL_LIMIT = 2000;
const HEALTHY_MIN_MEMBERS = 15;
const HEALTHY_MAX_MEMBERS = 45;

export interface RecommendedClanPoolEntry {
  id: string;
  req: number;
}

const recommendedClansDocRef = () => db.collection("System").doc("RecommendedClans");

const normalizeRequirement = (value: unknown): number => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return 0;
  }
  return Math.floor(numericValue);
};

const fetchCandidateClans = async (): Promise<RecommendedClanPoolEntry[]> => {
  const snapshot = await clansCollection()
    .where("status", "==", "active")
    .where("type", "==", "anyone can join")
    .where("stats.members", ">=", HEALTHY_MIN_MEMBERS)
    .where("stats.members", "<=", HEALTHY_MAX_MEMBERS)
    .orderBy("stats.members")
    .limit(RECOMMENDED_POOL_LIMIT)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() ?? {};
    return {
      id: data.clanId ?? doc.id,
      req: normalizeRequirement(data.minimumTrophies ?? 0),
    };
  });
};

const shuffleEntries = (entries: RecommendedClanPoolEntry[]): RecommendedClanPoolEntry[] => {
  const clone = [...entries];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

export const rebuildRecommendedClansPool = async (): Promise<{ processed: number }> => {
  const candidates = await fetchCandidateClans();
  const shuffled = shuffleEntries(candidates);
  const payload = {
    updatedAt: admin.firestore.Timestamp.now(),
    poolSize: shuffled.length,
    pool: shuffled,
  };
  await recommendedClansDocRef().set(payload);
  return { processed: shuffled.length };
};

export const recommendedClansPoolJob = onSchedule(
  {
    region: REGION,
    schedule: "every 60 minutes",
    timeZone: "Etc/UTC",
  },
  async () => {
    await rebuildRecommendedClansPool();
  },
);

const normalizePoolEntries = (input: unknown): RecommendedClanPoolEntry[] => {
  if (!Array.isArray(input)) {
    return [];
  }
  const normalized: RecommendedClanPoolEntry[] = [];
  input.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }
    const candidate = item as Record<string, unknown>;
    const id = typeof candidate.id === "string" ? candidate.id : null;
    if (!id) {
      return;
    }
    const req = normalizeRequirement(candidate.req ?? candidate.minimumTrophies);
    normalized.push({ id, req });
  });
  return normalized;
};

export const getRecommendedClansPool = onCall(callableOptions(), async (request) => {
  requireAuth(request);
  const snapshot = await recommendedClansDocRef().get();
  if (!snapshot.exists) {
    throw new HttpsError("failed-precondition", "Recommendation pool not ready.");
  }
  const data = snapshot.data() ?? {};
  const updatedAt = data.updatedAt instanceof admin.firestore.Timestamp ? data.updatedAt.toMillis() : null;
  const pool = normalizePoolEntries(data.pool);
  return {
    updatedAt,
    pool,
  };
});
