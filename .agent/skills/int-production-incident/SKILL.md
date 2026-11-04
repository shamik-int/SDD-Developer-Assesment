---
name: int-production-incident
description: Record, classify, triage, and manage production incidents from client, support, monitoring, or internal sources, then route the incident to the correct SDD path without automatically creating a Hotfix.
---

# INT Production Incident Protocol

1. Record production incident report in `.ai-context/incidents/INC-YYYY-NNN.md`.
2. Classify root cause:
   - Spec Gap ➔ Route to `.ai-context/specs/` (Update Spec & Plan)
   - Implementation Defect ➔ Route to `.ai-context/specs/hotfix-<slug>.spec.md`
   - New Requirement ➔ Route to `.ai-context/BRD.md` (BRD Ingestion)
3. Execute fix and verify via Gate 2 post-hoc review.
