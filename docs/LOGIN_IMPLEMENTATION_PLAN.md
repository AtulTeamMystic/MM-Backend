# Login System Implementation Plan

This document provides a step-by-step guide for client-side developers to implement the user login and authentication flows using the available cloud functions.

---

## Section 1: Initializing a Guest Account

This is the first step for any new user. The goal is to create a temporary guest account, allowing the user to experience the app before committing to a full signup.

1.  **Call the `ensureGuestSession` Function:**
    When the app launches for the first time, call the `ensureGuestSession` cloud function. You will need to generate and provide a unique `deviceAnchor` to identify the user's device.

    **Request Body:**
    ```json
    {
      "opId": "a-unique-operation-id",
      "deviceAnchor": "a-unique-device-identifier",
      "platform": "ios",
      "appVersion": "1.0.0"
    }
    ```

2.  **Handle the Response:**
    The function will return a response indicating the outcome. If a new guest account is created or an existing one is recovered, the response will include a `customToken`.

    **Successful Response (`new` or `recover` mode):**
    ```json
    {
      "status": "recover",
      "uid": "guest-user-uid",
      "customToken": "firebase-custom-auth-token"
    }
    ```

3.  **Sign In with Firebase SDK:**
    Use the `customToken` from the response to sign the user into Firebase Authentication on the client-side.

    *Example (JavaScript):*
    ```javascript
    import { getAuth, signInWithCustomToken } from "firebase/auth";

    const auth = getAuth();
    signInWithCustomToken(auth, customToken)
      .then((userCredential) => {
        // User is signed in as a guest.
        const user = userCredential.user;
        console.log("Guest user signed in with UID:", user.uid);
      })
      .catch((error) => {
        console.error("Error signing in with custom token:", error);
      });
    ```

---

## Section 2: Signing Up for a Full Account (Direct Signup)

This flow is for new users who choose to sign up for a full account directly, without starting as a guest.

1.  **Call the Appropriate Signup Function:**
    Depending on the chosen signup method, call either `signupEmailPassword` or `signupGoogle`.

    **`signupEmailPassword` Request Body:**
    ```json
    {
      "opId": "a-unique-operation-id",
      "email": "user@example.com",
      "password": "a-strong-password",
      "deviceAnchor": "optional-device-id (stored as reference only)"
    }
    ```

    **`signupGoogle` Request Body:**
    ```json
    {
      "opId": "a-unique-operation-id",
      "idToken": "google-id-token-from-client",
      "deviceAnchor": "optional-device-id (stored as reference only)"
    }
    ```

2.  **Handle the Response:**
    Upon successful account creation, the function will return the new user's UID and a `customToken`.

    **Successful Response:**
    ```json
    {
      "status": "ok",
      "uid": "new-user-uid",
      "customToken": "firebase-custom-auth-token"
    }
    ```

3.  **Sign In with Firebase SDK:**
    Use the `customToken` to sign the new user into Firebase, establishing their session. The implementation is the same as in the guest initialization flow.

---

## Section 3: Binding a Guest Account to a Full Account

This flow is for existing guest users who want to convert to a full account, preserving all their data and progress.

1.  **Ensure the User is Authenticated as a Guest:**
    Before proceeding, the user must already be signed in as a guest using their existing guest session token. The Firebase Auth SDK should have an active guest user session.

2.  **Call the Appropriate Binding Function:**
    Call either `bindEmailPassword` or `bindGoogle`, providing the new credentials. The backend will automatically associate these new credentials with the currently authenticated guest user's UID.

    **`bindEmailPassword` Request Body:**
    ```json
    {
      "opId": "a-unique-operation-id",
      "email": "user@example.com",
      "password": "a-strong-password"
    }
    ```

    **`bindGoogle` Request Body:**
    ```json
    {
      "opId": "a-unique-operation-id",
      "idToken": "google-id-token-from-client"
    }
    ```

3.  **Handle the Response:**
    A successful response indicates that the new credentials have been linked to the existing guest account.

    **Successful Response:**
    ```json
    {
      "status": "ok"
    }
    ```
After this, the user can sign out and sign back in using their new email/password or Google account, and they will be logged into their original account with all data intact.

4.  **Device Anchor Semantics:**
    Binding a guest to a full account vacates the device anchor slot so the device can create a new guest later. Full accounts do not use device anchors for login; if provided during signup, anchors are stored as references on the player only.
