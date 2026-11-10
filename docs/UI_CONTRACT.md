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

## Mandatory AppKit foundation acceptance gate

**Status: NOT VERIFIED / BLOCKS MERGE AND DEPLOYMENT.** Merely hosting a React/Vite frontend in Databricks Apps, or mentioning AppKit in the README, is not evidence of AppKit integration.

Before marking the UI restoration PR ready for review or deploying:

- [ ] Identify the **actual UMW AppKit source, package, version, ownership, and license/access boundary**; document the exact reuse mechanism and relevant commit/package version.
- [ ] Confirm which AppKit capabilities Armament SCA actually consumes: application shell/nav and layout primitives; identity/session; authorized API client; model-serving/Wingman integration; audit/logging/error handling; and approved design tokens. Explicitly record supported and missing pieces; do not assume the library provides every capability.
- [ ] Refactor the dashboard to **use** approved shared AppKit components and services where appropriate while preserving `docs/concept.png` as the visual contract. Avoid a second independently maintained UMW shell or Request Assistance workflow.
- [ ] Align **Request Assistance** with UMW's reusable component and real request/part-lookup contract if accessible. Until wired to an authoritative service, present the current dialog as a demo and never claim a request was submitted.
- [ ] Document the environment-specific Databricks Apps/WDP integration, resource binding, authentication and role scopes, and test the build and deployment configuration.
- [ ] Complete build/typecheck, functional tests, and a **3440×1440 side-by-side screenshot acceptance review**. Obtain explicit approval prior to merge and deployment.

**Architecture target:** Armament domain experience → shared AppKit application foundation → Databricks/WDP platform services. This gate is architectural and behavioral; it must not authorize unrequested visual redesign.

**Non-goal:** Declaring AppKit implemented by adding a folder, branding, documentation, or importing a name without real runtime consumption.

## AppKit implementation milestone (2026-11-10)

Verified UMW reference: private `DocBranton/umw` repository, `package.json`, `server/server.ts`, `client/vite.config.ts`, `tsdown.server.config.ts`, and `databricks.yml` on `main`. UMW uses `@databricks/appkit@0.82.0` and `@databricks/appkit-ui@0.82.0`; its server runtime initializes with `createApp({ plugins: [server()] })` and conditionally supports Lakebase.

Armament SCA now implements the **first runtime foundation slice**:
- Uses `@databricks/appkit@0.82.0`, AppKit `createApp` with `server()`, and AppKit tsdown build configuration.
- Builds separate server and client artifacts, using the UMW directory convention (`dist/server.js` and `client/dist/index.html`).
- Uses a Databricks Asset Bundle `resources.apps.app` definition matching UMW's structure.
- Adds a CI build gate covering both outputs.

**NOT YET VERIFIED:** Successful npm build/CI execution, Databricks deployment, compatible AppKit UI component reuse, identity/capability services, any authoritative backend request or parts lookup, and screenshot parity. The local execution environment cannot reach GitHub/npm to perform dependency installation. Treat this as a code-level implementation, not a finished or tested AppKit migration.

**Important:** AppKit server runtime is now integrated, but `@databricks/appkit-ui` package presence alone does *not* prove its components have been adopted. UMW's Request Assistance is currently implemented inline in `client/src/components/workbench.tsx`, not as a separately exported reusable package. An extraction/shared module is a subsequent task and should be independently validated to avoid breaking UMW or drifting the Armament visual contract.

## Request Assistance extraction milestone (2026-11-10)

Comparison baseline: `DocBranton/umw` `client/src/components/workbench.tsx` on main: UMW's `Hero` contains five request types, conditional part search, multiple selectable matches, selected part details, and four delivery-package choices. It is **not a separately exported UMW component**.

Armament SCA now has a reusable, adapter-backed workflow:
- `client/src/lib/request-assistance.ts` defines request types, deliverables, typed part-search inputs, selected-match model, and a replaceable `AssistanceAdapter`.
- `client/src/components/RequestAssistance.tsx` uses those contracts for choosing an assistance type; a conditional aircraft/NSN/part-number/description search; explicit part match selection; and deliverable package selection (CAD, Level II TDP, Level III TDP, Custom).
- `client/src/lib/request-assistance.test.ts` tests UMW-aligned categories and search normalization/filtering; `npm run test:request` is included in CI.
- The demo adapter only returns GAU-8/A samples. Their part numbers are unknown and intentionally set to `null`. It neither invents part numbers nor submits requests. The dialog says a draft was prepared locally, never submitted.

