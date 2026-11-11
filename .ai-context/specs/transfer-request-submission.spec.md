# Feature Specification: Transfer Request Submission

## Feature ID
transfer-request-submission

## Status
In Peer Review

## Linked BRD
.ai-context/BRD.md#BRD-001 · BRD-002 · BRD-003 · BRD-004 · BRD-005 · BRD-006 · BRD-007 · BRD-008 · BRD-009 · BRD-010 (rules BR-007, BR-008, BR-009, BR-010)

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Spec Review) | Shamik Bhattacharya | — | Pending | — |
| Gate 2 (Code Review) | Subhajit Mukherjee | — | Not Started | — |

## Intent & Business Goals
An authenticated employee initiates an internal transfer request from the One-Point Employee Portal by choosing a proposed department/business unit, location and role, a non-past effective date and an optional reason. The system validates and persists the request as an immutable submission with a unique reference number, enforces a single active request per employee, and hands the request to the approval stage. Once submitted, the request can be neither modified nor cancelled by the employee.

This spec owns the `TransferRequest` aggregate and the **request status lifecycle** used by all other transfer specs:
`Pending Approval → Partially Approved → Approved → Pending Downstream Actions → Ready for Execution / Scheduled → Completed`, with terminal states `Rejected`, `Cancelled`, `Completed`. (`Draft`/`Submitted` are transient: the request is created already submitted — see assumption S1-A1.)

## Context
- Builds on: `.ai-context/architecture.md` (Module Boundaries), `.ai-context/assumptions.md` (A-01..A-04, A-10, A-12)
- Related: `.ai-context/specs/parallel-approval.spec.md`, `.ai-context/specs/request-tracking-notifications.spec.md`
- Module: `backend/src/modules/transfer-requests/`

## User Roles & Actors
- **Employee**: initiates a request; may not modify or cancel it after submission.
- **System**: validates, assigns reference number, derives manager/HR approvers, enforces one-active-request rule.

## Assumptions & Open-Question Handling (for Gate 1 confirmation)
| ID | Statement | Relates to |
|---|---|---|
| S1-A1 | Submission is a single atomic step; there is no persisted Draft. The request is stored as `Pending Approval` on success. | BRD-007 |
| S1-A2 | "Active" = any non-terminal status (terminal: `Rejected`, `Cancelled`, `Completed`). | A-12, BR-009 |
| S1-A3 | No upper bound on how far ahead the effective date may be unless configured via `TRANSFER_MAX_ADVANCE_DAYS` (unset by default). | OQ-012 |
| S1-A4 | Corrections after submission are out of scope; an employee must wait for a terminal status and file a new request. | OQ-014 |
| S1-A5 | Department/BU, location and role options come from reference collections (`departments`, `locations`, `roles`) populated from the authoritative master data. | A-03 |
| S1-A6 | The reporting manager is resolved from the employee's record at submission time and stored on the request; HR approvers are resolved by role `HR`. | A-02 |

## Acceptance Criteria
### transfer-request-submission.AC1 — Authenticated access only
- **Given:** a caller without a valid JWT
- **When:** it calls any transfer-request endpoint
- **Then:** the API returns 401 and the frontend redirects to the portal login.

### transfer-request-submission.AC2 — Selectable proposed values
- **Given:** an authenticated employee opens the new-request form
- **When:** the form loads
- **Then:** active departments/business units, locations and roles are listed for selection and the effective-date and optional reason fields are shown.

### transfer-request-submission.AC3 — Successful submission
- **Given:** an employee with no active request, a valid department, location and role, and an effective date of today or later
- **When:** the employee submits
- **Then:** a request is created with a unique reference (`TR-YYYY-NNNNNN`), status `Pending Approval`, the resolved manager and HR approval slots, the submission timestamp and an audit entry, and a `transfer.submitted` event is emitted.

### transfer-request-submission.AC4 — Mandatory field validation
- **Given:** a payload missing department, location, role or effective date, or containing an unknown/inactive option id
- **When:** the employee submits
- **Then:** the API returns 422 with per-field errors and no request is created.

### transfer-request-submission.AC5 — Past effective date rejected
- **Given:** an effective date earlier than today (server date)
- **When:** the employee submits
- **Then:** the API returns 422 on `effectiveDate` and the form shows the error inline.

### transfer-request-submission.AC6 — One active request per employee
- **Given:** the employee already has a request in a non-terminal status
- **When:** the employee submits another
- **Then:** the API returns 409 `ACTIVE_REQUEST_EXISTS` and creates nothing, including under concurrent submissions (enforced by a unique partial index, not just a read check).

### transfer-request-submission.AC7 — New request after terminal status
- **Given:** the employee's previous request is `Rejected`, `Cancelled` or `Completed`
- **When:** the employee submits a new request
- **Then:** it is accepted.

### transfer-request-submission.AC8 — Submitted requests are immutable
- **Given:** a submitted request
- **When:** the employee calls `PUT`/`PATCH`/`DELETE` on it
- **Then:** the API returns 405 `REQUEST_IMMUTABLE`, the stored request is unchanged, and the UI offers no edit or cancel control.

