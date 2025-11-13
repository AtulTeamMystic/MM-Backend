# Release Notes

## 2025-10-21: Player Data Refactor

This release introduces significant breaking changes to the player data model in Firestore. Client-side code that reads player data must be updated to reflect the new structure.

### Breaking Schema Changes

*   **Player Data Split:** Many fields previously located in the root `/Players/{uid}` document have been moved into a new `/Players/{uid}/Profile/Profile` subcollection document. This was done to separate public-facing "menu" stats from the player's private economic state.
    *   The client should now listen to `/Players/{uid}/Profile/Profile` for real-time updates to display in the UI (e.g., coins, gems, level, trophies).
    *   The `/Players/{uid}` document is now a minimal identity shell.

*   **New `Profile` Document:** The `/Players/{uid}/Profile/Profile` document now contains the following fields:
    *   `displayName`
    *   `avatarId`
    *   `coins`
    *   `gems`
    *   `exp`
    *   `level`
    *   `trophies`
    *   `highestTrophies`
    *   `careerCoins`
    *   `totalWin`

*   **New `SpellDecks` Collection:** Player spell decks are now stored in a new `/Players/{uid}/SpellDecks/{deckNo}` collection, where `deckNo` is a number from 1 to 5.

*   **Updated `Loadouts` Document:** The `/Players/{uid}/Loadouts/{loadoutId}` document has been updated to include:
    *   `activeSpellDeck`: A number (1-5) that points to the currently active spell deck.
    *   `cosmetics`: A map for account-level equipped cosmetics.

### New Cloud Functions

*   `equipCosmetics({ opId, loadoutId, cosmetics })`: Equips cosmetics to a loadout.
*   `setSpellDeck({ opId, deckNo, spells })`: Updates the spells in a specific deck.
*   `selectActiveSpellDeck({ opId, loadoutId, deckNo })`: Selects the active spell deck for a loadout.

### Updated Cloud Functions

*   `setUsername` now writes to `/Players/{uid}/Profile/Profile`.
*   `setAvatar` now writes to `/Players/{uid}/Profile/Profile`.
*   `upgradeSpell` now correctly deducts `spellTokens` from `/Players/{uid}/Economy/Stats`.
*   `grantXP` now updates `level` and `exp` in both `/Players/{uid}/Economy/Stats` and `/Players/{uid}/Profile/Profile`.
*   `recordRaceResult` now updates stats in both `Economy` and `Profile` documents.