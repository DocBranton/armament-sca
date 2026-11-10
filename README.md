# Armament Supply Chain Analysis

Databricks App for Armament Supply Chain & Advanced Manufacturing (AM) Candidate Analysis.

**Maximize reuse** from [Idea Forge II](https://gitlab.com/drbranton-group/idea-forge-ii):
- Dark navy ops console shell (sidebar, top bar)
- SI Wingman drawer, persona system (Gen. John Duselis / AFLCMC), and Model Serving pattern
- AppKit / Databricks Asset Bundle structure (`databricks.yml`, `app.yaml`)
- Component and data-table patterns

## First Slice

- Sidebar navigation matching Global Mission Workbench Armament view
- KPI strip (Parts in Scope, AM Candidates, Lead Time, Cost Avoidance, etc.)
- Interactive scoring controls with live weight sliders
- AM Candidate Results table with mock GAU-8/A data from the concept UI
- SI Wingman drawer with domain-aware local replies + `/api/wingman` stub (ready for Model Serving)

## Data

Mock data in `client/src/lib/data.ts`. Move to Unity Catalog for production.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

```bash
databricks bundle deploy
```

Uses the same workspace host as Idea Forge II. Configure `WINGMAN_ENDPOINT` via app resources for live SI Wingman.

## Next

- Full AppKit server route for `/api/wingman` (copy from Idea Forge)
- Hero banner + process pipeline stages
- Unity Catalog queries for real NSN/parts data
- Brand assets (A-10 imagery)
- Persist filters / saved views
