# Feature Specification: Request Tracking, Pending Actions & Notifications

## Feature ID
request-tracking-notifications

## Status
In Peer Review

## Linked BRD
.ai-context/BRD.md#BRD-029 · BRD-030 · BRD-031 · BRD-032 (rules BR-014, BR-015, BR-016; Notification Events table; Auditability NFR)

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Spec Review) | Shamik Bhattacharya | — | Pending | — |
| Gate 2 (Code Review) | Subhajit Mukherjee | — | Not Started | — |

## Intent & Business Goals
Employees get a consolidated view of their transfer requests with current status, a timeline of what has happened, and which stakeholders still have pending actions. All relevant users are notified of the 11 notification events defined in the BRD, including automatic cancellation. Authorised users can read the audit history of a request.

## Context
- Builds on: events emitted by `transfer-request-submission`, `parallel-approval`, `downstream-task-management`, `deadline-monitoring-auto-cancel`, `transfer-execution`
- Module: `backend/src/modules/tracking/` and `backend/src/modules/notifications/`

## User Roles & Actors
- **Employee**: views own requests, pending actions, notifications.
- **Manager / HR / Payroll / IT / Facilities**: receive notifications; view requests relevant to them.
- **Portal Administrator / Management**: read-only oversight and audit history.

## Assumptions & Open-Question Handling (for Gate 1 confirmation)
| ID | Statement | Relates to |
|---|---|---|
| S6-A1 | Notification channel for v1 is **in-portal** (stored notifications + unread badge). Email is delivered through a `notification.port` adapter that is a no-op until the channel is confirmed. | BRD "channels require confirmation", Dependency 10 |
| S6-A2 | "Pending actions" are derived from live state: pending approver slots and non-completed tasks, each with responsible role/team and due date. | BRD-030 |
| S6-A3 | Notification recipients follow the BRD table; "relevant stakeholders" = manager, HR and the downstream teams on the request. | BRD-031 |
| S6-A4 | Notification creation is asynchronous, de-duplicated by `eventId + recipientId`, and never blocks the originating workflow. | NFR Performance |

## Acceptance Criteria
### request-tracking-notifications.AC1 — Consolidated request list
- **Given:** an authenticated employee
- **When:** they open "My Transfer Requests"
- **Then:** they see all their requests (newest first) with reference, proposed change, effective date, current status and last-updated time; they cannot see others' requests.

### request-tracking-notifications.AC2 — Request detail and timeline
- **Given:** a request the caller may view
- **When:** they open it
- **Then:** they see the submitted details, manager and HR decisions (with decider, time, comments), downstream tasks (team, status, due date), and a chronological timeline of status changes.

### request-tracking-notifications.AC3 — Pending actions and responsible stakeholders
- **Given:** a request that is not terminal
- **When:** it is viewed
- **Then:** `pendingActions[]` lists each outstanding item (manager approval, HR approval, Payroll/IT/Facilities task) with responsible person/role/team and due date; it is empty for terminal requests.

### request-tracking-notifications.AC4 — Status accuracy
- **Given:** any workflow event
- **When:** the event is processed
- **Then:** the displayed status equals the stored status and uses the shared lifecycle names (Pending Approval, Partially Approved, Rejected, Pending Downstream Actions, Ready for Execution, Scheduled, Completed, Cancelled).

### request-tracking-notifications.AC5 — Notification events
- **Given:** each BRD notification event (submitted; awaiting approval; manager approved; HR approved; rejected; task assigned; task completed; task approaching deadline; auto-cancelled; scheduled; completed)
- **When:** the event occurs
- **Then:** an in-portal notification is created for exactly the BRD-specified recipients with the reference number, event type and a link to the request.

### request-tracking-notifications.AC6 — Auto-cancellation notice
- **Given:** `transfer.auto_cancelled`
- **When:** it is processed
- **Then:** the employee and relevant stakeholders are notified including the overdue task team and the reason.

### request-tracking-notifications.AC7 — Notification inbox
- **Given:** an authenticated user
- **When:** they open notifications
- **Then:** they see only their notifications, newest first, with unread count; they can mark one or all as read.

### request-tracking-notifications.AC8 — De-duplication and resilience
- **Given:** an event is delivered twice or the email adapter fails
- **When:** it is processed
- **Then:** only one in-portal notification per recipient exists, and adapter failure is logged and retried without affecting the workflow.

