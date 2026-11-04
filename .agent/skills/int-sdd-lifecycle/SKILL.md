---
name: int-sdd-lifecycle
description: Manage the end-to-end INT SDD feature development lifecycle, including feature specs, status board updates, Gate 1 peer reviews, implementation plans, task breakdown, test-first TDD, Gate 2 code reviews, and Definitions of Ready & Done.
---

# INT SDD Feature Engineering Lifecycle

## Scope Boundary & Strict Non-Regression Guarantee
> [!IMPORTANT]
> **Strict Scope Restriction — PR Gate Workflow Enhancement**
> - **Before Spec Generation (🔒 NO CHANGE)**: BRD process, project setup, permissions, authentication, BRD ingestion, technology discovery, and pre-spec entry points remain 100% unchanged.
> - **Spec Generation → Gate 1 → Development → Gate 2 (✅ ENHANCEMENT ALLOWED)**: Non-blocking parallel specs, reviewer detection, decision prompts, work selection, standardized review templates, role validation, and dashboard synchronization.
> - **After Gate 2 Approval (🔒 NO CHANGE)**: Release Management, CR Management, Hot Fix Management, Deployment Management, Production Movement, Release Approvals, and downstream status transitions remain 100% unchanged. Handover to downstream workflows occurs exactly as it does today.

---

# Mandatory Lifecycle Flow

```text
1. BRD Ingestion / Authoring (.ai-context/BRD.md & .ai-context/assumptions.md)
       ↓
2. Gate 0: BRD PR Review & Approval (Standardized BRD Review Template + 5-Artifact Sync)
       ↓
3. Spec Authoring (.ai-context/specs/<feature-slug>.spec.md) [Parallel & Non-Blocking]
       ↓
4. Reviewer Detection / Selection & Decision Prompt (Review Pending Specs vs Work on Approved Specs)
       ↓
5. Gate 1: Spec PR Review & Approval (Standardized Gate 1 Template + Git Identity Validation)
       ↓
6. Developer Work Selection ("Which approved spec would you like to start development on?")
       ↓
7. Pre-Development PR Review Check & Developer Notification
       ↓
8. Plan (.ai-context/plans/<slug>.plan.md), Tasks (.tasks.md), Test Cases (.test_cases.md) Breakdown
       ↓
9. Full Development Phase: Test-First (RED) ──► Implementation (GREEN) ──► Full Test Suite Verification (PASS)
       ↓
10. Gate 2: Code PR Review & Approval (Standardized Gate 2 Template + Git Identity Validation + Dashboard Sync)
       ↓
11. EXISTING DOWNSTREAM WORKFLOW (Release Management / Release Note / CR Management / Hot Fix Management)
```

## 1. Non-Blocking Parallel Spec Generation & State Machine

Currently, when one spec is waiting for Gate 1 approval, the system does not block or prevent developers from drafting, generating, or progressing other specs.

Multiple specs exist and progress **independently** in parallel. For example, the following spec states can exist simultaneously in `.ai-context/status.md` and `.ai-context/dashboard.html`:

| Spec ID | Spec Title | Gate 1 Status | Gate 2 Status | Spec Lifecycle Status |
|---|---|---|---|---|
| `spec-1` | User Authentication | `Pending Review` | `Not Started` | `In Peer Review` |
| `spec-2` | Product Catalog | `Pending Review` | `Not Started` | `In Peer Review` |
| `spec-3` | Cart & Checkout | `Approved` | `Not Started` | `Approved` |
| `spec-4` | Payment Gateway | `Approved` | `Not Started` | `Under Development` |
| `spec-5` | Order Management | `Approved` | `Pending Review` | `In QA` |

One spec being pending, blocked, or in review MUST NOT block creating, reviewing, or developing another spec.

```text
Draft → In Peer Review (Gate 1) → Changes Requested ↺
      → Approved → Plan Drafted → Plan Reviewed → Tasks Generated
      → Under Development → In QA → Ready for Release → Released (vX.Y.Z)
```

### Standardized Spec Statuses:
| Status | Lifecycle Stage & Definition |
|---|---|
| `Draft` | Spec is being authored; not yet ready for peer review. |
| `In Peer Review` | Spec submitted for Gate 1 peer review. |
| `Changes Requested` | Gate 1 or Gate 2 review requested updates before approval. |
| `Approved` | Spec passed Gate 1 review with reviewer identity & comments captured. |
| `Plan Drafted` | Implementation plan (`.plan.md`) created from approved spec. |
| `Plan Reviewed` | Implementation plan reviewed and approved. |
| `Tasks Generated` | Executable tasks (`.tasks.md`) derived and ready for TDD. |
| `Under Development` | Feature actively being implemented (TDD Red → Green cycle). |
| `In QA` | Implementation complete, tests GREEN, undergoing Gate 2 review. |
| `Ready for Release` | Passed Gate 2 review with code merged, pending release deployment. |
| `Released (vX.Y.Z)` | Deployed to production and released under tag `vX.Y.Z`. |

