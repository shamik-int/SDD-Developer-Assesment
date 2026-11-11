# Feature Specification: Parallel Manager & HR Approval

## Feature ID
parallel-approval

## Status
In Peer Review

## Linked BRD
.ai-context/BRD.md#BRD-011 · BRD-012 · BRD-013 · BRD-014 · BRD-015 · BRD-016 (rules BR-001..BR-006, BR-016)

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Spec Review) | Shamik Bhattacharya | — | Pending | — |
| Gate 2 (Code Review) | Subhajit Mukherjee | — | Not Started | — |

## Intent & Business Goals
When a request is submitted, the reporting manager and HR receive it at the same moment and decide independently. Both approvals are mandatory: the request advances only when both approve, and a rejection by either one rejects the request immediately. Every decision is stored with the decider, timestamp and comments. Approvers see pending and processed requests assigned to them.

## Context
- Builds on: `.ai-context/specs/transfer-request-submission.spec.md` (consumes `transfer.submitted`, owns status lifecycle)
- Related: `.ai-context/specs/downstream-task-management.spec.md` (consumes `transfer.approved`), `.ai-context/specs/request-tracking-notifications.spec.md`
- Module: `backend/src/modules/approvals/`

## User Roles & Actors
- **Reporting Manager**: approves/rejects requests where they are the assigned manager.
- **HR Team member**: approves/rejects any request awaiting HR approval.
- **System**: creates both approval slots, evaluates the combined outcome.

## Assumptions & Open-Question Handling (for Gate 1 confirmation)
| ID | Statement | Relates to |
|---|---|---|
| S2-A1 | No approval deadline or auto-escalation is implemented; a request stays pending until both decide. | OQ-001, OQ-002, OQ-006 |
| S2-A2 | No delegation: only the assigned manager and users with role `HR` may decide. | OQ-011 |
| S2-A3 | The manager assigned at submission is fixed for the request; later reporting-line changes do not reassign it. | OQ-013 |
| S2-A4 | Any one HR user may record the HR decision; the first decision wins and the slot is then closed. | BRD-013 |
| S2-A5 | Rejection requires a reason; approval comment is optional. | BRD-012/013 |
| S2-A6 | When one approver rejects, the other still-pending slot is closed as `Superseded` and no further decision is accepted. | BR-006 |

## Acceptance Criteria
### parallel-approval.AC1 — Simultaneous dispatch
- **Given:** a `transfer.submitted` event
- **When:** it is processed
- **Then:** exactly one `MANAGER` and one `HR` approval slot exist for the request, both `Pending`, created in the same transaction, and `approval.awaiting` events are emitted for both.

### parallel-approval.AC2 — Approver inbox
- **Given:** an authenticated manager or HR user
- **When:** they open their approvals list
- **Then:** they see their `pending` and `processed` items separately, each with employee, proposed department/location/role, effective date and submission date; users never see other approvers' items.

### parallel-approval.AC3 — Manager approves
- **Given:** a pending manager slot and the caller is the assigned manager
- **When:** they approve
- **Then:** the slot becomes `Approved` with decider, timestamp and comment; if HR is still pending the request status becomes `Partially Approved`.

### parallel-approval.AC4 — HR approves
- **Given:** a pending HR slot and the caller has role `HR`
- **When:** they approve
- **Then:** same behaviour as AC3 for the HR slot.

### parallel-approval.AC5 — Both approved advances request
- **Given:** one slot already `Approved`
- **When:** the other approves
- **Then:** the request becomes `Approved` then `Pending Downstream Actions`, and `transfer.approved` is emitted exactly once.

### parallel-approval.AC6 — Either rejection rejects the request
- **Given:** a pending request in `Pending Approval` or `Partially Approved`
- **When:** manager or HR rejects with a reason
- **Then:** the request becomes `Rejected`, the other pending slot becomes `Superseded`, `transfer.rejected` is emitted, and no downstream task is ever created.

### parallel-approval.AC7 — Independent / concurrent decisions
- **Given:** manager and HR decide at the same time
- **When:** both requests reach the server concurrently
- **Then:** the final request status is deterministic and consistent (two approvals ⇒ Approved once; any rejection ⇒ Rejected), with no duplicate `transfer.approved` event.

### parallel-approval.AC8 — Authorisation
- **Given:** a user who is neither the assigned manager nor HR (including the requesting employee)
- **When:** they attempt a decision
- **Then:** the API returns 403 and nothing changes.

### parallel-approval.AC9 — Single, final decision
- **Given:** a slot already decided or superseded, or a request already terminal
- **When:** a decision is submitted again
- **Then:** the API returns 409 `DECISION_ALREADY_RECORDED`.

