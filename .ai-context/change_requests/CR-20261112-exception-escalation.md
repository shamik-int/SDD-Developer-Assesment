# Change Request: CR-20261112-exception-escalation

## Change Request ID
CR-20261112-exception-escalation

## Date
2026-11-12

## Source
User Feedback — Gate 1 reviewer must-fix feedback (Shamik Bhattacharya), recorded in `.ai-context/pr_reviews/gate-1-deadline-monitoring-auto-cancel.md`. The feedback cites a "BRD v4"; no such document exists in `docs/`. Only BRD v1.0 is the approved baseline.

## Status
Draft

## Description
Replace automatic cancellation on overdue downstream tasks with SLA-based reminders, levelled escalation and a final `EXCEPTION` escalation resolved by HR. Amends the BRD v1.0 baseline:
- **BRD-023 (proposed):** The system shall escalate a request to `EXCEPTION` (reason `FINAL_ESCALATION`) when a mandatory downstream task is still incomplete at SLA + 3 working days, and notify the HR Operations Head and stakeholders. It shall not cancel the request automatically.
- **BR-012 (proposed):** Failure to complete a mandatory downstream task within its SLA triggers reminders and escalation; final action is an HR-resolved `EXCEPTION`.
- **BRD-021 / OQ-003 / OQ-004 / OQ-005:** SLAs measured on a working calendar (09:00–17:00 IST, Mon–Fri, excluding holidays; 8 h = 1 working day). Reference values: Payroll and IT 1 working day (reminder after 4 h); Facilities 2 working days (reminder after 1 day); L1 at breach, L2 at SLA + 2 days, daily reminders after breach, final at SLA + 3 days; all configurable.
- **BRD §Statuses (proposed):** request statuses `PROCESSING`, `PARTIALLY_COMPLETED`, `EXCEPTION`, `COMPLETED`, `CANCELLATION_PENDING`, `CANCELLED`, to be mapped from v1.0 `Pending Downstream Actions` / `Ready for Execution` / `Scheduled`.
- **OQ-008 / OQ-009:** superseded (no auto-cancel, so no sibling cancellation or reopening of auto-cancelled requests).

**Governance note:** BRD changes need `/int-brd-ingestion` and Gate 0 re-approval. No BRD file or `brd-change-log.md` entry has been changed by this draft; `.ai-context/BRD.md` stays at v1.0 until Gate 0 approves this CR.

## Linked Assets
- **Archived Asset**: none (no source document)
- **Prompt History**: .ai-context/prompt_history.md

## Affected Spec IDs & Impact Analysis
| Spec ID | Impact Scope | Affected Files / Components | Description of Required Change |
|---|---|---|---|
| deadline-monitoring-exception-escalation (renamed from deadline-monitoring-auto-cancel) | Full Stack | `.ai-context/specs/deadline-monitoring-exception-escalation.spec.md` | Rewritten per this CR (done in this change) |
| downstream-task-management | Backend | `.ai-context/specs/downstream-task-management.spec.md` | SLA instance ownership/calendar, `Not Required` status, per-team SLA + reminder config; references renamed (cross-reference edit done; full AC revision pending its Gate 1) |
| request-tracking-notifications | Backend / Frontend | `.ai-context/specs/request-tracking-notifications.spec.md` | Replace auto-cancel notice with exception/escalation notices (edited in this change) |
| transfer-execution | Backend | `.ai-context/specs/transfer-execution.spec.md` | Align status model (`EXCEPTION` blocks execution). **Not yet edited — pending** |
| parallel-approval, transfer-request-submission | Backend | status names | Align lifecycle names. **Not yet edited — pending** |

## Multi-Spec Impact Matrix
- **deadline-monitoring-exception-escalation**: AC1–AC12 and UT01–UT14 replace the former AC1–AC9 / UT01–UT09.
- **downstream-task-management**: S3-A7 added; deadline days become working-calendar SLA values.
- **request-tracking-notifications**: AC5/AC6 and UT06 now cover escalation and exception events.
- **transfer-execution**: must refuse to execute `EXCEPTION` requests and use the new status names (pending).

## Proposed Spec Modifications
### Revised Acceptance Criteria:
1. deadline-monitoring-exception-escalation.AC5 — Given a task incomplete at SLA + 3 working days, when the monitor runs, then the request becomes `EXCEPTION` (`FINAL_ESCALATION`), HR Operations Head and stakeholders are notified, and nothing is cancelled.

## Open Items for the Reviewer
1. Where is `sla-lifecycle` (JOB01) specified? It is not in `.ai-context/specs/`.
2. Failed-task rules (reviewer item 5) are not defined anywhere in the repository.
3. Holiday calendar source.
4. Confirm the mapping of v1.0 statuses to the new status model.

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 0 (BRD re-approval) | Shamik Bhattacharya | — | Pending | — |
| Gate 1 (Spec Review) | Shamik Bhattacharya | — | Pending | — |
| Gate 2 (Code Review) | Subhajit Mukherjee | — | Not Started | — |