## Mandatory Lifecycle Rules
- **No implementation without an approved Spec**.
- **Gate 1 Approval Required for Development**: Development MUST NOT start for a spec that has not received Gate 1 approval.
- **Pre-Development PR Review Verification**: Before starting development on any spec, the system MUST inspect the existing PR Review record (`.ai-context/pr_reviews/GATE1-<slug>-*.md`) and notify the developer of the review findings.
- **Strict Rejection Blocking Rule**: If a spec was `Rejected` or marked `Changes Requested` at Gate 1, the user is **STRICTLY BLOCKED** from creating plans, tasks, test cases, or implementation code. The user MUST update the spec (`.ai-context/specs/<slug>.spec.md`) and re-submit for Gate 1 approval.
- **Developer Work Selection**: Once specs receive Gate 1 approval, present the eligible approved specs to the developer to select which one to work on.
- **Reviewer Detection on Git Pull**: Identify user Git credentials (`git config user.name`/`user.email` or configured User ID). If assigned as reviewer for pending specs, prompt with options: `Review Pending Specs` or `Work on Approved Specs`.
- **Git & Local Reviewer Validation**: Validate authenticated user matches assigned reviewer before official approval/rejection. In local-only mode, capture reviewer metadata without failing Git validation.
- **Plan, Tasks & Tests Generation**: Only after Gate 1 approval is granted, create `.plan.md`, `.tasks.md`, and `.test_cases.md`. Before creating tasks or implementation, perform CodeGraph impact analysis (`.ai-context/codegraph.sqlite`) to inspect existing call paths and module dependencies.
- **TDD RED before GREEN**: Write failing executable tests (`tests/`) first and confirm RED before writing implementation code (GREEN).
- **Mandatory Task-to-Code Traceability Annotations**: Generated implementation functions, methods, and classes MUST include structured JSDoc/Docstring traceability headers (`@task`, `@requirement`, `@spec`, `@description`).
- **Complete Development Before Gate 2**: All feature development tasks must be executed and test suites run to confirm 100% PASS before triggering Gate 2 review.
- **Gate 2 HALT**: After development is complete and tests pass GREEN, halt and perform Gate 2 code review using the standardized Gate 2 template.
- **Dashboard & Spec Synchronization**: Gate 1 and Gate 2 approval/rejection updates both Dashboard HTML (complete record) and Spec (current status) simultaneously.
- **Handover to Downstream**: Upon Gate 2 approval, hand over cleanly to existing downstream Release Management / Deployment workflows without modifying post-Gate-2 processes.
- One task per agent execution. Prompt by stable artifact ID (`<feature-slug>`).

---

# 2. Gate 1 Approval & Pre-Development PR Review Verification Protocol

When a developer selects a spec or requests to start development, the system executes the **Pre-Development Verification Check**:

### Step 1: Pre-Development PR Review Check & Developer Notification
Before generating implementation artifacts or writing code, the system inspects `.ai-context/pr_reviews/GATE1-<feature-slug>-*.md` (and `.ai-context/specs/<feature-slug>.spec.md`) for the selected spec.

The system presents the **Gate 1 Review Notification** to the developer:

> 📋 **Gate 1 PR Review Reference Found**
> - **Spec ID**: `<feature-slug>` — `<Spec Name>`
> - **Gate 1 Review Status**: `Approved` | `Rejected` | `Changes Requested`
> - **Assigned Reviewer**: `<Reviewer Name>` (`<Reviewer Email>`)
> - **Review Date**: `<YYYY-MM-DD HH:MM:SS>`
> - **PR Review Record File**: `.ai-context/pr_reviews/GATE1-<feature-slug>-<timestamp>.md`
> - **Review Summary & Description**: `<Review Description>`
> - **Review Comments**: `<Review Comments & Feedback>`

---

### Step 2A: Workflow if Spec is APPROVED (`Approved`)

If Gate 1 Status is **`Approved`**:
1. The system notifies the developer of the reviewer's approval comments and feedback.
2. The developer is directed to execute the mandatory feature implementation sequence:
   - **Phase 1: Implementation Plan**: Create `.ai-context/plans/<feature-slug>.plan.md` from `.spec.md`.
   - **Phase 2: Task Breakdown**: Create `.ai-context/tasks/<feature-slug>.tasks.md` from `.plan.md`.
   - **Phase 3: Test Case Specifications**: Create `.ai-context/test_cases/<feature-slug>.test_cases.md` mapping 1-to-1 with Acceptance Criteria.
   - **Phase 4: Executable TDD RED**: Generate failing automated tests under `tests/frontend/` or `tests/backend/` and confirm RED failure.
   - **Phase 5: Implementation GREEN**: Implement feature code under `src/` until all tests pass GREEN (100% PASS).
   - **Phase 6: Gate 2 Submission**: Halt execution and wait for / trigger **Gate 2 Code Review** (`.ai-context/pr_reviews/GATE2-<slug>-*.md`).

---

### Step 2B: Workflow if Spec is REJECTED or CHANGES REQUESTED (`Rejected` / `Changes Requested`)

If Gate 1 Status is **`Rejected`** or **`Changes Requested`**:
1. **STRICT DEVELOPMENT BLOCK**: The system **STRICTLY BLOCKS** the user/developer from proceeding to planning (`.plan.md`), task generation (`.tasks.md`), test case drafting (`.test_cases.md`), or writing implementation code in `src/`!
2. The system displays a high-priority warning:
   > 🛑 **DEVELOPMENT BLOCKED — GATE 1 SPEC REJECTED**
   >
   > **Spec ID**: `<feature-slug>`
   > **Gate 1 Outcome**: `Rejected` / `Changes Requested`
   > **Reviewer**: `<Reviewer Name>` (`<Reviewer Email>`)
   > **Reviewer Feedback**:
   > - *Description*: `<Review Description>`
   > - *Comments*: `<Review Comments>`
   >
   > 🔒 **Enforcement Rule**: No planning or development is allowed for rejected specs.
   > **Next Required Action**: The author must update the spec (`.ai-context/specs/<feature-slug>.spec.md`) to resolve reviewer comments and re-submit it for **Gate 1 Approval** before development can begin.

---

### Step 3: Developer Work Selection Roster
When a developer requests to start work, the system lists ONLY specs that have passed Gate 1:
> **"Which approved spec would you like to start development on?"**

If no Gate 1 approved spec is available for development, the system displays:
> **"No approved spec is currently available for development. Please complete the PR Gate 1 approval process before proceeding."**

---

# 3. Reviewer Detection After Git Pull & Interactive PR Review Loop

When a user pulls code or triggers **`/pr-gate-workflow`**, the system identifies the user's Git/system identity (`git config user.name`, `git config user.email` or User ID).

If the system identifies that the user is an **assigned PR reviewer** for one or more pending specs, it presents the top-level Decision Prompt:

> **"You are assigned as a PR reviewer. What would you like to do?"**
- **[ Option 1 — Review Pending Specs ]**
- **[ Option 2 — Work on Approved Specs ]**

