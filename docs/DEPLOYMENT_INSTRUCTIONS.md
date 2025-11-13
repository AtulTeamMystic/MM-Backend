# Cloud Functions Deployment Instructions

This document provides step-by-step instructions for building and deploying the Cloud Functions for this project. It is crucial to follow these steps precisely to ensure a successful deployment.

## 1. Navigate to the Correct Directory

First, open your terminal and navigate to the `functions` directory within the `backend-sandbox`:

```bash
cd backend-sandbox/functions
```

## 2. Build the TypeScript Source

Before every deployment, you must compile the TypeScript source code. This process generates the necessary JavaScript files in the `lib/` directory, which Firebase uses for deployment.

Run the following command to build the project:

```bash
npm run build
```

**Important:** Do not skip this step. Deploying without building first will result in deploying stale or incorrect code.

## 3. Run the Automated Test Suites

All deployments must pass the Jest suites against the local emulators. Run both the legacy baseline and the new itemId flows from the `backend-sandbox/functions` directory:

```bash
npm run test       # legacy expectations
npm run test:v2    # itemId (USE_ITEMID_V2) expectations
```

If either command fails, do not deploy. Investigate and resolve the regression first.

## 3. Deploy to Firebase

Once the build is complete, you can deploy the functions to the active Firebase project. Use the following command to deploy only the functions:

```bash
firebase deploy --only functions
```

This command will upload the contents of the `lib/` folder and update your Cloud Functions.

## 4. Rollback Plan

The final SKU-era implementations are preserved under `backend-sandbox/functions/src/legacy/v1`. If we need to revert after deploying the itemId versions:

1. Copy the desired `*V1` callable back into `src/` (e.g. replace `src/shop/purchaseOffer.ts` with `src/legacy/v1/purchaseOffer.ts`).
2. Rebuild the project (`npm run build`).
3. Re-run both test suites to confirm behaviour (`npm run test` and `npm run test:v2` — the latter should fail because the flagged path has been reverted; this is expected during rollback).
4. Deploy the functions again.

Keep the `src/legacy/v1` folder intact so we have a trusted snapshot of the previous production behaviour. Do not delete it until we formally deprecate SKU-based flows.
