# Feature Specification: Deadline Monitoring & Exception Escalation

## Feature ID
deadline-monitoring-exception-escalation

## Status
In Peer Review (resubmitted for Gate 1 — conditional on Gate 0 approval of CR-20261112-exception-escalation)

## Linked BRD
.ai-context/BRD.md#BRD-021 · BRD-022 · BRD-023 · BRD-032 (rules BR-011, BR-012)
**Deviation from BRD v1.0:** BRD-023 and BR-012 mandate automatic cancellation. This spec follows the Gate 1 reviewer's directive (escalation to `EXCEPTION`) and is governed by `.ai-context/change_requests/CR-20261112-exception-escalation.md`. Until that change request is approved at Gate 0 the BRD baseline is not amended and this spec cannot be approved at Gate 1.

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Spec Review) | Shamik Bhattacharya | 2026-11-11 17:04:24 | Changes Requested | Define the `limit` validation on API01; reminder dedup; "mandatory" definition; task already overdue when first seen; audit entry; must-fix feedback (escalation instead of auto-cancel, SLA calendar, per-stakeholder reminders, UT01–UT14). See `.ai-context/pr_reviews/gate-1-deadline-monitoring-auto-cancel.md`. |
| Gate 1 (Spec Review) — resubmission | Shamik Bhattacharya | — | Pending | — |
| Gate 2 (Code Review) | Subhajit Mukherjee | — | Not Started | — |

## Intent & Business Goals
Downstream tasks (Payroll, IT, Facilities) are tracked against stakeholder SLAs measured on a working calendar. Stakeholders are reminded before breach and escalated in levels after breach. A request is **never cancelled automatically**: if a task is still open at SLA + 3 working days the request moves to `EXCEPTION` (reason `FINAL_ESCALATION`), HR Operations Head and stakeholders are notified, and HR resolves it through the authorised workflow. Monitoring runs inside the existing `sla-lifecycle` JOB01 orchestration, must not block portal operations, and must never produce a duplicate reminder, escalation or transition.

## Context
- Builds on: `.ai-context/specs/downstream-task-management.spec.md` (tasks, per-team SLA configuration API03)
- Orchestration: `sla-lifecycle` JOB01 (**not present in `.ai-context/specs/` — see D-1**)
- Related: `.ai-context/specs/request-tracking-notifications.spec.md` (notification catalogue and delivery), `.ai-context/specs/transfer-execution.spec.md`
- Module: `backend/src/modules/deadline-monitor/` (handlers registered with JOB01; no own scheduler)

## User Roles & Actors
- **System (JOB01)**: evaluates SLA instances and fires thresholds.
- **Task team members (Payroll / IT / Facilities)**: receive reminders and L1/L2 escalations.
- **HR Operations Head and stakeholders**: receive the final escalation and resolve `EXCEPTION` through the authorised workflow.
- **Employee**: sees status and next action.
- **Portal Administrator**: configures SLAs (via `downstream-task-management`.API03) and views monitor runs (API01).

## Dependencies
| ID | Dependency | Status |
|---|---|---|
| D-1 | `sla-lifecycle` JOB01 orchestration (scheduler, tick, run lifecycle). This spec must not create a parallel scheduler or SLA engine. | **Open — spec/module not found in repository.** Gate 1 must confirm where it is specified; if it does not exist it must be authored before planning. |
| D-2 | Working-calendar service (09:00–17:00 IST, Mon–Fri, excluding holidays; 8 h = 1 working day). | Calendar vs business days: OQ-004 resolved as working calendar by CR; holiday list source to be confirmed (S4-A9). |
| D-3 | `downstream-task-management` per-team SLA configuration (SLA duration, reminder offset) via its service. | Extended by CR (see its S3-A7). |
| D-4 | `request-tracking-notifications` event catalogue. | Event names below added by CR. |
| D-5 | Request-level transaction/lock and transactional outbox in the shared layer (`backend/src/shared/`). | To be provided; used by this module only through the shared API. |

