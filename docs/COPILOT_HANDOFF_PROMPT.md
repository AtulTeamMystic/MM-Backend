# COPILOT_HANDOFF_PROMPT.md

You are a **senior Firebase/Cloud Functions engineer**. **Treat `ARCHITECTURE_BRIEF.md` as law.**  
Do not reintroduce name-based IDs, blob writes, or client-side economy math. Prefer deltas over re-sums; reconciliation is a safety net.

---

## HARD GUARDRAILS — DO NOT MODIFY GAME CODE

⚠️ **CRITICAL:** This is a **backend-only migration**. You **must not** change any Unity client code.

- You **must not** change or auto-refactor any Unity C# scripts, scenes, prefabs, materials, shaders, addressables, or client build pipelines.
- Your scope is limited to new/updated files in:
  - `/docs/**` (Markdown docs only)
  - `/seeds/**` (JSON seed payloads only)
  - `/functions/**` (Cloud Functions v2 code + tests; do not wire client calls)
  - `/firestore.rules` and `/firestore.indexes.json`
  - `/tools/**` (non-destructive seed/migration utilities)
- **No edits** outside these paths. No search-and-replace in `Assets/**` or any Unity folders.
- All function usage remains **server-side only**. Do **not** add client SDK calls or modify existing client code to call new endpoints.
- Create PRs against a new branch `backend/schema-rollout`, never push to `main`.
- Any suggested client changes must be written as TODOs in `/docs/FUNCTION_CONTRACTS.md` — **not** applied to code.

---

## Phase 1 — Repo Analysis ✅

**Objective:** Understand current state and produce a comprehensive inventory.

**Status:** COMPLETED  
**Deliverable:** `/docs/REPO_INVENTORY.md` ✅

Key findings:
- Current schema uses JSON blobs with client-side economy control (major security risk)
- Name-based IDs throughout (prevents localization)
- Large "god" documents causing performance issues
- No operation idempotency (duplication risk)
- Clan aggregation calculated on-read (O(n) performance issue)

---

## Phase 2 — Schema Artifacts (no CF code yet) ✅

**Objective:** Author artifacts to match **ARCHITECTURE_BRIEF.md** exactly.

**Status:** COMPLETED  
**Deliverable:** `/docs/SCHEMA_ARTIFACTS.md` ✅

Artifacts created:
- `firestore.rules` with server-authoritative economy restrictions ✅
- `firestore.indexes.json` for optimal queries ✅
- Opaque ID generation using Crockford base32 (validated) ✅
- Complete seed data for `/GameData/**` collections ✅
- Name→OpaqueID mapping tables ✅

---

## Phase 3 — Migration Plan ✅

**Objective:** Design a zero-downtime migration to the new schema.

**Status:** COMPLETED  
**Deliverable:** `/docs/MIGRATION_PLAN.md` ✅

Migration strategy:
- **Zero-downtime** dual-read approach with gradual per-user cutover ✅
- **Idempotent checkpoints** at `/Players/{uid}/Ops/op_migrate_v1` ✅
- **Field-by-field mapping** from legacy blob schema to new focused docs ✅
- **Reconciliation jobs** for clan trophies and inventory consistency ✅
- **Migration tools** for seeding and user data transformation ✅

---

## Phase 4 — Function Contracts & Implementation

**Objective:** Define and implement CF v2 functions that enforce server authority, transactions, and idempotency.

1. Create **`/docs/FUNCTION_CONTRACTS.md`** with concise I/O + invariants. Include at least:
   - `updateMemberTrophies` (delta apply with `opId`)
   - `joinClan`, `leaveClan` (stats.members/trophies deltas)
   - `recordRaceResult` (trophy delta + participant write)
   - Economy ops: `grantCoins`, `spendCoins`, `claimDaily`, `openCrate`, `purchaseCar`, `upgradeCar`, `grantItem`, `equipCosmetic`
   - Social: `sendFriendInvite`, `acceptInvite`, `removeFriend`
   - Offers/IAP: `recordPurchaseServerSide`, `grantEntitlements`
   - **For each:** Inputs, Tx reads/writes, invariants, idempotency rule (`opId`), errors, latency targets.

2. Implement **Cloud Functions v2 stubs and logic** under `/functions/` that:
   - Always read master config from **`/GameData/**`** and pins from **`/GameConfig/Versions/{active}`**.
   - Write only **tiny hot docs** under **`/Players/**`** and related paths.
   - Perform **transactional delta updates** for clan trophies (`clan.stats.trophies`) on join/leave/trophy-change.
   - Enforce **idempotency**: if `/Players/{uid}/Economy/Transactions/{opId}` exists → no-op; else write receipt.

3. Add **unit tests** under `/functions/test/`:
   - Happy paths, retries, idempotency replays, race-condition scenarios.
   - Clan join/leave with simultaneous updates (verify single aggregate result).
   - Economy spend with insufficient funds (error).

**Deliverables:**
- `/docs/FUNCTION_CONTRACTS.md`
- `/functions/*` (v2 functions + tests under `/functions/test/`)

---

## Phase 5 — Validation & Deploy Prep

1. Create **`/docs/VALIDATION_CHECKLIST.md`** covering:
   - Rules compile; indexes deployed; seeds load in emulator.
   - Cold-start sanity: GameData fetched once per app start.
   - Listeners per screen ≤ 4; no "god" doc reads.
   - Functions pass tests; idempotency verified.
   - Reconciliation job dry-run (clan trophies).

2. Provide **CLI blocks**:
   - Deploy rules & indexes
   - Run emulator, seed data, run tests
   - Deploy functions (post sign-off)

**Deliverables:**
- `/docs/VALIDATION_CHECKLIST.md`
- CLI blocks inline in the doc

---

## Guardrails

- If anything conflicts with `ARCHITECTURE_BRIEF.md`, **the brief wins**.
- **Never** re-introduce name-based IDs, blob writes, or client-side economy math.
- Prefer **deltas** over re-sums; **reconciliation** is safety only.
- Surface unknowns as **TODOs** with proposed defaults.
- **CRITICAL:** No modifications to Unity client code whatsoever.

---

## NON-INVASIVE CHECKLIST (Pre-PR)

- [ ] No diffs in `/Assets/**`, `/ProjectSettings/**`, or other Unity paths.
- [ ] Only the following changed: `/docs/**`, `/seeds/**`, `/functions/**`, `/firestore.rules`, `/firestore.indexes.json`, `/tools/**`.
- [ ] All Cloud Functions are server-authoritative and **not** referenced from client code.
- [ ] Migration tools are **read-only by default** and require an explicit `--apply` flag to write.
- [ ] All seeds use opaque IDs and pass Crockford base32 validation (no i/l/o/u).
- [ ] All changes are on branch `backend/schema-rollout`; PR description links to `ARCHITECTURE_BRIEF.md`.
- [ ] Client integration TODOs documented in `/docs/FUNCTION_CONTRACTS.md` but **not implemented**.
- [ ] All economy operations are server-side only with `opId` tracking.
- [ ] Tests cover idempotency, race conditions, and error scenarios.
- [ ] Security rules enforce server-only writes for economy data.