---

### Option 1 — Review Pending Specs (Role-Filtered Listing)

When the reviewer selects **Review Pending Specs**:

1. **Role-Based Spec Filtering**:
   The system queries `.ai-context/specs/*.spec.md` and `.ai-context/dashboard.html` to filter pending specs where the authenticated user matches the assigned reviewer roster:
   - **Gate 1 Approver**: Displays specs waiting for Gate 1 Spec Peer Review (`In Peer Review`).
   - **Gate 2 Approver**: Displays specs waiting for Gate 2 Code Review (`In QA`).
   - **Dual Approver (Gate 1 & Gate 2)**: Displays BOTH Gate 1 and Gate 2 pending reviewals in the same listing!

2. **Role-Filtered Listing Table**:
   The system displays the eligible pending specs assigned to that reviewer:

   | # | Spec ID | Spec Title | Gate Level | Assigned Role | Developer | Current Status |
   |---|---|---|---|---|---|---|
   | 1 | `auth-service` | User Authentication | **Gate 1** | Gate 1 Reviewer | Dev A | Pending Spec Review |
   | 2 | `payment-gateway` | Payment Gateway | **Gate 2** | Gate 2 Reviewer | Dev B | Pending Code Review |
   | 3 | `order-engine` | Order Processing | **Gate 1 & Gate 2** | Dual Reviewer | Dev C | Pending Spec Review |

3. **Spec-Oriented Interactive Q&A Review Process**:
   When the reviewer selects a spec from the table:
   - **Step A: Spec Orientation Summary**: Present the feature's Intent, Linked BRD, Acceptance Criteria, and (for Gate 2) code diff & passing test suite evidence.
   - **Step B: Interactive Q&A Criteria Evaluation**: System gathers reviewer input across the 11 standardized criteria (for Gate 1 or Gate 2).
   - **Step C: Review Description**: System prompts for high-level summary of review findings.
   - **Step D: Review Comments**: System prompts for line-item feedback or requested changes.
   - **Step E: Final Decision**: System prompts for official decision: **`Approve`**, **`Reject`**, or **`Changes Requested`**.

4. **Dedicated Review Record File Creation**:
   Upon review completion, the system automatically writes a dedicated review artifact file under:
   - `.ai-context/pr_reviews/GATE1-<feature-slug>-<YYYYMMDD-HHMMSS>.md` (for Gate 1)
   - `.ai-context/pr_reviews/GATE2-<feature-slug>-<YYYYMMDD-HHMMSS>.md` (for Gate 2)

5. **Multi-Artifact Synchronization Protocol**:
   Every completed PR review update MUST synchronize across **5 core repository artifacts**:
   - **1. PR Review Record (`.ai-context/pr_reviews/`)**: Dedicated markdown record with metadata, Q&A criteria scores, comments, description, reviewer identity, and timestamp.
   - **2. Dashboard HTML (`.ai-context/dashboard.html` — SINGLE SOURCE OF TRUTH)**: Updated with complete review record data, scores, comments, description, reviewer email/ID, and timestamp.
   - **3. Governing Spec (`.ai-context/specs/<slug>.spec.md`)**: Updated status (`Approved`, `Changes Requested`, `Under Development`, `Ready for Release`) and logged entry in `## Gate Approvals & History` linking to the PR review file.
   - **4. Project Status Board (`.ai-context/status.md`)**: Updated active spec status and daily log entry.
   - **5. Prompt History (`.ai-context/prompt_history.md`)**: Appended turn log entry (STRICT APPEND-ONLY RULE).

6. **Continuous Review Loop**:
   Immediately after review completion and 5-artifact sync:
   - The system **automatically loops back** to display the remaining list of assigned pending PR reviews for that reviewer!
   - If remaining assigned pending reviews exist:
     > *"Review completed and synchronized for `<spec-id>`. Remaining pending PR reviews assigned to you:"*
     > [Displays updated listing table]
   - If no more pending reviews remain:
     > *"All assigned PR reviews have been completed! Would you like to select an approved spec to start development on?"*

---

### Option 2 — Work on Approved Specs
If the reviewer selects **Work on Approved Specs**:
1. The reviewer acts as a **developer/contributor** for development purposes.
2. The system displays the list of Gate 1 approved specs available to any developer:
   > **"Select an approved spec to work on:"**
   - `spec-2` — Gate 1 Approved
   - `spec-3` — Gate 1 Approved
   - `spec-5` — Gate 1 Approved
3. The reviewer selects an approved spec and proceeds with standard development (TDD RED -> GREEN).

---

# 4. Reviewer and Developer Role Separation & Validation

The system enforces strict role separation:

- **Reviewer Identity**: Determines whether the user can perform:
  - Gate 1 review, approval, or rejection.
  - Gate 2 review, approval, or rejection.
- **Developer Identity**: Determines whether the user can:
  - Pull code.
  - Work on approved specs.
  - Execute development & write code.
  - Complete development & submit for Gate 2 review.

> **Crucial Rule**: Pulling code does NOT automatically grant reviewer approval rights. Only the assigned reviewer for that specific Gate and spec can perform official approval/rejection.
> Being assigned as a PR reviewer does NOT prevent a user from developing approved specs.
> Working on an approved spec does NOT automatically make the user the PR reviewer for that spec.

### Git-Based Identity Validation & Approval Restriction Rule
When project code is available in Git, the system performs **Strict Pre-Execution Email Matching**:

1. **Pre-Execution Check**:
   The system compares authenticated Git user email (`git config user.email`) against the **Assigned Reviewer Email Roster** configured for the target PR gate in `.ai-context/project_context.md` and `.ai-context/constitution.md`.