### parallel-approval.AC10 — Decision record
- **Given:** any decision
- **When:** it is stored
- **Then:** decider id/name, role, decision, comment/reason and server timestamp are persisted and written to the audit log; records are never edited or deleted.

## API Contract
### parallel-approval.API01 — GET /api/v1/approvals?state=pending|processed
**Success (200):**
```json
{ "items": [{ "requestId": "string", "referenceNumber": "string", "employee": { "id": "string", "name": "string" }, "proposed": { "department": "string", "location": "string", "role": "string" }, "effectiveDate": "YYYY-MM-DD", "approverRole": "MANAGER|HR", "decision": "Pending|Approved|Rejected|Superseded", "submittedAt": "ISO-8601" }], "page": 1, "pageSize": 20, "total": 0 }
```
| Code | Condition | Body |
|---|---|---|
| 401 / 403 | unauthenticated / caller is neither manager nor HR | `UNAUTHENTICATED` / `FORBIDDEN` |

### parallel-approval.API02 — POST /api/v1/transfer-requests/:id/approvals/decision
**Request:**
```json
{ "decision": "APPROVED|REJECTED", "comment": "string?", "rejectionReason": "string (required when REJECTED)" }
```
**Success (200):**
```json
{ "requestId": "string", "approverRole": "MANAGER|HR", "decision": "Approved|Rejected", "decidedAt": "ISO-8601", "requestStatus": "Partially Approved|Pending Downstream Actions|Rejected" }
```
| Code | Condition | Body |
|---|---|---|
| 401 / 403 | unauthenticated / not an authorised approver | `UNAUTHENTICATED` / `FORBIDDEN` |
| 404 | request not found or not visible to caller | `NOT_FOUND` |
| 409 | already decided or request terminal | `DECISION_ALREADY_RECORDED` |
| 422 | invalid decision, missing rejection reason | `VALIDATION_FAILED` |

## Architecture & Structural Scoping
### Frontend Scope (`frontend/src/`)
- Pages: `frontend/src/app/approvals/page.tsx` (pending/processed tabs), `frontend/src/app/approvals/[requestId]/page.tsx` (detail + decision form with confirm dialog)
- Components: `frontend/src/components/approvals/ApprovalList.tsx`, `DecisionForm.tsx`
- API client: `frontend/src/lib/api/approvals.ts`

### Backend Scope (`backend/src/modules/approvals/`)
- `approvals.routes.ts`, `approvals.controller.ts`, `approvals.service.ts` (decision evaluation inside a MongoDB transaction with optimistic version check on the request)
- Model: `Approval.model.ts` (unique index `requestId + approverRole`)
- Consumes `transfer.submitted`; emits `approval.awaiting`, `transfer.partially_approved`, `transfer.approved`, `transfer.rejected`

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| parallel-approval.UT01 | AC1 | handle submitted event (twice) | two slots once; two awaiting events |
| parallel-approval.UT02 | AC2 | list pending/processed as manager, HR, other | scoped lists; 403 for others |
| parallel-approval.UT03 | AC3 | manager approves | slot Approved; status Partially Approved |
| parallel-approval.UT04 | AC4 | HR approves | slot Approved; status Partially Approved |
| parallel-approval.UT05 | AC5 | second approval | Pending Downstream Actions; one `transfer.approved` |
| parallel-approval.UT06 | AC6 | reject from each side, each state | Rejected; other slot Superseded; no downstream event |
| parallel-approval.UT07 | AC7 | concurrent approve + reject; concurrent approve + approve | deterministic outcome; single event |
| parallel-approval.UT08 | AC8 | employee / unrelated manager decides | 403 |
| parallel-approval.UT09 | AC9 | repeat decision | 409 |
| parallel-approval.UT10 | AC10 | decision persisted + audited; update/delete blocked | record complete and immutable |

## Non-Functional Requirements & Security
- **Performance** (proposed): list and decision p95 ≤ 500 ms; event handling must not block the HTTP response.
- **Security & Authorization**: role + assignment checks server-side on every call; decision endpoints are idempotent-safe against replay (409); no sensitive employee data beyond the fields above.
- **Reliability**: decisions and status transition are atomic; no lost decisions; events published via outbox so `transfer.approved` is emitted exactly once.
- **Error Handling**: standard error envelope.

## Out of Scope
- Approval deadlines, reminders and escalation (OQ-001, OQ-002, OQ-006)
- Delegation and approver reassignment (OQ-011, OQ-013)
- Downstream tasks, notifications UI and request tracking views
