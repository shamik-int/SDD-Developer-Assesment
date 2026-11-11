# Prompt History (append-only)

## 2026-11-04 — /int-project-setup
- Initialized INT control plane, AI context, and baseline scaffolding (Next.js + Express + MongoDB/Mongoose, JWT, Docker; Modular Monolith + Microservice Ready).

## 2026-11-04 — /int-brd-ingestion
- Ingested docs/Employee Internal Transfer Business Requirements Document (BRD).pdf (v1.0) into .ai-context/BRD.md, assumptions.md, brd-change-log.md and dashboard.html. BRD status set to Pending Review; halted for Gate 0.

## 2026-11-11 — /int-pr-gate-workflow (Gate 0)
- Gate 0 BRD review: Approved by Shamik Bhattacharya. Synced pr_reviews/gate-0-brd-review.md, BRD.md, assumptions.md, dashboard.html, status.md, brd-change-log.md. OQ-001..OQ-016 carried forward to specs.

## 2026-11-11 — /int-sdd-lifecycle (spec authoring)
- Created six specs from the approved BRD: transfer-request-submission, parallel-approval, downstream-task-management, deadline-monitoring-auto-cancel, transfer-execution, request-tracking-notifications. Status set to In Peer Review; status.md updated; halted for Gate 1.

## 2026-11-11 — /int-pr-gate-workflow (Gate 1: deadline-monitoring-auto-cancel)
- Reviewer identity verified (Gate 1 roster match). Individual review of deadline-monitoring-auto-cancel: **Changes Requested** by Shamik Bhattacharya. Criteria 6 (Validations), 7 (Dependencies) and 9 (Edge Cases) rated Needs Improvement; development readiness Not Ready. Synced pr_reviews/gate-1-deadline-monitoring-auto-cancel.md, the spec, status.md, dashboard.html. 5 specs remain pending Gate 1.
- Reviewer supplied must-fix feedback (Exception escalation instead of auto-cancel, reuse of sla-lifecycle, working-calendar SLAs, UT01–UT14). Recorded in pr_reviews/gate-1-deadline-monitoring-auto-cancel.md with a baseline-conflict note: the feedback cites BRD v4, the approved baseline is v1.0, and the Critical items need a BRD change and Gate 0 re-approval first. status.md and dashboard.html synced.