2. **Access & Approval Enforcement**:
   - If the user's Git email (`git config user.email`) matches an assigned reviewer email for that PR gate, the user is granted PR review access.
   - If the user's Git email does **NOT** match an assigned reviewer email (e.g. logged in as `developer@company.com` but assigned reviewer is `reviewer@company.com`):
     - **Option 1 (Review Pending Specs)** is **STRICTLY BLOCKED AND RESTRICTED**.
     - The system MUST explicitly write and output the high-priority restriction alert as visible text in the chat response before displaying developer modal questions:
       > 🛑 **PR REVIEW RESTRICTED — EMAIL MISMATCH**
       > - **Logged-in Git Email:** `<logged_in_email>` (e.g. `developer@company.com`)
       > - **Assigned Reviewer Email:** `<assigned_email>` (e.g. `reviewer@company.com`)
       > 🔒 **Access Blocked**: Option 1 (Review Pending Specs) is restricted because your logged-in Git email does not match the assigned PR reviewer email. Directing to Developer Workspace...
     - Any manual attempt to submit an `Approve`, `Reject`, or `Changes Requested` decision is **HARD-BLOCKED AND REJECTED**.

### Local-Only Scenario Rule
If the project has not yet been pushed to Git and exists only locally:
- Git identity validation is skipped.
- Review process STILL captures complete reviewer information: Reviewer Name, Reviewer Email/User ID, Review Status, Review Comments, Review Description, and Timestamp.
- Once pushed to Git, full Git identity validation rules apply automatically.

---

# 5. Reviewer With Multiple Responsibilities Example

A Team Lead/Manager may be assigned as a reviewer for some specs while contributing to development on others.
When pulling code, the system presents the top-level decision prompt:

```text
What would you like to do?
[ Review Pending Specs ]
[ Work on Approved Specs ]
```

If **Review Pending Specs** is selected:
- Filter and show assigned pending specs based on reviewer identity.
- Execute interactive Q&A review using standardized template.
- Save dedicated review file under `.ai-context/pr_reviews/` and sync Dashboard HTML, Spec, Status Board, and Prompt History.
- Loop back to show remaining pending reviews until complete.

If **Work on Approved Specs** is selected:
- Shows Gate 1 approved specs (`spec-2`, `spec-3`, `spec-5`).
- Select spec and begin TDD development cycle.

---

# 6. Standardized Gate 1 Review Template (Spec & BRD Peer Review)

Every Gate 1 review MUST evaluate BOTH the Feature Spec (`.spec.md`) and the linked BRD Requirement (`.ai-context/BRD.md`). It MUST utilize the standardized 22-field Gate 1 Review Template (saved under `.ai-context/pr_reviews/GATE1-<slug>-<timestamp>.md`):

```markdown
# Gate 1 PR Review: <Spec ID> — <Spec Name>

## Review Metadata
- **Project Name:** <Project Name>
- **Spec ID:** <feature-slug>
- **Spec Name:** <Spec Name>
- **Linked BRD Requirement:** .ai-context/BRD.md#<BRD-ID> (<BRD Requirement Title>)
- **Developer:** <Developer Name / Email>
- **Assigned Reviewer(s):** <Assigned Reviewer Roster>
- **Reviewer Name:** <Reviewer Name>
- **Reviewer Email/User ID:** <Reviewer Email or User ID>
- **Review Status:** Approved | Rejected | Changes Requested
- **Review Date/Time:** YYYY-MM-DD HH:MM:SS
- **Review Record File:** .ai-context/pr_reviews/GATE1-<feature-slug>-<YYYYMMDD-HHMMSS>.md

## Review Criteria Evaluation (Q&A Results)
1. **BRD Traceability & Alignment:** Passed | Needs Improvement | Failed
2. **Requirement Completeness:** Passed | Needs Improvement | Failed
3. **Requirement Understanding:** Passed | Needs Improvement | Failed
4. **Functional Scope:** Passed | Needs Improvement | Failed
5. **Technical Approach/Design:** Passed | Needs Improvement | Failed
6. **Business Rules:** Passed | Needs Improvement | Failed
7. **Validations:** Passed | Needs Improvement | Failed
8. **Dependencies:** Passed | Needs Improvement | Failed
9. **Assumptions:** Passed | Needs Improvement | Failed
10. **Edge Cases:** Passed | Needs Improvement | Failed
11. **Acceptance Criteria & Readiness:** Ready | Not Ready

## Review Summary & Feedback
- **Review Description:** <High-level summary of review findings, BRD scope alignment, and assessment>
- **Review Comments:** <Detailed line-item feedback, requested changes, or approval notes>
```

---

# 7. Standardized Gate 2 Review Template

Every Gate 2 review MUST utilize the standardized 22-field Gate 2 Review Template (saved under `.ai-context/pr_reviews/GATE2-<slug>-<timestamp>.md`):

```markdown
# Gate 2 PR Review: <Spec ID> — <Spec Name>

## Review Metadata
- **Project Name:** <Project Name>
- **Spec ID:** <feature-slug>
- **Spec Name:** <Spec Name>
- **Developer:** <Developer Name / Email>
- **Assigned Reviewer(s):** <Assigned Reviewer Roster>
- **Reviewer Name:** <Reviewer Name>
- **Reviewer Email/User ID:** <Reviewer Email or User ID>
- **Review Status:** Approved | Rejected | Changes Requested
- **Review Date/Time:** YYYY-MM-DD HH:MM:SS
- **Review Record File:** .ai-context/pr_reviews/GATE2-<feature-slug>-<YYYYMMDD-HHMMSS>.md

## Review Criteria Evaluation (Q&A Results)
1. **Implementation Against Approved Spec:** Passed | Needs Improvement | Failed
2. **Functional Correctness:** Passed | Needs Improvement | Failed
3. **Code Quality:** Passed | Needs Improvement | Failed
4. **Coding Standards:** Passed | Needs Improvement | Failed
5. **Error Handling:** Passed | Needs Improvement | Failed
6. **Validation:** Passed | Needs Improvement | Failed
7. **Security Considerations:** Passed | Needs Improvement | Failed
8. **Test Coverage:** Passed | Needs Improvement | Failed
9. **Edge Cases:** Passed | Needs Improvement | Failed
10. **Acceptance Criteria Compliance:** Passed | Needs Improvement | Failed
11. **Regression Impact:** None | Low | High

## Review Summary & Feedback
- **Review Description:** <High-level summary of code review findings, test suite verification, and quality sign-off>
- **Review Comments:** <Detailed code comments, refactoring notes, or approval sign-off notes>
```

