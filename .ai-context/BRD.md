# Business Requirements Document — Employee Internal Transfer Digital Journey

- **Source Document:** docs/Employee Internal Transfer Business Requirements Document (BRD).pdf
- **Source Version:** 1.0 (Initial Business Baseline)
- **Parent Platform:** One-Point Employee Portal
- **Organisation:** INT (Indus Net Technologies)
- **Status:** Approved (Gate 0 — 2026-11-11, Shamik Bhattacharya)
- **Baseline Date:** 2026-11-04

## 1. Objective / Business Objectives
Provide a centralised digital workflow within the One-Point Employee Portal for internal transfers: employees initiate and track requests; manager and HR approve in parallel (both mandatory); Payroll, IT and Facilities receive downstream tasks; overdue mandatory tasks auto-cancel the request; approved transfers become effective automatically on the effective date.

1. Single digital interface for initiating internal transfer requests.
2. Reduce manual coordination between employees, managers, HR and operational teams.
3. Structured, standardised transfer approval process.
4. Parallel approval processing by manager and HR.
5. Automate downstream activities for Payroll, IT and Facilities.
6. Real-time visibility into request status and pending stakeholder actions.
7. Deadline-based monitoring of downstream activities.
8. Automatic cancellation when mandatory downstream activities exceed deadlines.
9. Automatic execution of approved transfers on their effective dates.
10. Auditable history of requests, approvals and stakeholder actions.

## 2. Scope
### In Scope
- **Employee:** access the module via the portal; initiate a request; select proposed department/business unit, location and role/job position; specify effective date; optional reason; submit; view request details; track status; view pending actions and responsible stakeholders; receive notifications.
- **Manager:** receive submitted requests; review details; approve/reject with comments or rejection reason; view pending and processed requests.
- **HR:** receive requests simultaneously with the manager; validate eligibility; approve/reject with comments or reason; view pending and processed requests.
- **Payroll / IT / Facilities:** receive relevant tasks, complete required work (payroll changes; access provisioning/removal; workplace arrangements), update task status.
- **System:** coordinate parallel approvals; maintain consolidated status; generate downstream tasks; monitor task deadlines; auto-cancel on overdue mandatory tasks; auto-execute transfers on effective date; maintain request and approval history; notify stakeholders.

## 3. Actors & Stakeholder Roles
| Stakeholder | Responsibility |
|---|---|
| Employee | Initiates and tracks transfer requests |
| Reporting Manager | Reviews and approves/rejects requests |
| HR Team | Validates eligibility and approves/rejects requests |
| Payroll Team | Completes required payroll activities |
| IT Team | Completes access-related activities |
| Facilities Team | Handles workplace/location requirements |
| Portal Administrator | Oversees portal configuration and operational monitoring |
| Management | Provides business oversight |

## 4. Business Journey
1. **Request Initiation:** employee selects Internal Transfer Request, enters proposed department/business unit, location, role, effective date, optional reason, submits; system validates and creates the request.
2. **Parallel Approval:** system sends the request to manager and HR simultaneously; each decides independently; both approvals mandatory; either rejection rejects the request.
3. **Downstream Activities:** after both approvals, tasks are generated for Payroll, IT and Facilities; system tracks completion and deadline per task.
4. **Deadline Monitoring:** all mandatory tasks done within deadline → proceed; any mandatory task overdue → request auto-cancelled and stakeholders notified.
5. **Transfer Execution:** when approvals and downstream tasks are complete the request becomes eligible; system waits for the effective date; on that date organisational information is updated, relevant systems receive updates, request is marked completed, employee is notified.

## 5. Functional Requirements
### Employee Request Management
- **BRD-001 (FR-001):** The system shall allow an authenticated employee to initiate an internal transfer request.
- **BRD-002 (FR-002):** The system shall allow employees to select a proposed department/business unit from available options.
- **BRD-003 (FR-003):** The system shall allow employees to select a proposed transfer location.
- **BRD-004 (FR-004):** The system shall allow employees to select a proposed role/job position.
- **BRD-005 (FR-005):** The system shall allow employees to provide a proposed effective date that is not in the past.
- **BRD-006 (FR-006):** The system shall provide an optional reason field.
- **BRD-007 (FR-007):** The system shall validate and submit the transfer request.
- **BRD-008 (FR-008):** The system shall prevent an employee from having more than one active transfer request.
- **BRD-009 (FR-009):** The system shall not allow employees to modify submitted requests.
- **BRD-010 (FR-010):** The system shall not allow employees to cancel submitted requests.

### Approval Management
- **BRD-011 (FR-011):** The system shall send submitted requests to the reporting manager and HR simultaneously.
- **BRD-012 (FR-012):** The system shall allow managers to approve or reject requests.
- **BRD-013 (FR-013):** The system shall allow HR to approve or reject requests.
- **BRD-014 (FR-014):** The system shall require both manager and HR approvals before proceeding.
- **BRD-015 (FR-015):** The system shall reject the request when either mandatory approver rejects it.
- **BRD-016 (FR-016):** The system shall maintain approval decisions, timestamps and comments.

