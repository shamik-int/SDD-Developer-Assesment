---
name: int-reverse-engine-workflow
description: Reverse engineer an existing, ongoing, or legacy codebase to generate authoritative .ai-context/BRD.md and .ai-context/assumptions.md baselines for Gate 0 PR review approval.
---

# INT Reverse Engineering Workflow

## 1. Purpose

This workflow is responsible for analyzing an **existing, ongoing, or legacy project across all workspace directories** (without restricting to specific folder names like `src/` or `controllers/`) and reverse-engineering its current implementation into an SDD-ready baseline.

It MUST:

- Recursively scan **ALL existing folders and subdirectories** in the workspace root (excluding build/dependency dirs like `node_modules/`, `dist/`, `.git/`, `vendor/`, `target/`, etc.).
- Dynamically identify code artifact roles, APIs, controllers, services, database models, schemas, UI components, and configs **based on file names, extensions, signatures, and patterns** across the entire repository tree.
- Extract functional requirements, non-functional constraints, user roles, business rules, dependencies, and open questions.
- Perform Source & Evidence Classification (`Confirmed Code`, `Confirmed DB`, `Inferred`, `Unknown / Human Confirmation Required`).
- Generate or update `.ai-context/BRD.md` with all mandatory sections (`Objectives`, `Scope`, `Actors`, `Functional Requirements`, `NFRs`, `Business Rules`, `Dependencies`, `Assumptions`, `Out of Scope`, `Open Questions`, `Acceptance Criteria`).
- Generate or update `.ai-context/assumptions.md` with technical, business, integration, and environmental uncertainties.
- **Generate or update `.ai-context/dashboard.html` BEFORE presenting for Gate 0 PR review approval** (rendering visual SDD status dashboard, Gate 0 status, module breakdown, open questions count, reviewer roster, and metric counts).
- Hand over to existing BRD Ingestion (`int-brd-ingestion`) and log changes in `.ai-context/decisions/brd-change-log.md`.
- Trigger **Gate 0 BRD PR Review** requiring the assigned reviewer to answer all pending open questions before approval.
- Stop before business architecture modifications or feature code implementation.

> [!CRITICAL]
> **Strict Non-Destructive Boundary**:
> - This workflow NEVER modifies, deletes, or refactors existing application code, test code, or database schema files in any folder.
> - This workflow NEVER modifies `int-project-setup` or alters clean project initialization logic.
> - Reused BRD generation and ingestion mechanisms remain the standard processing pipeline.

---

# 2. Prerequisites & Trigger Condition

Use this workflow when:

- Bringing an existing, ongoing, or legacy codebase into the INT SDD ecosystem.
- `BRD.md` or `assumptions.md` is missing, incomplete, or outdated relative to actual implementation.
- Executed via slash command `/int-reverse-engine-workflow` or context menu.

---

# 3. Two-Tier Minimum-Token Scan Protocol

To minimize token usage and prevent context window exhaustion on large repositories:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: Programmatic Deterministic Workspace Scan (0 LLM Tokens)       │
│ - Recursively scan ALL workspace folders (list_dir, grep_search)       │
│ - Excludes ONLY: node_modules/, dist/, build/, coverage/, .git/,       │
│   vendor/, bin/, obj/, target/, *.min.*, binaries, lockfiles           │
│ - Identifies artifacts BY FILENAME & EXTENSION:                        │
│   * Controllers/Routes: *controller*, *Handler*, *router*, views.py    │
│   * Services/Logic: *service*, *provider*, *usecase*, *repository*     │
│   * Models/Schemas: *model*, *entity*, *schema*, *.sql, *Dto*          │
│   * UI Components: *.jsx, *.tsx, *.vue, *.svelte, *Component*, *Page*   │
│   * Configs: package.json, pom.xml, go.mod, Cargo.toml, requirements   │
│ - Generates compact Repository Inventory Summary                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 2: Targeted LLM Semantic Extraction (~3,000 LLM Tokens)           │
│ - Receives ONLY Tier 1 Summary + primary entry points                  │
│ - Extracts business intent, business rules, actors, and workflows       │
│ - Populates mandatory BRD.md & assumptions.md sections                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

# 4. Source & Evidence Classification Matrix

Every extracted requirement and assumption MUST be classified by evidence source:

| Classification | Definition & Evidence Criteria | Target Artifact |
|---|---|---|
| **Confirmed from Code** | Directly verified in active code files (controllers, routes, services) anywhere in workspace. | `.ai-context/BRD.md` |
| **Confirmed from Database** | Directly verified in active migrations, SQL DDL, or ORM model files. | `.ai-context/BRD.md` |
| **Confirmed from APIs/Tests** | Verified via OpenAPI contracts or passing automated test files. | `.ai-context/BRD.md` |
| **Inferred from Implementation** | Derived from multi-source code patterns or naming conventions. | `.ai-context/BRD.md` (Flagged) |
| **Unknown / Human Confirmation Required** | Ambiguous, unconfirmed, or hardcoded parameters requiring human decision. | `.ai-context/assumptions.md` |

