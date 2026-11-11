# Feature Specification: Automatic Transfer Execution

## Feature ID
transfer-execution

## Status
In Peer Review

## Linked BRD
.ai-context/BRD.md#BRD-025 · BRD-026 · BRD-027 · BRD-028 (rule BR-013)

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Spec Review) | Shamik Bhattacharya | — | Pending | — |
| Gate 2 (Code Review) | Subhajit Mukherjee | — | Not Started | — |

## Intent & Business Goals
Once both approvals and all downstream tasks are complete, the request waits for its effective date and is then executed automatically: the employee's organisational information (department/business unit, location, role) is updated, relevant systems are informed, the request becomes `Completed`, and the employee is notified. Execution must be exactly-once, atomic and recoverable.

## Context
- Builds on: `.ai-context/specs/downstream-task-management.spec.md` (consumes `transfer.downstream_complete`), `.ai-context/specs/transfer-request-submission.spec.md`
- Related: `.ai-context/specs/request-tracking-notifications.spec.md`
- Module: `backend/src/modules/transfer-execution/`

## User Roles & Actors
- **System (scheduler)**: verifies prerequisites and executes on the effective date.
- **Employee**: is notified of scheduling and completion.
- **Portal Administrator**: monitors and retries failed executions.

## Assumptions & Open-Question Handling (for Gate 1 confirmation)
| ID | Statement | Relates to |
|---|---|---|
| S5-A1 | `Ready for Execution` = prerequisites met and effective date reached; `Scheduled` = prerequisites met but effective date is in the future. | BRD note on lifecycle |
| S5-A2 | The portal's employee master record is the source of truth that is updated; external HR/Payroll/IT/Facilities systems are notified through adapter ports (no-op adapters until integrations are confirmed). | OQ-016, Dependencies 5–8 |
| S5-A3 | If execution fails (including an integration failure) the request stays `Scheduled`, retries run with exponential backoff (max `EXECUTION_MAX_ATTEMPTS`, default 5), then the request is flagged `Execution Failed – Needs Attention` for administrator retry; it is never auto-cancelled. | OQ-010 |
| S5-A4 | Rejected, cancelled or incomplete requests never update employee records. | A-09 |
| S5-A5 | The effective date is evaluated in the portal's configured timezone (`PORTAL_TIMEZONE`). | BRD-026 |

## Acceptance Criteria
### transfer-execution.AC1 — Prerequisite verification
- **Given:** a `transfer.downstream_complete` event
- **When:** it is processed
- **Then:** the system verifies both approvals are `Approved` and every required task is `Completed`; if not, the request is left unchanged and the discrepancy is logged.

### transfer-execution.AC2 — Scheduling for a future effective date
- **Given:** prerequisites met and effective date after today
- **When:** verification succeeds
- **Then:** status becomes `Scheduled` and `transfer.scheduled` is emitted.

### transfer-execution.AC3 — Execution on the effective date
- **Given:** a `Scheduled` or `Ready for Execution` request whose effective date is today or earlier
- **When:** the daily/interval executor runs
- **Then:** the employee's department, business unit, location and role are updated to the requested values and status becomes `Completed` in one atomic transaction, with an execution audit entry.

### transfer-execution.AC4 — Exactly-once
- **Given:** the executor runs twice or on two instances
- **When:** the same request is processed
- **Then:** the employee update and `transfer.completed` event happen once (conditional state transition + lock).

### transfer-execution.AC5 — Employee notified
- **Given:** successful execution
- **When:** status becomes `Completed`
- **Then:** `transfer.completed` is emitted for the employee and relevant stakeholders.

### transfer-execution.AC6 — Never executes unqualified requests
- **Given:** a request that is `Rejected`, `Cancelled`, `Pending Approval`, `Pending Downstream Actions`, or has an incomplete mandatory task
- **When:** its effective date arrives
- **Then:** no employee data changes.

