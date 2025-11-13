# Cloud Function Validation Prompt for QA

**Objective:** To perform a comprehensive validation of all deployed cloud functions in the `mystic-motors-sandbox` environment, ensuring they are all deployed, functional, and resilient. Any functions that are not deployed or fail validation must be fixed and deployed.

**Prerequisites:**

1.  Ensure you have `editor` access to the `mystic-motors-sandbox` Firebase project.
2.  Clone the latest version of the `Mystic-Motors-App-Live` repository.
3.  Navigate to the `backend-sandbox` directory and run `npm install` to install all necessary dependencies.
4.  Ensure you are authenticated with the Firebase CLI and have selected the `mystic-motors-sandbox` project.

**Instructions:**

1.  **Deploy All Functions:** Before starting the validation, ensure all functions are deployed to the `mystic-motors-sandbox` environment. Run the following command from the `backend-sandbox/functions` directory:
    ```bash
    firebase deploy --only functions --project mystic-motors-sandbox
    ```

2.  **Execute Test Plan:** Follow the detailed test plan outlined in [`docs/CLOUD_FUNCTIONS_TEST_PLAN.md`](docs/CLOUD_FUNCTIONS_TEST_PLAN.md). This document contains all test cases, including inputs, expected outputs, and expected database changes.

3.  **Track Progress:** Use the checklist in [`docs/VALIDATION_CHECKLIST.md`](docs/VALIDATION_CHECKLIST.md) to track the validation status of each function. Mark each test case as "Pass" or "Fail".

4.  **Identify and Fix Failures:**
    *   If a test case fails, investigate the root cause. Check the function logs in the Google Cloud Console for errors.
    *   If a function is not behaving as expected, fix the code in the `backend-sandbox/functions/src` directory.
    *   After fixing the code, redeploy the specific function using the following command:
        ```bash
        firebase deploy --only functions:[functionName] --project mystic-motors-sandbox
        ```
    *   Retest the failed test case to ensure the fix is working correctly.

5.  **Document Findings:** For each failed test case, add a comment in the [`docs/VALIDATION_CHECKLIST.md`](docs/VALIDATION_CHECKLIST.md) with a brief description of the failure and the fix applied.

6.  **Completion:** Once all test cases in the test plan have been executed and have passed, the validation is complete.