# Cloud Functions Coverage Audit (Revised)

This document audits the coverage of legacy Cloud Functions against the new, consolidated contracts, based on a full review of the legacy `index.js` file.

## Coverage Table

| Domain | Legacy Feature | Contract Name | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Bot Generation | `generateBotCosmetics` | `generateBotLoadout` | Covered | Consolidated into a single loadout function. |
| Bot Generation | `calculateBotDifficulty` | `generateBotLoadout` | Covered | Consolidated into a single loadout function. |
| Bot Generation | `generateBotSpellDecks` | `generateBotLoadout` | Covered | Consolidated into a single loadout function. |
| Economy | `buyBooster` | `purchaseBooster` | Covered | - |
| Economy | `activateBooster` | `activateBooster` | Covered | - |
| Economy | `getBoosterData` | `getPlayerBoosters` | Covered | - |
| Economy | `getActiveConversion` | `exchangeGemsForCoins` | Covered | - |
| Economy | `buyCoins` | `exchangeGemsForCoins` | Covered | - |
| Race & Rewards | `startRace` | `startRace` | Covered | - |
| Race & Rewards | `finishRace` | `recordRaceResult` | Covered | - |
| Race & Rewards | `openCrate` | `openCrate` | Covered | - |
| Race & Rewards | `getEndRaceRewards` | `recordRaceResult` | Covered | The logic for granting end-of-race rewards is part of `recordRaceResult`. |
| Clan | `createClan` | `createClan` | Covered | - |
| Clan | `joinClan` | `joinClan` | Covered | - |
| Clan | `leaveClan` | `leaveClan` | Covered | - |
| Clan | `inviteToClan` | `inviteToClan` | Covered | - |
| Clan | `requestToJoinClan` | `requestToJoinClan` | Covered | - |
| Clan | `acceptJoinRequest` | `acceptJoinRequest` | **Missing** | A contract for accepting a clan join request is missing. |
| Clan | `declineJoinRequest` | `declineJoinRequest` | **Missing** | A contract for declining a clan join request is missing. |
| Clan | `promoteMember` | `promoteMember` | **Missing** | A contract for promoting a clan member is missing. |
| Clan | `demoteMember` | `demoteMember` | **Missing** | A contract for demoting a clan member is missing. |
| Clan | `kickMember` | `kickMember` | **Missing** | A contract for kicking a clan member is missing. |
| Clan | `getClanDetails` | `getClanDetails` | **Missing** | A contract for getting clan details is missing. |
| Clan | `getClans` | `getClans` | **Missing** | A contract for getting a list of clans is missing. |
| Clan | `updateClan` | `updateClanSettings` | Covered | - |
| Clan | `bookmarkClan` | `bookmarkClan` | **Missing** | A contract for bookmarking a clan is missing. |
| Clan | `removeClanBookmark` | `removeClanBookmark` | **Missing** | A contract for removing a clan bookmark is missing. |
| Clan | `getBookmarks` | `getBookmarks` | **Missing** | A contract for getting a user's bookmarked clans is missing. |
| Leaderboard | `getLeaderboard` | `getLeaderboard` | Covered | - |
| Maintenance | `checkMaintenance` | `getMaintenanceStatus` | Covered | - |
| Maintenance | `getMaintenanceReward` | `claimMaintenanceReward` | Covered | - |
| App | `checkAppVersion` | `getAppVersion` | **Missing** | A contract for checking the app version is missing. |
| User | `updateUserScore` | `updateUserScore` | **Missing** | A contract for updating a user's score is missing. |
| Auth | `AuthCheckFunction` | `authCheck` | **Missing** | A contract for checking a user's authentication status is missing. |

---

## Missing Contracts

The following contracts are missing and will be added to `docs/FUNCTION_CONTRACTS.md`:

- **`acceptJoinRequest`**: Accepts a player's request to join a clan.
- **`declineJoinRequest`**: Declines a player's request to join a clan.
- **`promoteMember`**: Promotes a clan member to a higher role.
- **`demoteMember`**: Demotes a clan member to a lower role.
- **`kickMember`**: Kicks a member from a clan.
- **`getClanDetails`**: Retrieves the details of a specific clan.
- **`getClans`**: Retrieves a list of clans.
- **`bookmarkClan`**: Bookmarks a clan for a user.
- **`removeClanBookmark`**: Removes a clan bookmark for a user.
- **`getBookmarks`**: Retrieves a user's bookmarked clans.
- **`getAppVersion`**: A read-only function to check the latest app version and force update status.
- **`updateUserScore`**: Updates a user's score.
- **`authCheck`**: Checks a user's authentication status.