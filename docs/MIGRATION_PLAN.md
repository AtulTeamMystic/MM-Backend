# Zero-Downtime Migration Plan

**Date:** 2025-10-15  
**Phase:** 3 - Migration Plan Design  
**Purpose:** Detailed strategy for migrating from current blob-based schema to opaque ID, server-authoritative architecture

---

## Migration Strategy Overview

### Core Principles
- **Zero Downtime:** Users never experience service interruption
- **Data Integrity:** No data loss, all operations remain consistent
- **Rollback Safety:** Ability to revert at any stage
- **Idempotency:** Migration can be resumed/repeated safely
- **Gradual Rollout:** Per-user migration with feature flags

### Migration Phases
1. **Preparation Phase:** Deploy dual-read infrastructure
2. **Master Data Phase:** Seed GameData collections
3. **User Migration Phase:** Gradual per-user cutover
4. **Validation Phase:** Data consistency checks
5. **Cleanup Phase:** Remove legacy structures

---

## Name → Opaque ID Mapping Tables

### Complete Mapping Registry

**Storage Location:** `/AdminOps/mappings_20251015/`

#### Cars Mapping Table
```json
{
  "path": "/AdminOps/mappings_20251015/cars",
  "data": {
    "version": "v2025.10.15",
    "mappings": {
      "Deimos GT": "car_9q7m2k4d1t",
      "Phantom Racer": "car_5n3k7q1p0m", 
      "Storm Rider": "car_8jz3m2k4d1",
      "Lightning Bolt": "car_2m7qk1p9sx",
      "Shadow Hunter": "car_3gzk7r2m9p",
      "Neon Cruiser": "car_7ks3gzk7r2",
      "Fire Dragon": "car_1p5x7r0m3n",
      "Ice Phoenix": "car_4n6j9q2k8p",
      "Thunder Strike": "car_6h8k4m2d7t",
      "Cosmic Voyager": "car_9z5b3n7q1r"
    },
    "createdAt": 1739560000000
  }
}
```

#### Spells Mapping Table
```json
{
  "path": "/AdminOps/mappings_20251015/spells",
  "data": {
    "version": "v2025.10.15", 
    "mappings": {
      "Shockwave": "spell_3gzk7r2m9p",
      "Speed Boost": "spell_c19q7m2k0d",
      "Fireball": "spell_f7p0x4a3n1",
      "Ice Blast": "spell_8jz3m2k4d1", 
      "Lightning Strike": "spell_5n3k7q1p0m",
      "Invisibility": "spell_2m7qk1p9sx",
      "Shield": "spell_7ks3gzk7r2",
      "Teleport": "spell_4n6j9q2k8p",
      "Meteor": "spell_6h8k4m2d7t",
      "Time Freeze": "spell_9z5b3n7q1r"
    },
    "createdAt": 1739560000000
  }
}
```

#### Items Mapping Table  
```json
{
  "path": "/AdminOps/mappings_20251015/items",
  "data": {
    "version": "v2025.10.15",
    "mappings": {
      "Gamma Wheels (Black)": "item_1p5x7r0m3n",
      "Gamma Wheels (White)": "item_2p6x8r1m4n",
      "Gamma Wheels (Red)": "item_3p7x9r2m5n",
      "Lightning Decal (Blue)": "item_7k2m4d1tq9",
      "Lightning Decal (Yellow)": "item_8k3m5d2tq0",
      "Lightning Decal (Purple)": "item_9k4m6d3tr1",
      "Neon Spoiler (Green)": "item_2m7qk1p9sx",
      "Neon Spoiler (Pink)": "item_3m8qk2p0sx",
      "Dragon Underglow (Red)": "item_4n6j9q2k8p",
      "Dragon Underglow (Blue)": "item_5n7j0q3k9p",
      "Boost Trail (Orange)": "item_6h8k4m2d7t",
      "Boost Trail (Cyan)": "item_7h9k5m3d8t"
    },
    "createdAt": 1739560000000
  }
}
```