---

# 8. Dashboard HTML — Single Source of Truth & 5-Artifact Synchronization

The existing Dashboard HTML (`.ai-context/dashboard.html` / `gate-review-dashboard-design.html`) provides a centralized view of every spec and its PR review lifecycle.

### Single Source of Truth Roles
- **Dashboard HTML = Complete PR Review Record** (contains full review templates, history, criteria scores, comments, descriptions, and timestamps for Gate 1 and Gate 2).
- **PR Review Folder (`.ai-context/pr_reviews/`) = Dedicated Review Record Files**.
- **Spec (`.spec.md`) = Current Workflow / Review Status** (contains summary state, reviewer identity link, current status, and next workflow action).

### 5-Artifact Synchronization Protocol
When Gate 1 or Gate 2 is approved or rejected:
1. **Create Review Record File**: Save `.ai-context/pr_reviews/GATE1-<slug>-<timestamp>.md` or `GATE2-<slug>-<timestamp>.md`.
2. **Dashboard HTML Update**: Record complete PR review template data (criteria, comments, description, reviewer identity, timestamps, next action).
3. **Spec File Update**: Update `.ai-context/specs/<slug>.spec.md` with new status (`Approved`, `Changes Requested`, `Under Development`, `Ready for Release`), reviewer metadata, and link to the review record file.
4. **Status Board Update**: Sync `.ai-context/status.md` active spec matrix and daily execution log.
5. **Prompt History Update**: Append execution entry to `.ai-context/prompt_history.md` (STRICT APPEND-ONLY RULE).

---

---

# Stable Feature Slug & Traceability

Every feature receives a short, kebab-case feature slug when its Spec is created (e.g. `user-authentication`, `dynamic-form-management`).

The feature slug is the single stable traceability key across:
- Spec: `.ai-context/specs/<slug>.spec.md` (e.g. `dynamic-request-management.spec.md`)
- Plan: `.ai-context/plans/<slug>.plan.md` (e.g. `dynamic-request-management.plan.md`)
- Tasks: `.ai-context/tasks/<slug>.tasks.md` (e.g. `dynamic-request-management.tasks.md`)
- Test Cases: `.ai-context/test_cases/<slug>.test_cases.md` (e.g. `dynamic-request-management.test_cases.md`)
- Git branch: `feature/<slug>`
- Status Board: `.ai-context/status.md`

## CRITICAL RULE — FLAT FILE STRUCTURE (NO SUBDIRECTORIES)
All artifact files inside `.ai-context/` MUST be created directly as **flat files** at the root of their respective category folder:
- **CORRECT**: `.ai-context/specs/dynamic-request-management.spec.md`
- **CORRECT**: `.ai-context/plans/dynamic-request-management.plan.md`
- **CORRECT**: `.ai-context/tasks/dynamic-request-management.tasks.md`
- **CORRECT**: `.ai-context/test_cases/dynamic-request-management.test_cases.md`

**PROHIBITED**: Never create subdirectories named after the feature slug (e.g., DO NOT create `.ai-context/specs/dynamic-request-management/spec.md` or `.ai-context/plans/dynamic-request-management/plan.md`). Feature subdirectories break file linking, automated tracking, and status board traceability.

## CRITICAL RULE — PORTABLE REPOSITORY-RELATIVE PATHS (NO ABSOLUTE PATHS)
All path references, file links, and code paths recorded inside repository artifacts (`.ai-context/`, `status.md`, specs, plans, tasks, test cases, ADRs, releases) MUST be **relative to the repository root**:
- **CORRECT**: `.ai-context/specs/dynamic-request-management.spec.md`
- **CORRECT**: `src/backend/controllers/requestController.ts`
- **PROHIBITED**: Never write absolute local file system paths (e.g., `C:\Users\Username\...`, `c:/Users/...`, `file:///C:/Users/...`, `/home/user/...`).

**Git Portability Mandatory**: Absolute OS paths break when committed to Git because team members and CI/CD pipelines operate under different user profile directories. All written path references MUST be relative to the repository workspace root.

## Traceability ID Conventions
- Acceptance Criteria: `<slug>.AC1`, `<slug>.AC2`
- API Contracts: `<slug>.API01`, `<slug>.API02`
- Unit Test Cases: `<slug>.UT01`, `<slug>.UT02`
- Tasks: `<slug>.T01`, `<slug>.T02`

---

# Status Board — `.ai-context/status.md`

`.ai-context/status.md` is the repository project status board. It MUST follow this exact structure:

```markdown
# Project Status Board

_Last updated: YYYY-MM-DD_

## Active Specs

| Spec ID | Title | Status | Owner | Last Updated | Notes |
|---|---|---|---|---|---|
| <feature-slug> | <title> | <status> | <owner> | YYYY-MM-DD | <current state / blocker> |

## Daily Execution Log

### YYYY-MM-DD
- **<feature-slug>**: <what changed today, progress, blocker, or review outcome>
```

---

# 1. Feature Specifications (`.spec.md`)

Create specifications under:
`.ai-context/specs/<feature-slug>.spec.md` (instantiated from `.ai-context/templates/spec.template.md`)

A Spec MUST be authored from an approved BRD requirement (`.ai-context/BRD.md`). A requirement MUST NOT first appear in the Spec.

## CRITICAL RULE — PROJECT TYPE & SCOPE MATCHING (FULL STACK MANDATE)
- **Full Stack Projects**: Every feature spec (`.spec.md`) MUST define both **Frontend** (`src/frontend/`, `tests/frontend/`) and **Backend** (`src/backend/`, `tests/backend/`) Acceptance Criteria, API Contracts, Unit Test Scenarios, and Code Deliverables.
- **Frontend-Only Projects**: Specs define UI components, state management, client routing, and frontend unit test cases (`tests/frontend/`).
- **Backend-Only Projects**: Specs define API contracts, services, controllers, database models, and backend unit/integration test cases (`tests/backend/`).

