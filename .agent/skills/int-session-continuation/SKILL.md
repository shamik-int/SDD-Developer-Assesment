---
name: int-session-continuation
description: Resume context and continue engineering tasks across session restarts by reading repository persistent memory (.ai-context/status.md, specs, plans, tasks, git status).
---

# INT Session Continuation & Context Recovery

## Purpose
This skill defines the mandatory protocol for resuming work in a project repository after a session restart, context clearance, or agent handoff.

The repository, NOT the chat window, is the persistent memory of the project.

---

# Core Rule — Repository Memory Authority

- Do NOT rely on chat history, memory, or user recall as the permanent source of truth.
- Do NOT guess project state, active features, or next tasks.
- Read only the specific repository artifacts required to determine the active state.
- All file paths and references written to `.ai-context/` artifacts MUST be **repository-relative** (e.g. `.ai-context/specs/<slug>.spec.md`, `src/...`) to ensure full Git portability across developer workstations and CI/CD. Never write local OS absolute paths (`C:\Users\...`).

---

# Skill & Governance Resolution Hierarchy

When executing any engineering task or reading project governance:
1. **Priority 1 — Check Repository Local Files FIRST**: Inspect project repository root for `AGENTS.md` and `.agents/skills/<skill_name>/SKILL.md`. If present, load and follow local project skills.
2. **Priority 2 — Fallback to Global Skills SECOND**: If and ONLY if a requested skill or rule file is not present in `.agents/skills/`, fall back to reading global skills from the active AI assistant's global configuration directory (`<global-skills-root>/`).

---

# State-Driven `int-project-resume` Engine

The `/int-project-resume` workflow is the **authoritative entry point for resuming an interrupted or in-progress SDD project**.

> [!IMPORTANT]
> **Zero Blind Execution & True State-Awareness**
> The system MUST NEVER assume the next step based on the last command executed or blindly advance the workflow. Every time `/int-project-resume` is run, the system MUST reconstruct the **actual current project state** from repository memory and Git, validate state consistency, detect manual edits, and present valid next actions for explicit user confirmation.

---

## State Reconstruction Chain

When `/int-project-resume` is executed, the engine reconstructs project state in this exact sequence:

```text
Inspect Repository Memory (.ai-context/status.md, dashboard.html, project_context.md)
        ↓
Inspect BRD & Gate 0 Review State (.ai-context/BRD.md, pr_reviews/BRD-*.md)
        ↓
Inspect Manual BRD Changes (Git diff vs last reviewed commit/record)
        ↓
Inspect All Feature Specs & Gate 1 Status (.ai-context/specs/*.spec.md, pr_reviews/GATE1-*.md)
        ↓
Present Multi-Spec Interactive Selection Table (If BRD & Gate 0 Approved)
        ↓
Inspect Selected Spec Downstream State (.plan.md, .tasks.md, .test_cases.md)
        ↓
Inspect Development & TDD State (tests/, src/, incomplete - [ ] tasks)
        ↓
Inspect Gate 2 Review State (pr_reviews/GATE2-*.md)
        ↓
Inspect Release State & Release Artifacts (.ai-context/releases/)
        ↓
Inspect Git Working Tree & PR Comments (Branch, commit, working tree diff)
        ↓
Validate Workflow Consistency & Present Action Options to Developer
        ↓
Wait for Developer Confirmation & Execute Selected Action
```

---

## State-Driven Branching Rules

### 1. BRD & Gate 0 State Rules

#### Scenario A — BRD Approved (`BRD = APPROVED` / `Gate 0 = APPROVED`)
If `.ai-context/BRD.md` has passed Gate 0 PR review:
- Do **NOT** automatically regenerate or modify the approved BRD.
- Prompt the developer:
  > 🟢 **BRD has already been approved (Gate 0 Passed).**
  > Do you want to continue with Spec Generation?
  > 
  > **Options:**
  > 1. Continue with Spec Generation
  > 2. Review/Modify BRD
  > 3. Exit

