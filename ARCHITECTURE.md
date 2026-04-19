# ARCHITECTURE.md

## Overview

This repository is a static front-end prototype for the Click Travel booking flow. It is organized as multiple HTML screens connected through shared JavaScript helpers and shared design tokens. The current architecture is optimized for fast UX iteration rather than for production-grade app structure.

## Main Components

- `*.html`
  Responsibility: individual screens in the booking funnel
  Depends on: shared CSS, shared JS, local assets

- `design-tokens.css`
  Responsibility: shared visual system and token definitions
  Depends on: screen markup consuming those tokens consistently

- `js/`
  Responsibility: shared interaction logic such as sheets, menus, and filters
  Depends on: specific DOM structure in each screen

- `data/`
  Responsibility: static structured data used by the prototype
  Depends on: JS consumers

- `img/`
  Responsibility: brand and UI assets

## Data Flow

1. User enters through a page like `index.html`
2. Client-side interactions are handled through local JS modules
3. Pages navigate through the booking flow as a static prototype
4. Shared UI patterns are reused across screens through design tokens and common scripts

## Key Decisions

- Multi-page static prototype instead of SPA
  Reason: faster iteration on isolated screens and booking steps
  Tradeoff: cross-screen consistency must be enforced manually

- Shared JS helpers in `js/`
  Reason: reduce duplication for sheets and navigation behaviors
  Tradeoff: DOM coupling can make regressions easy if markup changes

- Shared `design-tokens.css`
  Reason: maintain one visual language across the flow
  Tradeoff: local one-off styles can erode consistency if not reviewed carefully

- Prefer inline SVG for user-facing UI icons on critical screens
  Reason: avoids first-load icon-font flash where icon names briefly render as text on cold Safari loads
  Tradeoff: icons require slightly more markup or shared helpers than font-based symbols

- Prefer modular front-end decomposition over microservices
  Reason: token efficiency and implementation safety improve when tasks touch a few small files instead of large HTML files with mixed markup/CSS/JS
  Tradeoff: requires gradual extraction of screen logic into stable JS modules and shared helpers

## Risks

- Screen divergence
  Impact: booking flow feels inconsistent
  Mitigation: always validate related screens after UI changes

- DOM-coupled JavaScript
  Impact: small markup changes can break interactions silently
  Mitigation: check all entry points using the modified script

- Prototype-to-product drift
  Impact: future implementation becomes harder to translate into a real application
  Mitigation: capture reusable decisions explicitly in docs before complexity grows

- Icon-font flash on cold loads
  Impact: users may briefly see icon names instead of icons on first uncached render
  Mitigation: prefer inline SVG for critical UI icons and avoid introducing new user-facing icon-font dependencies on primary flows

## Future Changes

- Add canonical run/build/preview workflow if the prototype becomes a shared internal artifact
- Introduce a more explicit component or templating strategy if duplication grows further
- Gradually move from large screen-local inline logic toward a modular front-end structure:
  - screen HTML focused mostly on markup
  - shared UI behavior in `js/ui/*`
  - storage/contracts in `js/core/*`
  - screen-specific logic in `js/screens/*`
  - validation helpers in dedicated modules

## Token-Efficient Direction

Target architecture for future refactors:
- `js/core/storage.js`
  Responsibility: read/write helpers for `ct_search`, `ct_flight`, `ct_passengers`, `ct_contacts`

- `js/core/formatters.js`
  Responsibility: shared date, currency, and label formatting helpers

- `js/core/validation.js`
  Responsibility: reusable validation for passenger forms, contacts, and common inputs

- `js/core/passenger-model.js`
  Responsibility: passenger defaults, normalization, serialization, and compatibility helpers

- `js/ui/date-input.js`
  Responsibility: masked date input + calendar interaction logic

- `js/screens/results.js`
  Responsibility: loading state, mock generation, and results rendering

- `js/screens/passenger-details.js`
  Responsibility: passenger list rendering, sheet interactions, and form orchestration

This is a staged refactor direction, not a rewrite mandate. The preferred approach is incremental extraction when repeated pain appears, not large one-shot rewrites.