#### Tracks Mapping Table
```json
{
  "path": "/AdminOps/mappings_20251015/tracks",
  "data": {
    "version": "v2025.10.15",
    "mappings": {
      "Neon City Loop": "trk_7m2k4d1tq9",
      "Desert Storm Circuit": "trk_9q7m2k4d1t", 
      "Snow Mountain Pass": "trk_3gzk7r2m9p",
      "Forest Rapids": "trk_8jz3m2k4d1",
      "Volcano Valley": "trk_5n3k7q1p0m",
      "Ocean Drive": "trk_2m7qk1p9sx",
      "Sky Highway": "trk_7ks3gzk7r2",
      "Underground Tunnels": "trk_4n6j9q2k8p",
      "Space Station Orbit": "trk_6h8k4m2d7t",
      "Crystal Caverns": "trk_9z5b3n7q1r"
    },
    "createdAt": 1739560000000
  }
}
```

---

## Field-by-Field Migration Strategy

### ProfileData Migration
```
Current: /players/{uid}/profileData/profileData (JSON blob)
Target:  Multiple focused documents
```

| Current Field | Target Location | Migration Logic |
|---------------|----------------|-----------------|
| `username` | `/Players/{uid}` (root doc) | Direct copy |
| `userId` | `/Players/{uid}` (root doc) | Direct copy |
| `email` | `/Players/{uid}` (root doc) | Direct copy |
| `playerCoins` | `/Players/{uid}/Economy/Stats` | 🔒 SERVER-ONLY migration |
| `playerGem` | `/Players/{uid}/Economy/Stats` | 🔒 SERVER-ONLY migration |
| `playerExperience` | `/Players/{uid}/Economy/Stats` | Copy + validate |
| `playerLevel` | `/Players/{uid}/Economy/Stats` | Recalculate from XP |
| `trophyLevel` | `/Players/{uid}/Economy/Stats` | Copy current |
| `trophyHighestLevel` | `/Players/{uid}/Economy/Stats` | Copy peak |
| `selectedCar` | `/Players/{uid}/Loadouts/primary` | Map name → car_xxxxx |
| `spellDeck` | `/Players/{uid}/Loadouts/primary` | Map names → spell_xxxxx |
| `avatar` | `/Players/{uid}` (root doc) | Extract avatarId only |
| `friendRequestsSent` | `/Players/{uid}/Social/Profile` | Copy to friends system |
| `referralCode` | `/Players/{uid}/Social/Profile` | Copy directly |

### GarageData Migration  
```
Current: /players/{uid}/garageData/garageData (JSON blob)
Target:  Per-car and per-item documents
```

| Current Field | Target Location | Migration Logic |
|---------------|----------------|-----------------|
| `crateData` | `/Players/{uid}/Economy/Stats` | 🔒 SERVER-ONLY - inventory counts |
| `keyData` | `/Players/{uid}/Economy/Stats` | 🔒 SERVER-ONLY - inventory counts |
| `carsData[].carName` | `/Players/{uid}/Garage/{carId}` | Map name → car_xxxxx |
| `carsData[].isPurchased` | `/Players/{uid}/Garage/{carId}` | Copy ownership flag |
| `carsData[].currentCarLevel` | `/Players/{uid}/Garage/{carId}` | Copy as upgradeLevel |
| `carsData[].isEquipped` | `/Players/{uid}/Garage/{carId}` | Copy equipped flag |
| `garageItemsData[].itemName` | `/Players/{uid}/Inventory/{itemId}` | Map name → item_xxxxx |
| `garageItemsData[].variants[].count` | `/Players/{uid}/Inventory/{itemId}` | Sum all color variants |
| `carCosmeticData.wheels` | `/Players/{uid}/Garage/{carId}` | Map name_color → item_xxxxx |
| `carCosmeticData.decals` | `/Players/{uid}/Garage/{carId}` | Map name_color → item_xxxxx |
| `carCosmeticData.spoilers` | `/Players/{uid}/Garage/{carId}` | Map name_color → item_xxxxx |
| `carCosmeticData.underglow` | `/Players/{uid}/Garage/{carId}` | Map name_color → item_xxxxx |
| `carCosmeticData.boost` | `/Players/{uid}/Garage/{carId}` | Map name_color → item_xxxxx |

