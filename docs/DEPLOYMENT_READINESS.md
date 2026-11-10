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
