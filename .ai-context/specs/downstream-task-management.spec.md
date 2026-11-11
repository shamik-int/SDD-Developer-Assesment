# Feature Specification: Downstream Task Management (Payroll, IT, Facilities)

## Feature ID
downstream-task-management

## Status
In Peer Review

## Linked BRD
.ai-context/BRD.md#BRD-017 · BRD-018 · BRD-019 · BRD-020 · BRD-021 · BRD-024 (rules BR-011, BR-016)

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Spec Review) | Shamik Bhattacharya | — | Pending | — |
| Gate 2 (Code Review) | Subhajit Mukherjee | — | Not Started | — |

## Intent & Business Goals
After both approvals, the system generates downstream tasks for the Payroll, IT and Facilities teams. Each task has an owner team, a completion deadline and a status. Team members review and complete their tasks with comments. When every required task is complete, the request advances toward execution. This spec covers task generation, assignment, work and completion; deadline monitoring and auto-cancellation are in `deadline-monitoring-auto-cancel`.

## Context
- Builds on: `.ai-context/specs/parallel-approval.spec.md` (consumes `transfer.approved`)
- Related: `.ai-context/specs/deadline-monitoring-auto-cancel.spec.md`, `.ai-context/specs/transfer-execution.spec.md`
- Module: `backend/src/modules/downstream-tasks/`

## User Roles & Actors
- **Payroll / IT / Facilities team member**: sees tasks for their team, starts and completes them.
- **Portal Administrator**: maintains per-team deadline configuration.
- **System**: generates tasks, computes deadlines, detects completion of all tasks.

## Assumptions & Open-Question Handling (for Gate 1 confirmation)
| ID | Statement | Relates to |
|---|---|---|
| S3-A1 | Tasks are generated only after both approvals (no preparatory early tasks). | OQ-007, A-06 |
| S3-A2 | All three teams always receive one mandatory task each. A per-team `applicable` flag in configuration allows later narrowing without code change. | OQ-015, A-07 |
| S3-A3 | Each task has its own deadline: `dueAt = approvedAt + deadlineDays(team)`. Deadline values are configuration supplied by the business before release; the spec fixes no default number. | OQ-003, OQ-005, A-08 |
| S3-A4 | Deadline days are **calendar days** unless configuration sets `calendarType = BUSINESS`. | OQ-004 |
| S3-A5 | Any team member of the owning team may complete the task (no per-person assignment). | BRD-018..020 |
| S3-A6 | Integrations with Payroll/IT/Facilities systems sit behind adapter ports; this spec defines the manual task UI/API only and records integration outcome as task comments. | Dependencies 6–8 |

## Acceptance Criteria
### downstream-task-management.AC1 — Task generation after both approvals
- **Given:** a `transfer.approved` event
- **When:** it is processed
- **Then:** one task per applicable team (Payroll, IT, Facilities) is created with status `Pending`, `dueAt` from configuration, and `task.assigned` events are emitted.

### downstream-task-management.AC2 — Idempotent generation
- **Given:** `transfer.approved` is delivered more than once
- **When:** it is processed again
- **Then:** no duplicate tasks are created (unique index `requestId + team`).

### downstream-task-management.AC3 — No tasks for non-approved requests
- **Given:** a request that is `Rejected`, `Cancelled` or not yet fully approved
- **When:** task generation is attempted
- **Then:** no tasks are created.

### downstream-task-management.AC4 — Team task queue
- **Given:** an authenticated Payroll, IT or Facilities member
- **When:** they list tasks
- **Then:** they see only their team's tasks with request reference, employee, proposed change, effective date, status and due date, filterable by status; other teams' tasks are not accessible.

### downstream-task-management.AC5 — Review and complete a task
- **Given:** a `Pending` or `In Progress` task of the caller's team on an active request
- **When:** the member marks it `In Progress` or `Completed` with an optional comment
- **Then:** status, actor, completion timestamp and comment are stored and audited.

### downstream-task-management.AC6 — Completion rules
- **Given:** a task already `Completed`, `Cancelled`, or whose request is terminal
- **When:** a completion is attempted
- **Then:** the API returns 409 `TASK_NOT_ACTIONABLE`.

### downstream-task-management.AC7 — All tasks complete advances request
- **Given:** the last required task is completed
- **When:** the completion is saved
- **Then:** `transfer.downstream_complete` is emitted once and the request status moves to `Ready for Execution` (consumed by `transfer-execution`).

