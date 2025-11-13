# Debugging Prompt: Resolving Cloud Function Validation Errors

## 1. Problem Statement

A validation script is being used to test a suite of Cloud Functions. While some functions are returning the expected `200 OK` status, a number of them are failing with `400 Bad Request` and `500 Internal Server Error` responses. The goal is to diagnose and resolve these issues to ensure that all Cloud Functions are working correctly.

## 2. Context & Environment

*   **Project:** `mystic-motors-sandbox`
*   **Region:** `us-central1`
*   **Runtime:** Node.js 20 (2nd Gen)
*   **Deployment Tool:** Firebase CLI

## 3. Validation Script

### `backend-sandbox/tools/fullValidation.mjs`

```javascript
// tools/fullValidation.mjs
const idToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMjEzMGZlZjAyNTg3ZmQ4ODYxODg2OTgyMjczNGVmNzZhMTExNjUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbXlzdGljLW1vdG9ycy1zYW5kYm94IiwiYXVkIjoibXlzdGljLW1vdG9ycy1zYW5kYm94IiwiYXV0aF90aW1lIjoxNzYwODY2NjM4LCJ1c2VyX2lkIjoibnNKRU5LOFd5Y2FuaDVod0g4Y2xZM1Boak1oMiIsInN1YiI6Im5zSkVOSzhXeWNhbmg1aHdIOGNsWTNQaGpNaDIiLCJpYXQiOjE3NjA4NjY2MzksImV4cCI6MTc2MDg3MDIzOSwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJ0ZXN0QGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.kJbiLdxhILQ2c3NHL8fYosJrabSlPE8vjBYg8FjfCL_wTKamB7r1h50w36LY9-VvnOJPpDk1hzOQsLIYa4FW-FIQ3SYeHVYjq3ZtEyqiU559jMgbTMWIsvCAEmTfX5WdKPjcvO7aPKHa6UcukeLRR9DKRZ21qv6Vv9bJl1qdRBmB5DtZPX7FqiEQgbsjuj2xNXRZp4PYZO58aAdPK-01Icj1rk1RS32CoIcpFv8XDbNKUhKi0K4qvpGbCLZ4pkJXVQ9lTBLzQzRVthAlnwSXA7SNVphbZ2KwbmXvVMOUxJNhLusL4qNLu6b1aJ89Dx0PlpCdID_SSFgQljdBWgoPEw";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${idToken}`,
};

async function validateFunction(url, data, isPublic = false) {
  const t0 = Date.now();
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  };
  if (!isPublic) {
    options.headers.Authorization = `Bearer ${idToken}`;
  }
  const res = await fetch(url, options);
  console.log(`[${res.status}] ${url} ${Date.now() - t0}ms`);
  console.log(await res.text());
}

async function run() {
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/healthcheck", {}, true);
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/getMaintenanceStatus", {}, true);
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/adjustCoins", { amount: 100, opId: "test-op-1" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/adjustGems", { amount: 10, opId: "test-op-2" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/grantXP", { amount: 50, opId: "test-op-3" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/startRace", { raceId: "test-race", lobbyPlayerTrophies: [100, 200], playerIndexInLobby: 0, opId: "test-op-4" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/recordRaceResult", { raceId: "test-race", position: 1, opId: "test-op-5" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/purchaseCar", { carId: "default_car_id", opId: "test-op-6" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/upgradeCar", { carId: "default_car_id", opId: "test-op-7" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/equipCosmetic", { carId: "default_car_id", itemId: "sku_crate_common_starter", slot: "wheels", opId: "test-op-8" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/grantItem", { itemId: "sku_crate_common_starter", quantity: 1, opId: "test-op-9", reason: "test" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/openCrate", { crateId: "crate_common_starter", opId: "test-op-10" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/createClan", { name: "test-clan", description: "test-clan", badge: "test-badge", opId: "test-op-11" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/updateClanSettings", { clanId: "test-clan", description: "new-description", opId: "test-op-12" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/joinClan", { clanId: "test-clan", opId: "test-op-13" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/leaveClan", { opId: "test-op-14" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/updateMemberTrophies", { trophyDelta: 10, opId: "test-op-15" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/inviteToClan", { targetUid: "test-user", opId: "test-op-16" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/requestToJoinClan", { clanId: "test-clan", opId: "test-op-17" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/generateBotLoadout", { trophyCount: 100 });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/getLeaderboard", { leaderboardType: "trophies" });
  await validateFunction("https://us-central1-mystic-motors-sandbox.cloudfunctions.net/claimMaintenanceReward", { opId: "test-op-18" });
}

run().catch(e => { console.error(e); process.exit(1); });
```

## 4. Validation Results

*   **`healthcheck` & `getMaintenanceStatus`:** `200 OK`
*   **`requestToJoinClan`:** `200 OK`
*   **`inviteToClan`:** `400 Bad Request` - "Player is not in a clan." (Expected)
*   **`getLeaderboard`:** `400 Bad Request` - "Missing required parameters." (Expected)
*   **`adjustCoins`, `adjustGems`, `grantXP`:** `500 Internal Server Error` - "Value for argument "data" is not a valid Firestore document. Cannot use "undefined" as a Firestore value (found in field "reason")."
*   **`generateBotLoadout`:** `500 Internal Server Error` - "Could not load game configuration."
*   **All Other Functions:** `500 Internal Server Error` - "Value for argument "documentPath" must point to a document... Your path does not contain an even number of components."

## 5. Investigation Plan

1.  **Fix `reason` Field:**
    *   In `fullValidation.mjs`, add a `reason` field to the data payload for the `adjustCoins`, `adjustGems`, and `grantXP` functions.
2.  **Fix `getLeaderboard`:**
    *   In `fullValidation.mjs`, add the `leaderboardType` parameter to the data payload for the `getLeaderboard` function.
3.  **Investigate `generateBotLoadout`:**
    *   Check the Cloud Function logs for the `generateBotLoadout` function to get more details on the "Could not load game configuration" error.
    *   Verify that the `GameConfig` document exists in Firestore and is correctly configured.
4.  **Investigate Firestore Document Paths:**
    *   The "Your path does not contain an even number of components" error indicates an issue with the way Firestore document paths are being constructed.
    *   Review the `core/idempotency.ts` and `core/transactions.ts` files to ensure that the document paths are being constructed correctly.
    *   Verify that the `players` collection and the `transactions` sub-collection are being correctly referenced.
5.  **Set Up Test Data:**
    *   The `startRace`, `recordRaceResult`, `purchaseCar`, `upgradeCar`, `equipCosmetic`, `openCrate`, `createClan`, `updateClanSettings`, `joinClan`, `leaveClan`, `inviteToClan`, and `claimMaintenanceReward` functions are all failing because they are dependent on data that does not exist in Firestore.
    *   Create a separate script to set up the necessary test data in Firestore before running the validation script. This will involve creating a test user, a test clan, and other related data.

By following this investigation plan, we should be able to resolve all the validation errors and ensure that all the Cloud Functions are working correctly.
