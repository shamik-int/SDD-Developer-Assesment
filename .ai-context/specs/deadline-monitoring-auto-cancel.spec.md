# Feature Specification: Deadline Monitoring & Automatic Cancellation

## Feature ID
deadline-monitoring-auto-cancel

## Status
In Peer Review

## Linked BRD
.ai-context/BRD.md#BRD-021 · BRD-022 · BRD-023 · BRD-032 (rules BR-011, BR-012)

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Spec Review) | Shamik Bhattacharya | — | Pending | — |
| Gate 2 (Code Review) | Subhajit Mukherjee | — | Not Started | — |

## Intent & Business Goals
A scheduled monitor compares each mandatory downstream task's completion state with its deadline. Responsible stakeholders are reminded before the deadline. If a mandatory task is still incomplete after its deadline, the request is automatically cancelled, outstanding tasks are cancelled, and the employee and stakeholders are notified. Monitoring must not block portal operations and must never cancel a request twice or cancel a request whose tasks are all complete.

## Context
- Builds on: `.ai-context/specs/downstream-task-management.spec.md` (`dueAt`, task statuses)
- Related: `.ai-context/specs/request-tracking-notifications.spec.md` (delivers reminder/cancel notifications), `.ai-context/specs/transfer-execution.spec.md`
- Module: `backend/src/modules/deadline-monitor/`

## User Roles & Actors
- **System (scheduler)**: runs the monitor.
- **Task team members / Employee / Manager / HR**: receive reminders and cancellation notices.
- **Portal Administrator**: can view monitor run results.

## Assumptions & Open-Question Handling (for Gate 1 confirmation)
| ID | Statement | Relates to |
|---|---|---|
| S4-A1 | Monitoring runs every `MONITOR_INTERVAL_MINUTES` (default 15); deadline precision is therefore that interval. | BRD-022 |
| S4-A2 | When one mandatory task is overdue, the request is cancelled and every other non-completed task is set to `Cancelled`; completed tasks are kept. | OQ-008 |
| S4-A3 | An automatically cancelled request is terminal; reopening by an administrator is not supported. | OQ-009 |
| S4-A4 | A reminder is raised once per task when `dueAt - now <= REMINDER_LEAD_HOURS` (default 24). | Notification event "Task approaching deadline" |
| S4-A5 | A task is overdue when `now > dueAt` and status is `Pending` or `In Progress`. | BRD-023 |
| S4-A6 | Cancellation applies only while the request is `Pending Downstream Actions`; once all tasks are complete the request can no longer be auto-cancelled. | BRD-025 |

## Acceptance Criteria
### deadline-monitoring-auto-cancel.AC1 — Every mandatory task has a deadline
- **Given:** a generated downstream task
- **When:** it is stored
- **Then:** it has a non-null `dueAt`; a task without one is rejected by schema validation.

### deadline-monitoring-auto-cancel.AC2 — Periodic monitoring
- **Given:** the scheduler is running
- **When:** an interval elapses
- **Then:** all incomplete tasks on `Pending Downstream Actions` requests are evaluated against `dueAt` and the run result (checked, reminded, cancelled counts, duration) is logged.

### deadline-monitoring-auto-cancel.AC3 — Pre-deadline reminder
- **Given:** an incomplete task within the reminder window
- **When:** the monitor runs
- **Then:** exactly one `task.deadline_approaching` event is emitted for the responsible team; repeated runs do not re-send.

### deadline-monitoring-auto-cancel.AC4 — Auto-cancel on overdue mandatory task
- **Given:** an incomplete mandatory task with `now > dueAt` on a `Pending Downstream Actions` request
- **When:** the monitor runs
- **Then:** the request status becomes `Cancelled` with reason `AUTO_CANCEL_OVERDUE_TASK` and the overdue task id/team, remaining non-completed tasks become `Cancelled`, an audit entry is written, and `transfer.auto_cancelled` is emitted once.

### deadline-monitoring-auto-cancel.AC5 — Completed work protects the request
- **Given:** all tasks completed before their deadlines
- **When:** the monitor runs after the deadlines
- **Then:** the request is not cancelled.

