---
name: int-reverse-engine-workflow
description: Reverse engineer an existing, ongoing, or legacy codebase to generate authoritative .ai-context/BRD.md and .ai-context/assumptions.md baselines for Gate 0 PR review approval.
---

# INT Reverse Engineering & Codebase Discovery Skill

## Purpose

This skill governs the reverse-engineering of an **existing, ongoing, or legacy software project** into an SDD-ready baseline.

It analyzes existing source code, database structures, APIs, integrations, configurations, and tests to reconstruct `.ai-context/BRD.md` and `.ai-context/assumptions.md` while remaining 100% integrated with the existing BRD ingestion and Gate 0 review pipeline.

---

# Mandatory Execution Rules

1. **Analysis & Reconstruction Only**: Do NOT edit, refactor, or delete existing application source code (`src/`) or test suites (`tests/`).
2. **`int-project-setup` Is Protected**: Do NOT modify `int-project-setup` skill, workflow, or clean project initialization logic.
3. **Reuse Existing BRD Ingestion**: Reuses `.ai-context/BRD.md` structure, metadata, change log (`brd-change-log.md`), and Gate 0 review pipeline.
4. **Mandatory BRD Sections**: `.ai-context/BRD.md` MUST include `Objectives`, `Scope`, `Actors`, `Functional Requirements` (IDed `BRD-XXX`), `Non-Functional Requirements (NFRs)`, `Business Rules`, `Dependencies`, `Assumptions`, `Out of Scope`, `Open Questions`, and `Acceptance Criteria`.
5. **Mandatory `assumptions.md` Generation**: `.ai-context/assumptions.md` MUST be generated/updated alongside `BRD.md` to log technical, business, integration, and environmental uncertainties.
6. **Source & Evidence Classification**: Every item MUST be classified (`Confirmed Code`, `Confirmed DB`, `Inferred`, `Unknown / Human Confirmation Required`).
7. **Mandatory Reviewer Open Questions Resolution**: Assigned PM/TL reviewer MUST answer all pending open questions in `BRD.md` during Gate 0 PR review.

---

# Mandatory CodeGraph Structural Pre-Scan & BRD Correlation Protocol

For existing, ongoing, or legacy codebases:
1. **CodeGraph Pre-Scan**: Query CodeGraph SQLite (`.ai-context/codegraph.sqlite`) to inspect modules, controllers, services, repositories, models, API routes, call paths, and cross-module dependencies BEFORE drafting requirements.
2. **BRD + CodeGraph Correlation Matrix**: Compare business requirements against actual implementation evidence to classify requirements into:
   - **Implemented**: Requirement supported by code.
   - **Partially Implemented**: Partial functionality exists in code.
   - **Unimplemented**: Present in BRD but missing in code.
   - **Undocumented**: Functionality present in code but missing from BRD.
   - **Conflicting**: Implementation directly contradicts BRD text (`BRD != Code`).
3. **Traceability Annotations**: Document exact source file, function, module, API route, and implementation status for each reverse-engineered requirement.

---

# Two-Tier Scan Protocol (Minimum Token Consumption)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: Deterministic Workspace Scan (0 LLM Tokens)                    │
│ - Recursively scan ALL workspace directories using list_dir & grep     │
│ - Exclude ONLY: node_modules/, dist/, build/, coverage/, .git/, vendor │
│ - Identify artifact roles BY FILENAME & EXTENSION:                     │
│   * Routes/Controllers: *controller*, *Handler*, *router*, views.py    │
│   * Services/Logic: *service*, *provider*, *usecase*, *repository*     │
│   * Models/Schemas: *model*, *entity*, *schema*, *.sql, *Dto*          │
│   * UI Components: *.jsx, *.tsx, *.vue, *.svelte, *Component*, *Page*   │
│   * Configs: package.json, pom.xml, go.mod, Cargo.toml, requirements   │
│ - Produce compact JSON Repository Inventory Summary                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 2: Targeted LLM Semantic Extraction (~3,000 LLM Tokens)           │
│ - LLM analyzes Tier 1 Inventory + primary entry points                 │
│ - Synthesizes functional requirements & mandatory BRD sections          │
│ - Populates BRD.md & assumptions.md                                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

# Standardized Output Files

### 1. `.ai-context/BRD.md`
Contains authoritative system requirements extracted from actual implementation with mandatory `Dependencies`, `NFRs`, `Out of Scope`, and `Assumptions` sections.

### 2. `.ai-context/assumptions.md`
Contains technical, business, integration, and deployment uncertainties requiring human confirmation.

### 3. `.ai-context/decisions/brd-change-log.md`
Contains baseline version history and change impact log.

---

# Gate 0 Review & Handoff

1. Upon completion of BRD and assumptions generation, set status to `Pending Review`.
2. **MANDATORY DASHBOARD GENERATION**: Generate or update **`.ai-context/dashboard.html`** BEFORE requesting Gate 0 approval so the reviewer can visually inspect project governance metrics, open questions, reviewer email configuration, and baseline health.
3. Present `.ai-context/BRD.md`, `.ai-context/assumptions.md`, and `.ai-context/dashboard.html` for Gate 0 PR Review.
4. Reviewer conducts Gate 0 review using `.ai-context/pr_reviews/BRD-<timestamp>.md`, answers all open questions, and grants approval.
5. Spec generation (`.spec.md`) is **STRICTLY BLOCKED** until Gate 0 approval is granted.