## Spec Template (sourced from `.ai-context/templates/spec.template.md`)
```markdown
# Spec: <Feature Name>

## Spec ID
<feature-slug>

## Status
Draft | In Peer Review | Changes Requested | Approved | Plan Drafted | Plan Reviewed | Tasks Generated | Under Development | In QA | Ready for Release | Released (vX.Y.Z)

## Linked BRD
.ai-context/BRD.md#BRD-NNN

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Spec Review) | <Approver Name> | YYYY-MM-DD | Approved | "<User/Reviewer approval comment provided during review>" |
| Gate 2 (Code Review) | <Approver Name> | YYYY-MM-DD | Approved | "<User/Reviewer approval comment provided during code review>" |

## Intent
<One paragraph: what changes, for whom, under what condition>

## Context
- Builds on: .ai-context/architecture.md (<section>)
- Related: .ai-context/specs/<related-spec>.spec.md
- API contract: <link if external>

## API Contract (Mandatory if API surface exists)
### <slug>.API01 — <METHOD> <path>
**Request payload:**
```json
{ "field": "type" }
```
**Success response (<code>):**
```json
{ "field": "type" }
```
**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 4xx | <condition> | <shape> |

## Acceptance Criteria
1. <slug>.AC1 — Given <state>, when <action>, then <outcome>.
2. <slug>.AC2 — Given <state>, when <action>, then <outcome>.

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| <slug>.UT01 | AC1 | <scenario> | <expected> |

## Explicitly Out of Scope
- <item>

## Non-Functional Constraints (from constitution.md)
- <latency / throughput / compliance constraint>
```

---

# Gate 1 — Spec & BRD Peer Review

Gate 1 is a formal **Spec & BRD Peer Review** conducted before technical planning, design, or coding begins.

During Gate 1 review, the reviewer evaluates BOTH the **Feature Spec (`.ai-context/specs/<slug>.spec.md`)** AND the linked **BRD Requirement (`.ai-context/BRD.md#BRD-NNN`)** to ensure complete alignment, business intent satisfaction, and zero unbacked scope creation.

## Gate 1 Validation Checklist
- [ ] Reviewer is different from the author.
- [ ] Reviewer identity verified: Gate 1 approval MUST be performed and pushed to Git by the **Project Manager (PM)** or **Technical Lead (TL)**.
- [ ] Git commit/push for Gate 1 approval (`.ai-context/specs/<slug>.spec.md`) matches PM/TL Git identity (`user.email`). Developers MUST NOT push Gate 1 approvals.
- [ ] **BRD Requirement Traceability Verified**: Feature spec maps 1-to-1 with an authoritative requirement in `.ai-context/BRD.md`.
- [ ] Intent is one unambiguous paragraph matching BRD business objective.
- [ ] Every Acceptance Criterion uses Given / When / Then format and has a unique ID.
- [ ] API Contract defines request payload, success response, and exception table (if API surface exists).
- [ ] Explicitly Out of Scope section is present.
- [ ] Non-Functional Constraints are sourced from `constitution.md`.
- [ ] Linked BRD entry is verified.
- [ ] No overlap with an existing Spec.
- [ ] Status explicitly set to `Approved` or `Changes Requested`.
- [ ] Human approval comment captured and logged under `## Gate Approvals & History` in `.ai-context/specs/<feature-slug>.spec.md`.

## Mandatory Gate 1 Git & Role Enforcement
- **Gate 1 Approval Authority**: Gate 1 (Spec & BRD Scope Review) is reserved exclusively for **Project Managers (PM)** and **Technical Leads (TL)**.
- **Git Identity Verification**: The Git commit and push for Gate 1 Spec Approval (`.spec.md` transition to `Approved`) MUST be executed under the Git credentials (`user.email`) of the PM or TL.
- **Developer Prohibition**: Developers/Engineers are strictly prohibited from self-approving or pushing Gate 1 approvals to Git.

## Definition of Ready
A feature is Ready for technical planning & development only when:
- Spec status is `Approved` via Gate 1 by PM/TL and pushed under PM/TL Git identity.
- BRD requirement is linked.
- Acceptance criteria are testable and IDed.
- Architecture review is complete.
- Tasks are generated and approved for execution.

## Mandatory Gate 1 HALT Execution Mechanism
- **STRICT TURN TERMINATION RULE**: When requesting Gate 1 Spec Approval, the agent MUST present the Spec or Multi-Spec Impact Matrix to the user and **IMMEDIATELY END ITS TURN WITHOUT CALLING ANY FURTHER TOOLS**.
- **PROHIBITED PRE-APPROVAL ACTIONS**: The agent MUST NOT generate `.plan.md`, `.tasks.md`, `.test_cases.md`, or write application code before explicit human Gate 1 approval is received in a subsequent prompt from PM/TL.

---

# 2. Implementation Plans (`.plan.md`)

Create implementation plans under:
`.ai-context/plans/<feature-slug>.plan.md` (instantiated from `.ai-context/templates/plan.template.md`)

A Plan MUST be derived from an approved Spec and MUST NOT redefine business intent.

## Plan Template (sourced from `.ai-context/templates/plan.template.md`)
```markdown
# Plan: <Feature Name>

## Derived From
.ai-context/specs/<feature-slug>.spec.md

## Architecture Approach
<components touched, new vs existing, integration points>

## Data Model
<schema changes, migrations, if any>

## Constitution Check
- [ ] No new datastore introduced without ADR
- [ ] Testing discipline matches constitution.md
- [ ] Security posture matches constitution.md

## Explicitly Deferred
- <item with reason>

## Sequencing
1. <high-level build order>
```

---

# 3. Tasks Breakdown (`.tasks.md`)

Create executable tasks under:
`.ai-context/tasks/<feature-slug>.tasks.md` (instantiated from `.ai-context/templates/tasks.template.md`)

