# PainAI / Click Travel AI

Static front-end prototype for the Click Travel booking flow.

## Repository Rules

- Process and release gate: `OPERATING_RULES.md`
- Review and handoff protocol: `REVIEW_PROTOCOL.md`
- Claude instructions: `CLAUDE.md`
- Product context: `PROJECT_CONTEXT.md`
- Architecture notes: `ARCHITECTURE.md`
- Session history: `SESSION_LOG.md`
- Technical debt: `TECH_DEBT.md`
- Deploy notes: `DEPLOY.md`
- Smoke process: `SMOKE_CHECKLIST.md`

## Current Shape

- Multi-page HTML prototype
- Shared visual tokens in `design-tokens.css`
- Shared interaction logic in `js/`
- Local static data in `data/`

## Working Mode

- Claude Code implements in feature branches
- ChatGPT/Codex reviews and gates release
- Roman drives product direction and priorities
- Production deploy uses SSH alias `painai` and the runbook documented in `DEPLOY.md`