### transfer-request-submission.AC9 — Missing approver
- **Given:** the employee has no reporting manager on record, or no active HR approver exists
- **When:** the employee submits
- **Then:** the API returns 422 `APPROVER_UNRESOLVED` and creates nothing.

### transfer-request-submission.AC10 — Optional reason
- **Given:** a reason up to 1000 characters or no reason
- **When:** the employee submits
- **Then:** both are accepted; longer reasons return 422.

## API Contract
### transfer-request-submission.API01 — GET /api/v1/transfer-options
**Success (200):**
```json
{ "departments": [{ "id": "string", "name": "string", "businessUnit": "string" }], "locations": [{ "id": "string", "name": "string" }], "roles": [{ "id": "string", "title": "string" }] }
```
| Code | Condition | Body |
|---|---|---|
| 401 | missing/invalid JWT | `{ "error": { "code": "UNAUTHENTICATED", "message": "string" } }` |

### transfer-request-submission.API02 — POST /api/v1/transfer-requests
**Request:**
```json
{ "departmentId": "string", "locationId": "string", "roleId": "string", "effectiveDate": "YYYY-MM-DD", "reason": "string?" }
```
**Success (201):**
```json
{ "id": "string", "referenceNumber": "TR-2026-000001", "status": "Pending Approval", "effectiveDate": "YYYY-MM-DD", "submittedAt": "ISO-8601" }
```
| Code | Condition | Body |
|---|---|---|
| 401 | unauthenticated | `UNAUTHENTICATED` |
| 403 | caller is not an employee user | `FORBIDDEN` |
| 409 | active request exists | `ACTIVE_REQUEST_EXISTS` |
| 422 | validation / unresolved approver | `{ "error": { "code": "VALIDATION_FAILED \| APPROVER_UNRESOLVED", "fields": { "<field>": "string" } } }` |

### transfer-request-submission.API03 — PUT|PATCH|DELETE /api/v1/transfer-requests/:id
Always returns 405 `{ "error": { "code": "REQUEST_IMMUTABLE" } }` (401 when unauthenticated).

## Architecture & Structural Scoping
### Frontend Scope (`frontend/src/`)
- Page: `frontend/src/app/transfers/new/page.tsx` (Bootstrap form, inline validation, success redirect to request detail)
- Component: `frontend/src/components/transfer/TransferRequestForm.tsx`
- API client: `frontend/src/lib/api/transferRequests.ts`

### Backend Scope (`backend/src/modules/transfer-requests/`)
- Routes/controller: `transferRequests.routes.ts`, `transferRequests.controller.ts`; options: `transferOptions.controller.ts`
- Service: `transferRequests.service.ts` (validation, approver resolution, reference generation, event emit)
- Models: `TransferRequest.model.ts` (unique partial index on `employeeId` where `status` ∉ terminal), `Counter.model.ts` for reference numbers; reference collections `Department`, `Location`, `Role`
- Shared: `backend/src/shared/auth/jwt.middleware.ts`, `backend/src/shared/events/eventBus.ts`, `backend/src/shared/audit/audit.service.ts`

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| transfer-request-submission.UT01 | AC1 | call POST without JWT | 401 |
| transfer-request-submission.UT02 | AC2 | options endpoint + form render | all three lists and fields present |
| transfer-request-submission.UT03 | AC3 | valid submit | 201, reference format, `Pending Approval`, event + audit emitted |
| transfer-request-submission.UT04 | AC4 | missing fields / bad ids | 422 field errors, nothing stored |
| transfer-request-submission.UT05 | AC5 | yesterday's date vs today's date | 422 vs accepted |
| transfer-request-submission.UT06 | AC6 | second submit; two parallel submits | 409; exactly one persisted |
| transfer-request-submission.UT07 | AC7 | submit after Rejected/Cancelled/Completed | 201 |
| transfer-request-submission.UT08 | AC8 | PUT/PATCH/DELETE; UI has no edit/cancel | 405; record unchanged |
| transfer-request-submission.UT09 | AC9 | no manager / no HR user | 422 `APPROVER_UNRESOLVED` |
| transfer-request-submission.UT10 | AC10 | 1000 vs 1001 char reason; none | accepted / 422 / accepted |

## Non-Functional Requirements & Security
- **Performance** (proposed; constitution values pending): submit and options p95 ≤ 500 ms; submission must not block on notification delivery.
- **Security & Authorization**: JWT required; employee identity taken from token, never from payload; input sanitised and schema-validated; no PII in logs.
- **Reliability**: persistence of request, approval slots and audit entry in one MongoDB transaction; no lost submissions.
- **Error Handling**: uniform `{ "error": { "code", "message", "fields?" } }` envelope.

## Out of Scope
- Modification, correction or cancellation of submitted requests (BRD-009, BRD-010, OQ-014)
- Draft saving, salary/compensation changes, international relocation
- Approval handling (`parallel-approval`), status display and notifications (`request-tracking-notifications`)