## Assumptions & Open-Question Handling (for Gate 1 confirmation)
| ID | Statement | Relates to |
|---|---|---|
| S4-A1 | JOB01 invokes this module's evaluation handler each tick; tick interval belongs to `sla-lifecycle`. Threshold precision equals the tick interval. | BRD-022 |
| S4-A2 | **No automatic cancellation exists.** At SLA + 3 working days the request becomes `EXCEPTION` (reason `FINAL_ESCALATION`); sibling tasks are **not** changed. HR resolves it. Supersedes OQ-008. | BRD-023 (CR), OQ-008 |
| S4-A3 | Reopening/cancelling an `EXCEPTION` request is an HR action in the authorised workflow, outside this spec. Supersedes OQ-009. | OQ-009 |
| S4-A4 | SLA values (SLA working days, reminder offset, L1/L2/final offsets, daily reminder) come from Admin Configuration. Reference configuration: Payroll and IT SLA = 1 working day, reminder at 4 working hours after start; Facilities SLA = 2 working days, reminder at 1 working day after start. L1 at breach; L2 at SLA + 2 working days; daily reminders after breach; final action at SLA + 3 working days. No generic 24 h reminder. | BRD-021, OQ-003, OQ-005 |
| S4-A5 | A task is evaluated only while its status is `Pending` or `In Progress`. `Completed` and `Not Required` tasks are excluded. | BRD-023 |
| S4-A6 | **Mandatory task:** every generated task for an applicable team is mandatory (downstream S3-A2); optional tasks do not exist. A task with `Not Required` status is excluded from evaluation. | BRD-021 |
| S4-A7 | Request status model used here: `PROCESSING`, `PARTIALLY_COMPLETED`, `EXCEPTION`, `COMPLETED`, `CANCELLATION_PENDING`, `CANCELLED`. Evaluation applies only to `PROCESSING` and `PARTIALLY_COMPLETED` requests; `COMPLETED` and `CANCELLATION_PENDING` requests are never touched. Mapping from BRD v1.0 `Pending Downstream Actions` is defined by the CR. | BRD §Statuses (CR) |
| S4-A8 | **Failed-task rules** are not defined in the repository. Until the reviewer supplies them, a task in `Failed` status is skipped by the monitor and counted in `skipped`. | Reviewer item 5 |
| S4-A9 | The holiday list is part of the working-calendar configuration; no default holiday set is assumed. | OQ-004 |
| S4-A10 | A new request after an `EXCEPTION` resolution follows A-10 (terminal status reached). | A-10 |

## Acceptance Criteria
### deadline-monitoring-exception-escalation.AC1 — SLA instance on a working calendar
- **Given:** a downstream task is created or reassigned
- **When:** its SLA instance is created
- **Then:** `dueAt` is computed from the stakeholder SLA configuration on the working calendar (09:00–17:00 IST, Mon–Fri, excluding holidays, 8 h = 1 working day); the instance stores `startedAt`, `dueAt` and an immutable configuration snapshot; a missing `dueAt` is rejected by schema validation; later configuration changes never recalculate an existing instance; reassignment marks the old instance `SUPERSEDED` and creates a new one.

### deadline-monitoring-exception-escalation.AC2 — Evaluation inside JOB01
- **Given:** `sla-lifecycle` JOB01 ticks
- **When:** the handler runs
- **Then:** active SLA instances of `PROCESSING` / `PARTIALLY_COMPLETED` requests are evaluated in batches; a run record (checked, reminders, L1, L2, exceptions, skipped, errors, durationMs) is stored; no separate scheduler exists.

### deadline-monitoring-exception-escalation.AC3 — Per-stakeholder reminder
- **Given:** an incomplete task whose reminder offset has elapsed
- **When:** the handler runs
- **Then:** exactly one `task.deadline_approaching` event is emitted for the owning team (Payroll/IT 4 h, Facilities 1 day by reference configuration); the fired threshold is persisted on the SLA instance (`reminderFiredAt`) and is never re-sent.

### deadline-monitoring-exception-escalation.AC4 — Breach escalations
- **Given:** an incomplete task past `dueAt`
- **When:** the handler runs
- **Then:** `task.sla_breached` (L1) is emitted once at breach; `task.escalation_l2` once at SLA + 2 working days; a `task.overdue_reminder` once per working day after breach; each threshold is recorded (`l1FiredAt`, `l2FiredAt`, `lastDailyReminderOn`) and fires at most once.

### deadline-monitoring-exception-escalation.AC5 — Final escalation to EXCEPTION
- **Given:** an incomplete task at SLA + 3 working days on a `PROCESSING` / `PARTIALLY_COMPLETED` request
- **When:** the handler runs
- **Then:** in one request-level transaction the request status becomes `EXCEPTION` with reason `FINAL_ESCALATION`, an audit entry is written (actor `SYSTEM`, reason, overdue task id and team, previous status, timestamp), and `transfer.exception_raised` is written to the transactional outbox once for HR Operations Head and stakeholders. The request is **not** cancelled and no sibling task is changed.

