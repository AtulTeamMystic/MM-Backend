

````markdown
# Technical Spec: Recommended Clans (Smart Pool Architecture)

**Version:** 1.0
**Status:** Approved for Implementation
**Objective:** Provide a randomized list of "Healthy" clans to users, filtering out clans they are not eligible to join (Trophy Requirements), while minimizing Firestore read costs.

## 1. The Problem
Firestore cannot efficiently "Pick Random" documents. Running a live query for random clans is computationally impossible without retrieving large datasets, and running a standard query (e.g., Top 50) results in the same clans being shown to every user ("Zombie Clan" problem).

## 2. The Solution: "Pool & Shuffle"
We will use a **Cron Job** to generate a pool of eligible Clan IDs + Requirements. The **Client** downloads this lightweight pool, filters it locally based on the user's trophies, and then randomly selects a subset to fetch.

### Key Benefits
* **Cost:** Fixed cost (~1 read per user session).
* **Performance:** Instant filtering without complex database queries.
* **Quality:** We only show "Healthy" clans (active, not empty, not full).

---

## 3. Database Schema (The Pool)

We will use a **Singleton Document** to store the pool of recommended candidates.

**Document:** `/System/RecommendedClans`
* **Note:** A Firestore document max size is 1MB. v1 only caches 10 entries, so the payload is tiny.

```json
{
  "updatedAt": 1739990000000, // timestamp
  "pool": [
    {
      "id": "clan_h4ayzw",  // Clan Document ID
      "minimumTrophies": 1200 // Minimum Trophies Requirement
    },
    {
      "id": "clan_b2x9aa",
      "minimumTrophies": 0
    },
    // ... up to 10 items
  ]
}
````

-----

## 4\. Backend Logic (Cron Job)

**Function:** `generateRecommendedPool`
**Trigger:** Schedule (Every 60 Minutes)

**Execution Logic:**

1.  **Query "Healthy" Clans:**
    Query the `Clans` collection for candidates that are active but have room to grow.
      * `type` == "anyone can join"
      * `stats.members` \\>= 1 (avoid empty query)
      * `stats.members` \\<= 45 (Leave room for at least 5 new members)
      * *Limit:* fetch ~50 docs, shuffle, then keep 10.
2.  **Map Data:**
    Extract the fields the Join UI needs.
      * `pool = docs.map(d => ({ id: d.id, minimumTrophies, name, badge, type, members, totalTrophies }))`
3.  **Save:**
    Overwrite `/System/RecommendedClans` with the new array.

-----

## 5\. Frontend Logic (Client)

The client performs the logic to ensure the user only sees relevant, randomized clans.

### Step 1: Fetch Pool (1 Read)

On the "Join Clan" tab load:

  * Read `/System/RecommendedClans`.
  * *Optimization:* Cache this response locally for 30 minutes.

### Step 2: Local Filter (Eligibility Check)

Filter the pool based on the user's current stats. This ensures we never recommend a clan that will reject the user.

  * `userTrophies` = `Profile.trophies`
  * `validClans = pool.filter(item => item.minimumTrophies <= userTrophies)`

### Step 3: Local Shuffle (Randomization)

Pick up to 10 random items from the `validClans` array (whatever the server baked into the doc).

  * Use a standard array shuffle (Fisher-Yates) or random selection logic.
  * Extract the IDs: `selectedIds = [ "clan_A", "clan_B", ... ]`

### Step 4: Hydrate Data (2 Reads)

Fetch the full details for the selected IDs to display in the UI.

  * **Query:** `db.collection('Clans').where(documentId(), 'in', selectedIds)`
  * *Note:* Firestore `IN` operator limits to 30 items. If selecting 50 clans, split into 2 parallel queries.

-----

## 6\. Cost Analysis

**Scenario:** 100,000 Daily Active Users checking the Recommended Tab.

  * **Naive Approach (Live Query):** High contention, poor randomization, same 50 clans get slammed.
  * **Smart Pool Approach:**
      * **Server:** 2,000 reads / hour (negligible).
      * **Client:** 1 Read (Pool) + 2 Reads (Hydration) = **3 Reads per session.**
      * **Total:** Extremely efficient scaling.

<!-- end list -->

```
```
