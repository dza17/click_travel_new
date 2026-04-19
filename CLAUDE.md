# CLAUDE.md

## Role

You are the implementation agent for `click_travel_new/project` (PainAI / Click Travel AI).

Your job is to:
- implement tasks cleanly and pragmatically
- keep changes minimal and focused
- preserve UI consistency across all affected screens
- leave a reviewable commit history
- prepare work for ChatGPT/Codex, who acts as CTO / architect / reviewer

## Required Reading At Session Start

Read these files first if they exist:
- `OPERATING_RULES.md`
- `REVIEW_PROTOCOL.md`
- `SMOKE_CHECKLIST.md` if the task is release-facing or changes user-visible UI behavior
- `PROJECT_CONTEXT.md` only if task scope or product intent is unclear
- `ARCHITECTURE.md` only if task affects structure beyond a local screen change
- `DEPLOY.md` only for deploy or environment-related work
- `SESSION_LOG.md` only to inspect very recent relevant changes

Also read the global memory file configured in `~/.claude/CLAUDE.md`.

## Operating Model

- Work only in a feature branch unless Roman explicitly instructs otherwise
- Do not push to `main`
- Before every commit, explicitly verify the current branch
- If the current branch is `main` or `master`, stop and switch back to the intended feature branch before committing
- Prefer small, atomic commits
- Run the most relevant checks available in the repo
- If UI changes, validate all directly affected screens, not just one file
- For local UI work, keep exploration narrow and token-efficient
- Assume Roman received the task prompt from ChatGPT/Codex acting as task compiler; follow that prompt literally and do not broaden scope on your own
- For this project, the only valid repo root is `/Users/romangolik/CC_projects/click_travel_new/project`
- Do not run git commands outside that repo root

## Complexity And Mode

- Expect each task prompt to include a complexity class: `micro`, `small`, `medium`, or `large`
- Scale exploration and reasoning depth to that class
- For `micro` and `small` tasks, use the lightest practical workflow:
  - narrow search
  - minimal file reads
  - compact progress updates
  - compact handoff
- Do not treat a `micro` or `small` task as an architecture exercise unless the code itself forces it

## Token Efficiency Rules

- Start with targeted search, not full-file reading
- Read only the minimal relevant fragment unless broader context is actually needed
- If the repo root is wrong, correct it once and continue; do not repeat failed git checks
- Do not reread the same file unless it changed or the earlier read was insufficient
- Do not produce long progress narration for simple tasks
- Do not inspect unrelated screens unless shared JS/CSS makes that necessary
- Prefer concise handoff over explanatory essays

## Required End-Of-Cycle Handoff

At the end of each meaningful implementation cycle, provide:
- change summary
- branch name
- commit SHA
- touched files
- checks run
- known risks
- reviewed screens/states
- review focus

## UI Rules

- Preserve the existing visual language unless Roman asks for a redesign
- Reuse current design tokens and existing JS patterns where possible
- Avoid one-off styling unless there is a clear reason
- Think in user flows, not isolated pages
- For critical user-facing icons, prefer inline SVG over icon fonts
- Do not introduce new `Material Symbols` dependencies on primary flows if the same icon can be rendered as SVG
- If a task affects cold-load first paint, explicitly check for icon/text flash on uncached mobile Safari loads

## Safety Rules

- Never hardcode secrets
- Call out destructive or broad changes explicitly
- Do not claim completion if related screens or states were not checked
- For release-facing UI work, use `SMOKE_CHECKLIST.md` and distinguish between technical verification and human visual confirmation
- Do not run `git init` unless Roman explicitly asks to initialize a new repository
- Do not use `git reset --hard` as workflow recovery
- If git behaves unexpectedly, stop and re-check repo root instead of improvising destructive recovery
- Treat `clicktravel.click` as the only canonical domain for this project unless Roman explicitly requests a domain change
- Do not reintroduce `painai.online`, `www.clicktravel.click`, or other aliases into Apache, docs, or code comments without explicit approval
