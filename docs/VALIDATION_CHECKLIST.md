# Validation Checklist

This checklist should be used to manually validate the implementation of new features and changes.

## Player Data Refactor (2025-10-21)

- [ ] Spin up emulators and run the full Jest suite.
- [ ] **Manual Happy Paths:**
  - [ ] Create a new user and verify that `/Players/{uid}`, `/Profile/Profile`, `/Economy/Stats`, `/Loadouts/Active`, `/Garage/Cars`, `/SpellDecks/Decks`, and `/Spells/Levels` are created with the correct default values.
  - [ ] Set a username and confirm that it is written to `/Profile/Profile` and a reservation is created in `/Usernames`.
  - [ ] Set an avatar and confirm that `/Profile/Profile.avatarId` is updated.
  - [ ] Set age and confirm that `birthYear` and `isOver13` are correctly calculated on `/Players/{uid}/Profile/Profile`.
  - [ ] Grant XP to cross a level boundary and confirm that `level` is updated in `Profile/Profile`, that `spellTokens` is incremented in `Economy/Stats`, and that no `level`/`trophies` fields appear in `Economy/Stats`.
  - [ ] Upgrade a spell and confirm that `spellTokens` are deducted from `Economy/Stats` and the spell's level is incremented.
  - [ ] Settle a race with a 1st-place result and confirm that `totalWin` is incremented, `careerCoins` is increased, and `highestTrophies` is updated correctly in `Profile/Profile`.
  - [ ] Equip a cosmetic and confirm that it is written to `/Loadouts/Active.cosmetics`.
  - [ ] Assign a spell deck and confirm that the spells are written to `/SpellDecks/Decks.decks`.
  - [ ] Switch the active spell deck and confirm that `/Loadouts/Active.activeSpellDeck` is updated.
- [ ] **Firestore Rules:**
  - [ ] Confirm that direct client writes to `/Players/{uid}`, `/Profile/Profile`, `/Economy/**`, `/SpellDecks/**`, `/Loadouts/**`, `/Inventory/**`, `/Receipts/**`, and `/Usernames/**` are all blocked.

## GameData Catalog Consolidation (2025-10-24)

- [ ] Run `npm run seed:gamedata` (inside `backend-sandbox/functions`) and confirm it completes without errors.
- [ ] Verify that `/GameData/v1/catalogs/{Cars,Spells,Items,ItemSkus,Crates,Offers,Ranks,XpCurve}` exist and contain `updatedAt` plus the expected top-level map.
- [ ] Confirm that `/GameData/v1` has no other subcollections besides `catalogs`.
- [ ] Run `npm run seed:testplayer` and verify `test_user_001` has canonical singleton docs plus `/Inventory/_summary`.