### SocialData Migration
```
Current: /players/{uid}/socialData/socialData (JSON blob)
Target:  Focused social profile document
```

| Current Field | Target Location | Migration Logic |
|---------------|----------------|-----------------|
| `username` | `/Players/{uid}/Social/Profile` | Copy (deduplicated) |
| `userId` | `/Players/{uid}/Social/Profile` | Copy (deduplicated) |
| `playerLevel` | `/Players/{uid}/Social/Profile` | Copy from ProfileData |
| `trophyLevel` | `/Players/{uid}/Social/Profile` | Copy from ProfileData |
| `avatar` | `/Players/{uid}/Social/Profile` | Copy avatarId only |
| `clanName` | `/Players/{uid}/Social/Profile` | Map to clanId if exists |
| `friends` | `/Players/{uid}/Social/Profile` | Copy friend list |
| `friendRequests` | `/Players/{uid}/Social/Profile` | Copy pending requests |

### MapData Migration
```
Current: /players/{uid}/mapData/mapData (JSON blob)  
Target:  Per-track progress documents
```

| Current Field | Target Location | Migration Logic |
|---------------|----------------|-----------------|
| `mapStats[].levelName` | `/Players/{uid}/Progress/Tracks/{trackId}` | Map name → trk_xxxxx |
| `mapStats[].stars` | `/Players/{uid}/Progress/Tracks/{trackId}` | Copy star count |
| `mapStats[].bestTimeMs` | `/Players/{uid}/Progress/Tracks/{trackId}` | Copy best time (if exists) |
| `mapStats[].unlocked` | `/Players/{uid}/Progress/Tracks/{trackId}` | Copy unlock status |

---

## Zero-Downtime Migration Approach

### Phase 1: Infrastructure Deployment (No User Impact)

#### 1.1 Deploy New Collections Structure
```javascript
// Deploy GameData collections with seed data
await deployGameDataCollections();

// Deploy new security rules (permissive during migration)
await deployMigrationRules();

// Deploy composite indexes
await deployFirestoreIndexes();
```

#### 1.2 Deploy Migration Cloud Functions
```javascript
// Functions for dual-read/write operations
deployFunction('migrateUserData');
deployFunction('dualWriteEconomy'); 
deployFunction('validateMigration');
deployFunction('reconcileUserData');
```

### Phase 2: Dual-Read Implementation (No User Impact)

#### 2.1 Client App Updates
- Update clients to attempt reading from new schema first
- Fall back to legacy schema if new data doesn't exist
- Continue writing to legacy schema during migration

```csharp
// Example: Dual-read for car data
public async Task<List<Car>> GetUserCars(string userId)
{
    // Try new schema first
    var newCars = await GetCarsFromNewSchema(userId);
    if (newCars.Any()) 
        return newCars;
    
    // Fall back to legacy schema
    return await GetCarsFromLegacySchema(userId);
}
```

#### 2.2 Server Functions Updates  
- All economy operations check both schemas
- Write to both schemas during transition period
- Maintain operation idempotency across schemas

### Phase 3: Per-User Migration (Gradual Rollout)

#### 3.1 Migration Checkpoint System
```
/Players/{uid}/Ops/op_migrate_v1
{
  "opId": "op_migrate_v1",
  "status": "in_progress", // pending | in_progress | completed | failed
  "startedAt": 1739560000000,
  "completedAt": null,
  "phases": {
    "profileData": "completed",
    "garageData": "in_progress", 
    "socialData": "pending",
    "mapData": "pending"
  },
  "errors": [],
  "retryCount": 0
}
```