### transfer-execution.AC7 — Failure handling and retry
- **Given:** the employee update or an adapter call fails
- **When:** execution runs
- **Then:** the transaction rolls back (no partial update), the attempt is recorded, retries follow backoff, and after the maximum attempts the request is flagged `Execution Failed – Needs Attention` and an administrator alert is emitted.

### transfer-execution.AC8 — Administrator retry
- **Given:** a flagged request
- **When:** a Portal Administrator triggers retry
- **Then:** execution is re-attempted once under the same exactly-once guarantees; non-admins get 403.

### transfer-execution.AC9 — Missed effective date
- **Given:** a request that became ready after its effective date, or the executor was down on that date
- **When:** the executor next runs
- **Then:** it is executed immediately.

## API Contract
### transfer-execution.API01 — POST /api/v1/admin/transfer-requests/:id/retry-execution
**Success (202):**
```json
{ "requestId": "string", "status": "Scheduled|Completed|Execution Failed – Needs Attention", "attempts": 0 }
```
| Code | Condition | Body |
|---|---|---|
| 401 / 403 | unauthenticated / not Portal Administrator | standard envelope |
| 404 | not found | `NOT_FOUND` |
| 409 | request not in a retryable state | `EXECUTION_NOT_RETRYABLE` |

### transfer-execution.API02 — GET /api/v1/admin/transfer-executions?status=failed
Returns `{ "items": [{ "requestId", "referenceNumber", "attempts", "lastError", "lastAttemptAt" }] }`; 403 for non-admin.

## Architecture & Structural Scoping
### Frontend Scope (`frontend/src/`)
- Page: `frontend/src/app/admin/executions/page.tsx` (failed executions list with retry button)
- Display of `Scheduled` / `Completed` states and effective date in `frontend/src/components/transfer/StatusTimeline.tsx` (owned by `request-tracking-notifications`)

### Backend Scope (`backend/src/modules/transfer-execution/`)
- `execution.job.ts` (interval from env), `execution.service.ts`, `execution.routes.ts`, `execution.controller.ts`
- Model: `ExecutionAttempt.model.ts`; updates employee via `backend/src/modules/employees/employees.service.ts` (`applyOrganisationalChange`)
- Ports: `backend/src/shared/integrations/hr.port.ts` (+ payroll/IT/facilities ports from downstream spec)
- Consumes `transfer.downstream_complete`; emits `transfer.scheduled`, `transfer.completed`, `transfer.execution_failed`

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| transfer-execution.UT01 | AC1 | complete vs incomplete prerequisites | proceeds vs unchanged |
| transfer-execution.UT02 | AC2 | future date | Scheduled + event |
| transfer-execution.UT03 | AC3 | date reached | employee updated; Completed; audited |
| transfer-execution.UT04 | AC4 | run twice / parallel | single update, single event |
| transfer-execution.UT05 | AC5 | success | `transfer.completed` emitted |
| transfer-execution.UT06 | AC6 | each non-qualifying state | no change |
| transfer-execution.UT07 | AC7 | adapter/db failure; max attempts | rollback; backoff; flagged; alert |
| transfer-execution.UT08 | AC8 | admin vs non-admin retry | success / 403 |
| transfer-execution.UT09 | AC9 | late readiness | executed on next run |

## Non-Functional Requirements & Security
- **Performance**: executor is batch-based off the request path; indexed on `status + effectiveDate`.
- **Security & Authorization**: admin endpoints restricted; employee data changes only through the execution service; before/after values written to audit.
- **Reliability**: MongoDB transaction, conditional state transition, TTL job lock, retries with backoff, reconciliation log of attempts.
- **Error Handling**: standard envelope; errors recorded without PII in logs.

## Out of Scope
- Building real integrations with HR/Payroll/IT/Facilities systems (OQ-016)
- Salary revision and payroll calculation changes
- Reversal of completed transfers
