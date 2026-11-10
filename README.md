# Armament Supply Chain Analysis

Databricks App for Armament Supply Chain & Advanced Manufacturing (AM) Candidate Analysis.

**Maximize reuse** from [Idea Forge II](https://gitlab.com/drbranton-group/idea-forge-ii):
- Dark navy ops console shell (sidebar, top bar)
- SI Wingman drawer and persona system (Gen. John Duselis / AFLCMC)
- AppKit runtime patterns, `app.yaml`, Databricks bundle structure
- Component patterns for hero, controls, and data tables

## First Slice

- Sidebar navigation matching Global Mission Workbench Armament view
- KPI strip (Parts in Scope, AM Candidates, Lead Time, Cost Avoidance, etc.)
- Hero banner with process stages (Detect → Analyze → Prioritize → Assess → Execute → Measure)
- Interactive scoring controls with live weight sliders
- AM Candidate Results table with mock GAU-8/A data
- SI Wingman integration stub (Ask SI Wingman button opens drawer)

## Data

Mock data in `client/src/lib/data.ts` based on the concept screenshot (GAU-8/A A-10 parts). Move to Unity Catalog tables for production.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Databricks Apps via Asset Bundle. See Idea Forge II for the full AppKit + Model Serving pattern for SI Wingman.

## Next

- Wire real Unity Catalog queries
- Full SI Wingman domain prompts (explain scores, recommend AM processes)
- Export, filters, system selector persistence
- Brand assets (A-10 hero imagery)