#### 3.2 Migration Execution Flow
```javascript
async function migrateUser(userId) {
  const checkpoint = await getOrCreateCheckpoint(userId, 'op_migrate_v1');
  
  if (checkpoint.status === 'completed') {
    return { success: true, message: 'User already migrated' };
  }
  
  try {
    // Phase-by-phase migration with checkpoints
    if (checkpoint.phases.profileData !== 'completed') {
      await migrateProfileData(userId);
      await updateCheckpoint(userId, 'profileData', 'completed');
    }
    
    if (checkpoint.phases.garageData !== 'completed') {
      await migrateGarageData(userId);
      await updateCheckpoint(userId, 'garageData', 'completed');
    }
    
    if (checkpoint.phases.socialData !== 'completed') {
      await migrateSocialData(userId);
      await updateCheckpoint(userId, 'socialData', 'completed');
    }
    
    if (checkpoint.phases.mapData !== 'completed') {
      await migrateMapData(userId);
      await updateCheckpoint(userId, 'mapData', 'completed');
    }
    
    // Mark user as fully migrated
    await updateCheckpoint(userId, null, 'completed');
    
    return { success: true, message: 'User migration completed' };
    
  } catch (error) {
    await updateCheckpoint(userId, null, 'failed', error.message);
    throw error;
  }
}
```

#### 3.3 Gradual Rollout Strategy
```javascript
// Migration waves with increasing user percentages
const migrationWaves = [
  { percentage: 1, duration: '24h' },    // 1% of users for 24h
  { percentage: 5, duration: '48h' },    // 5% of users for 48h  
  { percentage: 25, duration: '72h' },   // 25% of users for 72h
  { percentage: 100, duration: '168h' }  // All remaining users
];

// Feature flag controls per user
function shouldMigrateUser(userId) {
  const userHash = hashUserId(userId);
  const migrationPercentage = getCurrentMigrationPercentage();
  return (userHash % 100) < migrationPercentage;
}
```

### Phase 4: Schema Cutover (Per-User)

#### 4.1 Client Schema Switch
- Once user migration completes, client reads from new schema only
- Writes go through Cloud Functions (server-authoritative)
- Legacy schema becomes read-only backup

#### 4.2 Economy Operations Cutover
```csharp
// Before migration: Direct client writes
FirestoreManager.UpdatePlayerCoins(newAmount);

// After migration: Server function calls  
await CloudFunction.grantCoins(userId, deltaAmount, opId, reason);
```

---

## Idempotent Migration Checkpoints

### Checkpoint Document Structure
```javascript
{
  "opId": "op_migrate_v1",
  "userId": "uid_abc123",
  "status": "in_progress",
  "version": "v2025.10.15",
  "startedAt": 1739560000000,
  "lastUpdatedAt": 1739560300000,
  "completedAt": null,
  "phases": {
    "masterData": "completed",
    "profileData": "completed", 
    "garageData": "in_progress",
    "socialData": "pending",
    "mapData": "pending",
    "validation": "pending"
  },
  "dataHashes": {
    "profileData": "sha256_hash_of_migrated_data",
    "garageData": null,
    "socialData": null,
    "mapData": null
  },
  "errors": [],
  "retryCount": 2,
  "maxRetries": 5
}
```

### Idempotency Rules
1. **Same Input = Same Output:** Replaying migration with same data produces identical results
2. **Hash Validation:** Data hashes prevent duplicate migrations
3. **Atomic Phases:** Each phase completes fully or not at all
4. **Retry Safety:** Failed operations can be retried without corruption
5. **Rollback Support:** Checkpoints enable precise rollback points

### Recovery Procedures
```javascript
// Recover failed migration
async function recoverFailedMigration(userId) {
  const checkpoint = await getCheckpoint(userId, 'op_migrate_v1');
  
  if (checkpoint.retryCount >= checkpoint.maxRetries) {
    // Escalate to manual intervention
    await notifyMigrationFailure(userId, checkpoint.errors);
    return;
  }
  
  // Resume from last completed phase
  const lastCompletedPhase = getLastCompletedPhase(checkpoint);
  await migrateUserFromPhase(userId, lastCompletedPhase + 1);
}
```

---

## Reconciliation Jobs

### Clan Trophy Reconciliation

#### Problem
- Current: Clan trophies calculated by summing member trophies on read (O(n) operation)
- Target: Delta-based updates with periodic reconciliation for data integrity

