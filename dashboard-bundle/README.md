# Native Databricks AI/BI dashboard — proof of concept

This is a **separate** Databricks Declarative Automation Bundle that creates a native AI/BI Dashboard without changing the deployed `armament-sca` App.

## Contents
- `dashboards/armament_micap_poc.lvdash.json`: 1-page dashboard + global filters with inline synthetic SQL data.
- `dashboard-bundle/databricks.yml`: dedicated dashboard bundle manifest, so the existing root App bundle is left untouched.

## Scope and limitations
- Source: ten existing sample GAU-8/A parts in `client/src/lib/data.ts` (snapshot at creation). They are **not** live operational MICAP events.
- KPIs: parts in sample, total example MICAP counts, average lead time, critical candidate count.
- Charts: supply-risk distribution and part lead times.
- Table: per-NSN sample scores and acquisition / demand / readiness data.
- Filters: weapon system, priority, supply risk. System filter has one system until additional representative data is provided.
- No historical trend, readout of operational fleet readiness, claimed cost avoidance, or recalculated weighting: no defensible event history or scoring formula is provided by the source data.
- No data is written into Unity Catalog. The dataset is a read-only SELECT from an inline SQL VALUES list.
- `embed_credentials: false` means per-viewer data permissions when sharing. Confirm WDP policy before changing it.

## Validate and deploy in authorized Databricks DEV
Prerequisites: Databricks CLI with bundle dashboard support; authenticated workspace profile; usable SQL warehouse; permissions to create dashboards and use warehouse.

```bash
cd dashboard-bundle
databricks bundle validate --target dev --var "warehouse_id=<SQL_WAREHOUSE_ID>"
databricks bundle deploy --target dev --var "warehouse_id=<SQL_WAREHOUSE_ID>"
```

Open the generated dashboard in Databricks Workspace, inspect dataset results and filters, then publish it **manually** after acceptance. Bundle deploy creates or updates the draft dashboard; do not interpret that as published to viewers.

## Acceptance checks
1. Dashboard loads without SQL errors.
2. Part count is **10**, MICAP total **55**, critical count **2**.
3. Avg lead time is approximately **253 days** (SQL rounding).
4. Filter to CRITICAL: two rows, **20** sample MICAPs.
5. Confirm table shows all 10 NSNs before filtering and respects global filters.
6. Capture a screenshot and record the workspace URL, warehouse ID, bundle CLI version, and deployment commit for release evidence.

## Production evolution
Replace inline SQL dataset with a governed Unity Catalog view once authorized. Define MICAP as events vs open cases vs period totals, incorporate event timestamps for honest trends, harmonize NSN/system mapping, validate supply-chain and readiness definitions, then centralize scoring logic so both App and dashboard use the same calculations.

This POC does not depend on DRAGON, but using it for WDP requires an approved dashboard route, review gates, and WDP-authorized credentials. The GitHub branch is not a WDP production deployment.
