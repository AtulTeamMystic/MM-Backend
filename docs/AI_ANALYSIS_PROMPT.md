# AI Prompt: Comprehensive Analysis of Mystic Motors Legacy Functions and Gap Analysis for New Cloud Functions

## 1. Objective

The primary objective of this task is to conduct a thorough analysis of the legacy Mystic Motors backend functions and compare them against the new, planned cloud functions designed to integrate with the new Firestore schema. The goal is to identify any functional gaps, propose new cloud functions or modifications to existing ones, and create a comprehensive picture of all planned game functions.

## 2. Background

The Mystic Motors backend is being modernized from a legacy Firebase implementation to a new, more secure, and scalable architecture using modern cloud functions and a redesigned Firestore schema. The legacy backend had many functions implemented locally with poor Firestore integration, and the new architecture aims to move as much of the business logic as possible to the cloud for better security and maintainability.

This analysis should be inspired by the *scope and requirements* of the legacy functionality, not its implementation, which is considered poor practice.

## 3. Key Resources

To complete this task, you must analyze the following resources:

*   **Legacy Function Implementation**: The primary source of the legacy business logic is located in `legacy-firebase-backend/functions/index.js`.
*   **Legacy Function Discovery**: A high-level overview of the legacy functions can be found in `docs/FUNCTION_DISCOVERY.md`.
*   **New Firestore Schema**: The new database structure is detailed in `docs/FIRESTORE_SCHEMA.md`.
*   **New Function Contracts**: The specifications for the new cloud functions are defined in `docs/FUNCTION_CONTRACTS.md`.
*   **Existing Gap Analysis**: A preliminary analysis of the functional gaps is available in `docs/FUNCTION_GAP_ANALYSIS.md`.

## 4. Analysis and Task Breakdown

Your analysis should be broken down into the following logical sections, corresponding to the major features of the game. For each section, you must:

1.  **Identify Legacy Functions**: List all legacy functions related to this section and describe their purpose.
2.  **Analyze New Schema and Functions**: Review the new Firestore schema and planned cloud functions to determine how the legacy functionality is intended to be implemented in the new architecture.
3.  **Identify Functional Gaps**: Identify any legacy functionality that is not covered by the new planned functions.
4.  **Propose New or Modified Functions**: For each identified gap, propose a new cloud function or a modification to an existing one. Provide a high-level contract for each new function, including its purpose, inputs, and outputs.

### 4.1. Garage Section

This section deals with all player interactions within the garage, including car upgrades, purchases, and cosmetic customizations.

*   **Legacy Functions**:
    *   `openCrate`: Handles the logic for opening cosmetic crates and granting rewards.
    *   Other garage-related logic may be embedded in the client-side code in `/Assets/`.
*   **Analysis**:
    *   Review the `/Players/{uid}/Garage`, `/Players/{uid}/Inventory`, and `/GameData/v1/Items` collections in the new schema.
    *   Analyze how the new architecture will handle car upgrades, cosmetic equipping, and item purchases.
*   **Task**:
    *   Propose cloud functions for upgrading cars, purchasing cars, and equipping cosmetic items.
    *   Determine if the `openCrate` functionality is fully covered by the new planned functions and propose any necessary additions.

### 4.2. Spell Deck Section

This section covers all functionality related to player spell decks, including upgrading spells and unlocking new ones.

*   **Legacy Functions**:
    *   `generateBotSpellDecks`: Generates spell decks for AI bots.
    *   Spell upgrade and unlock logic was likely handled client-side in the legacy implementation.
*   **Analysis**:
    *   Review the `/Players/{uid}/Loadouts` collection in the new schema.
    *   Analyze how spell data is stored in `/GameData/v1/` and how player spell progression will be tracked.
*   **Task**:
    *   Propose cloud functions for upgrading spells and unlocking new spells.
    *   Define how spell loadouts will be managed and updated in the new architecture.

### 4.3. Race Lifecycle

This section includes all functions related to the start and end of a race, including reward calculation and matchmaking.

*   **Legacy Functions**:
    *   `startRace`: Pre-deducts trophies to discourage quitting.
    *   `finishRace`: Calculates and applies final race rewards.
    *   `getEndRaceRewards`: Grants random end-of-race rewards.
    *   `generateBotCosmetics`, `calculateBotDifficulty`: Used for generating AI opponents.
*   **Analysis**:
    *   Review the `/Races` collection and its sub-collections in the new schema.
    *   Analyze the `recordRaceResult` function contract and determine if it covers all the logic from the legacy `finishRace` function.
*   **Task**:
    *   Propose a `startRace` cloud function to handle the pre-deduction logic.
    *   Propose a `generateBotLoadout` function that combines the functionality of the legacy bot generation functions.
    *   Determine if any other functions are needed to fully manage the race lifecycle.

### 4.4. Social and Clan System

This section covers all social features, including clan creation, management, and invitations.

*   **Legacy Functions**:
    *   A comprehensive set of clan management functions, including `createClan`, `joinClan`, `leaveClan`, `inviteToClan`, `promoteMember`, etc.
*   **Analysis**:
    *   Review the `/Clans` collection and its sub-collections in the new schema.
    *   Analyze the existing gap analysis for the social and clan system.
*   **Task**:
    *   For each legacy clan function, propose a corresponding new cloud function with a clear contract.
    *   Ensure that all aspects of clan management, including roles, permissions, and invitations, are covered by the new proposed functions.

### 4.5. Economy and Progression

This section includes all functions related to the in-game economy, player progression, and rewards.

*   **Legacy Functions**:
    *   `buyCoins`, `buyBooster`, `activateBooster`: Handle in-game purchases and booster management.
    *   `claimRewards`, `getRankRewards`: Manage rank-up rewards.
    *   `getLeaderboard`: Retrieves player leaderboards.
*   **Analysis**:
    *   Review the `/Players/{uid}/Economy` collection and the `/GameData/v1/Ranks` collection in the new schema.
    *   Analyze the `spendGems` function contract and determine if it is sufficient for all in-game purchases.
*   **Task**:
    *   Propose specific cloud functions for each type of in-game purchase (e.g., `exchangeGemsForCoins`, `purchaseBooster`).
    *   Propose cloud functions for claiming rank-up rewards and retrieving leaderboard data.
    *   Ensure that all aspects of the player economy and progression are managed securely on the backend.

## 5. Final Output

The final output of this analysis should be a comprehensive document that:

*   Provides a clear mapping of legacy functions to new or proposed cloud functions.
*   Details all identified functional gaps.
*   Includes high-level contracts for all new or modified cloud functions.
*   Is structured logically by game feature, as outlined above.

This document will serve as a blueprint for the implementation of the new Mystic Motors backend, ensuring that all required functionality is accounted for and designed in a secure and scalable manner.