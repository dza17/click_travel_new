# PROJECT_CONTEXT.md

## Project

- Name: PainAI / Click Travel AI
- Repository path: `/Users/romangolik/CC_projects/click_travel_new/project`
- Status: active prototype
- Owner: Roman

## Goal

- Build a travel booking interface for Click Travel
- Explore and validate UX, structure, and product flows for airline ticket booking
- Use the prototype as a foundation for future product and implementation decisions

## Current Scope

- In scope: UI flows, screen structure, front-end interactions, booking funnel consistency
- Out of scope: production backend, payments processing, real booking engine, auth, and live integrations unless explicitly added later

## Stack

- Language: HTML, CSS, JavaScript
- UI approach: static multi-page prototype with shared JS and design tokens
- Assets: local images and data files

## Current Priorities

- Keep the booking flow coherent across screens
- Maintain a strong, intentional Click Travel visual direction
- Make changes easy to review and extend

## Constraints

- The project currently appears to be a front-end prototype, not a full application
- Changes should preserve consistency across `index`, `results`, `ticket`, `passenger_details`, `payment`, and `confirmation`
- Mobile behavior matters because screens are designed in a mobile-first style

## Main Screens

- `index.html` — main search entry
- `results.html` / `all_results.html` — search results
- `ticket.html` — fare / ticket details
- `passenger_details.html` / `passengers.html` — traveler input
- `payment.html` — payment step
- `confirmation.html` — booking confirmation
- `dates.html` / `destination.html` — supporting selection flows

## Open Questions

- Is this repo purely prototype/UI or will it become the base for a real app?
- What deployment target should be considered canonical for previews or demos?
- What changes should stay local experiments vs become approved product direction?
