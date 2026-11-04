# Assumptions

Status: Pending Review (Gate 0) — accompanies `.ai-context/BRD.md`

## From the BRD (proposed, pending business confirmation)
| ID | Assumption |
|---|---|
| A-01 | The organisation already maintains employee records in an authoritative employee system. |
| A-02 | Manager and HR information can be retrieved using the employee's organisational records. |
| A-03 | Department, business unit, location and role information is maintained in an authoritative source. |
| A-04 | Each transfer request has a unique reference number. |
| A-05 | Manager and HR approval activities are independent and can be processed simultaneously. |
| A-06 | Downstream stakeholders receive tasks only after both approvals are obtained. |
| A-07 | Payroll, IT and Facilities activities are generated according to the requirements of the proposed transfer. |
| A-08 | Each mandatory downstream task has a configurable deadline. |
| A-09 | A cancelled or rejected request does not automatically update the employee's organisational details. |
| A-10 | A new request can be initiated after the previous request reaches a terminal status, subject to eligibility rules. |

## Project configuration (not from the BRD)
| ID | Assumption |
|---|---|
| A-11 | The BRD defers technology choices; the project setup fixes Next.js + Express + MongoDB/Mongoose, JWT and Docker. Confirm these satisfy BRD dependencies (portal integration, notification infrastructure). |
| A-12 | "Active" request (BR-009 / BRD-008) is interpreted as any non-terminal status; terminal statuses are Rejected, Completed, Cancelled. To be confirmed in spec design. |