#### Scenario B — BRD Changes Requested (`BRD = CHANGES_REQUESTED` / `Gate 0 = NOT_APPROVED`)
If Gate 0 PR review record (`.ai-context/pr_reviews/BRD-*.md`) has status `Changes Requested` or `Rejected`:
- Identify reviewer comments and display them clearly to the developer.
- Provide suggested BRD updates based on reviewer feedback.
- Prompt the developer:
  > ⚠️ **BRD requires updates based on Gate 0 review.**
  > 
  > **Reviewer Comments:**
  > - `<Comment 1>`
  > - `<Comment 2>`
  > 
  > **Available Actions:**
  > 1. Apply suggested updates
  > 2. Manually update BRD
  > 3. Review PR comments
  > 4. Exit
- Do **NOT** silently apply changes without explicit user confirmation.

#### Scenario C — Manual BRD Change Detection
If the developer manually modified `.ai-context/BRD.md` after a previous review or baseline:
- Compare current `.ai-context/BRD.md` against the previously reviewed/approved snapshot or Git history.
- If changes are detected, notify the developer:
  > 🔍 **Changes detected in BRD after previous review.**
- Do **NOT** automatically resubmit for Gate 0 review. Ask the developer:
  > **Available Actions:**
  > 1. Continue modifying the BRD
  > 2. Review detected changes
  > 3. Send updated BRD for Gate 0 PR review
  > 4. Exit

---

### 2. Multi-Spec & Gate 1 State Rules

When BRD and Gate 0 are approved, `/int-project-resume` inspects all feature specifications under `.ai-context/specs/*.spec.md` and displays the **Multi-Spec Status Summary**:

```text
📊 Project Specifications Status Summary (X of Y Specs Approved)

Select the specification you want to work with:

1. Spec 1 — <Slug 1> [APPROVED]
2. Spec 2 — <Slug 2> [APPROVED]
3. Spec 3 — <Slug 3> [PENDING REVIEW]
4. Spec 4 — <Slug 4> [CHANGES REQUESTED]
5. Spec 5 — <Slug 5> [DRAFT]
...
```

#### Scenario A — Selected Spec is APPROVED (`Spec = APPROVED`)
If the developer selects a spec that passed Gate 1:
- Do **NOT** automatically generate plans, tasks, or code.
- Prompt the developer:
  > 🟢 **Spec `<feature-slug>` has already been approved (Gate 1 Passed).**
  > The next workflow stage is Plan Generation. Do you want to continue?
  > 
  > **Options:**
  > 1. Continue with Plan Generation
  > 2. Review Spec
  > 3. Modify Spec
  > 4. Exit
- If developer selects `1. Continue with Plan Generation`:
  ```text
  APPROVED SPEC ➔ PLAN ➔ TASKS ➔ TEST CASES ➔ TDD (RED ➔ GREEN) ➔ GATE 2 REVIEW
  ```

#### Scenario B — Selected Spec Has Changes Requested (`Spec = CHANGES_REQUESTED`)
If the spec was marked `Changes Requested` or `Rejected` at Gate 1 or Gate 2:
- Show Gate 1/2 reviewer comments from `.ai-context/pr_reviews/GATE1-<slug>-*.md`.
- Strictly **BLOCK** downstream plan/task/code generation until spec changes are made and re-submitted for Gate 1 approval.

#### Scenario C — Selected Spec Under Development (`Spec = UNDER DEVELOPMENT`)
If the spec is approved and in development:
- Inspect `.ai-context/plans/<slug>.plan.md`, `.ai-context/tasks/<slug>.tasks.md`, `.ai-context/test_cases/<slug>.test_cases.md`, and Git status.
- Determine the exact first incomplete task `- [ ]`.
- Run existing tests to verify TDD state (RED vs GREEN).
- Prompt developer with next task action before proceeding.

---

### 3. Gate 2 & Release State Rules

#### Scenario A — Gate 2 Changes Requested (`Gate 2 = CHANGES_REQUESTED`)
- Display Gate 2 reviewer feedback from `.ai-context/pr_reviews/GATE2-<slug>-*.md`.
- Guide developer through fixing failing tests or code compliance issues.

