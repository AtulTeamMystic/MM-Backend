# New Sandbox Project Setup Guide (`mystic-motors-sandbox`)

**Date:** 2025-10-16  
**Purpose:** This document outlines the exact steps taken to create and configure the new `mystic-motors-sandbox` project, which was created to bypass a persistent deployment issue in the original sandbox.

---

## 1. Project Creation & Configuration

1.  **Create New Project**: A new Google Cloud project was created with the ID `mystic-motors-sandbox`.
2.  **Link Billing**: The project was linked to an active billing account.
3.  **Set Active Project**: The `gcloud` CLI was configured to target the new project:
    ```bash
    gcloud config set project "mystic-motors-sandbox"
    ```
4.  **Enable APIs**: All necessary APIs for Firebase, Firestore, and Cloud Functions were enabled.
5.  **Create Firestore Database**: A new Firestore database was created in `australia-southeast1` in Native mode.

## 2. Service Account & Permissions

1.  **Create Service Account**: A new service account was created with the name `mm-sandbox-deployer`.
2.  **Grant IAM Roles**: The following roles were granted to the new service account to allow it to manage all necessary resources:
    - `Firebase Admin`
    - `Cloud Functions Developer`
    - `Cloud Build Editor`
    - `Service Account User`
    - `Artifact Registry Writer`
    - `Cloud Run Admin`
    - `Cloud Datastore Index Admin`
    - `Firebase Rules Admin`
    - `Service Usage Consumer`
3.  **Generate Key**: A new JSON key was generated for the service account and is used for authentication in deployment scripts.

## 3. Backend Scaffolding & Deployment

1.  **Update `.firebaserc`**: The `backend-sandbox/.firebaserc` file was updated to point the `sandbox` alias to the new `mystic-motors-sandbox` project.
2.  **Deploy Schema**: The `firestore.rules` and `firestore.indexes.json` files were successfully deployed to the new project.
3.  **Seed Data**: The master data from the `/seeds` directory was successfully written to the new Firestore database.

This new sandbox environment is now fully configured and ready for Cloud Functions deployment and testing.