### deadline-monitoring-exception-escalation.AC6 — Protected states
- **Given:** a request that is `COMPLETED` or `CANCELLATION_PENDING` (or already `EXCEPTION` / `CANCELLED`), or a task that is `Completed` / `Not Required`
- **When:** the handler runs
- **Then:** nothing is reminded, escalated or changed.

### deadline-monitoring-exception-escalation.AC7 — Completion race and stale state
- **Given:** a task is completed while the handler evaluates it
- **When:** both operations run
- **Then:** every state change is a conditional update against the observed status/version inside the request-level transaction; exactly one outcome wins; a completed task is never escalated and an `EXCEPTION` request is never marked completed by this module.

### deadline-monitoring-exception-escalation.AC8 — Multi-instance, lock ownership and idempotency
- **Given:** two scheduler instances run, a worker stalls, or a tick re-runs
- **When:** the same request is evaluated
- **Then:** the `JobLock` TTL lock records owner id and expiry and is renewed by its owner; a stale worker whose lock expired cannot commit (owner/version check on write); the per-threshold persisted markers plus conditional updates ensure no duplicate reminder, escalation or transition.

### deadline-monitoring-exception-escalation.AC9 — Catch-up after downtime
- **Given:** the monitor first sees a task whose thresholds have already elapsed (e.g. after downtime)
- **When:** the handler runs
- **Then:** every elapsed threshold fires once, in order (reminder, L1, L2, final), without duplicates; if the final threshold has elapsed the request moves to `EXCEPTION` in the same run.

### deadline-monitoring-exception-escalation.AC10 — Failure isolation and notification isolation
- **Given:** an error while processing one request, or a notification/outbox delivery failure after commit
- **When:** the handler runs
- **Then:** the request's transaction is rolled back and the error logged with the request id (no PII); other requests continue; the next run retries. A notification delivery failure never rolls back a committed transition; the outbox retries delivery.

### deadline-monitoring-exception-escalation.AC11 — Request visible to users
- **Given:** a request with an overdue or due-soon task, or in `EXCEPTION`
- **When:** a user opens it or the task list
- **Then:** the existing overdue and due-soon badges remain; the overdue task, team, deadline and escalation level are shown; for `EXCEPTION` the status and the next HR action are shown; there is no auto-cancel notice; no permitted action is removed.

### deadline-monitoring-exception-escalation.AC12 — Monitor run API
- **Given:** a Portal Administrator calls API01
- **When:** the request is valid
- **Then:** runs are returned sorted by `startedAt` descending with counts and duration; no endpoint of this module changes workflow state.

## API Contract
No public business endpoints; the monitor is an internal handler under JOB01. API01 is kept because no equivalent run-history endpoint exists in `sla-lifecycle` (to be confirmed at Gate 1 under D-1; drop API01 if an equivalent is found).

### deadline-monitoring-exception-escalation.API01 — GET /api/v1/admin/deadline-monitor/runs?limit=
Portal Administrator only. `limit`: integer, default 20, minimum 1, maximum 100. Sorted by `startedAt` descending.

**Success (200):**
```json
{ "runs": [{ "startedAt": "ISO-8601", "durationMs": 0, "checked": 0, "reminders": 0, "l1": 0, "l2": 0, "exceptions": 0, "skipped": 0, "errors": 0 }] }
```
| Code | Condition | Body |
|---|---|---|
| 400 | `limit` not an integer, < 1 or > 100 | `VALIDATION_FAILED` |
| 401 / 403 | unauthenticated / not Portal Administrator | standard envelope |

## Architecture & Structural Scoping
### Frontend Scope (`frontend/src/`)
- Exception state rendering (reason, overdue task, team, deadline, escalation level, next HR action) in `frontend/src/components/transfer/ExceptionNotice.tsx`, used by `frontend/src/app/transfers/[id]/page.tsx`
- Overdue / due-soon badges kept in `frontend/src/components/tasks/TaskTable.tsx`; escalation level added

