# GameData Audit: Legacy vs. Sandbox

This document outlines the differences between the legacy Firebase project and the current sandbox environment for all `GameData` collections.

## Summary Table

| Collection | Legacy Count | Sandbox Count | Missing IDs | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `Cars` | ~5+ | 1 | `Deimos`, `Phobos`, `Enyo`, etc. | Missing multiple car definitions. |
| `Spells` | ~10+ | 1 | `Fireball`, `Ice Shard`, etc. | Missing multiple spell definitions. |
| `Items` | 100+ | 0 | All cosmetic items, boosts, etc. | No items are currently seeded. |
| `Crates` | 5 | 1 | `Rare`, `Exotic`, `Legendary`, `Mythical` | Missing crate definitions and loot tables. |
| `Tracks` | 25 | 0 | All tracks | No tracks are currently seeded. |
| `Ranks` | TBD | 0 | All ranks | No ranks are currently seeded. |
| `XpCurve` | 1 | 1 | - | Appears to be consistent. |
| `Offers` | 12 | 0 | All offers | No offers are currently seeded. |

---

## Detailed Analysis & Proposed Fixes

### Cars
- **Missing:** `Deimos`, `Phobos`, `Enyo`, and others from `legacy-firebase-backend/json-files/DefaultData.json`.
- **Action:** Create `car_*.json` seed files for each missing car, mapping legacy names to opaque IDs.

### Spells
- **Missing:** `Fireball`, `Ice Shard`, and others from `legacy-firebase-backend/json-files/DefaultData.json`.
- **Action:** Create `spell_*.json` seed files for each missing spell, mapping legacy names to opaque IDs.

### Items
- **Missing:** All cosmetic items (wheels, decals, etc.) and boosts from `legacy-firebase-backend/json-files/DefaultData.json`.
- **Action:** Create `items.json` seed file with all items, mapping legacy names to opaque IDs.

### Crates
- **Missing:** `Rare`, `Exotic`, `Legendary`, and `Mythical` crate definitions.
- **Action:** Create `crates.json` seed file with all crate definitions and loot tables.

### Tracks
- **Missing:** All 25 tracks from `legacy-firebase-backend/json-files/DefaultData.json`.
- **Action:** Create `tracks.json` seed file with all tracks.

### Ranks
- **Missing:** All rank definitions.
- **Action:** Investigate legacy data for rank definitions and create `ranks.json` seed file.

### Offers
- **Missing:** All 12 offers from `legacy-firebase-backend/json-files/OffersData.json`.
- **Action:** Create `offers.json` seed file with all offers.

---

## Appendix: Schema Considerations

*No schema changes are proposed at this time.*