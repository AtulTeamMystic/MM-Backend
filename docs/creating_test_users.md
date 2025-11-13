# Creating and Populating Test Users

This document outlines the process for creating a new test user in the `mystic-motors-sandbox` Firebase project and populating it with data.

## Prerequisites

Before you begin, ensure you have the following:

*   Access to the `mystic-motors-sandbox` Firebase project.
*   The `gcloud` CLI installed and authenticated.
*   Node.js and npm installed.
*   A service account key for the `mystic-motors-sandbox` project, located at `~/.mm/sandbox-sa.json`.

## Step 1: Create a New Test User

To create a new test user, run the following command from the `backend-sandbox` directory:

```bash
npm run create:user -- <email> <password>
```

Replace `<email>` and `<password>` with the desired credentials for the new user. The script will output the new user's UID upon successful creation.

## Step 2: Populate the User's Data

Once the user has been created, you can populate their data using the new `populateTestUser.ts` script. This script will generate all the necessary seed files for the user.

Run the following command from the `backend-sandbox` directory, replacing `<user-id>` with the UID of the user you created in the previous step:

```bash
npm run populate:user -- <user-id>
```

This command will create a set of seed files in the `backend-sandbox/seeds` directory, one for each module (Daily, Economy, Garage, Inventory, Loadouts, Progress, and Social).

To seed the database with this data, run the following command:

```bash
npm run seed:all
```

## Conclusion

You have now successfully created a new test user and populated their data. You can verify the data in the Firebase console.