#### Solution
```javascript
async function reconcileClanTrophies(clanId) {
  const startTime = Date.now();
  
  try {
    // Get current aggregated value
    const clanDoc = await db.collection('Clans').doc(clanId).get();
    const currentTotal = clanDoc.data().stats.trophies;
    
    // Calculate actual total from members
    const membersSnapshot = await db.collection('Clans').doc(clanId)
      .collection('Members').get();
    
    const actualTotal = membersSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().trophies || 0);
    }, 0);
    
    // Check for drift
    const drift = Math.abs(currentTotal - actualTotal);
    
    if (drift > 0) {
      console.log(`Clan ${clanId} trophy drift: ${drift} (current: ${currentTotal}, actual: ${actualTotal})`);
      
      // Correct the aggregated value
      await db.collection('Clans').doc(clanId).update({
        'stats.trophies': actualTotal,
        'stats.lastReconciled': FieldValue.serverTimestamp()
      });
      
      // Log the correction
      await logReconciliationEvent(clanId, 'trophies', currentTotal, actualTotal, drift);
    }
    
    return {
      clanId,
      driftFound: drift > 0,
      driftAmount: drift,
      executionTimeMs: Date.now() - startTime
    };
    
  } catch (error) {
    console.error(`Reconciliation failed for clan ${clanId}:`, error);
    throw error;
  }
}

// Schedule hourly reconciliation during off-peak hours
async function scheduleReconciliationJobs() {
  const activeClans = await getActiveClans();
  
  for (const clanId of activeClans) {
    // Spread reconciliation jobs across the hour to avoid load spikes
    const delayMs = Math.random() * 3600000; // 0-60 minutes
    
    setTimeout(() => {
      reconcileClanTrophies(clanId)
        .then(result => console.log('Reconciliation completed:', result))
        .catch(error => console.error('Reconciliation failed:', error));
    }, delayMs);
  }
}
```

### User Inventory Reconciliation

#### Problem  
- Inventory counts may drift due to failed transactions or race conditions
- Need to verify player inventory against transaction log

#### Solution
```javascript
async function reconcileUserInventory(userId) {
  try {
    // Get current inventory counts
    const inventorySnapshot = await db.collection('Players').doc(userId)
      .collection('Inventory').get();
    
    const currentCounts = {};
    inventorySnapshot.docs.forEach(doc => {
      currentCounts[doc.id] = doc.data().qty || 0;
    });
    
    // Calculate expected counts from transaction log
    const transactionsSnapshot = await db.collection('Players').doc(userId)
      .collection('Economy').doc('Transactions')
      .where('type', 'in', ['grantItem', 'spendItem', 'openCrate'])
      .orderBy('createdAt')
      .get();
    
    const expectedCounts = {};
    transactionsSnapshot.docs.forEach(doc => {
      const tx = doc.data();
      if (tx.status === 'applied' && tx.delta) {
        Object.keys(tx.delta).forEach(itemId => {
          if (itemId.startsWith('item_')) {
            expectedCounts[itemId] = (expectedCounts[itemId] || 0) + tx.delta[itemId];
          }
        });
      }
    });
    
    // Find discrepancies
    const discrepancies = [];
    const allItems = new Set([...Object.keys(currentCounts), ...Object.keys(expectedCounts)]);
    
    allItems.forEach(itemId => {
      const current = currentCounts[itemId] || 0;
      const expected = expectedCounts[itemId] || 0;
      
      if (current !== expected) {
        discrepancies.push({
          itemId,
          currentCount: current,
          expectedCount: expected,
          drift: current - expected
        });
      }
    });
    
    // Correct discrepancies
    if (discrepancies.length > 0) {
      const batch = db.batch();
      
      discrepancies.forEach(({ itemId, expectedCount }) => {
        const inventoryRef = db.collection('Players').doc(userId)
          .collection('Inventory').doc(itemId);
        
        if (expectedCount > 0) {
          batch.set(inventoryRef, { 
            itemId, 
            qty: expectedCount, 
            updatedAt: FieldValue.serverTimestamp() 
          });
        } else {
          batch.delete(inventoryRef);
        }
      });
      
      await batch.commit();
      
      // Log reconciliation event
      await logInventoryReconciliation(userId, discrepancies);
    }
    
    return {
      userId,
      discrepanciesFound: discrepancies.length,
      discrepancies
    };
    
  } catch (error) {
    console.error(`Inventory reconciliation failed for user ${userId}:`, error);
    throw error;
  }
}
```