---

# 5. Reverse Engineering Execution Flow

```text
Workspace Root (ALL Folders & Sub-directories)
       │
       ▼
CodeGraph SQLite AST Pre-Scan (.ai-context/codegraph.sqlite)
       │
       ▼
TIER 1: Deterministic Scan & Filename Pattern Identifier (0 LLM Tokens)
       │
       ▼
TIER 2: Evidence Classifier & BRD + CodeGraph Correlation Analysis
       │
       ▼
Generate / Update .ai-context/BRD.md & .ai-context/assumptions.md
       │
       ▼
Generate / Update .ai-context/dashboard.html (MANDATORY BEFORE GATE 0)
       │
       ▼
Handover to Existing BRD Ingestion (int-brd-ingestion)
       │
       ▼
Gate 0 BRD PR Review (Reviewer Answers Open Questions)
       │
       ▼
SDD-Ready Baseline Approved
```

### Step-by-Step Execution:

1. **Workspace-Wide Inventory Scan**:
   - Recursively inspect ALL existing workspace folders (`list_dir`, `grep_search`). Do NOT restrict to specific folder names.
   - Filter out ONLY non-source build/dependency directories (`node_modules/`, `dist/`, `build/`, `.git/`, `vendor/`, `target/`, `bin/`, `obj/`, lockfiles, binaries).
   - Identify artifact purpose by **Filename, Extension, and Pattern Signature**:
     - **Routes & Controllers**: Files matching `*controller*`, `*Handler*`, `*router*`, `views.py`, `@Controller`, `@RestController`, `route.ts`, `web.php`.
     - **Services & Logic**: Files matching `*service*`, `*provider*`, `*usecase*`, `*repository*`, `*dao*`, `*Helper*`.
     - **Database Models & Schemas**: Files matching `*model*`, `*entity*`, `*schema*`, `*.sql`, `*Dto*`, `models.py`, `structs`.
     - **UI Screens & Components**: Files matching `*.jsx`, `*.tsx`, `*.vue`, `*.svelte`, `*Component*`, `*Page*`, `*View*`, `*Screen*`.
     - **Environment & Build Configs**: `package.json`, `pom.xml`, `go.mod`, `Cargo.toml`, `requirements.txt`, `composer.json`, `build.gradle`, `.env*`, `application.yml`, `settings.py`, `Program.cs`.

2. **Semantic Requirements Synthesis**:
   - Map routes and controller endpoints across all discovered folders to candidate business domains and functional requirement IDs (`BRD-001`, `BRD-002`).
   - Extract measurable Non-Functional Requirements (NFRs) from configs and system setup.
   - Extract mandatory Dependencies (databases, external APIs, cloud services).
   - Extract mandatory Out-of-Scope boundaries based on missing or un-implemented capabilities.

3. **Baseline File & Dashboard Generation**:
   - Write `.ai-context/BRD.md` with all 11 mandatory sections.
   - Write `.ai-context/assumptions.md` recording technical/business uncertainties and unconfirmed items.
   - Log baseline entry in `.ai-context/decisions/brd-change-log.md`.
   - **MANDATORY DASHBOARD GENERATION**: Generate or update **`.ai-context/dashboard.html`** BEFORE requesting Gate 0 approval so the reviewer can visually inspect project governance metrics, open questions, reviewer email configuration, and baseline health.

4. **Gate 0 BRD PR Review Handoff**:
   - Set BRD status to `Pending Review` in `status.md` and `dashboard.html`.
   - Present `.ai-context/BRD.md`, `.ai-context/assumptions.md`, and `.ai-context/dashboard.html` for Gate 0 PR review.
   - The assigned PM/TL reviewer MUST review and provide explicit answers to all pending items listed under `Open Questions` during review.
   - Reviewer answers are recorded in `.ai-context/pr_reviews/BRD-<timestamp>.md` and updated into `.ai-context/BRD.md` before approval.
   - **HALT & END TURN** waiting for explicit Gate 0 PR review approval.

---

# 6. Compatibility & Consolidation Rules

- **Integration Target**: Consolidates exclusively with existing BRD Generation / Ingestion (`int-brd-ingestion` and `int-project-from-brd`).
- **No Parallel System**: Reuses existing BRD structure, naming conventions, metadata, and Gate 0 review pipeline.
- **Unrelated Workflows**: Spec Generation, Plan, Tasks, Test Cases, Release Management, and `int-project-resume` remain 100% separate and unmodified.

---

# 7. Stop Conditions

STOP after completing baseline generation and presenting for Gate 0 PR Review.

Do NOT:

- Modify existing application code (`src/`).
- Modify existing test suites (`tests/`).
- Draft feature specs (`.spec.md`).
- Generate plans (`.plan.md`) or tasks (`.tasks.md`).
- Approve Gate 0 automatically.
