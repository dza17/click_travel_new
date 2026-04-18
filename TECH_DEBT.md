# TECH_DEBT.md

## Purpose

This file stores non-blocking technical debt, refactor opportunities, and architecture-quality follow-ups discovered during implementation and review.

Use it for items that:
- should not block the current task or release
- are worth preserving for future cleanup
- may matter for maintainability or scalability later

## Status Labels

- `todo` — known debt, not scheduled
- `planned` — selected for a future task
- `done` — resolved
- `wontfix` — intentionally not pursued

## Prioritization Fields

Each item should include:
- `Priority`
  - `high` — worth addressing soon; real risk to quality, scale, or repeated delivery
  - `medium` — useful cleanup with clear value, but not urgent
  - `low` — optional cleanup or polish
- `Impact`
  - what gets better if fixed: maintainability, correctness, scale readiness, developer speed, UX consistency, etc.
- `Effort`
  - `S` — small, localized change
  - `M` — several related edits
  - `L` — broad refactor or structural work
- `Trigger to address`
  - when this should move from backlog to active work
  - examples: "before shared filter refactor", "before production data model", "when this file is touched again"

## Usage Rule

When reviewing `TECH_DEBT.md`, prioritize work in this order:
1. high priority + low/medium effort
2. medium priority items that unblock future scale or cleanup repeated pain
3. low priority polish only when already working nearby

## Items

- ID: TD-001
  Date: 2026-04-18
  Status: todo
  Area: `all_results.html`
  Source: review of commit `bd2e54e`
  Title: Replace baggage detection via `chips.includes(3)` with explicit data model
  Why it matters: the current logic relies on a magic index and couples UI filtering to presentation-oriented chip metadata
  Suggested direction: introduce an explicit field such as `hasBaggage` or a structured tag model, then update filter logic to use that field
  Priority: medium
  Impact: maintainability, scale readiness, safer future filter logic
  Effort: S
  Trigger to address: when results data model or shared filtering logic is touched again

- ID: TD-002
  Date: 2026-04-18
  Status: todo
  Area: `passenger_details.html`
  Source: architecture review after passenger-details refactor
  Title: Extract passenger-details logic into dedicated screen and validation modules
  Why it matters: the current screen mixes markup, styling, state, validation, storage, and bottom-sheet orchestration in one large file, which inflates token usage and increases regression risk
  Suggested direction: move passenger screen logic into `js/screens/passenger-details.js` and reusable validation helpers into `js/core/validation.js`
  Priority: high
  Impact: token efficiency, maintainability, safer iteration, faster review cycles
  Effort: M
  Trigger to address: before the next substantial passenger-details enhancement or when this screen is touched again

- ID: TD-003
  Date: 2026-04-18
  Status: todo
  Area: `results.html`
  Source: architecture review after loading-skeleton implementation
  Title: Extract results screen loading/render logic from large HTML file
  Why it matters: results flow now combines screen markup, mock data generation, loading-state behavior, rendering logic, and interactions in one file, making small changes more expensive in tokens and review effort
  Suggested direction: move results-specific state and rendering into `js/screens/results.js`, keeping HTML primarily declarative
  Priority: medium
  Impact: token efficiency, cleaner diffs, lower regression risk
  Effort: M
  Trigger to address: before the next non-trivial results-screen feature or shared results refactor

- ID: TD-004
  Date: 2026-04-18
  Status: todo
  Area: `sessionStorage contracts`
  Source: architecture review after passenger-details compatibility patch
  Title: Normalize storage contracts for search, flight, passenger, passengers, and contacts
  Why it matters: the flow currently relies on a mix of singular and plural storage keys (`ct_passenger`, `ct_passengers`, `ct_contacts`), which creates compatibility patches and raises cross-screen bug risk
  Suggested direction: introduce a small storage helper module with explicit read/write compatibility rules and one canonical contract per entity
  Priority: high
  Impact: correctness, scale readiness, lower cross-screen regression risk
  Effort: M
  Trigger to address: before another booking-funnel refactor touching passenger/payment/confirmation continuity
