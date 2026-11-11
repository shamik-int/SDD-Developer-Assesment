# Gate 1 PR Review: deadline-monitoring-auto-cancel — Deadline Monitoring & Automatic Cancellation

## Review Metadata
- **Project Name:** SDD-Developer-Assessment
- **Spec ID:** deadline-monitoring-auto-cancel
- **Spec Name:** Deadline Monitoring & Automatic Cancellation
- **Developer:** Vijit Singh / vijit.singh@intglobal.com
- **Assigned Reviewer:** Shamik Bhattacharya
- **Reviewer Name:** Shamik Bhattacharya
- **Reviewer Email/User ID:** shamik.bhattacharya@intglobal.com
- **Review Status:** Changes Requested
- **Review Date/Time:** 2026-11-11 17:04:24

## Review Criteria Evaluation
1. **Requirement Completeness:** Passed
2. **Requirement Understanding:** Passed
3. **Functional Scope:** Passed
4. **Technical Approach/Design:** Passed
5. **Business Rules:** Passed
6. **Validations:** Needs Improvement
7. **Dependencies:** Needs Improvement
8. **Assumptions:** Passed
9. **Edge Cases:** Needs Improvement
10. **Acceptance Criteria:** Passed
11. **Development Readiness:** Not Ready

## Review Summary & Feedback
- **Review Description:** The spec covers BRD-021, BRD-022, BRD-023 and BRD-032 and business rules BR-011 and BR-012. OQ-008 and OQ-009 are resolved as explicit assumptions (S4-A2, S4-A3). The design is sound: a scheduled job, a TTL lock, conditional updates and access to other modules only through their services. Each of the 9 acceptance criteria maps 1:1 to a unit test. Three areas must be tightened before planning starts.
- **Review Comments:**
  1. **Validations (API01):** Specify the default and maximum for `limit` on `GET /api/v1/admin/deadline-monitor/runs`, add a `400` response for an invalid `limit`, and state the sort order of runs (e.g. `startedAt` descending).
  2. **Dependencies (AC3):** The once-only reminder needs a persisted marker, e.g. `reminderSentAt` on `DownstreamTask`. That model belongs to `downstream-task-management`, so define the field and its update method (through that module's service) in both specs. Alternatively, record that the reminder is deduplicated by a separate store owned by this module.
  3. **Edge Cases:**
     - (a) Define "mandatory task". State whether every generated task for an applicable team is mandatory, or whether tasks can be optional and so excluded from auto-cancel.
     - (b) Define behaviour for a task that is already overdue when the monitor first sees it (e.g. after monitor downtime): does it cancel immediately without a reminder? Add an AC and a unit test for it.
     - (c) Specify the auto-cancel audit entry: actor `SYSTEM`, reason `AUTO_CANCEL_OVERDUE_TASK`, overdue task id/team, previous status, timestamp.
  4. **Minor:** In AC7, replace "distributed lock / conditional update" with the chosen mechanism (the `JobLock` TTL lock plus a conditional status update) so that the test UT07 is deterministic.
- **Resubmission:** Update `.ai-context/specs/deadline-monitoring-auto-cancel.spec.md` (and `downstream-task-management.spec.md` for item 2), then resubmit for Gate 1. Planning, tasks, test cases and code for this spec stay blocked until it is approved.

## Reviewer Must-Fix Feedback (2026-11-11, Shamik Bhattacharya)
The reviewer supplied the following must-fix feedback. It is summarised here. Development is **On Hold – Pending Specification Correction**.

| # | Priority | Feedback | Baseline status |
|---|---|---|---|
| 1 | Critical | Replace automatic cancellation with escalation: at SLA + 3 working days set the request to `EXCEPTION` (reason `FINAL_ESCALATION`), notify HR Operations Head and stakeholders, and let HR resolve it through the authorised workflow. Remove `AUTO_CANCEL_OVERDUE_TASK`, the automatic `Cancelled` transition, the cancelling of sibling tasks and the `transfer.auto_cancelled` event. | **Blocked: BRD change required.** Contradicts BRD v1.0 BRD-023 / BR-012. |
| 2 | Critical | Reuse the existing `sla-lifecycle` JOB01 orchestration; no parallel scheduler or SLA engine. | **Blocked: dependency not found.** No `sla-lifecycle` spec exists in `.ai-context/specs/`. |
| 3 | Critical | Calculate `dueAt` from the stakeholder SLA configuration and a working calendar (09:00–17:00 IST, Mon–Fri, excluding holidays, 8 h = 1 working day). Store the SLA instance start, deadline and a configuration snapshot. Reassignment supersedes the SLA instance. No silent recalculation. No generic 24 h reminder. | **Partly blocked.** OQ-004 (calendar vs business days) is still open in BRD v1.0. Snapshotting and no-silent-recalculation can be applied now. |
| 4 | Critical | Reminders and escalations per stakeholder: Payroll and IT have a 1 working-day SLA with a reminder after 4 h; Facilities has a 2 working-day SLA with a reminder after 1 day. L1 at breach, L2 at SLA + 2 days, daily reminders after breach, final action at SLA + 3 days. All values from Admin Configuration; each threshold fires once. | **Blocked: BRD change required.** The SLA table is not in BRD v1.0 (OQ-003 is open). |
| 5 | Critical | Use request statuses `PROCESSING`, `PARTIALLY_COMPLETED`, `EXCEPTION`, `COMPLETED`, `CANCELLATION_PENDING`, `CANCELLED`. Exclude Completed and Not Required tasks. Follow the Failed-task rules. Never touch Completed or Cancellation Pending requests. | **Blocked: BRD change required.** BRD v1.0 §Statuses defines `Pending Downstream Actions` and not these statuses. |
| 6 | Critical | Concurrency: request-level transaction and lock; atomic task and request changes; conditional DB updates against stale state; lock ownership, expiry and stale-worker protection; no duplicate reminders, escalations or transitions; transactional outbox for events. | **Actionable now.** |
| 7 | High | Frontend: keep the overdue and due-soon badges; show the overdue task, team, deadline and escalation status; show the `EXCEPTION` status and the next HR action; no auto-cancel notice; don't remove permitted actions; reuse the notification catalogue; a notification failure must not roll back the transition. | Badge and notification-isolation items are actionable now. The Exception UI depends on item 1. |
| 8 | High | API01: keep it only if no equivalent exists; Portal Administrator only; validate `limit` with a default and maximum; return checked, reminder, escalation, Exception and error counts plus duration; log request IDs without PII; per-request failure isolation; no endpoint that changes workflow state. | **Actionable now.** The escalation and Exception counts depend on item 1. |
| 9 | Critical | Replace UT01–UT09 with UT01–UT14 (working-calendar deadline, per-stakeholder reminder, L1, L2, Exception at SLA + 3, completion race, two schedulers, reassignment, batch failure, notification failure after commit, Cancellation Pending untouched). | Tests UT01, 03, 08, 09, 10, 12 and 13 are actionable now. The rest depend on items 1–5. |
| 10 | Mandatory | Rename the spec to `deadline-monitoring-exception-escalation`; remove the auto-cancel assumptions, reason code and event; replace AC4; align statuses; reuse `sla-lifecycle`; align events with the `notifications` spec; correct the OQ-008, OQ-009 and A-10 references; update the API and frontend scope; give every AC BRD and dependency traceability. | 10.8: A-10 **is** defined (`.ai-context/assumptions.md`, A-10). 10.1–10.6 are blocked by the BRD change. 10.7 and 10.10 are actionable. |

## Baseline Conflict & Required Path
The feedback cites **BRD v4** and the modules `sla-lifecycle`, `admin-config`, `notifications`, `downstream-tasks` and `cancellation`. The approved baseline in this repository is **BRD v1.0** (Gate 0 approved 2026-11-11), and it explicitly mandates automatic cancellation (BRD-023, BR-012). Under the governance rules, a spec cannot contradict the approved BRD. To adopt the Exception-escalation model:
1. Add the BRD v4 source document to `docs/` and run `/int-brd-ingestion` to record the change in `.ai-context/brd-change-log.md`. Changing BRD-023, BR-012, the status model and the SLA table is a material change.
2. Re-approve the updated BRD at Gate 0.
3. Revise this spec, renamed `deadline-monitoring-exception-escalation`. Also review the dependent specs that the same change affects: `downstream-task-management`, `transfer-execution` and `request-tracking-notifications`.
4. Resubmit for Gate 1. Gate 1 approval will be considered only after all Critical and High items are incorporated.
