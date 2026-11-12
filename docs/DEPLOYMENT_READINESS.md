# Armament SCA — DEV deployment readiness review
Review date: 2026-11-10

## Current evidence

- Restoration PR: https://github.com/DocBranton/armament-sca/pull/1 (draft).
- Exact tested commit: `1b61c900ccbead8140eb6228a126a113bf0fb7d5`.
- Successful run: https://github.com/DocBranton/armament-sca/actions/runs/42906617402
- CI artifact: `armament-ui-acceptance-screenshots` with `armament-dashboard-3440x1440.png` and `armament-request-assistance-3440x1440.png`.
- Verified: AppKit server/frontend TypeScript/build artifacts, Request Assistance contract tests, browser smoke, logo/photo loading, 3440x1440 screenshot capture, and all three slanted Hero cards (GAU-8/A, M61A1, UAL).
- Human visual inspection: Mission header, six KPI bar, compact A-10 Hero, right-side integrated cards, six-step workflow, scoring/weight panel, and results table all appear. This is a *review observation*, not the user's final acceptance.

## Deployment gates

1. **Verify target workspace and application identity.** `databricks.yml` currently hardcodes `https://dbc-045433f3-7964.cloud.databricks.com` and `name: armament-sca`. The workspace host originated from another app's deployment context. **Do not assume it is the intended Armament SCA DEV workspace.** Confirm the approved host, app existence, resource permissions, and intended deployment identity.
2. **Verify AppKit startup in target Databricks Apps.** `app.yaml` invokes `npm run start`; AppKit `dist/server.js` is produced by CI, but a running Databricks App has not been verified. Check app logs and health after publishing.
3. **Visual contract approval.** Compare the actual 3440x1440 screenshot with `docs/concept.png`. Keep the approved shell, six KPIs, compact A-10 Hero and three angled cards, workflow, analysis controls and table; do not redesign.
4. **Demo guardrails.** Part lookup is demonstration data, and Request Assistance prepares a local draft only. Avoid any claim that an official UMW request was submitted.
5. **Source rights.** Confirm authorization to redistribute the supplied UAL photograph if the repo or deployed app is accessible outside the intended USAF audience.
6. **Release decision.** No PROD deployment. Merge only after acceptance, and conduct a controlled DEV deployment with a rollback commit recorded.

## Proposed DEV verification sequence (once workspace is confirmed)

- `npm install && npm run test:request && npm run build`.
- `databricks bundle validate -t default` using target-scoped approved credentials.
- `databricks bundle deploy -t default` only after confirmation of the workspace/app identity.
- Start the app if needed, check the AppKit server logs, open the DEV URL, validate all official assets and Request Assistance behavior.
- Capture the deployed browser screen at 3440x1440, compare with the approved reference and record sign-off.
- If startup, auth, or visual contract fails, roll back to the last known deployed version.

**Current status: CI green, ready for final human review; Databricks workspace/deployment not yet verified.** No merge or deployment has occurred.

## DEV staging hardening — November 12, 2026

- Removed the previously hardcoded commercial Databricks workspace address from `databricks.yml`. The explicit `dev` target now requires `workspace_host` to be supplied at validation/deployment time, preventing accidental deployment into the Super CAD workspace.
- Added manual **read-only preflight** GitHub Actions workflow `.github/workflows/databricks-dev-preflight.yml`. It accepts the approved DEV workspace URL, authenticates using the approved `dev` GitHub environment's `DATABRICKS_CLIENT_ID` and OIDC federation, validates the Databricks bundle, and verifies that `armament-sca` exists and is accessible. It **never deploys**. Note: GitHub manual `workflow_dispatch` normally requires the workflow to exist on the default branch before the Actions UI can dispatch it; alternate authorized execution from the branch may be needed until merged.
- Added `scripts/appkit-server-smoke.mjs` to CI so a real built `npm run start` server must return the React homepage on port 8123. This complements the existing Playwright/Vite visual acceptance; it does **not** prove actual Databricks runtime startup.
- Databricks documentation describes AppKit deployments performing a runtime build; final Databricks App deployment must still confirm the build actually happens and produces `dist/server.js` and `client/dist/index.html`, since these directories are excluded from Git.
- Only proceed with actual DEV `bundle deploy` / `bundle run app` after verifying destination workspace, app identity, service-principal scope, readiness checks, and explicit authorized deployment approval. If a target does not have `armament-sca`, **stop** rather than creating one in an unspecified workspace.
- Production remains out of scope. No Databricks credential or authenticated workspace is connected to the assistant's available tools; no real Databricks operation has occurred.

Example only, after approved host and Databricks CLI auth:
```bash
databricks bundle validate -t dev --var="workspace_host=$DATABRICKS_HOST"
databricks apps get armament-sca
# Deliberately NOT executed: databricks bundle deploy -t dev --var="workspace_host=$DATABRICKS_HOST"
# Deliberately NOT executed: databricks bundle run app -t dev --var="workspace_host=$DATABRICKS_HOST"
```

### Authenticated AppKit startup clarification

The November 12 production server smoke initially failed on GitHub Actions run 43231549836 because `@databricks/appkit` requires Databricks authentication and the ordinary CI runner has no `DATABRICKS_HOST` or service-principal identity. Build, typecheck, and bundled output checks passed. This failure **does not demonstrate that AppKit code is broken**, nor does it prove production startup works.

The production server smoke was moved from unauthenticated `ui-contract-build.yml` into the manual, read-only `databricks-dev-preflight.yml`, after the OIDC identity check, npm install, and build. It is **pending a confirmed DEV host and authorized federated identity**. In the meantime, ordinary CI checks remain build + Request Assistance tests + Playwright visual smoke, and their success must not be reported as an authenticated Databricks startup check.

## User-confirmed Armament SCA DEV app endpoint (November 12, 2026)

- **App endpoint:** https://armament-sca-7474654475322205.aws.databricksapps.com
- **App name:** `armament-sca`
- **Workspace ID embedded in the app endpoint:** `7474654475322205`
- The app endpoint is a runtime URL, **not** the Databricks workspace URL used by `databricks bundle validate` or `DATABRICKS_HOST`. Do not set `workspace_host` to the app endpoint.
- The read-only `databricks-dev-preflight.yml` now asserts that `databricks apps get armament-sca` returns **exactly** the confirmed app name and URL, preventing accidental deployment into another workspace with a same-named app.
- The matching workspace UI/CLI host (usually `https://dbc-....cloud.databricks.com`) and authorized authentication still need verification. The workspace ID also appears in previous Super CAD deployment context, but **this alone does not establish the host**.
- No Databricks deployment has been initiated and app status has not been read from an authenticated workspace.
