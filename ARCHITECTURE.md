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

## Future Changes

- Add canonical run/build/preview workflow if the prototype becomes a shared internal artifact
- Introduce a more explicit component or templating strategy if duplication grows further