### Downstream Activity Management
- **BRD-017 (FR-017):** The system shall generate applicable downstream tasks after both approvals are obtained.
- **BRD-018 (FR-018):** The system shall enable Payroll stakeholders to review and complete assigned tasks.
- **BRD-019 (FR-019):** The system shall enable IT stakeholders to review and complete assigned tasks.
- **BRD-020 (FR-020):** The system shall enable Facilities stakeholders to review and complete assigned tasks.
- **BRD-021 (FR-021):** Each mandatory downstream task shall have a defined completion deadline.
- **BRD-022 (FR-022):** The system shall monitor downstream task completion against configured deadlines.
- **BRD-023 (FR-023):** The system shall automatically cancel the request when a mandatory downstream task exceeds its completion deadline.
- **BRD-024 (FR-024):** The system shall maintain task assignment, status, completion timestamps and relevant comments.

### Transfer Execution
- **BRD-025 (FR-025):** The system shall verify that both mandatory approvals and all required downstream tasks are complete.
- **BRD-026 (FR-026):** The system shall execute the transfer on the approved effective date.
- **BRD-027 (FR-027):** The system shall update relevant employee organisational information.
- **BRD-028 (FR-028):** The system shall notify the employee after successful transfer execution.

### Tracking and Notifications
- **BRD-029 (FR-029):** The system shall provide employees with a consolidated view of their transfer requests.
- **BRD-030 (FR-030):** The system shall display pending actions and responsible stakeholders.
- **BRD-031 (FR-031):** The system shall notify relevant users when important request status changes occur.
- **BRD-032 (FR-032):** The system shall notify the employee and relevant stakeholders when a request is automatically cancelled.

> BRD-0NN IDs map 1:1 to the source FR-0NN IDs.

## 6. Non-Functional Requirements (NFRs)
Source expectations are non-measurable; measurable targets are deferred to specification design / constitution.
- **Security:** only authenticated employees can initiate requests; users access only role-permitted requests and actions; approval actions restricted to authorised managers and HR; sensitive employee information protected.
- **Reliability:** requests and approval decisions must not be lost; duplicate task execution prevented; automatic cancellation and transfer execution must be reliable.
- **Auditability:** all important request activities recorded; approval decisions include responsible user and timestamp; history available to authorised users.
- **Performance:** responsive request submission and status retrieval; workflow processing must not unnecessarily block portal operations.
- **Usability:** employees can understand transfer status; pending stakeholder actions clearly identifiable; approval interfaces simple and consistent.

## 7. Business Rules
| Rule ID | Business Rule |
|---|---|
| BR-001 | Every internal transfer request must receive manager approval. |
| BR-002 | A manager has the authority to approve or reject a transfer request. |
| BR-003 | Every transfer request must receive HR approval. |
| BR-004 | Manager and HR receive the request simultaneously. |
| BR-005 | Both manager and HR approvals are mandatory. |
| BR-006 | If either manager or HR rejects the request, the transfer request is rejected. |
| BR-007 | Employees cannot cancel submitted transfer requests. |
| BR-008 | Employees cannot modify submitted transfer requests. |
| BR-009 | An employee cannot have multiple active internal transfer requests simultaneously. |
| BR-010 | Effective dates cannot be in the past. |
| BR-011 | Payroll, IT and Facilities must complete their applicable downstream activities within their configured deadlines. |
| BR-012 | Failure to complete a mandatory downstream task within its deadline results in automatic request cancellation. |
| BR-013 | A transfer becomes effective automatically on its approved effective date after all mandatory approvals and downstream activities are completed. |
| BR-014 | Employees must be able to view their request status. |
| BR-015 | Employees must be able to identify pending stakeholder actions. |
| BR-016 | The system must maintain a record of approval and stakeholder actions. |

### Request Status Lifecycle (proposed; final model to be confirmed during spec design)
Draft · Submitted · Pending Approval · Partially Approved · Rejected · Approved · Pending Downstream Actions · Ready for Execution · Scheduled · Completed · Cancelled.
Note: the distinction between Ready for Execution and Scheduled depends on the effective date.

### Notification Events
| Event | Recipient |
|---|---|
| Transfer request submitted | Employee, Manager, HR |
| Request awaiting approval | Manager, HR |
| Manager approval completed | Employee, HR |
| HR approval completed | Employee, Manager |
| Request rejected | Employee and relevant stakeholders |
| Downstream task assigned | Relevant stakeholder |
| Downstream task completed | Employee and relevant stakeholders, as appropriate |
| Task approaching deadline | Responsible stakeholder |
| Request automatically cancelled | Employee and relevant stakeholders |
| Transfer scheduled | Employee and relevant stakeholders |
| Transfer completed | Employee and relevant stakeholders |