### request-tracking-notifications.AC9 — Audit history access
- **Given:** an authorised user (request owner, assigned approvers, relevant teams, administrator, management)
- **When:** they request history
- **Then:** they receive the append-only audit entries (actor, action, from/to status, timestamp); other users get 403.

## API Contract
### request-tracking-notifications.API01 — GET /api/v1/transfer-requests?page=
Returns the caller's requests: `{ "items": [{ "id", "referenceNumber", "status", "proposed": {}, "effectiveDate", "updatedAt" }], "page", "total" }`. 401 when unauthenticated.

### request-tracking-notifications.API02 — GET /api/v1/transfer-requests/:id
**Success (200):**
```json
{ "id": "string", "referenceNumber": "string", "status": "string", "details": {}, "approvals": [{ "role": "MANAGER|HR", "decision": "string", "decidedBy": "string|null", "decidedAt": "ISO-8601|null", "comment": "string|null" }], "tasks": [{ "team": "string", "status": "string", "dueAt": "ISO-8601", "completedAt": "ISO-8601|null" }], "pendingActions": [{ "type": "APPROVAL|TASK", "responsible": "string", "dueAt": "ISO-8601|null" }], "timeline": [{ "at": "ISO-8601", "event": "string", "status": "string" }], "cancellation": { "reason": "string", "team": "string" } }
```
| Code | Condition | Body |
|---|---|---|
| 401 / 403 / 404 | unauthenticated / not permitted / not found | standard envelope |

### request-tracking-notifications.API03 — GET /api/v1/transfer-requests/:id/history
Returns `{ "entries": [{ "at", "actor", "action", "fromStatus", "toStatus" }] }`; 403 for unauthorised users.

### request-tracking-notifications.API04 — GET /api/v1/notifications?unread=
Returns `{ "items": [{ "id", "type", "requestId", "referenceNumber", "message", "read", "createdAt" }], "unreadCount": 0 }`.

### request-tracking-notifications.API05 — POST /api/v1/notifications/:id/read · POST /api/v1/notifications/read-all
Return 204; 404 when the notification is not the caller's.

## Architecture & Structural Scoping
### Frontend Scope (`frontend/src/`)
- Pages: `frontend/src/app/transfers/page.tsx`, `frontend/src/app/transfers/[id]/page.tsx`
- Components: `frontend/src/components/transfer/StatusTimeline.tsx`, `PendingActionsPanel.tsx`, `frontend/src/components/notifications/NotificationBell.tsx`, `NotificationList.tsx`
- API clients: `frontend/src/lib/api/transferRequests.ts`, `frontend/src/lib/api/notifications.ts`

### Backend Scope
- `backend/src/modules/tracking/` — `tracking.routes.ts`, `tracking.service.ts` (read model assembling approvals, tasks, pending actions via module services)
- `backend/src/modules/notifications/` — `notifications.routes.ts`, `notifications.service.ts` (event subscriber, recipient resolution table), `Notification.model.ts` (unique `eventId + recipientId`)
- Shared: `backend/src/shared/audit/AuditLog.model.ts`, `backend/src/shared/integrations/notification.port.ts`

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| request-tracking-notifications.UT01 | AC1 | list as owner / other user | only own requests |
| request-tracking-notifications.UT02 | AC2 | detail with approvals, tasks | full detail + timeline order |
| request-tracking-notifications.UT03 | AC3 | active vs terminal request | pending list vs empty |
| request-tracking-notifications.UT04 | AC4 | each lifecycle event | status matches store/labels |
| request-tracking-notifications.UT05 | AC5 | each of 11 events | correct recipient set |
| request-tracking-notifications.UT06 | AC6 | auto-cancel event | notices to employee + stakeholders with reason |
| request-tracking-notifications.UT07 | AC7 | inbox, mark read, read-all | scoped; counts update |
| request-tracking-notifications.UT08 | AC8 | duplicate event; adapter error | one notification; workflow unaffected |
| request-tracking-notifications.UT09 | AC9 | history as authorised vs other | entries vs 403 |

## Non-Functional Requirements & Security
- **Performance** (proposed): list/detail p95 ≤ 500 ms; notification fan-out asynchronous.
- **Security & Authorization**: visibility enforced server-side per role and assignment; only role-permitted fields returned; no sensitive data in notification text.
- **Reliability**: de-duplicated, retryable notification delivery; audit log append-only.
- **Usability**: status names and pending-action labels consistent across employee, approver and team views.

## Out of Scope
- Choosing/implementing email, SMS or push infrastructure (S6-A1)
- Management analytics dashboards
- Workflow actions themselves (submission, approvals, tasks, execution)
