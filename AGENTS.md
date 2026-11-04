# INT AI-First Engineering Policy (AGENTS.md)

This file is the vendor-agnostic governance entry point for every AI assistant and engineer working in this repository.

## Authority Hierarchy
1. `.ai-context/constitution.md` — project-specific constraints (highest authority for the project).
2. `.agent/rules/` — INT organization-wide engineering standards (`int-standards.md`, `auto-log.md`).
3. `.agent/workflows/` and `.agent/skills/` — lifecycle procedures.
4. `.ai-context/` — project knowledge (BRD, specs, plans, tasks, status).

Resolution order: local repository (`.agent/`, `AGENTS.md`) first; global INT configuration only as fallback.

## Lifecycle
BRD ingestion → **Gate 0** (BRD PR review) → Spec → **Gate 1** (Spec peer review) → Plan → Tasks → Test Cases → TDD RED → TDD GREEN → Verification → **Gate 2** (Code review) → Release.

## Core Governance Rules
- No spec drafting until `.ai-context/BRD.md` is `Approved` at Gate 0.
- Specs progress independently and in parallel once Gate 0 is approved.
- A spec rejected or marked `Changes Requested` at Gate 1 blocks planning, tasks, test cases, and code.
- Gate approvals require `git config user.email` to match the assigned reviewer email in `.ai-context/project_context.md`.
- Artifacts are flat files under `.ai-context/<category>/`; never create per-feature subdirectories.
- All recorded paths are repository-relative; never write absolute local paths.
- Never add AI-attribution comments to code or commit messages; keep `.ai-context/prompt_history.md` append-only.
- Implementation functions carry traceability tags (`@task`, `@requirement`, `@spec`, `@description`).
- Read and follow `.agent/rules/int-standards.md` for code style, error handling, security, and performance.