Notification channels (email, portal, other) require confirmation.

## 8. Dependencies
1. Access to the existing One-Point Employee Portal.
2. Employee master data and organisational hierarchy.
3. Manager and HR user information.
4. Department, business unit, role and location master data.
5. Availability of HR system integration.
6. Availability of Payroll integration.
7. Availability of IT access-management integration.
8. Availability of Facilities integration.
9. Authentication and role-based authorisation.
10. Notification infrastructure.
11. Business-approved deadline configurations.
12. Business approval of the final workflow and exception-handling rules.

## 9. Assumptions
See `.ai-context/assumptions.md` (A-01 to A-10, plus project-configuration assumptions).

## 10. Out of Scope
- External recruitment and hiring.
- Resignation and employee termination.
- Employee promotion workflows independent of transfers.
- Salary revision and compensation approval workflows.
- International relocation and immigration processing.
- Complete replacement of existing HR, Payroll, IT or Facilities systems.
- Development of a new employee portal.
- Manual modification of submitted transfer requests.
- Employee cancellation of submitted requests.
- Changes to existing payroll calculation policies.
- Automated employee performance evaluation.

## 11. Open Questions
| ID | Open Question | Why It Matters |
|---|---|---|
| OQ-001 | What is the exact deadline for manager approval? | Approval escalation and workflow handling |
| OQ-002 | What is the exact deadline for HR approval? | How long a request can remain pending |
| OQ-003 | What are the deadlines for Payroll, IT and Facilities? | Required for automatic cancellation |
| OQ-004 | Are deadlines measured in calendar days or business days? | Deadline calculation |
| OQ-005 | Does each stakeholder have an independent deadline or does the entire downstream stage have one? | Timeout behaviour |
| OQ-006 | What happens if a manager or HR does not respond within their deadline? | Approval timeout behaviour undefined |
| OQ-007 | Does downstream work begin only after both approvals, or can some preparatory tasks begin earlier? | Task-generation sequence |
| OQ-008 | If one downstream task becomes overdue, should all other outstanding tasks be cancelled immediately? | Cancellation behaviour |
| OQ-009 | Can an authorised administrator reopen an automatically cancelled request? | Exception handling |
| OQ-010 | What happens if the effective date arrives but a downstream integration fails? | Execution failure handling |
| OQ-011 | Can a manager or HR approver delegate their approval responsibility? | Approval delegation |
| OQ-012 | Can a request be submitted for a future effective date several months in advance? | Effective-date validation |
| OQ-013 | What happens if the employee's reporting manager changes while approval is pending? | Approver reassignment |
| OQ-014 | What is the process for handling changes to the proposed transfer after submission? | Correction handling undefined |
| OQ-015 | Should all three downstream teams always receive tasks, or only relevant teams? | Task applicability |
| OQ-016 | Which system is the source of truth for the final employee organisational information? | Integration responsibility |

## 12. Acceptance Criteria (Success Criteria)
1. Employees can submit internal transfer requests through one portal.
2. All mandatory transfer details are captured and validated.
3. Manager and HR receive requests simultaneously.
4. Both approvals are mandatory before downstream processing.
5. Rejected requests do not proceed to downstream execution.
6. Employees cannot modify or cancel submitted requests.
7. Employees cannot submit multiple active transfer requests.
8. Payroll, IT and Facilities can manage their assigned tasks.
9. Downstream deadlines are monitored.
10. Overdue mandatory downstream activities trigger automatic cancellation.
11. Employees can view request status and pending stakeholder actions.
12. Transfers are automatically executed on their approved effective dates once all prerequisites are satisfied.
13. All important workflow actions are auditable.

## 13. Risks
| Risk | Business Impact | Proposed Mitigation |
|---|---|---|
| Manager or HR delays | Request remains pending | Define approval deadlines and escalation rules |
| Downstream task delays | Transfer cancellation | Configure deadlines and reminders |
| Integration failure | Incomplete organisational updates | Retry and recovery mechanisms |
| Incorrect employee information | Incorrect transfer processing | Validate against authoritative employee records |
| Duplicate requests | Conflicting transfer workflows | Enforce one-active-request rule |
| Inconsistent stakeholder status | Employee confusion | Centralised status tracking |
| Transfer execution failure | Employee data inconsistency | Transaction control and reconciliation |
| Unauthorised approval | Security and compliance risk | Role-based access and audit trail |

## 14. Technical Decisions Deferred to Technical Plan
Workflow orchestration, deadline monitoring / scheduled jobs, notification delivery, HR/Payroll/IT/Facilities integration, retry and recovery, audit logging, authorisation mechanism, and hosting. (Project configuration already fixes: Next.js + Express + MongoDB/Mongoose, JWT, Docker.)