This is **behavioral alignment and reusable app-local extraction**, not a shared package consumed by both UMW and Armament. To achieve literal single-source reuse, move the extracted contract and UI into a versioned internal shared package/repository, migrate UMW to consume it, and then import it in Armament with permissions and functional/regression testing. Do not copy large, private UMW application code directly into the public Armament repository without a deliberate source-sharing/visibility decision.

**Pending**: an authoritative UMW request API; role-based part catalog access; secure server-side validation; audit history; deployable package/version management; successful build and UI test/screenshot.

## Automated browser acceptance (2026-11-10)

GitHub Actions run [42854827616](https://github.com/DocBranton/armament-sca/actions/runs/42854827616) completed successfully with the Playwright acceptance check. It verifies:

- Dashboard renders at **3440×1440** without uncaught client errors.
- Six KPI cards, six workflow stages, and ten demonstration candidate rows.
- KPI → hero → results vertical order.
- Gold **Request Assistance** CTA opens the dialog, five assistance types exist, demo NSN search finds a match, Level II TDP is selectable, and the prepared draft clearly states **no request submitted**.
- Artifact `armament-ui-acceptance-screenshots`: `armament-dashboard-3440x1440.png` and `armament-request-assistance-3440x1440.png`.

This is a **functional smoke test and snapshot capture**, not a visual-diff approval. **Official image assets are still missing from the repo**, so the screenshots do not prove photographic or branding fidelity. The originals provided in conversation must be placed at approved paths before visual sign-off.

Remaining gates: upload exact official brand/photos, compare screenshots to `docs/concept.png`, verify real UMW integration/part services, validate Databricks deployment, then obtain approval before merge.

## Approved mission header crest (2026-11-10)
- The user-supplied Weapons Superiority Division emblem is installed as `client/public/brand/weapons-superiority-division.webp` and rendered alongside `AFLCMC / EBUW` and `Weapons Superiority Division` in the mission-identity banner.
- The design contract is **keep the official artwork intact**, maintain aspect ratio, 48×48 CSS pixel footprint before ultrawide zoom, no recoloring or additional badges. This replaces the generic crosshair in the organization identity block only; navigation, hero, workflow, controls, and results hierarchy remain unchanged.
- CI smoke test checks the crest loads successfully. Hero imagery is still incomplete pending approved A-10, M61A1 and Small Arms photographs; success of the crest check is not full visual acceptance.

## Official image sourcing check (2026-11-10)

- New candidate catalog: `docs/official-image-sources.json` documents USAF/DVIDS photo-page URLs and photographer credits for A-10, M61A1 and Small Arms.
- The separate GitHub Actions workflow `Stage official imagery for review` attempts to stage public-domain candidates into a downloadable artifact without auto-committing images or changing the approved UI.
- **Run [42862682446](https://github.com/DocBranton/armament-sca/actions/runs/42862682446) did not stage any photo:** all three source endpoints returned **HTTP 403 Forbidden** from the hosted runner. This is an access restriction, not an image-clearance decision. The diagnostic `official-photo-candidates` artifact records the failures.
- The user-owned private `DocBranton/idea-forge-II` repository already has `client/public/communities/a10.webp` with documented public-domain DVIDS origin (VIRIN 250715-F-AD704-1111), as well as `client/public/communities/CREDITS.md`. It is suitable for *review as a possible source*, but it has not been copied into this public repository and the private-repository boundary must be respected.
- No unofficial aircraft or generic weapon imagery was substituted. The outstanding A-10, M61A1, Small Arms and USAF nav assets remain a visual acceptance **blocker**.

## Approved A-10 Hero asset integrated (2026-11-10)

- The user-approved sunset A-10 crop is committed at `client/public/brand/a10.webp` (2200 × 190 pixels), matching the pre-existing background reference in `client/src/index.css`.
- No changes were made to the `Hero` component, typography, narrative, gold **Request Assistance** CTA, integrated three-card gallery, banner height, workflow, analysis controls, or results grid.
- GitHub Actions [run #42877759832](https://github.com/DocBranton/armament-sca/actions/runs/42877759832) passed: AppKit build, Request Assistance tests, exact A-10 asset decode and browser smoke. Screenshots were captured.
- The screenshot acceptance workflow has been corrected to save **viewport-only 3440 × 1440 PNGs** rather than full-page captures that exceeded the requested height. Visual parity review remains human-gated.
- The Small Arms card remains without an approved source photograph. **No merge/deploy yet.**