### deadline-monitoring-auto-cancel.AC6 — Race with completion
- **Given:** a task is completed at the same moment the monitor evaluates it
- **When:** both operations run
- **Then:** exactly one wins consistently (conditional update on task status); a completed task is never cancelled and a cancelled request is never completed.

### deadline-monitoring-auto-cancel.AC7 — Idempotent, multi-instance safe
- **Given:** two backend instances run the monitor, or the monitor re-runs
- **When:** the same request is evaluated
- **Then:** a distributed lock / conditional update ensures the request is cancelled and notified once.

### deadline-monitoring-auto-cancel.AC8 — Cancelled request visible to users
- **Given:** an auto-cancelled request
- **When:** the employee opens it
- **Then:** the UI shows status `Cancelled`, the reason and the overdue team; no further actions are offered. A new request may then be submitted (assumption A-10).

### deadline-monitoring-auto-cancel.AC9 — Failure isolation
- **Given:** an error while processing one request
- **When:** the monitor runs
- **Then:** the error is logged with the request id, other requests are still processed, and the next run retries.

## API Contract
No public business endpoints; the monitor is an internal scheduled job.

### deadline-monitoring-auto-cancel.API01 — GET /api/v1/admin/deadline-monitor/runs?limit=
**Success (200):**
```json
{ "runs": [{ "startedAt": "ISO-8601", "durationMs": 0, "checked": 0, "reminded": 0, "cancelled": 0, "errors": 0 }] }
```
| Code | Condition | Body |
|---|---|---|
| 401 / 403 | unauthenticated / not Portal Administrator | standard envelope |

## Architecture & Structural Scoping
### Frontend Scope (`frontend/src/`)
- Cancelled-state rendering (reason, overdue team) in `frontend/src/components/transfer/CancellationNotice.tsx`, used by `frontend/src/app/transfers/[id]/page.tsx`
- Overdue/“due soon” badge in `frontend/src/components/tasks/TaskTable.tsx`

### Backend Scope (`backend/src/modules/deadline-monitor/`)
- `deadlineMonitor.job.ts` (scheduler, interval from env), `deadlineMonitor.service.ts`, `deadlineMonitor.routes.ts`
- Model: `MonitorRun.model.ts`, `JobLock.model.ts` (TTL lock)
- Emits `task.deadline_approaching`, `transfer.auto_cancelled`; updates `DownstreamTask` and `TransferRequest` through their module services (no direct cross-module model access)

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| deadline-monitoring-auto-cancel.UT01 | AC1 | create task without `dueAt` | validation error |
| deadline-monitoring-auto-cancel.UT02 | AC2 | run with mixed tasks | correct counts logged |
| deadline-monitoring-auto-cancel.UT03 | AC3 | within window, run twice | one reminder |
| deadline-monitoring-auto-cancel.UT04 | AC4 | overdue task | request Cancelled; others Cancelled; one event; audit |
| deadline-monitoring-auto-cancel.UT05 | AC5 | all complete, past deadlines | not cancelled |
| deadline-monitoring-auto-cancel.UT06 | AC6 | concurrent complete vs monitor | consistent single outcome |
| deadline-monitoring-auto-cancel.UT07 | AC7 | two monitors in parallel | one cancellation |
| deadline-monitoring-auto-cancel.UT08 | AC8 | render cancelled request | reason shown, no actions |
| deadline-monitoring-auto-cancel.UT09 | AC9 | one request throws | others processed; error logged |

## Non-Functional Requirements & Security
- **Performance**: job processes in batches (default 200), uses indexes on `status + dueAt`, and runs off the request path so it does not block portal traffic.
- **Security & Authorization**: run-history endpoint is administrator-only; no PII in job logs (ids only).
- **Reliability**: idempotent, lock-protected, retried on next interval; cancellation is atomic.
- **Error Handling**: per-request try/catch; failures logged and counted.

## Out of Scope
- Approval-stage deadlines and escalation (OQ-001, OQ-002, OQ-006)
- Reopening cancelled requests (OQ-009)
- Task completion UI (`downstream-task-management`) and notification delivery (`request-tracking-notifications`)
