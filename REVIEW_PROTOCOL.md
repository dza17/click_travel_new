# REVIEW_PROTOCOL.md

## Purpose

This file defines how Roman, Claude Code, and ChatGPT/Codex collaborate on `PainAI / Click Travel AI`.

It is the durable protocol for task compilation, implementation handoff, review, and release.

## Roles

- Roman = product owner, operator, escalation point
- Claude Code = implementation agent
- ChatGPT/Codex = task compiler, reviewer, CTO / architect, release gate

## Standard Workflow

1. Roman brings a raw product task to ChatGPT/Codex.
2. ChatGPT/Codex returns:
   - `Complexity`
   - `Claude mode`
   - `Files/context to read`
   - `Prompt for Claude`
   - `Expected handoff`
3. Roman sends that compiled task to Claude Code.
4. Claude Code implements in a feature branch and creates an atomic commit.
5. Roman sends the result back to ChatGPT/Codex.
6. ChatGPT/Codex reviews and returns `approve`, `request changes`, or `blocked`.
7. If needed, Roman sends the findings back to Claude Code.
8. The cycle repeats until approval.
9. After approval, ChatGPT/Codex may push to `main` and perform release actions if requested.

## What Roman Should Send To Claude Code

Roman should not send raw product wording by default.

Preferred input to Claude Code:
- `Complexity`
- `Claude mode`
- `Files/context to read`
- `Prompt for Claude`
- `Expected handoff`

For medium/large tasks or whenever repo-layout confusion is plausible, ChatGPT/Codex should also include:
- `Repo root: /Users/romangolik/CC_projects/click_travel_new/project`
- `Do not run git commands outside this directory`
- `Do not run git init`
- `Do not use git reset --hard for recovery`

## What Claude Code Must Return

Claude Code should return a compact handoff after each completed implementation cycle.

Required handoff fields:
- `change summary`
- `branch name`
- `commit SHA`
- `touched files`
- `checks run`
- `known risks`
- `reviewed screens/states`
- `review focus`

Preferred size:
- 6-12 short lines
- no long narrative unless explicitly requested

## What Roman Should Send To ChatGPT/Codex

### Default review package

Normally send:
- Claude handoff
- commit SHA

### Better review package

If convenient, also send:
- short diff summary
- screenshots for UI-heavy work

### Full package

Send the full Claude transcript only when needed.

## When Full Transcript Is Actually Useful

Use the full transcript only if:
- Claude consumed too many tokens and needs efficiency review
- behavior was strange or inconsistent
- the implementation decision is unclear from diff and handoff
- you want me to audit Claude's process, not just the code result
- there was a git/process incident such as wrong repo root, `git init` in the wrong place, or destructive recovery attempts

Otherwise, handoff is enough.

## Process Incidents

The following should be treated as process incidents even if the code result is later recovered:
- working outside the intended repo root
- running `git init` in the wrong directory
- using `git reset --hard` for workflow recovery
- committing on the wrong branch and then repairing it destructively

Process incidents should be surfaced in review and used to justify session reset plus stricter next-task prompting.

## Review Response Format

ChatGPT/Codex returns one of:
- `approve`
- `request changes`
- `blocked`

### Approve

Includes:
- approval decision
- residual risks if any
- whether push/release is safe

### Request changes

Includes:
- findings first
- impact
- concrete fix
- optional extra validation

### Blocked

Includes:
- missing information
- reason review cannot be completed safely
- what is needed next

## Durable Memory For This Project

The following files are the durable project memory:
- `OPERATING_RULES.md`
- `CLAUDE.md`
- `PROJECT_CONTEXT.md`
- `ARCHITECTURE.md`
- `SESSION_LOG.md`
- `TECH_DEBT.md`
- `DEPLOY.md`
- `REVIEW_PROTOCOL.md`

These files should be enough to restore the working model after restart.

## Reset Recovery

After a restart:
- Claude Code should rebuild context from repo docs and global Claude instructions
- ChatGPT/Codex should use repo docs as the source of truth
- Roman should only need to provide the new task, not restate the whole operating model

## Minimal Shortcut For Small Tasks

For a small local UI task, Roman may send only:
- handoff
- commit SHA

That is usually sufficient for review, because ChatGPT/Codex can inspect the code directly.

## Escalation Cases

Always send more than the minimal package if the task affects:
- shared JS used by multiple screens
- architecture
- deployment
- security
- data integrity
- broad UI patterns across the booking flow

## Session Logging

After meaningful work, add a short factual entry to `SESSION_LOG.md`:
- date
- task
- agent
- branch
- commit
- status
- checks
- notes

## Technical Debt Logging

If ChatGPT/Codex finds non-blocking issues during review, preserve them in `TECH_DEBT.md` instead of leaving them only in chat.

Each debt item should include at least:
- status
- priority
- impact
- effort
- trigger to address
