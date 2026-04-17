# OPERATING_RULES.md

## Purpose

This repository uses a two-agent operating model:
- Claude Code is the primary implementation agent
- ChatGPT/Codex is the reviewer, architecture gate, and release operator
- Roman is the final product owner and decision-maker

## Roles

### Roman
- Defines the task, scope, and business priority
- Approves risky tradeoffs and irreversible actions

### Claude Code
- Implements changes in a feature branch
- Runs relevant local checks
- Creates atomic commits
- Prepares clean review handoff
- Does not push to `main` or `master` directly

### ChatGPT/Codex
- Reviews code as CTO / architect / tech lead
- Checks correctness, regressions, architecture, UX consistency, security, and release risk
- Decides `approve`, `request changes`, or `blocked`
- May push to main and deploy after approval
- Acts as task compiler before implementation when Roman brings a raw product task

## Branch Policy

- Main branch is `main`
- Claude Code works only in non-main branches unless Roman explicitly instructs otherwise
- Push or merge to main happens only after review approval

## Delivery Loop

1. Roman brings the raw product task to ChatGPT/Codex.
2. ChatGPT/Codex classifies complexity, recommends Claude mode, narrows scope, and prepares the implementation prompt.
3. Roman passes that prompt to Claude Code.
4. Claude Code implements the task in a feature branch.
5. Claude Code runs checks and creates a commit.
6. Roman passes the commit or diff to ChatGPT/Codex for review.
7. ChatGPT/Codex returns `approve`, `request changes`, or `blocked`.
8. If needed, Claude Code fixes the findings and recommits.
9. After approval, ChatGPT/Codex may push to main and deploy.
10. Post-change validation is required.

## Task Compiler Output

Before implementation, ChatGPT/Codex should provide:
- `Complexity`
- `Claude mode`
- `Files/context to read`
- `Prompt for Claude`
- `Expected handoff`

If the task is `micro` or `small`, the prompt should explicitly require a narrow, token-efficient workflow.

## Review Protocol

`REVIEW_PROTOCOL.md` defines:
- what Roman sends to Claude Code
- what Claude Code returns
- what Roman sends to ChatGPT/Codex
- when full transcripts are necessary
- how this workflow is restored after restart

## Smoke Validation

`SMOKE_CHECKLIST.md` defines the lightweight pre-release validation process:
- ChatGPT/Codex performs `Codex-check`
- Roman performs short `Human visual check` for affected screens
- release confidence is highest when both are completed

## Required Handoff From Claude Code

Each implementation cycle must end with:
- task summary
- branch name
- commit SHA
- touched files
- checks run and results
- known risks or open questions
- screenshots or UX notes if UI changed
- deploy notes if config, infra, build, or integrations changed

## Efficiency Rules

- Local UI tasks should be handled with narrow file exploration
- Prefer targeted search and partial reads over reading full files
- Avoid repeating failed repo-root or git checks
- Keep progress updates and handoff concise
- Scale effort to task size; simple screen-level changes should use the lightest practical workflow

## Review Standard

ChatGPT/Codex reviews for:
- correctness against the requested behavior
- regression risk across related screens
- consistency of design tokens and interaction patterns
- HTML/CSS/JS maintainability
- accessibility and mobile behavior
- deployment and rollback safety

## Non-Negotiables

- No direct release from unreviewed code
- No hardcoded secrets
- No claim of success without checks or evidence
- No UI shipped without validating affected screens
