# PROCESS_INCIDENTS.md

## Purpose

This file records operational mistakes in the AI workflow so the same failure modes do not repeat.

It is not product tech debt. It is process memory.

## How To Use

Log only incidents that matter for future execution quality, for example:
- wrong branch commits
- work outside the intended repo root
- destructive git recovery attempts
- incomplete deploy verification
- repeated prompt or workflow failures

Each entry should stay short and factual.

## Entries

- Date: 2026-04-18
  Incident: Claude Code committed to local `main` during passenger-details work
  Scope: local only, not pushed from incident state
  Impact: required cleanup of local `main`; increased release risk and review overhead
  Resolution: restored local `main` to `origin/main`, preserved feature branch, created backup branch for incident state
  Prevention: before each commit, verify current branch is not `main` or `master`

- Date: 2026-04-19
  Incident: Claude Code again committed to local `main` during passenger-details follow-up work
  Scope: local only, not pushed from incident state
  Impact: required second cleanup of local `main`; confirmed repeated branch-discipline weakness
  Resolution: restored local `main` to `origin/main`, preserved feature branch, created backup branch for incident state
  Prevention: keep explicit pre-commit branch check in global bootstrap, global Claude instructions, and project-local Claude instructions
