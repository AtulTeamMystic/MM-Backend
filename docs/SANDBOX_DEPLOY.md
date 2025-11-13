# Sandbox Deployment Guide

**Project:** `mystic-motors-sandbox`
**Region:** `australia-southeast1`

This document provides the exact commands for deploying the Cloud Functions v2 backend to the sandbox environment.

## Prerequisites

1.  **Authenticate with Google Cloud:**
    ```bash
    gcloud auth login
    ```

2.  **Set Environment Variables:**
    ```bash
    export FIREBASE_PROJECT="mystic-motors-sandbox"
    export GOOGLE_APPLICATION_CREDENTIALS="<absolute path to your sandbox-sa.json>"
    ```

## Deployment Commands

Execute these commands from the root of the `backend-sandbox` directory.

1.  **Install Dependencies & Build:**
    ```bash
    npm install
    ```

2.  **Run Conversion and Seeding Scripts:**
    ```bash
    # Run all conversion scripts
    npm run convert:items+inv && \
    npm run convert:cars && \
    npm run convert:spells && \
    npm run convert:crates && \
    npm run convert:ranks && \
    npm run convert:xp && \
    npm run convert:offers && \
    npm run convert:chat

    # Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
    export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.mm/sandbox-sa.json"

    # Run all seeding scripts
    npm run seed:items && \
    npm run seed:itemSkus && \
    npm run seed:playerInv && \
    npm run seed:playerCos && \
    npm run seed:cars && \
    npm run seed:spells && \
    npm run seed:crates && \
    npm run seed:ranks && \
    npm run seed:xp && \
    npm run seed:offers && \
    npm run seed:chat
    ```

3.  **Deploy All Functions:**
    ```bash
    firebase deploy --only functions --project "$FIREBASE_PROJECT" --non-interactive
    ```

4.  **Set Artifact Registry Cleanup Policy (One-Time):**
    ```bash
    firebase functions:artifacts:setpolicy \
      --region australia-southeast1 \
      --max-age-days 14 \
      --keep-min-count 10 \
      --project "$FIREBASE_PROJECT"
    ```

## Verification

1.  **List Deployed Functions:**
    ```bash
    firebase functions:list --project "$FIREBASE_PROJECT"
    ```

2.  **Check Cloud Run Services:**
    ```bash
    gcloud run services list --region australia-southeast1 --project "$FIREBASE_PROJECT"
    ```

3.  **View Logs for a Specific Function:**
    ```bash
    firebase functions:log --only <functionName> --project "$FIREBASE_PROJECT"