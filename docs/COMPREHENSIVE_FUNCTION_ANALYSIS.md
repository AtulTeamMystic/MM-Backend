# Comprehensive Analysis of Mystic Motors Legacy Functions and Gap Analysis for New Cloud Functions

**Date:** 2025-10-20
**Phase:** 4 - Cloud Functions Implementation
**Objective:** To provide a clear mapping of legacy functions to new or proposed cloud functions, detail all identified functional gaps, and include high-level contracts for all new or modified cloud functions.

---

## 1. Garage Section

### 1.1. Legacy Functions & Gaps

- **`openCrate`**: Handled crate opening and reward granting.
- **Client-Side Logic**: Car upgrades, purchases, and cosmetic equipping were handled insecurely on the client.
- **Gaps Identified**: No server-side functions exist for upgrading cars, purchasing cars, equipping cosmetics, or opening crates in the new architecture.

### 1.2. New Schema Analysis

- **`/Players/{uid}/Garage`**: Securely stores player-owned cars and their equipped cosmetics.
- **`/Players/{uid}/Inventory`**: Tracks quantities of owned cosmetic SKUs.
- **`/GameData/v1/Items` & `/GameData/v1/ItemSkus`**: Master catalog for all cosmetic items and their variants.

### 1.3. Proposed New Functions

#### `upgradeCar`
- **Purpose**: To upgrade a player-owned car to the next level.
- **Inputs**: `carId` (string)
- **Process**:
    1. Verify car ownership and retrieve current `upgradeLevel`.
    2. Fetch upgrade cost from `/GameData/v1/Cars/{carId}`.
    3. Atomically deduct cost from `/Players/{uid}/Economy/Stats` and increment `upgradeLevel` in `/Players/{uid}/Garage/{carId}`.
- **Outputs**: `{ success: true, newLevel: number }`

#### `purchaseCar`
- **Purpose**: To allow a player to purchase a new car.
- **Inputs**: `carId` (string)
- **Process**:
    1. Verify the player does not already own the car.
    2. Fetch the car's price from `/GameData/v1/Cars/{carId}`.
    3. Atomically deduct cost and create a new document in `/Players/{uid}/Garage/{carId}`.
- **Outputs**: `{ success: true, carId: string }`

#### `equipCosmetic`
- **Purpose**: To equip a cosmetic item to a specific car.
- **Inputs**: `carId` (string), `skuId` (string)
- **Process**:
    1. Verify ownership of both the car and the cosmetic item SKU.
    2. Fetch the item's category from `/GameData/v1/ItemSkus/{skuId}`.
    3. Update the corresponding field (e.g., `wheelsSkuId`) in the `/Players/{uid}/Garage/{carId}` document.
- **Outputs**: `{ success: true }`

#### `openCrate`
- **Purpose**: To open a cosmetic crate and grant a random reward.
- **Inputs**: `crateId` (string)
- **Process**:
    1. Atomically decrement the crate and a corresponding key from `/Players/{uid}/Inventory`.
    2. Determine loot based on `/GameData/v1/Crates/{crateId}`.
    3. Increment the awarded item SKU in `/Players/{uid}/Inventory`.
- **Outputs**: `{ success: true, awardedSkuId: string }`

---

## 2. Spell Deck Section

### 2.1. Legacy Functions & Gaps

- **`generateBotSpellDecks`**: Created spell decks for AI opponents.
- **Client-Side Logic**: Player spell upgrades and unlocks were handled insecurely on the client.
- **Gaps Identified**: No server-side functions exist for unlocking spells, upgrading spells, or managing loadouts.

### 2.2. New Schema Analysis

- **`/Players/{uid}/Loadouts`**: Stores player-created spell decks.
- **Proposed `/Players/{uid}/Spells`**: A new collection is needed to track the `level` of each spell a player has unlocked.
- **`/GameData/v1/Spells`**: The master catalog for all spell definitions, including properties, upgrade costs, and unlock requirements.

### 2.3. Proposed New Functions

#### `upgradeSpell`
- **Purpose**: To unlock a new spell (level 0 ➜ 1) or upgrade an existing one.
- **Inputs**: `spellId` (string)
- **Process**:
    1. Fetch current spell `level` and upgrade cost.
    2. Ensure player meets unlock requirements (level + prerequisite spell).
    3. Atomically deduct currency and increment the `level` in `/Players/{uid}/Spells/{spellId}`.
- **Outputs**: `{ success: true, newLevel: number }`

#### `setLoadout`
- **Purpose**: To create or update a spell deck loadout.
- **Inputs**: `loadoutId` (string), `spellDeck` (array of strings)
- **Process**:
    1. Validate that the player has unlocked all spells in the `spellDeck`.
    2. Create or overwrite the document at `/Players/{uid}/Loadouts/{loadoutId}`.
- **Outputs**: `{ success: true, loadoutId: string }`

---

## 3. Race Lifecycle

### 3.1. Legacy Functions & Gaps

- **`startRace`**: Pre-deducted a trophy penalty to discourage quitting.
- **`finishRace`**: Settled the race, calculating and applying final rewards.
- **`getEndRaceRewards`**: Granted a random end-of-race item.
- **`generateBotCosmetics` & `calculateBotDifficulty`**: Generated AI opponents.
- **Gaps Identified**: The critical `startRace` pre-deduction logic is missing. Bot generation is not consolidated. The `recordRaceResult` contract needs to explicitly include random rewards.