#### Scenario B — Gate 2 Approved (`Gate 2 = APPROVED`)
If Gate 2 code review has been approved:
- Do **NOT** automatically generate release files or tags.
- Prompt the developer:
  > 🟢 **Gate 2 has been approved for Spec `<feature-slug>`.**
  > The next step is Release File Generation. Do you want to continue?
  > 
  > **Options:**
  > 1. Generate Release File
  > 2. Review Gate 2 changes
  > 3. Review Spec
  > 4. Exit
- Release file generation (`.ai-context/releases/RELEASE-vX.Y.Z.md`) occurs **ONLY** after explicit user confirmation (`Option 1`).

---

# Git & Change Classification Protocol

During `/int-project-resume`, the engine inspects Git branch, commit history, working tree status, and diffs to classify modifications into one of 6 distinct categories:

1. **`No Changes`**: Working tree clean; repository matches last reviewed state.
2. **`Workflow Changes`**: System-generated log, status, or context updates during execution.
3. **`Manual Changes`**: Developer manually edited `.ai-context/BRD.md`, `.spec.md`, or source code outside active agent prompt.
4. **`Changes Requested by Reviewer`**: Gate 0, Gate 1, or Gate 2 PR review submitted with `Changes Requested`.
5. **`Changes Already Reviewed`**: Code/Spec modifications already submitted and reviewed in a previous PR record.
6. **`New Unreviewed Changes`**: Uncommitted or fresh changes awaiting formal review submission.

> [!CAUTION]
> Do **NOT** treat every Git modification as an automatic request for a new review. Always notify the developer and request confirmation before re-submitting updated artifacts to review gates.

---

# Non-Negotiable Safety & Precedence Rules

1. **State Precedence Hierarchy**:
   $$\text{Gate 0 Approval} > \text{Spec Approval (Gate 1)} > \text{Gate 2 Approval} > \text{Release Generation}$$
2. **Zero Gate Bypassing**: Never skip Gate 0, Gate 1 (Spec Approval), or Gate 2 (Code Review).
3. **No Unapproved Artifact Downstream**: Never generate plans, tasks, test cases, or implementation code for unapproved BRDs or Specs.
4. **No Unconfirmed Overwrites**: Never regenerate or overwrite approved artifacts (`BRD.md`, `.spec.md`, release notes) without explicit user confirmation.
5. **No Blind Continuation**: Never assume the last executed command represents current state; always reconstruct state from repository memory.

---

# Handling Existing & Ongoing Projects (Retrofit & Auto-Sync)

When working with an existing, legacy, or ongoing project:

1. **Automatic Control Plane Upgrade (Dynamic Sync)**:
   - During Step 2 of session continuation, the agent inspects the project's local `.agent/rules/` and `.agent/workflows/`.
   - If any workflow files (e.g. `int-hotfix-management.md`, `int-release-management.md`, `int-project-from-brd.md`, `int-production-incident.md`, `int-brd-ingestion.md`, `int-project-resume.md`, `int-pr-gate-workflow.md`, `int-code-review.md`, `int-generate-tests.md`, `int-project-setup.md`) or rule files are missing compared to `skills/int-project-setup/resources/INT-Control-Plane/.agent/`, the agent **automatically copies the missing files** into `.agent/` without overwriting custom project code or user settings.

2. **Immediate Global Governance Application**:
   - Global rules (`AGENTS.md` / global AI governance rules) apply universally across all projects regardless of when the project was created.
   - For any old project, the agent will automatically enforce the **Client Observation & Change Management Protocol** (auto-detect Spec ID, draft Spec updates, request Gate 1 approval, run TDD RED -> GREEN) for any client feedback or design prompt.

3. **Legacy Projects Lacking `.ai-context/`**:
   - If an existing project lacks `.ai-context/`, the agent runs `int-project-setup` in **Non-Destructive Baseline Mode** to generate `.ai-context/` artifacts and templates without touching existing source code (`src/`, `tests/`).