Tasks MUST be derived from the approved Plan.

## Task Template (sourced from `.ai-context/templates/tasks.template.md`)
```markdown
# Tasks: <Feature Name>

## Derived From
.ai-context/plans/<feature-slug>.plan.md

## Sequence
- [ ] <slug>.T01 — <independently verifiable work> — Acceptance: <AC ID(s)>
- [ ] <slug>.T02 — <independently verifiable work> — Acceptance: <AC ID(s)>
```

### Task Execution Rules:
- Implement one task at a time.
- Task states: `Not Started` -> `In Progress` -> `In Review` -> `Merged`.
- Never execute multiple tasks unattended in a single batch diff.

---

# 4. Test Cases & Test-First (TDD) Discipline

Test-case specifications belong under:
`.ai-context/test_cases/<feature-slug>.test_cases.md`

Cross-feature integration scenarios belong under:
`.ai-context/test_cases/_integration.md`

Executable automated test files belong under `tests/frontend/` or `tests/backend/`.

## CRITICAL RULE — MODULAR SPEC-DERIVED TEST CASES & TRACEABILITY
- **Modular Spec Derivation**: All test case specifications (`.ai-context/test_cases/<feature-slug>.test_cases.md`) and executable test files (`tests/frontend/`, `tests/backend/`) MUST be derived directly from the corresponding modular sub-feature spec (`.ai-context/specs/<feature-slug>.spec.md`).
- **1-to-1 Acceptance Criteria Mapping**: Every test case ID (`<slug>.TC01`, `<slug>.TC02`) MUST explicitly map to an Acceptance Criterion (`<slug>.AC1`, `<slug>.AC2`) defined in that modular spec.
- **Full Stack Test Coverage**: For Full Stack projects, tests derived from a modular spec MUST cover both Frontend UI scenarios (`tests/frontend/`) and Backend API/Service scenarios (`tests/backend/`) specified in that modular spec.

## EXECUTABLE TEST CREATION & JEST CONFIGURATION PROTOCOL
1. **Post-Gate 1 Artifact Generation**: Once a modular feature spec (`.ai-context/specs/<feature-slug>.spec.md`) is approved via Gate 1, the agent automatically generates:
   - Implementation Plan: `.ai-context/plans/<feature-slug>.plan.md`
   - Task Breakdown: `.ai-context/tasks/<feature-slug>.tasks.md`
   - Test Case Specification: `.ai-context/test_cases/<feature-slug>.test_cases.md`
2. **Development Phase Executable Test Generation**: During the development stage (TDD RED phase), before writing any implementation code in `src/`, executable automated test code files (`.test.js` / `.test.jsx`) are generated under `tests/` matching the project's Jest / test runner configuration.
3. **Hierarchy Mirroring**: Executable test code files under `tests/` MUST sit inside the exact `modules/`, `config/`, or `shared/` directory structure matching `src/`.

## Test-First Rule
```text
Test Case Spec → Write Executable Test → Run Test → RED → Implementation → Run Test → GREEN
```
1. Write the failing test first and confirm it fails (RED) for the expected missing capability.
2. Implement code until the test passes (GREEN).
3. Do NOT retrofit tests after coding.

---

# 5. Gate 2 — Code Review

Gate 2 occurs after tests are GREEN and before merging into main.

## Mandatory Role Split for Development & Gate 2
- **Developer / SSE Role**: Developers/Engineers execute TDD (RED ➔ GREEN), implement feature tasks in `src/` and `tests/`, run test suites, and submit the completed diff for Gate 2 Code Review under their Git identity.
- **Technical Lead / Reviewer Role**: The Technical Lead (TL) conducts the technical code review, verifies test coverage evidence, and approves Gate 2 before merging.

## Gate 2 Validation Checklist
- [ ] Developer implementation diff verified: Code implemented by Developer/SSE under developer Git identity.
- [ ] Every Acceptance Criterion verified individually against the diff by ID (`<slug>.AC#`).
- [ ] Tests were written first and confirmed RED before GREEN.
- [ ] No AI attribution in comments or commit messages (`Generated by AI` prohibited).
- [ ] Security checklist passed: No secrets, credentials, or PII in logs; auth & rate limits enforced.
- [ ] `architecture.md` / `ADR` updated if architectural changes occurred.
- [ ] `status.md` and Spec status updated same day.
- [ ] Human Gate 2 approval comment captured and logged under `## Gate Approvals & History` in `.ai-context/specs/<feature-slug>.spec.md`.

## Definition of Done
A feature is Done for merge only when:
- All Acceptance Criteria individually verified.
- TDD cycle verified (RED then GREEN).
- Gate 2 checklist complete.
- Security checks passed.
- `status.md` updated.
- Human code review complete.

## Mandatory Gate 2 HALT Execution Mechanism
- **STRICT TURN TERMINATION RULE**: When development is 100% complete and test suites pass GREEN, the agent MUST present the Gate 2 Code Review Request (with completed diff summary and passing test execution results) and **IMMEDIATELY END ITS TURN WITHOUT CALLING ANY FURTHER TOOLS**.
- **PROHIBITED PRE-APPROVAL ACTIONS**:
  1. Do NOT create release note files (`.ai-context/releases/RELEASE-vX.Y.Z.md`).
  2. Do NOT update status to `Ready for Release` or `Released (vX.Y.Z)`.
  3. Do NOT scan `BRD.md` for the next requirement or draft the next spec.
  4. Do NOT execute any post-review work until explicit human Gate 2 approval is received in a subsequent prompt.

## Post-Gate 2 Release Logging & Next Spec Transition Protocol
Immediately following successful Gate 2 code review approval for a feature spec (`<feature-slug>`):
1. **Generate/Update Release Plan**: Create or update the project Release Plan document (`.ai-context/releases/RELEASE-vX.Y.Z.md`) using `.ai-context/templates/release.template.md`, recording the completed spec ID, feature title, spec link, intent summary, and Gate 2 review sign-off.
2. **Status Board Sync**: Update `.ai-context/status.md` and `.ai-context/specs/<slug>.spec.md` to transition the spec status to `Ready for Release` or `Released (vX.Y.Z)`.
3. **Automated Transition to Next Spec**: Immediately scan `.ai-context/BRD.md` for the next un-implemented requirement, author its modular sub-feature spec (`.ai-context/specs/<next-slug>.spec.md`), and present it for Gate 1 review approval.