### Economy Balance Reconciliation

#### Purpose
- Verify total economy circulation remains constant
- Detect potential duplication or loss bugs
- Monitor inflation/deflation trends

```javascript
async function reconcileEconomyTotals() {
  try {
    // Sum all player coin/gem balances
    const playersQuery = db.collectionGroup('Stats')
      .where('coins', '>=', 0)
      .select('coins', 'gems');
    
    let totalCoins = 0;
    let totalGems = 0;
    let playerCount = 0;
    
    const snapshot = await playersQuery.get();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      totalCoins += data.coins || 0;
      totalGems += data.gems || 0;
      playerCount++;
    });
    
    // Compare with previous totals
    const previousTotals = await getPreviousEconomyTotals();
    
    const metrics = {
      timestamp: Date.now(),
      playerCount,
      totalCoins,
      totalGems,
      coinDelta: totalCoins - (previousTotals.totalCoins || 0),
      gemDelta: totalGems - (previousTotals.totalGems || 0)
    };
    
    // Store current totals for next comparison
    await storeEconomyTotals(metrics);
    
    // Alert on significant changes
    const coinInflation = Math.abs(metrics.coinDelta) / metrics.totalCoins;
    const gemInflation = Math.abs(metrics.gemDelta) / metrics.totalGems;
    
    if (coinInflation > 0.05 || gemInflation > 0.05) { // 5% threshold
      await alertEconomyAnomaly(metrics);
    }
    
    return metrics;
    
  } catch (error) {
    console.error('Economy reconciliation failed:', error);
    throw error;
  }
}
```

---

## Migration Tools

### Data Seeding Tool

**File:** `tools/seedFirestore.js`

```javascript
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

async function seedCollection(seedFile) {
  console.log(`Seeding from ${seedFile}...`);
  
  const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  const batch = db.batch();
  let operationCount = 0;
  
  for (const item of seedData) {
    const docRef = db.doc(item.path);
    batch.set(docRef, item.data);
    operationCount++;
    
    // Commit batch every 500 operations (Firestore limit)
    if (operationCount >= 500) {
      await batch.commit();
      console.log(`Committed batch of ${operationCount} operations`);
      operationCount = 0;
    }
  }
  
  // Commit remaining operations
  if (operationCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${operationCount} operations`);
  }
  
  console.log(`✅ Seeded ${seedData.length} documents from ${seedFile}`);
}

async function seedAllCollections() {
  const seedDir = './seeds';
  const seedFiles = fs.readdirSync(seedDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(seedDir, file));
  
  console.log(`Found ${seedFiles.length} seed files`);
  
  for (const seedFile of seedFiles) {
    await seedCollection(seedFile);
  }
  
  console.log('🎉 All collections seeded successfully');
}

// Run seeding
seedAllCollections().catch(console.error);
```

### User Migration Tool

**File:** `tools/migrateUsers.js`

```javascript
const admin = require('firebase-admin');
const { generateOpaqueId } = require('./utils/idGenerator');

admin.initializeApp();
const db = admin.firestore();

// Load mapping tables
const carMappings = require('./mappings/cars.json');
const spellMappings = require('./mappings/spells.json'); 
const itemMappings = require('./mappings/items.json');
const trackMappings = require('./mappings/tracks.json');

