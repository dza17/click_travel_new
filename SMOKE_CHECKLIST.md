# SMOKE_CHECKLIST.md

## Purpose

This file defines the lightweight pre-release smoke test process for `PainAI / Click Travel AI`.

It is intentionally split into:
- `Codex-check` — technical checks that ChatGPT/Codex can perform from code and repository context
- `Human visual check` — short browser-based checks for final UI confirmation

## When To Use

Run this checklist:
- before pushing a user-facing UI change to main
- before demoing an updated flow
- after changes to shared UI logic or shared visual patterns

## Smoke Rule

A release candidate is safest when:
- Codex-check passes
- Human visual check passes for the affected screen(s)

## Codex-Check

### Generic UI Change

- Confirm the expected file(s) changed and no unrelated screens were modified accidentally
- Confirm the requested UI elements exist in markup
- Confirm event handlers are wired to the right controls
- Confirm active/inactive states are represented in code
- Confirm related shared JS/CSS references are still valid
- Confirm there are no stale selectors or removed class references left behind
- Confirm initialization order is valid for new overlays, sheets, menus, or injected components
- Confirm no obvious conflict with existing shared UI patterns

### Results Screen Specific

- Confirm top chip row contains the expected controls
- Confirm each chip has a corresponding handler
- Confirm filter/sort state updates trigger a re-render path
- Confirm sort bottom sheet has open and close paths
- Confirm selected sort option updates current sort state
- Confirm chip active state logic matches product behavior

## Human Visual Check

### all_results.html

- Open `all_results.html`
- Expected: top row shows these 4 chips:
  - `Сортировка`
  - `Без пересадок`
  - `С багажом`
  - `Самый быстрый`

- Tap `Сортировка`
- Expected: bottom sheet opens with 3 sort options

- Select `Рекомендуемые`
- Expected: sheet closes and sort chip is not active

- Open `Сортировка` again and select `Сначала дешёвые`
- Expected: sheet closes and sort chip becomes blue

- Tap `Самый быстрый`
- Expected: `Самый быстрый` becomes blue and reflects active quick-sort state

- Tap `Самый быстрый` again
- Expected: quick-sort deactivates and chip returns to inactive state

- Tap `Без пересадок`
- Expected: chip becomes blue and visible cards remain valid

- Tap `С багажом`
- Expected: chip becomes blue and visible cards remain valid

- With multiple active chips, verify top row still fits and scrolls correctly
- Expected: no overlap, clipping, or broken spacing

- Open and close sort sheet several times
- Expected: overlay, close button, and drag-to-close behave correctly

## Release Note

For UI-only prototype changes, Human visual check may be short, but it should still cover:
- open
- apply
- reset/toggle off
- layout sanity

## Recording Result

When smoke test is run before release, note the outcome in `SESSION_LOG.md`:
- date
- task
- smoke status
- who verified it
- any residual issues