### downstream-task-management.AC8 — Deadline configuration
- **Given:** a Portal Administrator
- **When:** they set deadline days / calendar type / applicability per team
- **Then:** the values apply to tasks generated afterwards only; existing tasks keep their `dueAt`; non-admins get 403.

### downstream-task-management.AC9 — Task history
- **Given:** any task change
- **When:** it is stored
- **Then:** assignment team, status, actor, timestamps and comments are retained in an append-only history.

## API Contract
### downstream-task-management.API01 — GET /api/v1/tasks?status=&page=
**Success (200):**
```json
{ "items": [{ "id": "string", "requestId": "string", "referenceNumber": "string", "team": "PAYROLL|IT|FACILITIES", "status": "Pending|In Progress|Completed|Cancelled", "dueAt": "ISO-8601", "employeeName": "string", "proposed": { "department": "string", "location": "string", "role": "string" }, "effectiveDate": "YYYY-MM-DD" }], "page": 1, "total": 0 }
```
| Code | Condition | Body |
|---|---|---|
| 401 / 403 | unauthenticated / not a downstream team member | standard envelope |

### downstream-task-management.API02 — POST /api/v1/tasks/:id/status
**Request:**
```json
{ "status": "In Progress|Completed", "comment": "string?" }
```
**Success (200):**
```json
{ "id": "string", "status": "string", "completedAt": "ISO-8601|null", "requestStatus": "Pending Downstream Actions|Ready for Execution" }
```
| Code | Condition | Body |
|---|---|---|
| 403 | task belongs to another team | `FORBIDDEN` |
| 404 | not found | `NOT_FOUND` |
| 409 | not actionable | `TASK_NOT_ACTIONABLE` |
| 422 | invalid status/comment | `VALIDATION_FAILED` |

### downstream-task-management.API03 — GET|PUT /api/v1/admin/task-deadlines
**PUT request:**
```json
{ "PAYROLL": { "deadlineDays": 0, "calendarType": "CALENDAR|BUSINESS", "applicable": true }, "IT": {}, "FACILITIES": {} }
```
Returns 200 with stored config; 403 for non-admin; 422 for `deadlineDays` < 1.

## Architecture & Structural Scoping
### Frontend Scope (`frontend/src/`)
- Pages: `frontend/src/app/tasks/page.tsx`, `frontend/src/app/tasks/[id]/page.tsx`, `frontend/src/app/admin/task-deadlines/page.tsx`
- Components: `frontend/src/components/tasks/TaskTable.tsx`, `TaskActionPanel.tsx`
- API client: `frontend/src/lib/api/tasks.ts`

### Backend Scope (`backend/src/modules/downstream-tasks/`)
- `tasks.routes.ts`, `tasks.controller.ts`, `tasks.service.ts`, `taskDeadlineConfig.service.ts`
- Models: `DownstreamTask.model.ts` (unique `requestId + team`), `TaskDeadlineConfig.model.ts`, `TaskHistory.model.ts`
- Ports: `backend/src/shared/integrations/payroll.port.ts`, `it.port.ts`, `facilities.port.ts` (no-op adapters)
- Consumes `transfer.approved`; emits `task.assigned`, `task.completed`, `transfer.downstream_complete`

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| downstream-task-management.UT01 | AC1 | approved event | 3 tasks, correct `dueAt`, events |
| downstream-task-management.UT02 | AC2 | duplicate event | still 3 tasks |
| downstream-task-management.UT03 | AC3 | rejected/cancelled/partial request | none created |
| downstream-task-management.UT04 | AC4 | list as each team / other role | team-scoped; 403 |
| downstream-task-management.UT05 | AC5 | in-progress then complete | fields stored, audited |
| downstream-task-management.UT06 | AC6 | complete twice; complete on cancelled request | 409 |
| downstream-task-management.UT07 | AC7 | complete third task (concurrent completions) | single `downstream_complete`; Ready for Execution |
| downstream-task-management.UT08 | AC8 | admin updates config; employee tries | new tasks use new values; old unchanged; 403 |
| downstream-task-management.UT09 | AC9 | status changes | append-only history |

## Non-Functional Requirements & Security
- **Performance** (proposed): list/update p95 ≤ 500 ms.
- **Security & Authorization**: team scoping enforced server-side; admin-only configuration; audit of every change.
- **Reliability**: idempotent generation and completion; atomic task + request-status update.
- **Error Handling**: standard error envelope.

## Out of Scope
- Deadline monitoring, reminders and auto-cancellation (`deadline-monitoring-auto-cancel`)
- Real integrations with Payroll/IT/Facilities systems (adapter ports only; OQ-016)
- Salary or payroll calculation policy changes
