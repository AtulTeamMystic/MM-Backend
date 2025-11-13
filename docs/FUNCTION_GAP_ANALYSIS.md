# Function Gap Analysis

**Date:** 2025-10-15  
**Phase:** 4 - Cloud Functions Implementation  
**Purpose:** Identify discrepancies between legacy functions and defined contracts, and propose new contracts to cover all existing functionality.

---

## 1. Analysis Summary

This analysis compares the functions discovered in `docs/FUNCTION_DISCOVERY.md` against the specifications in `docs/FUNCTION_CONTRACTS.md`.

- **Coverage**: The existing contracts cover the core economy, garage, and social actions well, but lack coverage for many of the specific gameplay loops, clan management features, and administrative functions found in the legacy codebase.
- **Schema Compliance**: The legacy functions operate on a significantly different data model. The proposed new functions must adapt this logic to the new, stricter schema defined in `ARCHITECTURE_BRIEF.md`.
- **Idempotency**: The legacy functions lack formal idempotency, which is a core requirement for the new v2 functions. All new contracts will enforce this.

---

## 2. Function Coverage Gaps

The following functions from the legacy codebase are **not** covered by the existing `FUNCTION_CONTRACTS.md`. New contracts are proposed for each.

### 2.1. Bot & Race Generation

| Legacy Function | Contract Coverage | Proposed New Contract(s) | Notes |
| :--- | :--- | :--- | :--- |
| `generateBotCosmetics` | **Missing** | `generateBotLoadout` | The new function should be more generic to return a complete loadout (car, cosmetics, spells). |
| `calculateBotDifficulty` | **Missing** | `getBotDifficulty` | To be used internally by `generateBotLoadout`. |
| `generateBotSpellDecks` | **Missing** | `getBotSpellDeck` | To be used internally by `generateBotLoadout`. |

### 2.2. Economy & Progression

| Legacy Function | Contract Coverage | Proposed New Contract(s) | Notes |
| :--- | :--- | :--- | :--- |
| `getActiveConversion` | **Missing** | `getGemToCoinConversionRate` | A simple read-only function to inform the client. |
| `buyCoins` | Covered by `spendGems` | `exchangeGemsForCoins` | A more specific contract is better than a generic `spendGems` call. |
| `buyBooster` | **Missing** | `purchaseBooster` | For purchasing boosters with gems. |
| `activateBooster` | **Missing** | `activateBooster` | For activating a purchased booster. |
| `getBoosterData` | **Missing** | `getPlayerBoosters` | To get current booster inventory and timers. |
| `getEndRaceRewards` | Partially covered by `recordRaceResult` | Extend `recordRaceResult` | The random crate/key drop should be part of the main race result logic. |
| `getRankRewards` | **Missing** | `getGameDataRanks` | A public, read-only function to fetch rank definitions and rewards. |

### 2.3. Race Lifecycle

| Legacy Function | Contract Coverage | Proposed New Contract(s) | Notes |
| :--- | :--- | :--- | :--- |
| `startRace` | **Missing** | `startRace` | The pre-deduction logic is a key anti-quit mechanism and needs its own function. |
| `finishRace` | Covered by `recordRaceResult` | `recordRaceResult` | The existing contract is sufficient but needs to incorporate the settlement of the `startRace` pre-deduction. |

### 2.4. Social & Clan

| Legacy Function | Contract Coverage | Proposed New Contract(s) | Notes |
| :--- | :--- | :--- | :--- |
| `createClan` | **Missing** | `createClan` | Essential for the clan system. |
| `inviteToClan` | **Missing** | `inviteToClan` | |
| `requestToJoinClan` | **Missing** | `requestToJoinClan` | |
| `acceptJoinRequest` | **Missing** | `acceptJoinRequest` | |
| `declineJoinRequest` | **Missing** | `declineJoinRequest` | |
| `promoteMember` | **Missing** | `promoteClanMember` | |
| `demoteMember` | **Missing** | `demoteClanMember` | |
| `kickMember` | **Missing** | `kickClanMember` | |
| `getClanDetails` | **Missing** | `getClanDetails` | |
| `getClans` | **Missing** | `searchClans` | |
| `updateClan` | **Missing** | `updateClanSettings` | |
| `bookmarkClan` | **Missing** | `bookmarkClan` | |
| `removeClanBookmark` | **Missing** | `removeClanBookmark` | |
| `getBookmarks` | **Missing** | `getBookmarkedClans` | |
| `getUserClanDetails` | Covered by `getClanDetails` | `getMyClanDetails` | A dedicated function for the user's own clan is useful. |

### 2.5. Miscellaneous

| Legacy Function | Contract Coverage | Proposed New Contract(s) | Notes |
| :--- | :--- | :--- | :--- |
| `checkAppVersion` | **Missing** | `getAppConfig` | A generic config function is more flexible. |
| `updateUserScore` | **Missing** | None | This seems like a generic, unused function. Proposing to omit unless a clear use case is found. |
| `getLeaderboard` | **Missing** | `getLeaderboard` | |
| `checkMaintenance` | **Missing** | `getMaintenanceStatus` | |
| `getMaintenanceReward` | **Missing** | `claimMaintenanceReward` | |
| `AuthCheckFunction` | **Missing** | None | This is a debug function and not needed for production. |

---

## 3. Proposed New Contracts (High-Level)

The following new contracts should be added to `docs/FUNCTION_CONTRACTS.md`.

### `generateBotLoadout`
- **Purpose**: Generates a complete loadout for an AI opponent.
- **Inputs**: `trophyCount: number`, `opId: string`
- **Outputs**: `{ carId: string, cosmetics: { ... }, spellDeck: { ... } }`
- **Logic**: Internally calls `getBotDifficulty` and `getBotSpellDeck` based on configuration from `/GameData/BotConfig`.

### `exchangeGemsForCoins`
- **Purpose**: Atomically exchanges a player's gems for coins at the current trophy-based rate.
- **Inputs**: `uid: string`, `gemAmount: number`, `opId: string`
- **Outputs**: `{ success: boolean, coinsGained: number, gemsSpent: number }`
- **Logic**: Reads `/Players/{uid}/Economy/Stats` and `/GameData/Economy/GemConversionCurve`, performs the transaction, and writes a receipt.

### `createClan`
- **Purpose**: Creates a new clan.
- **Inputs**: `uid: string`, `opId: string`, `clanName: string`, `clanDescription: string`, `clanBadge: number`, etc.
- **Outputs**: `{ success: boolean, clanId: string }`
- **Logic**: Creates `/Clans/{clanId}` and `/Clans/{clanId}/Members/{uid}` documents, and updates the player's social profile.

### `getLeaderboard`
- **Purpose**: Retrieves a paginated leaderboard.
- **Inputs**: `leaderboardType: 'trophies' | 'earnings'`, `pageSize: number`, `startAfter?: any`
- **Outputs**: `{ players: { ... }[], nextPageToken: any }`
- **Logic**: Queries the `/Players` collection, likely requiring a composite index on the ranked field.

*(Note: This is a high-level summary. The full, detailed contracts will be added to `FUNCTION_CONTRACTS.md` in the next step.)*