async function migrateUser(userId, dryRun = true) {
  console.log(`${dryRun ? 'DRY RUN: ' : ''}Migrating user ${userId}...`);
  
  try {
    // Check if user already migrated
    const checkpointRef = db.collection('Players').doc(userId).collection('Ops').doc('op_migrate_v1');
    const checkpointDoc = await checkpointRef.get();
    
    if (checkpointDoc.exists && checkpointDoc.data().status === 'completed') {
      console.log(`User ${userId} already migrated`);
      return { success: true, message: 'Already migrated' };
    }
    
    // Get legacy user data
    const legacyUserRef = db.collection('players').doc(userId);
    const profileDataRef = legacyUserRef.collection('profileData').doc('profileData');
    const garageDataRef = legacyUserRef.collection('garageData').doc('garageData');
    const socialDataRef = legacyUserRef.collection('socialData').doc('socialData');
    const mapDataRef = legacyUserRef.collection('mapData').doc('mapData');
    
    const [profileDoc, garageDoc, socialDoc, mapDoc] = await Promise.all([
      profileDataRef.get(),
      garageDataRef.get(), 
      socialDataRef.get(),
      mapDataRef.get()
    ]);
    
    if (!profileDoc.exists) {
      throw new Error(`User ${userId} not found in legacy schema`);
    }
    
    // Parse legacy data
    const profileData = JSON.parse(profileDoc.data().profileData || '{}');
    const garageData = JSON.parse(garageDoc.data()?.garageData || '{}');
    const socialData = JSON.parse(socialDoc.data()?.socialData || '{}');
    const mapData = JSON.parse(mapDoc.data()?.mapData || '{}');
    
    // Create migration checkpoint
    const migrationData = {
      opId: 'op_migrate_v1',
      userId,
      status: 'in_progress',
      version: 'v2025.10.15',
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      phases: {
        profileData: 'pending',
        garageData: 'pending', 
        socialData: 'pending',
        mapData: 'pending',
        validation: 'pending'
      },
      errors: [],
      retryCount: 0
    };
    
    if (!dryRun) {
      await checkpointRef.set(migrationData);
    }
    
    // Migrate each phase
    const migrationResults = {};
    
    // Phase 1: Profile Data
    migrationResults.profileData = await migrateProfileData(userId, profileData, dryRun);
    if (!dryRun) {
      await checkpointRef.update({ 'phases.profileData': 'completed' });
    }
    
    // Phase 2: Garage Data  
    migrationResults.garageData = await migrateGarageData(userId, garageData, profileData, dryRun);
    if (!dryRun) {
      await checkpointRef.update({ 'phases.garageData': 'completed' });
    }
    
    // Phase 3: Social Data
    migrationResults.socialData = await migrateSocialData(userId, socialData, dryRun);
    if (!dryRun) {
      await checkpointRef.update({ 'phases.socialData': 'completed' });
    }
    
    // Phase 4: Map Data
    migrationResults.mapData = await migrateMapData(userId, mapData, dryRun);
    if (!dryRun) {
      await checkpointRef.update({ 'phases.mapData': 'completed' });
    }
    
    // Phase 5: Validation
    const validationResults = await validateMigration(userId, migrationResults, dryRun);
    migrationResults.validation = validationResults;
    
    if (!dryRun) {
      await checkpointRef.update({
        'phases.validation': 'completed',
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log(`✅ ${dryRun ? 'DRY RUN: ' : ''}User ${userId} migration completed`);
    return { success: true, results: migrationResults };
    
  } catch (error) {
    console.error(`❌ Migration failed for user ${userId}:`, error);
    
    if (!dryRun) {
      await checkpointRef.update({
        status: 'failed',
        errors: admin.firestore.FieldValue.arrayUnion(error.message),
        retryCount: admin.firestore.FieldValue.increment(1)
      });
    }
    
    return { success: false, error: error.message };
  }
}

async function migrateProfileData(userId, profileData, dryRun) {
  const newData = {
    // Root player document
    playerRoot: {
      uid: userId,
      avatarId: mapAvatarToOpaqueId(profileData.avatar),
      country: "AU", // TODO: Extract from existing data
      ab: { configVersion: "v2025.10.15", bucket: "A" },
      privacy: { allowFriendRequests: true },
      createdAt: parseTimestamp(profileData.accountCreatedAt),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    
    // Economy stats (server-only)
    economyStats: {
      coins: profileData.playerCoins || 0,
      gems: profileData.playerGem || 0,
      xp: profileData.playerExperience || 0,
      level: profileData.playerLevel || 1,
      trophies: profileData.trophyLevel || 0,
      trophiesPeak: profileData.trophyHighestLevel || 0,
      lastDailyClaimAt: parseTimestamp(profileData.lastDailyClaimTime),
      balancesVersion: "v1",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    
    // Primary loadout
    primaryLoadout: {
      slotId: "primary",
      carId: carMappings[profileData.selectedCar] || "car_9q7m2k4d1t", // Default car
      spellDeck: (profileData.spellDeck || []).map(spell => 
        spellMappings[spell.spellName] || spell.spellName
      ).slice(0, 3), // Limit to 3 spells
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };
  
  if (!dryRun) {
    const batch = db.batch();
    
    // Write root player doc
    const playerRef = db.collection('Players').doc(userId);
    batch.set(playerRef, newData.playerRoot);
    
    // Write economy stats
    const economyRef = playerRef.collection('Economy').doc('Stats');
    batch.set(economyRef, newData.economyStats);
    
    // Write primary loadout
    const loadoutRef = playerRef.collection('Loadouts').doc('primary');
    batch.set(loadoutRef, newData.primaryLoadout);
    
    await batch.commit();
  }
  
  return newData;
}

// Additional migration functions...
// migrateGarageData(), migrateSocialData(), migrateMapData(), validateMigration()

module.exports = { migrateUser };
```

---

## Risk Mitigation

### Data Loss Prevention
- **Backup Strategy:** Full database backup before migration begins
- **Dual Schema Period:** Both old and new schemas active simultaneously
- **Transaction Logging:** All operations logged with rollback capability
- **Validation Checks:** Continuous data integrity monitoring

### Performance Impact Mitigation
- **Gradual Rollout:** Limit concurrent migrations to prevent resource exhaustion
- **Off-Peak Scheduling:** Schedule intensive operations during low-traffic periods
- **Resource Monitoring:** Track CPU, memory, and database usage during migration
- **Circuit Breakers:** Automatic pause if system performance degrades

### Rollback Procedures
```javascript
async function rollbackUserMigration(userId) {
  console.log(`Rolling back migration for user ${userId}...`);
  
  try {
    // Get migration checkpoint
    const checkpointRef = db.collection('Players').doc(userId).collection('Ops').doc('op_migrate_v1');
    const checkpoint = await checkpointRef.get();
    
    if (!checkpoint.exists) {
      throw new Error('No migration checkpoint found');
    }
    
    // Delete all new schema data for this user
    const playerRef = db.collection('Players').doc(userId);
    const collections = ['Economy', 'Garage', 'Inventory', 'Loadouts', 'Progress', 'Social'];
    
    for (const collectionName of collections) {
      const collectionRef = playerRef.collection(collectionName);
      const snapshot = await collectionRef.get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      if (snapshot.docs.length > 0) {
        await batch.commit();
      }
    }
    
    // Delete root player document
    await playerRef.delete();
    
    // Mark rollback in checkpoint
    await checkpointRef.update({
      status: 'rolled_back',
      rolledBackAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Rollback completed for user ${userId}`);
    return { success: true };
    
  } catch (error) {
    console.error(`❌ Rollback failed for user ${userId}:`, error);
    return { success: false, error: error.message };
  }
}
```

---

## Migration Timeline & Milestones

### Phase 3 Complete ✅
- [x] Name → Opaque ID mapping tables created
- [x] Field-by-field migration strategy designed
- [x] Zero-downtime approach planned
- [x] Idempotent checkpoint system designed
- [x] Reconciliation jobs specified
- [x] Migration tools outlined

### Phase 4: Data Migration & Seeding ✅
- [x] Conversion and seeding tools implemented and audited. See [**Audit of Tools Runtime**](./AUDIT_TOOLS_RUNTIME.md) for details.
- [x] All legacy data converted and seeded to `/GameData/v1/`.

### Next Phase: Cloud Functions Implementation
- [ ] Function contracts definition
- [ ] Server-authoritative economy functions
- [ ] Clan trophy aggregation functions
- [ ] Race result processing functions
- [ ] Comprehensive test suite
