# Deployment Guardrails & Best Practices

This document outlines key guardrails and best practices to follow during the deployment of Cloud Functions to ensure stability and avoid misinterpretation of transient errors.

## 1. Patience with `409 Conflict` Errors

**Rule:** When a `firebase deploy` command returns a `409 Conflict` error ("Resource already exists" or "unable to queue the operation"), **do not immediately assume it is a permanent failure.**

**Procedure:**
1.  **Wait**: Allow at least 2-3 minutes for the deployment operation to fully resolve on the Google Cloud backend. These errors are often transient and indicate that a previous operation is still being finalized.
2.  **Verify**: After waiting, use `gcloud functions list` or `gcloud run services list` to check the actual state of the resource.
3.  **Retry**: Only if the resource is confirmed to be in a stuck or `UNKNOWN` state after a waiting period should you attempt further diagnostic or cleanup actions.

By adhering to this waiting period, we can avoid unnecessary troubleshooting and prevent misdiagnosing transient backend states as permanent errors.