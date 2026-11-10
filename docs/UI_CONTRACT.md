# Armament SCA — UI Acceptance Contract

The authoritative visual reference is [docs/concept.png](concept.png). This is a reconstruction target, not a loose style guide.

## Viewport and priorities
- Primary target: 3440 × 1440 (ultrawide desktop). Retain responsive horizontal overflow for the 12-column results table on smaller screens.
- Page hierarchy is fixed: narrow left rail; global top bar; mission/organization header; six KPIs; integrated A-10 armament hero; independent six-stage workflow; collapsible analysis controls; immediately visible dense results table.
- Do not reposition KPI cards beneath hero, move gallery cards into a separate row, put workflow stages inside hero, or replace compact table with tiles without an explicit new design approval.
- Prefer the results table over excessive scrolling. Keep cards and controls compact.

## Components
1. Header: GLOBAL MISSION WORKBENCH branding, version, search, SI Wingman action, persona.
2. Sidebar: mission, capabilities, personal groupings and bottom RSO endorsement.
3. Mission: AFLCMC / EBUW, Weapons Superiority Division, Aircraft Guns, Small Arms, and Light Weapons; centered title and description.
4. KPIs: 18,426 parts; 327 qualified AM candidates; 421-day average lead time (+14%); $142.7M projected avoidance; 12 weapon systems; +23.6% projected readiness impact. All *demonstration* values until connected to authoritative data.
5. Hero: A-10 primary photograph, left-aligned title/narrative/amber CTA, three slanted gallery images for GAU-8/A, GAU-9/A, small arms. Collapsible. Gallery is **inside** hero.
6. Workflow: DETECT → ANALYZE → PRIORITIZE → ASSESS → EXECUTE → MEASURE; third stage highlighted by default.
7. Controls: title line, Scoring & Weights and Filters tabs, named presets, Save View, Reset; weighted/threshold radio; six horizontal sliders and weapon-system selector.
8. Results: high-density 12-column table showing rank, weighted score, priority, NSN/NIIN, component, cost, lead time, MICAPs, demand, DMSMS risk, readiness impact, AM assessment. Export CSV.

## Fidelity checklist
- [ ] Use exact composition and aspect ratio of docs/concept.png; inspect at 3440×1440.
- [ ] No separate three-card row below hero.
- [ ] KPIs appear above hero.
- [ ] Workflow is below hero and above Analysis Controls.
- [ ] Default 30/25/20/10/10/5 slider values.
- [ ] Slider edits recalculate ranking; Reset restores defaults.
- [ ] Filters visibly affect records; Export emits visible records.
- [ ] Wingman remains accessible without obstructing results while closed.
- [ ] All photography and logos display (no silently missing assets).
- [ ] Demonstration values clearly remain sample data until integrated.

## Required assets (currently absent from repository)
Place approved, legally reusable image files at:
- `client/public/brand/a10.webp`
- `client/public/brand/gau8.webp`
- `client/public/brand/gau9.webp`
- `client/public/brand/smallarms.webp`
- `client/public/brand/usaf-horizontal-white.png`

The screenshot is a *visual reference*, not a substitute for individual photography or UI text. Missing assets are an outstanding blocker for exact visual parity.

## Validation gates
Run `npm install && npm run build`, then compare screenshots to the reference at 3440×1440. Verify UI interactions and accessibility, and perform Databricks deployment only after visual acceptance. The current restoration branch has not passed a local build or browser screenshot test from this environment.

## UMW-aligned request action
The gold hero CTA reads **Request Assistance**, matching the Unified Mission Workbench. Clicking it opens a UMW-style two-column Request Assistance / Find the Part dialog. The fourth request category, **Analyze manufacturing and repair alternatives**, is preselected. The other UMW request options remain available. Look up matches only the included GAU-8/A demonstration records; there is no authoritative lookup or submit endpoint yet. The UI must not imply a request was submitted. The second weapon-system card is **M61A1 Vulcan — 20mm**, replacing the earlier GAU-9/A placeholder; approved `client/public/brand/m61a1.webp` image still needs to be provided.

## Build/deployment readiness gate (2026-11-10)
The branch now runs the Vite preview server via `npm run start` (Databricks App port default 8000), rather than the nonexistent `dist/server.js`. A GitHub Actions build-validation workflow was added under `.github/workflows/ui-contract-build.yml` to run `npm run build` and check the output bundle. No successful CI execution has yet been observed. The `databricks.yml` currently references `resources/*.yml`, but the repository has no `resources` directory; the Databricks bundle deployment configuration must be completed and checked before any deployment. The mock-only Request Assistance form does not submit requests to UMW. The approved images and logo have been provided in chat but are not yet present as repository files.