---

# 6. Handling Observations, Feedback & Change Requests

When feedback, screenshots, or bug reports are received, the system evaluates the prompt to determine whether it is a **Formal Change Request** or a **Development-Related Fix**:

## Mandatory Prompt Keyword Classification Rule

> [!IMPORTANT]
> **Change Request Trigger Condition & Execution Safeguard**
> - **Formal Change Request (CR)**: The system ONLY triggers the formal Change Request workflow if the user prompt contains the keyword phrase **"Change Request"** or `"CR"` (case-insensitive, matching `"Change Request"`, `"change request"`, `"CR"`, `"change-request"`, `"CR:"`, or `"Change Request:"`).
> - **Mandatory Pre-Execution Requirement**: When triggered, the agent **MUST IMMEDIATELY execute Step 0 (creating `.ai-context/change_requests/CR-<YYYYMMDD>-<slug>.md` and logging in `prompt_history.md`) BEFORE taking any other action**. Source code modifications are STRICTLY PROHIBITED until Gate 1 re-approval is granted.
> - **Development-Related Fix / UI Bug Fix**: If the prompt does NOT contain "Change Request" or "CR", the system processes it as a **Development-Related Fix** under the active approved spec.

---

### Classification Matrix

| Prompt Keyword | Classification | Required Workflow | Code Modification Allowed? |
|---|---|---|---|
| Prompt contains **"Change Request"** or **"CR"** (case-insensitive) | **Formal Change Request** | Auto-create `.ai-context/change_requests/` dir, write `CR-<YYYYMMDD>-<slug>.md` (using inline template if file missing), append to `prompt_history.md`, update `.spec.md`, **HALT & wait for Gate 1 Approval**. | ❌ NO (Blocked until Gate 1 approved) |
| Prompt does NOT contain **"Change Request"** | **Development-Related Fix / UI Bug Fix** | Apply fix directly under active approved spec, update test cases if needed (TDD RED → GREEN), and verify before Gate 2 review. | ✅ YES (TDD RED → GREEN allowed) |

---

## Workflow A: Formal Change Request (Prompt Contains "Change Request")

When a prompt contains "Change Request" or "CR" (case-insensitive):

### Step 0: Mandatory Change Request Document Creation & Asset Archiving
1. **Auto-Create Directory**: Ensure `.ai-context/change_requests/` directory exists (create automatically if missing).
2. **Create Change Request Document (`CR-<YYYYMMDD>-<slug>.md`)**:
   - Write `.ai-context/change_requests/CR-<YYYYMMDD>-<slug>.md`.
   - If `.ai-context/templates/change-request.template.md` exists, instantiate from it.
   - **BUILT-IN INLINE TEMPLATE FALLBACK**: If template file is absent, write directly using built-in structure:
     ```markdown
     # Change Request: CR-<YYYYMMDD>-<slug>

     ## Change Request ID
     CR-<YYYYMMDD>-<slug>

     ## Date
     YYYY-MM-DD

     ## Source
     <User Prompt in Chat>

     ## Status
     Draft | In Peer Review (Gate 1)

     ## Description
     <Detailed explanation of requested change>

     ## Affected Spec IDs & Impact Analysis
     | Spec ID | Impact Scope | Description of Required Change |
     |---|---|---|

     ## Proposed Spec Modifications
     ### Revised Acceptance Criteria:
     1. <feature-slug>.AC_REV1 — Given <state>, when <action>, then <outcome>.

     ## Gate Approvals & History
     | Gate | Approver | Date | Outcome |
     | Gate 1 (Spec Review) | <Approver Name> | YYYY-MM-DD | Pending |
     ```
3. **Archive Provided Assets**: Save any provided screenshots/documents into `.ai-context/change_requests/CR-<YYYYMMDD>-<slug>-<filename>`.
4. **Append to Prompt History**: Read `.ai-context/prompt_history.md` and **APPEND** the prompt entry to the bottom.

### Step 1: Automatic Spec Discovery & Multi-Spec Impact Analysis
- Scan `.ai-context/status.md` and `.ai-context/specs/*.spec.md` for affected Spec IDs.
- Generate Multi-Spec Impact Matrix listing affected Spec IDs and scope changes.

### Step 2: Spec Modification (Delta & AC Revisions)
- Draft updated Acceptance Criteria in affected specs and set status to `In Peer Review`.

### Step 3: Unified Gate 1 Approval Request & Halt
- Present Multi-Spec Impact Matrix and proposed Spec diffs to the user.
- **HALT & WAIT** for explicit human Gate 1 approval before making any code changes.

---

## Workflow B: Development-Related Fix / UI Bug Fix (Prompt Does NOT Contain "Change Request")

When a prompt does NOT contain the keyword **"Change Request"** (e.g. fixing small UI bugs, alignment glitches, minor component behavior tweaks during active development):

1. **Direct Scope Check**: Confirm the fix belongs under the active approved feature spec (`.ai-context/specs/<feature-slug>.spec.md`).
2. **TDD RED Phase**: Write or update failing unit/integration tests under `tests/` matching the UI bug or development fix.
3. **TDD GREEN Phase**: Execute code and styling changes in `src/` to resolve the UI bug or defect.
4. **Verification**: Run test suites to ensure 100% PASS and no regression.
5. **Gate 2 Submit**: Include the fix in the final diff submitted for Gate 2 Code Review.

---

---

# Repository Branching & Traceability

- Feature Branch: `feature/<feature-slug>`
- Bug-Fix Branch: `fix/<issue-slug>`
- Commit Messages: `Implements <slug>.T01` (Do NOT include AI attribution).

