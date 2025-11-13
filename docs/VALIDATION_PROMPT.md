# Cloud Function Validation Prompt

**Objective:** To create a comprehensive test plan for validating all deployed cloud functions in the `mystic-motors-sandbox` environment.

**Instructions:**

1.  **Review all function contracts** in `docs/FUNCTION_CONTRACTS.md`.
2.  **For each function, create a test case** that includes:
    *   A descriptive name for the test.
    *   The function to be tested.
    *   The input data (`opId` and other parameters) required for the test.
    *   The expected output (success or error).
    *   The expected database state changes (e.g., a document is created, a field is incremented).
3.  **Cover all success and error cases** for each function.
4.  **Include at least one idempotency test** for each function that modifies data. This test should call the function twice with the same `opId` and verify that the operation is only performed once.
5.  **Write the test plan in a clear and concise format**, suitable for execution by a QA engineer.
6.  **Pay special attention to the `leaveClan` function**, as it has a known issue and needs to be thoroughly tested.

**Example Test Case:**

```
**Function:** `purchaseCar`

**Test Case:** Player successfully purchases a car.

**Input:**
{
  "opId": "purchase-car-success-1",
  "carId": "test-car"
}

**Expected Output:**
{
  "success": true,
  "carId": "test-car"
}

**Expected DB Changes:**
*   `/Players/{uid}/Garage/test-car` document is created.
*   `/Players/{uid}/Economy/Stats` `coins` field is decremented by the price of the car.