---
name: int-incident-management
description: Manage production incident reporting, triage, classification (Spec Gap vs Defect vs New Requirement), incident artifact logging under .ai-context/incidents/, and resolution tracking.
---

# INT Production Incident Management & Triage

## Purpose
This skill defines the process for receiving, triaging, classifying, and tracking production incidents according to the INT SDD Blueprint V1.0. 

Production incidents are distinct project entities and MUST be maintained separately from normal feature specs and hotfixes.

---

# Incident Context Structure

Production incidents belong under:
```text
.ai-context/incidents/INC-YYYY-NNN.md
```

Every production incident MUST receive a unique, system-generated Incident ID:
`INC-YYYY-NNN` (e.g. `INC-2026-001`). Do not ask the user to manually invent Incident IDs.

---

# Incident Information Collection

When a client, support team, monitoring system, or internal team reports a production issue, collect or confirm:

1. **Source** (e.g. Client Email, Sentry Alert, User Ticket)
2. **Incident Title**
3. **Incident Description**
4. **Environment** (e.g. Production, Staging, Production-EU)
5. **Affected Application / Module**
6. **Expected Behaviour**
7. **Actual Behaviour**
8. **Business Impact** (e.g. High / Medium / Low / Critical)
9. **Severity** (e.g. Sev-1, Sev-2, Sev-3)
10. **Incident Type**:
    - Production Defect
    - Production Outage
    - Performance Issue
    - Security Incident
    - Data Issue
    - Integration Issue
    - Infrastructure Issue
    - Configuration Issue
    - Other
11. **Evidence / Logs / Stack Traces**, when available.

---

# Incident Classification & Workflow Routing

Every incident MUST be classified into one of three primary root cause categories:

```text
                       Production Incident (INC-YYYY-NNN)
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
 1. Spec Gap                 2. Implementation Defect        3. Genuine New Requirement
     │                                 │                                 │
     ▼                                 ▼                                 ▼
Hotfix Spec / Bug-Fix Spec    Lightweight Bug-Fix Spec           BRD Entry & Change Log
     │                                 │                                 │
     ▼                                 ▼                                 ▼
Update Original Spec          Keep Original Spec Intact           Gate 1 → New Spec
```

## 1. Spec Gap
The application performed as designed, but the Spec contained an ambiguity, omission, or flaw.
- Route to: Hotfix Spec or Bug-Fix Spec (`.ai-context/specs/hotfix-<slug>.spec.md`).
- Action: Update the original feature Spec after fix completion.

## 2. Implementation Defect
The Spec was correct, but the implementation violated the Spec's Acceptance Criteria.
- Route to: Lightweight Bug-Fix Spec.
- Action: Original Spec remains unchanged unless broader technical learning requires an update.
- *ADR Trigger*: If the same incident class occurs three times, trigger an ADR (instantiated from `.ai-context/templates/adr.template.md`) to update `architecture.md` or `constitution.md`.

## 3. Genuine New Requirement
The issue report requests new business functionality not covered by the existing BRD baseline.
- Route to: `int-brd-ingestion` workflow.
- Action: Create a new BRD entry, record in `brd-change-log.md`, pass Gate 1 review, and launch the normal SDD feature lifecycle. Do NOT treat as an emergency hotfix.

---

# Incident Closure Criteria

An Incident MUST NOT be marked Closed in `.ai-context/incidents/INC-YYYY-NNN.md` until:
- The production issue is resolved or formally accepted as resolved.
- Associated Hotfix (`HOTFIX-<incident-slug>`), if any, has completed its required release process.
- Root cause is documented (or explicitly recorded as unknown).
- Related Hotfix ID is recorded in the Incident file.
- Release version (e.g. `v1.4.2`) is recorded.
- `.ai-context/status.md` daily log is updated the same day.