### 3.2. New Schema Analysis

- **`/Races/{raceId}`**: Stores the state of each race.
- **`/Races/{raceId}/Participants/{uid}`**: Securely stores the results and rewards for each participant.

### 3.3. Proposed New & Modified Functions

#### `startRace`
- **Purpose**: To initialize a race and apply a pre-deduction penalty.
- **Inputs**: `lobbyRatings` (array of numbers), `playerIndex` (number)
- **Process**:
    1. Calculate the "as-if-last-place" trophy penalty.
    2. Create a "pending" race document in `/Races/{raceId}`.
    3. Atomically apply the penalty to the player's economy and record the pre-deduction amount in the participant document.
- **Outputs**: `{ success: true, raceId: string, preDeductedTrophies: number }`

#### `generateBotLoadout`
- **Purpose**: To generate a complete loadout for an AI opponent.
- **Inputs**: `trophyCount` (number)
- **Process**: Fetches bot configuration and generates a car, cosmetics, spell deck, and difficulty stats based on the trophy level.
- **Outputs**: `{ carId: string, cosmetics: map, spellDeck: array, difficulty: map }`

#### `recordRaceResult` (Modified)
- **Purpose**: To settle a race, apply final rewards, and grant random items.
- **Inputs**: `raceId` (string), `finishOrder` (array of strings)
- **Process**:
    1. Verify the race is "pending".
    2. For each participant, calculate final trophy delta, coins, and XP.
    3. Determine if a random end-of-race reward is granted.
    4. Atomically reverse the pre-deduction, apply final results, and grant any random rewards.
    5. Set the race status to "settled".
- **Outputs**: `{ success: true, rewards: { trophies: number, coins: number, xp: number, randomReward?: string } }`

---

## 4. Social and Clan System

### 4.1. Legacy Functions & Gaps

- A comprehensive suite of clan management functions existed (`createClan`, `joinClan`, `kickMember`, etc.).
- **Gaps Identified**: A near-total functional gap exists. The entire clan management system needs to be rebuilt with new functions that are compatible with the new, more scalable Firestore schema.

### 4.2. New Schema Analysis

- **`/Clans/{clanId}`**: Top-level collection for clan documents.
- **`/Clans/{clanId}/Members/{uid}`**: Sub-collection for members, allowing for efficient queries and management.
- **`/Clans/{clanId}/Requests/{uid}`**: Sub-collection for join requests.

### 4.3. Proposed New Functions

A complete, one-to-one replacement of the legacy clan functions is required. Each function will be a separate, atomic cloud function.

- **`createClan`**: Creates a new clan.
- **`joinClan`**: Joins an "open" clan.
- **`leaveClan`**: Leaves the current clan, handling leader succession.
- **`inviteToClan`**: Invites a player to a clan.
- **`requestToJoinClan`**: Requests to join a closed/invite-only clan.
- **`acceptJoinRequest` / `declineJoinRequest`**: Manages join requests.
- **`promoteClanMember` / `demoteClanMember`**: Manages member roles.
- **`kickClanMember`**: Removes a member from the clan.
- **`updateClanSettings`**: Updates a clan's public information.

---

## 5. Economy and Progression

### 5.1. Legacy Functions & Gaps

- **`buyCoins`**, **`buyBooster`**, **`activateBooster`**: Handled various in-game purchases.
- **`claimRewards`**: Managed one-time rank-up rewards.
- **`getLeaderboard`**: Inefficiently fetched all players to generate leaderboards.
- **Gaps Identified**: The system needs specific, secure functions for each purchase type instead of a generic `spendGems` function. A scalable leaderboard solution is required.

### 5.2. New Schema Analysis

- **`/Players/{uid}/Economy`**: Securely tracks all player currency and progression stats.
- **`/GameData/v1/Ranks`**: Stores rank definitions and rewards.

### 5.3. Proposed New Functions

#### `exchangeGemsForCoins`
- **Purpose**: To convert gems to coins based on a trophy-scaled rate.
- **Inputs**: `gemAmount` (number)
- **Process**: Fetches the conversion rate and atomically updates player currency.
- **Outputs**: `{ success: true, coinsGained: number, gemsSpent: number }`

#### `purchaseBooster`
- **Purpose**: To purchase a booster item using gems.
- **Inputs**: `boosterId` (string)
- **Process**: Fetches the booster's price and atomically deducts gems while adding the booster to the player's inventory.
- **Outputs**: `{ success: true, boosterId: string }`

#### `claimRankUpReward`
- **Purpose**: To claim the one-time reward for achieving a new rank.
- **Inputs**: `rankId` (string)
- **Process**: Verifies the player has achieved the rank and has not already claimed the reward, then grants the items/currency.
- **Outputs**: `{ success: true, rewards: map }`

#### `getLeaderboard`
- **Purpose**: To retrieve a paginated leaderboard.
- **Inputs**: `leaderboardType` (string: "trophies" | "earnings"), `pageSize` (number), `startAfter` (optional)
- **Process**: Performs an optimized query on the `/Players` collection using a composite index and pagination.
- **Outputs**: `{ players: array, nextPageToken: any }`
