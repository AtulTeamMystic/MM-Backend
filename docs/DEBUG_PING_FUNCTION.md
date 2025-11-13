# Debugging Prompt: Resolving `400 Bad Request` on Public Cloud Function

## 1. Problem Statement

A 2nd generation Google Cloud Function (`ping`), written in TypeScript and deployed via Firebase, is consistently returning a `400 Bad Request` error when invoked. This issue persists even after the function was converted to a public `onRequest` type and its underlying Cloud Run service was made publicly accessible. The goal is to diagnose and resolve this issue to allow for successful validation of all Cloud Functions.

## 2. Context & Environment

*   **Project:** `mystic-motors-sandbox`
*   **Region:** `us-central1`
*   **Function Name:** `ping`
*   **Runtime:** Node.js 20 (2nd Gen)
*   **Deployment Tool:** Firebase CLI

## 3. Code Implementation

### `backend-sandbox/functions/src/health/ping.ts`

```typescript
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const ping = onRequest((request, response) => {
  logger.info("Ping received!");
  response.json({ success: true, message: "pong" });
});
```

### `backend-sandbox/tools/validatePing.ts` (Validation Script)

```typescript
import axios from "axios";

const PROJECT_ID = "mystic-motors-sandbox";
const REGION = "us-central1";
const FUNCTION_NAME = "ping";

const url = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${FUNCTION_NAME}`;

async function validatePing() {
  try {
    const response = await axios.post(url, {});
    if (response.status === 200 && response.data.success) {
      console.log(`[${FUNCTION_NAME}] Validation successful:`, response.status, response.data);
    } else {
      console.error(`[${FUNCTION_NAME}] Validation failed:`, response.status, response.data);
    }
  } catch (error: any) {
    const errorMessage = error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message;
    console.error(`[${FUNCTION_NAME}] Validation failed:`, errorMessage);
  }
}

validatePing();
```

## 4. Debugging Steps Taken

1.  **Converted to `onRequest`:** The function was changed from `onCall` to `onRequest` to make it a standard HTTP-triggered function.
2.  **Made Public:** The function's Cloud Run service was granted the `roles/run.invoker` role for `allUsers` using the following command:
    ```bash
    gcloud run services add-iam-policy-binding ping --member=allUsers --role=roles/run.invoker --region=us-central1 --project=mystic-motors-sandbox
    ```
3.  **Validation Script:** A validation script using `axios` was created to send a `POST` request to the function's URL.
4.  **Deployment:** The function was successfully deployed after the changes.

## 5. Expected vs. Actual Behavior

*   **Expected:** A `200 OK` response with the JSON payload `{ "success": true, "message": "pong" }`.
*   **Actual:** A `400 Bad Request` error with the message `{"error":{"message":"Bad Request","status":"INVALID_ARGUMENT"}}`.

## 6. Investigation Plan

1.  **Check Cloud Function Logs:**
    *   Navigate to the Google Cloud Console for the `mystic-motors-sandbox` project.
    *   Go to the Cloud Functions section and find the `ping` function.
    *   Examine the logs for any detailed error messages that might provide more insight into the `400` error.
2.  **Verify Public Access:**
    *   In the Google Cloud Console, go to the Cloud Run section and find the `ping` service.
    *   Check the "Security" tab to confirm that "Allow unauthenticated invocations" is enabled.
3.  **Test with `curl`:**
    *   Run the following `curl` command in your terminal to isolate the issue from the `axios` script:
        ```bash
        curl -X POST -H "Content-Type: application/json" https://us-central1-mystic-motors-sandbox.cloudfunctions.net/ping
        ```
4.  **Simplify the Function:**
    *   If the issue persists, simplify the `ping.ts` function to its bare minimum to rule out any issues with the logger or other dependencies:
        ```typescript
        import { onRequest } from "firebase-functions/v2/https";

        export const ping = onRequest((request, response) => {
          response.send("pong");
        });
        ```
    *   Deploy the simplified function and re-run the validation steps.

By following this investigation plan, we should be able to identify the root cause of the `400 Bad Request` error and get the `ping` function working correctly.