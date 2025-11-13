# Test User Creation and Seeding Guide

This guide provides instructions for creating and populating a test user in the `mystic-motors-sandbox` environment. It also includes a comprehensive list of all available seed files and their purposes.

## Creating a Test User

To create a new test user with a complete set of data, follow these steps:

1.  **Create a new user in the Firebase Authentication console.** Note the UID of the new user.
2.  **Run the `populateTestUser.ts` script** from the `backend-sandbox` directory, providing the new user's UID as an argument. This script will populate the user with a complete set of test data.

    ```bash
    npx ts-node tools/populateTestUser.ts -u <new-user-id>
    ```

## Available Seed Files

The consolidated catalog seeds live at `backend-sandbox/seeds/*.json` (for example `gameDataCatalogs.fixed.json`). Legacy, per-document seeds that were previously used by ad-hoc scripts are now archived under `backend-sandbox/seeds/archive/`. The itemId v2 rollout writes an additive bundle to `gameDataCatalogs.v2.json`; run `npm run tools:build-v2:write` followed by `npm run seed:gameDataV2` whenever you need to refresh the v2 side.

### Archived Game Data Seeds

These legacy files contain individual documents for older seeding flows. They are preserved for reference and one-off tooling.

*   **`archive/item_skus.json`**: Individual Item SKU documents (price, currency, etc.).
*   **`archive/clans.json`**, **`archive/clan_members.json`**, **`archive/clan_requests.json`**, **`archive/clan_chat.json`**: Legacy clan catalog + membership/chat snapshots.
*   **`archive/rooms.json`** and **`archive/global_room_messages.json`**: Legacy room definitions and chat history.
*   **`archive/races.json`** and **`archive/race_participants.json`**: Historical race and participant samples.

### Archived Player Data Seeds

These files were used as templates for generating player-specific seeds. The `populateTestUser.ts` utility can still consume them from the archive if needed.

*   **`archive/players_cosmetics.json`**: Cosmetic loadout snapshot.
*   **`archive/players_daily.json`**: Daily login progress.
*   **`archive/players_economy.json`**: Economy stats (coins, gems, etc.).
*   **`archive/players_garage.json`**: Owned cars.
*   **`archive/players_inventory.json`**: Inventory contents.
*   **`archive/players_loadouts.json`**: Active car + spell decks.
*   **`archive/players_progress.json`**: Track progress markers.
*   **`archive/players_social.json`**: Social profile.
*   **`archive/players.json`**: Core player profile document.
