---
name: int-project-resume
description: State-Aware Session Continuation & SDD Resume Engine (inspects BRD, Gate 0, Spec states, Gate 1, TDD, Gate 2, Release state, and Git status before executing valid actions).
---

# INT Project Resume Workflow (State-Driven Engine)

The `/int-project-resume` workflow is the **authoritative entry point for resuming an interrupted or in-progress SDD project**.

> [!IMPORTANT]
> **True State Reconstruction (No Blind Continuation)**
> Every time this skill/workflow is triggered, the system inspects persistent repository memory (`.ai-context/`), review records (`pr_reviews/`), and Git working tree status to determine the actual project state tree. It validates state consistency, detects manual edits, and prompts for explicit user confirmation before executing any action.

---

## Workflow Flowchart

```text
/int-project-resume
       ↓
Reconstruct Project State Tree (.ai-context/status.md, dashboard.html, project_context.md, CodeGraph index status)
       ↓
Inspect BRD & Gate 0 Review State (.ai-context/BRD.md, pr_reviews/BRD-*.md)
       ├─► [BRD Approved] ──► Prompt: "BRD Approved. Continue to Spec Generation?"
       ├─► [BRD Changes Requested] ──► Display Reviewer Comments & Suggest Updates
       └─► [Manual BRD Edits Detected] ──► Prompt: "Manual changes detected. Review or Submit for Gate 0?"
       ↓
Inspect Feature Specs & Gate 1 Status (.ai-context/specs/*.spec.md, pr_reviews/GATE1-*.md)
       ↓
Display Multi-Spec Interactive Selection Table (e.g. "3 of 8 Specs Approved")
       ↓
User Selects Specific Feature Spec
       ↓
Inspect Selected Spec Downstream Artifacts (.plan.md, .tasks.md, .test_cases.md)
       ├─► [Spec Approved (Gate 1 Passed)] ──► Prompt: "Spec Approved. Continue to Plan Generation?"
       ├─► [Spec Changes Requested] ──► Show Reviewer Feedback & Block Downstream Coding
       └─► [Spec In Development] ──► Inspect Tasks (- [ ]) & TDD State (tests/ RED vs GREEN)
       ↓
Inspect Gate 2 & Release Readiness State (.ai-context/pr_reviews/GATE2-*.md, releases/)
       ├─► [Gate 2 Changes Requested] ──► Show Gate 2 Reviewer Feedback & Guide Code Fix
       └─► [Gate 2 Approved] ──► Prompt: "Gate 2 Approved. Continue to Release File Generation?"
       ↓
Inspect Git Status & Working Tree Diffs (Classify: No Changes | Workflow | Manual | PR Review Edits)
       ↓
Present Valid Next Actions to Developer
       ↓
Wait for Developer Confirmation
       ↓
Execute Selected Action & Update Repository State
```

---

## State Transition Rules

### 1. BRD & Gate 0 State Rules

#### Scenario A — BRD Approved (`BRD = APPROVED` / `Gate 0 = APPROVED`)
If `.ai-context/BRD.md` has passed Gate 0 PR review:
- Do **NOT** automatically regenerate or modify the approved BRD.
- Prompt developer: "BRD Approved. Continue with Spec Generation?"

#### Scenario B — BRD Changes Requested (`BRD = CHANGES_REQUESTED` / `Gate 0 = NOT_APPROVED`)
If Gate 0 PR review record (`.ai-context/pr_reviews/BRD-*.md`) has status `Changes Requested` or `Rejected`:
- Identify reviewer comments and display them clearly to the developer.
- Provide suggested BRD updates based on reviewer feedback.
- Prompt developer to apply updates and re-submit for Gate 0 PR review.

#### Scenario C — Manual BRD Change Detection
If developer manually modified `.ai-context/BRD.md`:
- Notify developer of detected changes.
- Ask developer to review changes and re-submit for Gate 0 PR review.

---

## Non-Negotiable Safety Rules
1. **Precedence Hierarchy**: `Gate 0 Approval > Spec Approval (Gate 1) > Gate 2 Approval > Release Generation`.
2. **No Blind Execution**: Never assume previous command represents current state.
3. **No Gate Bypassing**: Never skip Gate 0, Gate 1, or Gate 2 review cycles.
4. **No Silent Overwrites**: Never overwrite or regenerate approved artifacts without user sign-off.
