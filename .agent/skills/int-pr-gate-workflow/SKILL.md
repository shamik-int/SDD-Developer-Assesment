---
name: int-pr-gate-workflow
description: Standardized PR Gate Workflow between Spec Generation and Gate 2 Approval covering parallel spec execution, reviewer detection after git pull, role decision prompts, reviewer identity validation, Gate 1 & Gate 2 standardized review templates, and dashboard synchronization.
---

# INT PR Gate Workflow (Spec Generation → Gate 1 → Development → Gate 2)

> [!IMPORTANT]
> **Scope Restriction**
> This workflow governs exclusively the PR Gate lifecycle between **Spec Generation and Gate 2 Approval**.

---

## 1. Authorization & Reviewer Identity Pre-Check (`/pr-gate-workflow`)

When `/pr-gate-workflow` is triggered, the system executes **Mandatory Pre-Check Authorization FIRST**:

```text
               1. Execute /pr-gate-workflow
                           │
                           ▼
          2. Check git config user.email
                           │
                           ▼
   Compare against Assigned Reviewer Roster (project_context.md)
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    [ EMAILS MATCH ]            [ EMAILS DO NOT MATCH ]
             │                           │
             ▼                           ▼
  User IS Authorized Reviewer   User IS NOT Authorized Reviewer
             │                           │
             ▼                           ▼
  Show Reviewer Questions:      1. Display Unauthorized Alert:
  - Option 1: Review Specs         "🛑 UNAUTHORIZED FOR PR REVIEW"
  - Option 2: Work on Specs     2. SKIP Option 1 completely!
                                3. DIRECTLY route to Developer Selection
```

---

## 2. Reviewer Decision Options & Bulk Actions

When an authorized reviewer accesses pending reviews:
- **Option A — Bulk Action: Approve All Pending Items**: Approves all assigned pending Gate 0, Gate 1, and Gate 2 reviews in a single step with batch sign-off comments.
- **Option B — Bulk Action: Reject All Pending Items**: Rejects all assigned pending reviews in a single step with revision feedback.
- **Option C — Select Individual Item**: Performs line-by-line interactive criteria evaluation for a selected spec.

### Rejection Handling Rules
- **Gate 0 Rejection**: Author must update `.ai-context/BRD.md` and `.ai-context/assumptions.md` to resolve comments and re-submit for Gate 0 PR review.
- **Gate 1 Rejection**: Author must update `.ai-context/specs/<slug>.spec.md` to resolve comments and re-submit for Gate 1 PR review.
- **Gate 2 Rejection**: Developer must update code in `src/` and tests under `tests/` to resolve comments and re-submit for Gate 2 review.


---

## 3. Multi-Artifact Synchronization Protocol

Upon PR review completion, synchronize outcome across:
1. Dedicated PR Review File (`.ai-context/pr_reviews/`)
2. Dashboard HTML (`.ai-context/dashboard.html`)
3. Governing Requirement/Spec (`.ai-context/BRD.md` & `.ai-context/assumptions.md` for Gate 0; `.ai-context/specs/<slug>.spec.md` for Gate 1/2)
4. Project Status Board (`.ai-context/status.md`)
5. Prompt History (`.ai-context/prompt_history.md`)
6. Post-Gate 2 CodeGraph Sync (`codegraph sync --incremental`, full rebuild fallback on error)
