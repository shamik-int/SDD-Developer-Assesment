---
name: int-hotfix-management
description: Manage emergency hotfix workflows for production incidents, maintain HOTFIX-<incident-slug> artifacts, author compressed hotfix specs, execute test-first fixes, and enforce post-hoc Gate 2 reviews.
---

# INT Emergency Hotfix Management

## Purpose
This skill defines the hotfix execution workflow for urgent production failures. Hotfixes utilize a compressed SDD lifecycle to enable rapid response while maintaining strict test discipline, bidirectional traceability, and mandatory post-hoc Gate 2 reviews.

Hotfixes MUST NOT bypass Gate 2 code reviews under any circumstances.

---

# Prerequisites & Identifier Conventions

The `int-hotfix-management` workflow MUST consume an existing Incident (`INC-YYYY-NNN`) created by `int-incident-management`.

```text
Incident (INC-YYYY-NNN)
       ↓
Incident classified as requiring a Hotfix
       ↓
Generate Hotfix ID: HOTFIX-<incident-slug>
```

Every hotfix receives:
- **Hotfix ID**: `HOTFIX-<incident-slug>` (e.g. `HOTFIX-auth-token-leak`)
- **Hotfix Branch**: `hotfix/<incident-slug>`
- **Operational Hotfix Record**: `.ai-context/hotfixes/HOTFIX-<incident-slug>.md`
- **Authoritative Hotfix Spec**: `.ai-context/specs/hotfix-<incident-slug>.spec.md`

*Bidirectional Traceability Rule*: The Hotfix record MUST reference the Incident ID (`INC-YYYY-NNN`), and the Incident record MUST reference the Hotfix ID (`HOTFIX-<incident-slug>`).

---

# Hotfix Lifecycle Flow

```text
Incident (INC-YYYY-NNN)
       ↓
HOTFIX-<incident-slug> Initialized
       ↓
Author Lightweight Hotfix Spec (.ai-context/specs/hotfix-<slug>.spec.md)
       ↓
Root Cause Identification
       ↓
Write Failing Test (RED)
       ↓
Guided Fix Implementation (GREEN)
       ↓
Test Suite Validation
       ↓
Gate 2 — Post-Hoc Code Review
       ↓
CodeGraph Synchronization (Incremental Sync)
       ↓
Retro-Documentation & Status Update
       ↓
Release Integration (vX.Y.Z)
       ↓
Close Incident
```

---

# Lightweight Hotfix Spec Structure

Create the hotfix spec under:
`.ai-context/specs/hotfix-<incident-slug>.spec.md` (instantiated from `.ai-context/templates/hotfix-spec.template.md`)

The hotfix spec MUST contain:
1. **Incident ID**: `INC-YYYY-NNN`
2. **Hotfix ID**: `HOTFIX-<incident-slug>`
3. **Incident Summary**: Brief description of the production failure
4. **Root Cause**: Diagnostic root cause
5. **Correct Behaviour**: Desired operational outcome
6. **Acceptance Criteria**: Testable `Given / When / Then` criteria (`<slug>.AC1`)
7. **Related Original Spec**: Path to original feature spec (if applicable)
8. **Fix Summary**: Technical fix approach

---

# Operational Hotfix Record (`.ai-context/hotfixes/`)

Create `.ai-context/hotfixes/HOTFIX-<incident-slug>.md` directly as a flat file (do NOT create subdirectories):
- Incident ID & Hotfix ID
- Target Environment & Priority
- Assigned Developer & Reviewer
- Test Evidence (Confirmation of initial RED test failure, then GREEN pass)
- Gate 2 Post-Hoc Review Status
- Retro-documentation checklist
- Associated Release Tag (`vX.Y.Z`)

---

# Critical Hotfix Rules

1. **Gate 2 Enforcement**: Hotfixes use a compressed lifecycle, but Gate 2 code review remains MANDATORY. If deployed urgently to restore service, Gate 2 review must be completed post-hoc within the Blueprint-defined review window.
2. **No Silent BRD Changes**: Hotfixes MUST NOT silently alter business requirements or scope. If the hotfix uncovers a new requirement, route it to `int-brd-ingestion` for formal BRD change log processing.
3. **Test-First Discipline**: Always write a failing test reproducing the production incident before committing the code fix.