### Backend Scope (`backend/src/modules/deadline-monitor/`)
- `deadlineMonitor.handler.ts` (registered with JOB01), `deadlineMonitor.service.ts`, `deadlineMonitor.routes.ts`
- Models: `SlaInstance.model.ts` (requestId, taskId, team, startedAt, dueAt, configSnapshot, status `ACTIVE|SUPERSEDED|CLOSED`, `reminderFiredAt`, `l1FiredAt`, `l2FiredAt`, `lastDailyReminderOn`, `finalFiredAt`, `version`), `MonitorRun.model.ts`, `JobLock.model.ts` (TTL, `ownerId`, `expiresAt`)
- Emits via outbox: `task.deadline_approaching`, `task.sla_breached`, `task.escalation_l2`, `task.overdue_reminder`, `transfer.exception_raised`. `transfer.auto_cancelled` and reason `AUTO_CANCEL_OVERDUE_TASK` are removed.
- Reads/updates `DownstreamTask` and `TransferRequest` only through their module services.

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | BRD / Dependency | Scenario | Expected |
|---|---|---|---|---|
| deadline-monitoring-exception-escalation.UT01 | AC1 | BRD-021 / D-2, D-3 | task created Friday 16:00 IST with 1-day SLA; config later changed | `dueAt` Monday 16:00; snapshot stored; not recalculated; missing `dueAt` rejected |
| deadline-monitoring-exception-escalation.UT02 | AC3 | BRD-022 / D-3 | Payroll/IT at 4 h, Facilities at 1 day; run twice | one reminder per task at the right time; no 24 h reminder |
| deadline-monitoring-exception-escalation.UT03 | AC4 | BRD-022 | task at breach | one L1 event; rerun no duplicate |
| deadline-monitoring-exception-escalation.UT04 | AC4 | BRD-022 | task at SLA + 2 working days | one L2 event |
| deadline-monitoring-exception-escalation.UT05 | AC4 | BRD-022 | three working days past breach | one daily reminder per working day |
| deadline-monitoring-exception-escalation.UT06 | AC5 | BRD-023 (CR) / D-5 | task at SLA + 3 | request `EXCEPTION`/`FINAL_ESCALATION`; audit written; one outbox event; request not cancelled; siblings unchanged |
| deadline-monitoring-exception-escalation.UT07 | AC7 | BRD-023 | concurrent completion vs monitor | single consistent outcome; completed task never escalated |
| deadline-monitoring-exception-escalation.UT08 | AC8 | D-1 | two schedulers; stale worker after lock expiry | one transition; stale worker write rejected; no duplicate events |
| deadline-monitoring-exception-escalation.UT09 | AC1 | BRD-021 | task reassigned | old SLA instance `SUPERSEDED`; new instance with new `dueAt`; old thresholds not reused |
| deadline-monitoring-exception-escalation.UT10 | AC10 | BRD-022 | one request throws mid-batch | its transaction rolled back; others processed; error logged with id only |
| deadline-monitoring-exception-escalation.UT11 | AC10 | D-4 | notification delivery fails after commit | transition stays committed; outbox retries |
| deadline-monitoring-exception-escalation.UT12 | AC6 | S4-A7 | `COMPLETED`, `CANCELLATION_PENDING`, `Completed`/`Not Required` task | nothing changed or sent |
| deadline-monitoring-exception-escalation.UT13 | AC12 | BRD-032 | API01 with default, 0, 101, "x", non-admin | default 20; 400; 400; 400; 403; sorted `startedAt` desc |
| deadline-monitoring-exception-escalation.UT14 | AC9 | BRD-023 | task first seen with all thresholds elapsed | each threshold once in order; request `EXCEPTION` in same run |

(AC2 is covered by UT10/UT13 counts; AC11 by a frontend render test to be added at the Test Cases stage — UT numbering is kept at UT01–UT14 as requested.)

## Non-Functional Requirements & Security
- **Performance**: batches (default 200); indexes on `status + dueAt` and `requestId`; runs off the request path inside JOB01.
- **Security & Authorization**: API01 Portal Administrator only; no PII in logs (request/task ids only); no module endpoint changes workflow state.
- **Reliability**: request-level transaction and lock; atomic task + request updates; conditional updates against stale state; lock ownership, expiry and stale-worker protection; transactional outbox; each threshold fires at most once.
- **Error Handling**: per-request try/catch; failures logged and counted; standard error envelope.

## Out of Scope
- Automatic cancellation and cancelling sibling tasks (removed by CR)
- Approval-stage deadlines and escalation (OQ-001, OQ-002, OQ-006)
- HR's resolution workflow for `EXCEPTION` requests and `CANCELLATION_PENDING` handling
- Building `sla-lifecycle` itself (D-1), the working-calendar service, the outbox
- Task completion UI (`downstream-task-management`) and notification delivery (`request-tracking-notifications`)
