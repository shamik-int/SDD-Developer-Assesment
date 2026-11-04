---
name: int-project-setup
description: Initialize a new software project using the exact INT AI-First standard Control Plane, project-specific AI context, technology-aware execution structure, and foundational repository baseline.
---
# INT AI-First Project Setup

## Purpose

Initialize a new software project according to the INT AI-First development architecture.

This skill is responsible for project initialization and baseline setup only. Do not implement business functionality or create business modules during initial setup unless explicitly requested.

The INT Control Plane is an organizational standard and MUST remain unchanged.

---

# MANDATORY STEP 1 — Existing Codebase Detection, User Confirmation Halt & Technology Discovery Gate

Before prompting or creating any artifacts, the agent **MUST FIRST INSPECT THE WORKSPACE** to determine whether the project is a **Brand New Empty Project** or an **Existing / Legacy Project Codebase**.

> [!CRITICAL]
> **SAFE OPERATION & USER CONFIRMATION HALT PROTOCOL**:
> 1. **Zero-Harm Codebase Guarantee**: Under NO circumstances will `int-project-setup` modify, delete, overwrite, re-structure, or harm any existing source code files, codebase folders, or ongoing project architectures. Existing codebase files are 100% preserved and untouched.
> 2. **Inspect Workspace Disk First**: Check if the workspace already contains source code or build configuration files (`package.json`, `pom.xml`, `requirements.txt`, `go.mod`, `Cargo.toml`, `src/`, `models/`, `controllers/`, `routes/`, etc.).
> 3. **IF AN EXISTING CODEBASE IS DETECTED — MANDATORY USER HALT**:
>    - The agent MUST **HALT** and present an explicit confirmation prompt to the user:
>      > **Existing Codebase Detected**: "An existing codebase was found in this directory. No existing codebase files or folders will be altered or harmed. Please select how you would like to populate `.ai-context/architecture.md` and `.ai-context/project_context.md`:"
>      > - **Option 1 (Recommended)**: *Auto-Detect from Codebase* — Automatically inspect existing files/folders to populate `project_context.md` and `architecture.md` without asking redundant tech stack questions.
>      > - **Option 2**: *Manual Stack Entry* — Answer interactive discovery questions to manually define or verify technology stack & architecture parameters.
> 4. **Execution Based on User Choice**:
>    - **If Option 1 is chosen**: Programmatically extract language, framework, database, ORM, and architecture pattern from codebase files; write auto-extracted values to `.ai-context/project_context.md` and `.ai-context/architecture.md`. Prompt ONLY for missing Gate 0/1/2 reviewer emails if empty.
>    - **If Option 2 is chosen**: Ask standard interactive discovery questions (Project type, architecture, stack, DB, ORM, reviewers) and write confirmed answers to `.ai-context/project_context.md` and `.ai-context/architecture.md`.
>    - **In BOTH options**: Bypass CLI scaffolding (`create-vite`, `@nestjs/cli`, etc.) completely so existing codebase folders are never modified or re-scaffolded.
> 5. **IF THE WORKSPACE IS BRAND NEW & EMPTY**:
>    - Execute standard interactive discovery: prompt user to confirm Project Type, Architecture Style, Technology Stack, Database, ORM, Deployment Target, and Reviewer Roster before executing automated CLI scaffolding in Step 2.

### Stack Parameters for Discovery (Clean Projects or Option 2 Manual Entry):
1. **Project Name & Type**: Full Stack, Frontend Only, Backend Only, or Mobile.
2. **Architecture Style**: Monolithic vs Modular Monolith vs Microservices vs Clean Architecture vs Feature-Sliced Architecture.
3. **Frontend Technology & Styling**: (e.g., React / Vite + Vanilla CSS or Tailwind).
4. **Backend Technology & Framework**: (e.g., Node.js Express / NestJS / Python FastAPI / Go).
5. **Database & ORM Layer**: (e.g., PostgreSQL + Sequelize / Prisma / Mongoose / TypeORM).
6. **Authentication & Security Strategy**: (e.g., JWT / OAuth2).
7. **Deployment Target**: (e.g., Docker / AWS / Vercel).
8. **Gate 0 Reviewer(s)**: Business Analyst / Project Manager / Product Owner names & emails (BRD Review).
9. **Gate 1 Reviewer(s)**: Project Manager / Tech Lead / Product Owner names & emails (Spec Review).
10. **Gate 2 Reviewer(s)**: Technical Lead / Architect / Senior Developer names & emails (Code Review).


---

# MANDATORY STEP 2 — Automated CLI-Driven Scaffolding & Dynamic Architecture Sync Protocol

Once all technology and architecture parameters are confirmed in Step 1, the agent MUST automatically generate the project directory structure on disk using official framework command-line interface (CLI) tools.

> [!CRITICAL]
> **AUTOMATED CLI SCAFFOLDING & ZERO STATIC TEMPLATES**:
> 1. The system carries **ZERO pre-defined or hardcoded static folder structures**. Static templates for `src/` and `tests/` are completely removed.
> 2. **NO MANUAL CONFIRMATION PROMPT**: The agent does NOT pause to ask for folder structure approval. Scaffolding is automatically executed via CMD / terminal using the official framework CLI generator matching the project setup plan.
> 3. **DYNAMIC ARCHITECTURE DOCUMENTATION**: `.ai-context/architecture.md` and `.ai-context/project_context.md` MUST NEVER contain hardcoded static paths. They MUST be populated dynamically with the actual directory tree scanned from disk after CLI execution.

## Step-by-Step CLI Scaffolding Execution Protocol:

1. **Map Selected Stack to Official Framework CLI Generator**:
   - **React (Vite)**: `npx -y create-vite@latest ./ --template react-ts`
   - **Next.js**: `npx -y create-next-app@latest ./ --typescript --app`
   - **NestJS**: `npx -y @nestjs/cli new ./ --package-manager npm`
   - **Java Spring Boot**: `curl -s https://start.spring.io/starter.tgz -d dependencies=web,jpa,postgresql | tar -xzv`
   - **Python Django / FastAPI**: `django-admin startproject myapp ./` or `poetry new ./`
   - **C# .NET**: `dotnet new webapi -o ./`
   - **Go**: `go mod init <module_name>`
   - **Rust**: `cargo new ./ --bin`
   - **PHP Laravel**: `composer create-project laravel/laravel ./`
   - **Mobile (Flutter / React Native)**: `flutter create ./` or `npx react-native@latest init myapp`

2. **Automated Terminal Execution**:
   - Execute the mapped CLI command automatically via terminal (CMD) in non-interactive mode.
   - Scaffold official configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, `pom.xml`, `go.mod`, etc.) and entry point files on disk.

3. **Disk Inspection & Dynamic Architecture Documentation**:
   - Scan disk (`list_dir`) to inspect the exact generated directory tree.
   - Immediately update **`.ai-context/architecture.md`** and **`.ai-context/project_context.md`** with the scanned actual folder hierarchy, module boundaries, and entry point file locations created by the CLI.





# CRITICAL RULE — INT CONTROL PLANE (.agent/ CONTROL DIRECTORY) & NATIVE OS DIRECT COPY PROTOCOL

The following directory is the authoritative source for the INT Control Plane:
`skills/int-project-setup/resources/INT-Control-Plane/.agent/`

> [!CRITICAL]
> **HIGH-SPEED NATIVE OS BULK COPYING MANDATE**:
> To minimize project setup execution time (< 2 seconds) and eliminate LLM token wastage (~35,000 tokens saved), the agent MUST execute bulk direct file copying via native OS terminal commands (`run_command` via PowerShell `Copy-Item`). The agent MUST NEVER recreate control plane rules, templates, or skills by generating text line-by-line via LLM tool calls.

## Native OS Bulk Copying Script:

```powershell
# 1. Create ALL Mandatory Directories (Control Plane, Knowledge Base, Docs, Tests & Claude Bridge)
New-Item -ItemType Directory -Force -Path ".agent", ".ai-context\templates", "docs", "tests\frontend", "tests\backend", ".claude" | Out-Null
New-Item -ItemType File -Force -Path "docs\.gitkeep", "tests\frontend\.gitkeep", "tests\backend\.gitkeep" | Out-Null

# 2. Bulk Copy Control Plane Rules, Workflows & Claude Bridge
Copy-Item -Recurse -Force "$env:USERPROFILE\.gemini\config\skills\int-project-setup\resources\INT-Control-Plane\.agent\*" ".agent\"
if (Test-Path "$env:USERPROFILE\.gemini\config\skills\int-project-setup\resources\INT-Control-Plane\.claude") {
    Copy-Item -Recurse -Force "$env:USERPROFILE\.gemini\config\skills\int-project-setup\resources\INT-Control-Plane\.claude\*" ".claude\"
}
if (Test-Path "$env:USERPROFILE\.gemini\config\skills\int-project-setup\resources\INT-Control-Plane\CLAUDE.md") {
    Copy-Item -Force "$env:USERPROFILE\.gemini\config\skills\int-project-setup\resources\INT-Control-Plane\CLAUDE.md" "CLAUDE.md"
}

# 3. Bulk Copy Knowledge Base Engineering Templates
if (Test-Path "$env:USERPROFILE\.gemini\config\templates") {
    Copy-Item -Recurse -Force "$env:USERPROFILE\.gemini\config\templates\*" ".ai-context\templates\"
}

# 4. Create docs/README.md

Set-Content "docs\README.md" "# Client Documentation & BRD Ingestion Directory (`docs/`)`n`nPlace all client Business Requirements Documents (BRDs), specifications, or requirements files here, then run `/int-brd-ingestion`." -Force

# 4. Exclude master admin workflow
if (Test-Path ".agent\workflows\int-sync-global-skills.md") { Remove-Item ".agent\workflows\int-sync-global-skills.md" -Force }
if (Test-Path ".claude\commands\int-sync-global-skills.md") { Remove-Item ".claude\commands\int-sync-global-skills.md" -Force }

# 5. Bulk Copy Local Project Skills (STRICT RULE: Copy ONLY skill directory and SKILL.md file)
Get-ChildItem "$env:USERPROFILE\.gemini\config\skills\" -Directory | ForEach-Object {
    $targetDir = ".agent\skills\$($_.Name)"
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    if (Test-Path "$($_.FullName)\SKILL.md") {
        Copy-Item "$($_.FullName)\SKILL.md" -Destination $targetDir -Force
    }
}
```

## Dynamic Copying Protocol & Constraints:

- **Dynamic Rule Synchronization**: All rule files present inside `skills/int-project-setup/resources/INT-Control-Plane/.agent/rules/` are dynamically copied to `.agent/rules/`.
- **Dynamic Workflow Synchronization**: All project workflow files present inside `skills/int-project-setup/resources/INT-Control-Plane/.agent/workflows/` are dynamically copied to `.agent/workflows/`.
- **Master Admin Workflow Exclusion (`int-sync-global-skills.md`)**: The master global sync workflow `int-sync-global-skills.md` is strictly restricted to master global administration. It MUST NEVER be shipped, copied, or exposed inside user project repositories under `.agent/workflows/`.
- **Strict Skill Exclusion Rule**: When copying skills into `.agent/skills/`, the system copies **ONLY the skill directory and its `SKILL.md` file**, strictly excluding nested subdirectories (such as `resources/` or `image/`). This ensures control plane template folders are never duplicated inside project repositories!

## Rules for Copying:

- DO NOT recreate these files from memory.
- DO NOT summarize these files.
- DO NOT rewrite these files line-by-line.
- DO NOT modify these files.
- DO NOT rename these files.
- DO NOT add additional files inside the INT Control Plane unless explicitly requested.

Do NOT create `.agent/README.md` unless explicitly requested.
The copied INT Control Plane files are authoritative and must remain content-equivalent to the approved source files.

---

# MANDATORY PROJECT VENDOR-AGNOSTIC GOVERNANCE & LOCAL SKILLS (`AGENTS.md` & `.agent/skills/`)

To ensure the project repository is completely self-contained and vendor-agnostic (independent of any specific AI tool or provider such as Gemini, Claude, Cursor, Windsurf, or Copilot):

1. **Auto-Generate `AGENTS.md` in Workspace Root**:
   During initial project setup, the agent MUST write **`AGENTS.md`** into the project workspace root. `AGENTS.md` contains the INT AI-First Engineering Policy, authority hierarchy, lifecycle definition, and core governance rules.

2. **Auto-Copy Project-Level Skills into `.agent/skills/`**:
   During project setup, the agent MUST execute the automated native OS bulk copy script to copy all project sub-skills into `.agent/skills/`.
   
   **CRITICAL EXCLUSION RULE**: The agent MUST copy ONLY the skill folder and its `SKILL.md` file, **STRICTLY EXCLUDING** any nested `resources/` directory (e.g. `skills/int-project-setup/resources/`).

3. **Mandatory Workflow, Skill & Governance Resolution Hierarchy**:
   After project setup is complete, whenever any workflow, skill, slash command, or governance rule is executed in the workspace (e.g., `/int-project-resume`, `/int-brd-ingestion`, `/int-project-setup`), the AI chat agent MUST enforce the following resolution priority:
   - **Priority 1 (Local Repository First)**: First check if local project workflows (`.agent/workflows/<workflow_name>.md`), `AGENTS.md`, or local project skills (`.agent/skills/<skill_name>/SKILL.md`) exist inside `.agent/` in the project repository root. If present, load and execute the **local project workflows, rules, and skills** first.
   - **Priority 2 (Global Fallback Second)**: If and ONLY if a requested workflow, skill, or rule file is not present locally in `.agent/`, fall back to checking global workflows (`<global-config-root>/global_workflows/`) or global skills (`<global-skills-root>/<skill_name>/SKILL.md`).

This ensures that every team member or AI assistant (Gemini, Claude, Cursor, Windsurf, Copilot, etc.) working on the project prioritizes repository-local workflows and skills directly inside `.agent/` without relying on external or cloud AI configurations.


---

# EXISTING PROJECT RE-INITIALIZATION & NON-DESTRUCTIVE SYNC PROTOCOL

When the user runs `/int-project-setup` on a project that is **already set up or contains existing code**:

1. **Auto-Detect Codebase & Skip Redundant Questions**:
   - The system inspects disk first (`package.json`, `src/`, `models/`, etc.).
   - If code exists, the system **automatically extracts** Language, Framework, Database, ORM, and Architecture style, auto-populates `project_context.md` & `architecture.md`, and **SKIPS asking technology discovery questions**!
   - CLI scaffolding (`create-vite`, `nestjs`, etc.) is completely bypassed.

2. **Non-Destructive Guarantee**:
   - The system **NEVER** deletes, overwrites, or resets existing project-specific data (`BRD.md`, `project_context.md`, `constitution.md`, `architecture.md`, `status.md`, `prompt_history.md`, specs, plans, tasks, test cases, or PR review records).
   - All source code (`src/`, `tests/`) and legacy project structures remain 100% untouched.

3. **Control Plane & Local Skill Sync from Global Standards**:
   - The system compares the local `.agent/rules/`, `.agent/workflows/`, and `.agents/skills/` with the latest global Control Plane resources and global skills (`<global-skills-root>/`).
   - If global skills or control plane standards contain updated workflows (e.g. `pr-gate-workflow.md`, `int-standards.md`, `int-sdd-lifecycle`), the system **automatically updates and syncs `.agents/skills/` and `.agent/`** so the project repository is upgraded with the latest engineering standards and security fixes!

4. **Missing Template & Directory Restoration**:
   - If any new mandatory templates (e.g. `gate-1-review.template.md`, `gate-2-review.template.md`, `gate-review-dashboard-design.html`) or `.ai-context/` subdirectories are missing, the system non-destructively generates them.

5. **Governance Aspect & Reviewer Roster Validation & Auto-Correction**:
   - The system inspects `.ai-context/project_context.md` and `.ai-context/constitution.md`.
   - If any assigned reviewer email fields (Gate 0 Reviewers, Gate 1 Reviewers, Gate 2 Reviewers) are missing, empty, or contain default placeholders (`<email@domain.com>`, `<Name>`), the system prompts the user to input real names and emails for all 3 PR gates and updates `.ai-context/project_context.md` and `.ai-context/constitution.md` automatically!

---

# MANDATORY AUTOMATED `.gitignore` CREATION

During initial project setup, the agent MUST automatically create **`.gitignore`** in the project workspace root with standard exclusion boundaries:

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment & Secrets
.env
.env.local
.env.*.local
*.pem

# Build & Production Outputs
dist/
build/
coverage/

# OS Files
.DS_Store
Thumbs.db

# Logs & Temporary Files
scratch/
*.log

# Ignore Vendor-Specific Bridge Files (Keep Git 100% Clean & Zero Duplication)
CLAUDE.md
.claude/
.cursor/
.cursorrules

# CRITICAL: DO NOT IGNORE INT CONTROL PLANE OR KNOWLEDGE BASE
!.agent/
!.ai-context/
!.agents/
!AGENTS.md
```

## Mandatory Vendor Bridge Adapter Generation Protocol (Claude, Cursor, Windsurf)

During project setup, the agent MUST automatically generate lightweight vendor bridge pointers to preserve `.agent/` and `AGENTS.md` as the 100% single source of truth without duplicating any rules:

1. **Auto-Generate `CLAUDE.md` Import Pointer**:
   Create `CLAUDE.md` in project root containing `@AGENTS.md`.
2. **Auto-Create `.claude/` Directory Junction Links**:
   Create junction links so `.claude/` points directly to `.agent/`:
   - `.claude/commands` ──► `.agent/workflows`
   - `.claude/skills` ──► `.agent/skills`
   - `.claude/rules` ──► `.agent/rules`


---

# Project Knowledge Base

Create the project-specific AI context directory structure:

```text
.ai-context/
├── constitution.md
├── project_context.md
├── architecture.md
├── BRD.md
├── assumptions.md
├── brd-change-log.md
├── status.md
├── prompt_history.md
├── specs/
├── plans/
├── tasks/
├── test_cases/
├── pr_reviews/
├── decisions/
├── incidents/
├── hotfixes/
├── releases/
├── change_requests/
└── templates/
    ├── spec.template.md
    ├── plan.template.md
    ├── tasks.template.md
    ├── test_cases.template.md
    ├── gate-1-review.template.md
    ├── gate-2-review.template.md
    ├── adr.template.md
    ├── incident.template.md
    ├── hotfix-spec.template.md
    ├── release.template.md
    ├── change-request.template.md
    └── gate-review-dashboard-design.html
```

All listed files/directories are mandatory.

## MANDATORY AUTOMATED RUNTIME INSTANTIATION PROTOCOL

During initial project setup, the agent MUST automatically generate the `.ai-context/` knowledge base on disk:

1. **Auto-Generate Mandatory Artifact Subdirectories with Seed Files**:
   To ensure empty subdirectories are physically created on disk and tracked by Git, the agent MUST execute file creation for a `.gitkeep` file in each of the 10 mandatory subdirectories during setup:

   - `.ai-context/specs/.gitkeep`
   - `.ai-context/plans/.gitkeep`
   - `.ai-context/tasks/.gitkeep`
   - `.ai-context/test_cases/.gitkeep`
   - `.ai-context/pr_reviews/.gitkeep`
   - `.ai-context/decisions/.gitkeep`
   - `.ai-context/incidents/.gitkeep`
   - `.ai-context/hotfixes/.gitkeep`
   - `.ai-context/releases/.gitkeep`
   - `.ai-context/change_requests/.gitkeep`
2. **Auto-Copy All 12 Template Files (`.ai-context/templates/`) via Native OS Command**:
   The agent MUST execute the native OS bulk copy command (`Copy-Item -Recurse -Force "$env:USERPROFILE\.gemini\config\skills\int-project-setup\resources\INT-Control-Plane\.ai-context\templates\*" ".ai-context\templates\"`) to copy all 12 template files into `.ai-context/templates/` in a single 1-second operation consuming zero LLM output tokens:

   - `.ai-context/templates/spec.template.md`
   - `.ai-context/templates/plan.template.md`
   - `.ai-context/templates/tasks.template.md`
   - `.ai-context/templates/test_cases.template.md`
   - `.ai-context/templates/gate-1-review.template.md`
   - `.ai-context/templates/gate-2-review.template.md`
   - `.ai-context/templates/adr.template.md`
   - `.ai-context/templates/incident.template.md`
   - `.ai-context/templates/hotfix-spec.template.md`
   - `.ai-context/templates/release.template.md`
   - `.ai-context/templates/change-request.template.md`
   - `.ai-context/templates/gate-review-dashboard-design.html`

3. **Auto-Generate Base Context Files**:
   Initialize `.ai-context/constitution.md`, `.ai-context/project_context.md`, `.ai-context/architecture.md`, `.ai-context/BRD.md`, `.ai-context/assumptions.md`, `.ai-context/brd-change-log.md`, `.ai-context/status.md`, and `.ai-context/prompt_history.md`.

## Purpose of AI Context

The `.ai-context` directory contains project-specific knowledge, development artifacts, and standard engineering templates.
It MUST NOT contain generic INT standards that belong to the `.agent` Control Plane.

## CRITICAL RULE — FLAT FILE STRUCTURE (NO SUBDIRECTORIES)

All artifacts created inside `.ai-context/` subdirectories MUST be created directly as **flat files** using standard naming conventions:

- Specs: `.ai-context/specs/<feature-slug>.spec.md` (e.g. `dynamic-request-management.spec.md`)
- Plans: `.ai-context/plans/<feature-slug>.plan.md` (e.g. `dynamic-request-management.plan.md`)
- Tasks: `.ai-context/tasks/<feature-slug>.tasks.md` (e.g. `dynamic-request-management.tasks.md`)
- Test Cases: `.ai-context/test_cases/<feature-slug>.test_cases.md` (e.g. `dynamic-request-management.test_cases.md`)
- Decisions: `.ai-context/decisions/ADR-NNN.md` (e.g. `ADR-001.md`)
- Incidents: `.ai-context/incidents/INC-YYYY-NNN.md` (e.g. `INC-2026-001.md`)
- Hotfixes: `.ai-context/hotfixes/HOTFIX-<slug>.md` (e.g. `HOTFIX-memory-leak.md`)
- Releases: `.ai-context/releases/RELEASE-vX.Y.Z.md` (e.g. `RELEASE-v1.2.0.md`)
- Change Requests: `.ai-context/change_requests/CR-<YYYYMMDD>-<slug>.md` (e.g. `CR-20260830-employee-portal-redesign.md`) instantiated from `change-request.template.md` (plus optional archived attachments like `CR-<YYYYMMDD>-<slug>-screenshot.png`)

**PROHIBITED**: DO NOT create subdirectories named after feature slugs inside `specs/`, `plans/`, `tasks/`, or `test_cases/` (e.g. NEVER create `.ai-context/specs/dynamic-request-management/spec.md` or `.ai-context/plans/dynamic-request-management/plan.md`). All artifact files MUST sit directly at the root of their respective category folder.

## CRITICAL RULE — PORTABLE REPOSITORY-RELATIVE PATHS (NO ABSOLUTE PATHS)

All file references, cross-links, document paths, and code references recorded inside repository artifacts (`.ai-context/`, `status.md`, specs, plans, tasks, ADRs, releases, test cases) MUST be **relative to the repository root**:

- **CORRECT**: `.ai-context/specs/dynamic-request-management.spec.md`
- **CORRECT**: `src/backend/controllers/requestController.ts`
- **CORRECT**: `tests/backend/requestController.test.ts`
- **PROHIBITED**: Never write absolute local file system paths containing local user directories (e.g. `C:\Users\Username\...`, `c:/Users/...`, `file:///C:/Users/...`, `/home/user/...`).

**Git Portability Mandatory**: Absolute local OS paths break when committed to Git because other collaborators and CI/CD pipelines operate under different root directories. All written path references MUST be relative to the project workspace root.

---

# Mandatory Automated Template Creation (`.ai-context/templates/`)

During initial project setup, all template files under `.ai-context/templates/` MUST be automatically created. Every generated project artifact in `.ai-context/` is derived directly from its corresponding template:

## Template-to-Artifact Mapping Table

| Template File (`.ai-context/templates/`) | Target Artifact Location                                    | Workflow / Skill                           |
| ------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------ |
| `spec.template.md`                       | `.ai-context/specs/<feature-slug>.spec.md`                | `int-sdd-lifecycle`                      |
| `plan.template.md`                       | `.ai-context/plans/<feature-slug>.plan.md`                | `int-sdd-lifecycle`                      |
| `tasks.template.md`                      | `.ai-context/tasks/<feature-slug>.tasks.md`               | `int-sdd-lifecycle`                      |
| `test_cases.template.md`                 | `.ai-context/test_cases/<feature-slug>.test_cases.md`     | `int-sdd-lifecycle`                      |
| `gate-1-review.template.md`              | PR Gate 1 Review Record in Dashboard & Spec                | `int-sdd-lifecycle`                      |
| `gate-2-review.template.md`              | PR Gate 2 Review Record in Dashboard & Spec                | `int-sdd-lifecycle`                      |
| `adr.template.md`                        | `.ai-context/decisions/ADR-NNN.md`                        | `int-incident-management` / Architecture |
| `incident.template.md`                   | `.ai-context/incidents/INC-YYYY-NNN.md`                   | `int-incident-management`                |
| `hotfix-spec.template.md`                | `.ai-context/specs/hotfix-<slug>.spec.md`                 | `int-hotfix-management`                  |
| `release.template.md`                    | `.ai-context/releases/RELEASE-vX.Y.Z.md`                  | `int-release-management`                 |
| `change-request.template.md`             | `.ai-context/change_requests/CR-<YYYYMMDD>-<slug>.md`     | `int-sdd-lifecycle`                      |
| `gate-review-dashboard-design.html`      | `.ai-context/templates/gate-review-dashboard-design.html` | Gate Review Visualizer                     |

---

### 1. `spec.template.md`

```markdown
# Spec: <Feature Name>

## Spec ID
<feature-slug>

## Status
Draft | In Peer Review | Changes Requested | Approved | Plan Drafted | Plan Reviewed | Tasks Generated | Under Development | In QA | Ready for Release | Released (vX.Y.Z)

## Roles & Assignments
- **Developer:** <Developer Name / Email>
- **Gate 1 Reviewer(s):** <Assigned Reviewer Name(s) / Email(s) / User ID(s)> (Single or Multiple)
- **Gate 2 Reviewer(s):** <Assigned Reviewer Name(s) / Email(s) / User ID(s)> (Single or Multiple)

## Linked BRD
.ai-context/BRD.md#BRD-NNN

## Gate Approvals & History
| Gate | Approver Name | Approver Email/ID | Date/Time | Outcome | Approval Comment / Summary |
|---|---|---|---|---|---|
| Gate 1 (Spec Review) | <Approver Name> | <Email/ID> | YYYY-MM-DD HH:MM:SS | Approved | "<Gate 1 review summary / link to dashboard>" |
| Gate 2 (Code Review) | <Approver Name> | <Email/ID> | YYYY-MM-DD HH:MM:SS | Approved | "<Gate 2 review summary / link to dashboard>" |

## Intent
<One paragraph: what changes, for whom, under what condition>

## Context
- Builds on: .ai-context/architecture.md (<section>)
- Related: .ai-context/specs/<related-spec>.spec.md
- API contract: <link if external>

## API Contract (Mandatory if API surface exists)
### <slug>.API01 — <METHOD> <path>
**Request payload:**
```json
{ "field": "type" }
```

**Success response (`<code>`):**

```json
{ "field": "type" }
```

**Exceptions:**

| Code | Condition       | Response body |
| ---- | --------------- | ------------- |
| 4xx  | `<condition>` | `<shape>`   |

## Acceptance Criteria

1. `<slug>`.AC1 — Given `<state>`, when `<action>`, then `<outcome>`.
2. `<slug>`.AC2 — Given `<state>`, when `<action>`, then `<outcome>`.

## Unit Test Cases (spec-derived)

| Test ID         | Maps to AC | Scenario       | Expected       |
| --------------- | ---------- | -------------- | -------------- |
| `<slug>`.UT01 | AC1        | `<scenario>` | `<expected>` |

## Explicitly Out of Scope

- <item>

## Non-Functional Constraints (from constitution.md)

- <latency / throughput / compliance constraint>

```

### 2. `plan.template.md`
```markdown
# Plan: <Feature Name>

## Derived From
.ai-context/specs/<feature-slug>.spec.md

## Architecture Approach
<components touched, new vs existing, integration points>

## Data Model
<schema changes, migrations, if any>

## Constitution Check
- [ ] No new datastore introduced without ADR
- [ ] Testing discipline matches constitution.md
- [ ] Security posture matches constitution.md

## Explicitly Deferred
- <item with reason>

## Sequencing
1. <high-level build order>
```

### 3. `tasks.template.md`

```markdown
# Tasks: <Feature Name>

## Derived From
.ai-context/plans/<feature-slug>.plan.md

## Sequence
- [ ] <slug>.T01 — <independently verifiable work> — Acceptance: <AC ID(s)>
- [ ] <slug>.T02 — <independently verifiable work> — Acceptance: <AC ID(s)>
```

### 4. `test_cases.template.md`

```markdown
# Test Cases: <Feature Name>

## Derived From Spec
.ai-context/specs/<feature-slug>.spec.md

## Acceptance Test Scenarios
### <slug>.TC01 — <Title>
- **Maps to AC:** <slug>.AC1
- **Given:** <initial state>
- **When:** <action / trigger>
- **Then:** <expected outcome>
- **Automated Test File:** tests/frontend/<path> or tests/backend/<path>

### <slug>.TC02 — <Title>
- **Maps to AC:** <slug>.AC2
- **Given:** <initial state>
- **When:** <action / trigger>
- **Then:** <expected outcome>
- **Automated Test File:** tests/frontend/<path> or tests/backend/<path>
```

### 5. `gate-1-review.template.md`

```markdown
# Gate 1 PR Review: <Spec ID> — <Spec Name>

## Review Metadata
- **Project Name:** <Project Name>
- **Spec ID:** <feature-slug>
- **Spec Name:** <Spec Name>
- **Developer:** <Developer Name / Email>
- **Assigned Reviewer:** <Assigned Reviewer Name>
- **Reviewer Name:** <Reviewer Name>
- **Reviewer Email/User ID:** <Reviewer Email or User ID>
- **Review Status:** Approved | Rejected | Changes Requested
- **Review Date/Time:** YYYY-MM-DD HH:MM:SS

## Review Criteria Evaluation
1. **Requirement Completeness:** Passed | Needs Improvement | Failed
2. **Requirement Understanding:** Passed | Needs Improvement | Failed
3. **Functional Scope:** Passed | Needs Improvement | Failed
4. **Technical Approach/Design:** Passed | Needs Improvement | Failed
5. **Business Rules:** Passed | Needs Improvement | Failed
6. **Validations:** Passed | Needs Improvement | Failed
7. **Dependencies:** Passed | Needs Improvement | Failed
8. **Assumptions:** Passed | Needs Improvement | Failed
9. **Edge Cases:** Passed | Needs Improvement | Failed
10. **Acceptance Criteria:** Passed | Needs Improvement | Failed
11. **Development Readiness:** Ready | Not Ready

## Review Summary & Feedback
- **Review Description:** <High-level summary of review findings and scope assessment>
- **Review Comments:** <Detailed line-item feedback, requested changes, or approval notes>
```

### 6. `gate-2-review.template.md`

```markdown
# Gate 2 PR Review: <Spec ID> — <Spec Name>

## Review Metadata
- **Project Name:** <Project Name>
- **Spec ID:** <feature-slug>
- **Spec Name:** <Spec Name>
- **Developer:** <Developer Name / Email>
- **Assigned Reviewer:** <Assigned Reviewer Name>
- **Reviewer Name:** <Reviewer Name>
- **Reviewer Email/User ID:** <Reviewer Email or User ID>
- **Review Status:** Approved | Rejected | Changes Requested
- **Review Date/Time:** YYYY-MM-DD HH:MM:SS

## Review Criteria Evaluation
1. **Implementation Against Approved Spec:** Passed | Needs Improvement | Failed
2. **Functional Correctness:** Passed | Needs Improvement | Failed
3. **Code Quality:** Passed | Needs Improvement | Failed
4. **Coding Standards:** Passed | Needs Improvement | Failed
5. **Error Handling:** Passed | Needs Improvement | Failed
6. **Validation:** Passed | Needs Improvement | Failed
7. **Security Considerations:** Passed | Needs Improvement | Failed
8. **Test Coverage:** Passed | Needs Improvement | Failed
9. **Edge Cases:** Passed | Needs Improvement | Failed
10. **Acceptance Criteria Compliance:** Passed | Needs Improvement | Failed
11. **Regression Impact:** None | Low | High

## Review Summary & Feedback
- **Review Description:** <High-level summary of code review findings, test suite verification, and quality sign-off>
- **Review Comments:** <Detailed code comments, refactoring notes, or approval sign-off notes>
```

### 7. `adr.template.md`

```markdown
# ADR-<NNN>: <Title>

## Status
Proposed | Approved | Deprecated | Superseded

## Date
YYYY-MM-DD

## Context
<Context, drivers, incident trigger, or architectural problem statement>

## Decision
<Clear statement of the architectural decision made>

## Consequences
- **Positive:** <benefits>
- **Negative / Risks:** <trade-offs / risks>

## Compliance & Constitution Impact
- Updates `architecture.md` section: <section>
- Updates `constitution.md` constraint: <constraint, if applicable>
```

### 6. `incident.template.md`

```markdown
# Incident: INC-YYYY-NNN — <Title>

## Incident Metadata
- **Incident ID:** INC-YYYY-NNN
- **Reporter / Source:** <Source>
- **Environment:** <Production | Staging | etc.>
- **Impact / Severity:** <Sev-1 | Sev-2 | Sev-3>
- **Reported Date:** YYYY-MM-DD
- **Status:** Open | Triaged | Fix In Progress | Verifying | Closed

## Description & Evidence
<Description of the failure>
### Log Evidence / Stack Trace:
```text
<logs / trace>
```

## Classification & Routing

- [ ] **Spec Gap** → Route to: `.ai-context/specs/<feature-slug>.spec.md` (Update Spec & Plan)
- [ ] **Implementation Defect** → Route to: `.ai-context/specs/hotfix-<incident-slug>.spec.md`
- [ ] **New Requirement** → Route to: `.ai-context/BRD.md` (BRD ingestion workflow)

## Root Cause Analysis

<Detailed root cause>

## Resolution & Post-Mortem Sign-Off

- **Hotfix / Spec Link:** `.ai-context/specs/hotfix-<incident-slug>.spec.md`
- **Resolution Date:** YYYY-MM-DD
- **ADR Triggered:** Yes / No (Link: `.ai-context/decisions/ADR-NNN.md`)

```

### 7. `hotfix-spec.template.md`
```markdown
# Hotfix Spec: <Incident Name>

## Incident ID
INC-YYYY-NNN

## Hotfix ID
HOTFIX-<incident-slug>

## Status
Draft | Approved | Implemented | Verified (Gate 2 Post-Hoc)

## Incident Summary
<Brief description of the production failure>

## Root Cause
<Diagnostic root cause>

## Correct Behaviour
<Desired operational outcome>

## Acceptance Criteria
1. <slug>.AC1 — Given <state>, when <action>, then <outcome>.

## Related Original Spec
.ai-context/specs/<feature-slug>.spec.md

## Fix Summary
<Technical fix approach>

## Gate Approvals & Post-Hoc History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Post-Hoc Gate 2 Review | <Approver Name> | YYYY-MM-DD | Approved | "<Post-hoc review approval comment>" |
```

### 6. `release.template.md`

```markdown
# Release vX.Y.Z

## Release Date
YYYY-MM-DD

## Target Version
vX.Y.Z

## Included Features & Specs
| Spec ID | Feature Title | Spec Link | Status |
|---|---|---|---|
| <feature-slug> | <Title> | .ai-context/specs/<feature-slug>.spec.md | Released (vX.Y.Z) |

## High-Level Summary
<Summary of major capabilities and changes in this release, derived from Spec Intents>

## Change Log (Spec-Derived)
### Features
- **<feature-slug>**: <Intent summary from Spec>

### Bug Fixes / Hotfixes
- **HOTFIX-<slug>**: <Hotfix summary>

## Gate 2 & Verification Sign-Off
- [ ] All feature unit and integration tests GREEN
- [ ] Gate 2 code reviews passed for all included specs
- [ ] No open Sev-1/Sev-2 blocking incidents
```

### 7. `change-request.template.md`

```markdown
# Change Request: CR-<YYYYMMDD>-<slug>

## Change Request ID
CR-<YYYYMMDD>-<slug>

## Date
YYYY-MM-DD

## Source
<Client Prompt / User Feedback / Screen Screenshot>

## Status
Draft | In Peer Review (Gate 1) | Approved | Implemented

## Description
<Detailed explanation of the requested change, UI updates, layout changes, or workflow modifications>

## Linked Assets
- **Archived Asset**: .ai-context/change_requests/CR-<YYYYMMDD>-<slug>-<filename>
- **Prompt History**: .ai-context/prompt_history.md

## Affected Spec IDs & Impact Analysis
| Spec ID | Impact Scope | Affected Files / Components | Description of Required Change |
|---|---|---|---|
| <feature-slug> | <Frontend / Backend / Full Stack> | <src/...> | <Description of change> |

## Multi-Spec Impact Matrix
- **<feature-slug-1>**: <Summary of AC revisions / new criteria>
- **<feature-slug-2>**: <Summary of AC revisions / new criteria>

## Proposed Spec Modifications
### Revised Acceptance Criteria:
1. <feature-slug>.AC_REV1 — Given <state>, when <action>, then <outcome>.

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Spec Review) | <Approver Name> | YYYY-MM-DD | Approved | "<User/Reviewer approval comment provided during review>" |
| Gate 2 (Code Review) | <Approver Name> | YYYY-MM-DD | Approved | "<User/Reviewer approval comment provided during code review>" |
```

### 8. `gate-review-dashboard-design.html`

HTML/CSS design dashboard template for visualizing Gate 1 and Gate 2 status, active specs, approval comments, and compliance checks.

---

## `constitution.md` Generation Rules & Structure

When generating `.ai-context/constitution.md`, the file MUST adhere to the following mandatory structure:

```markdown
# Project Constitution

## Testing Discipline
<BRD content>

## Security Posture
<BRD content>

## Architectural Constraints
<BRD content>

## Non-Functional Baselines
<BRD content>

## Versioning Rules
<BRD content>
```

### Constitution Generation Guidelines

If the supplied BRD contains a Constitution, Engineering Constitution, Technical Constitution, or equivalent project-specific governance section:

1. Treat the BRD-provided Constitution as the authoritative project-specific Constitution.
2. Preserve all project-specific constraints.
3. Do not replace BRD Constitution rules with generic INT rules.
4. Do not remove, simplify, summarize, or reinterpret measurable constraints.
5. Preserve:
   - Testing requirements
   - Security requirements
   - Architectural constraints
   - Technology constraints
   - Data constraints
   - Non-functional requirements
   - Availability requirements
   - Performance requirements
   - Recovery requirements
   - Versioning requirements
   - Compliance requirements
6. Generate `.ai-context/constitution.md` from the Constitution contained in the BRD.
7. Organization-wide INT SDD rules may be referenced as governing engineering-process rules, but MUST NOT overwrite project-specific Constitution requirements.
8. If a BRD Constitution conflicts with an organization-level rule, do not silently resolve the conflict. Flag the conflict for human review.
9. Do not invent technologies, infrastructure, authentication mechanisms, databases, frameworks, or architectural constraints that are not supported by the BRD or explicitly provided project configuration.
10. Preserve the terminology and intent of the BRD Constitution.

## `test_cases/` Directory Rule

`.ai-context/test_cases/` contains test-case specifications, scenarios, acceptance-oriented test definitions, and related test planning artifacts. It is NOT the location for executable automated test code.

Executable automated tests belong under:

- `tests/frontend/`
- `tests/backend/` (for Full Stack projects)

---

## `prompt_history.md` Generation & Append-Only Protocol

`.ai-context/prompt_history.md` stores a complete chronological audit log of all user prompts, change requests, and AI execution turns.

### CRITICAL RULE — STRICT APPEND-ONLY MUTATION

- `.ai-context/prompt_history.md` is a **mandatory, append-only chronological log**.
- Whenever logging a new user prompt, change request, feature execution, or session restart, the agent MUST read existing content first, and **APPEND** the new entry to the bottom of the file below all previous entries.

---

# Execution Layer Setup & CLI Scaffolding Protocol

> [!CRITICAL]
> **AUTOMATED CLI SCAFFOLDING & ZERO STATIC TEMPLATES**:
> 1. The system carries **ZERO pre-defined or static templates** for `src/` and `tests/`.
> 2. The execution layer folder structure MUST be created automatically via CMD / terminal using the official CLI generator command matching the selected technology stack.
> 3. No manual folder confirmation prompt is required.
> 4. `.ai-context/architecture.md` and `.ai-context/project_context.md` MUST be populated dynamically by scanning disk after CLI execution to record the real generated directory tree.

## Execution Rules:

1. **Map Selected Technology Stack to CLI Generator**: Retrieve confirmed parameters (Frontend, Backend, Database, ORM, Architecture style) and execute the corresponding official CLI initializer via CMD (e.g. `npx create-vite`, `npx @nestjs/cli`, `dotnet new`, `django-admin`, `cargo new`, `composer create-project`, `flutter create`, `curl start.spring.io`).
2. **Auto-Generate Configurations & Baseline Code**: Allow the CLI command to scaffold official entry points (`main.ts`, `App.tsx`, `server.js`) and build configs (`package.json`, `tsconfig.json`, `vite.config.ts`, `pom.xml`, `go.mod`) on disk.
3. **Scan Disk & Sync `architecture.md`**: Perform a disk inspection (`list_dir`) and immediately write the actual generated folder hierarchy, module boundaries, and configuration parameters into `.ai-context/architecture.md` and `.ai-context/project_context.md`.


---

# MANDATORY STEP 5 — Automated CodeGraph Auto-Installation & Project Dependencies Setup Protocol

During INT Project Setup (`/int-project-setup`), the system MUST automatically verify, auto-install, and configure CodeGraph and its runtime dependencies for the project environment.

## Setup & Automated Installation Flow:

1. **Automated Detection & Installation**:
   - Inspect environment for CodeGraph CLI / MCP server (`codegraph --version`).
   - Validate version compatibility with the INT SDD workflow.
   - **Auto-Installation Mandate**: If CodeGraph is missing or unavailable:
     - For Node.js / JavaScript / TypeScript projects: Execute `npm install -g @codegraph/cli` (or `npm install --save-dev @codegraph/cli`).
     - For Python projects: Execute `pip install codegraph-mcp` (or `poetry add --group dev codegraph-mcp`).
     - For other technology stacks: Download/install the corresponding CodeGraph native CLI / MCP package.
     - Auto-install required runtime parser dependencies (`sqlite3`, language AST parsers).

2. **Automated Project MCP Server Configuration**:
   - Auto-generate or update `.mcp/config.json` (or vendor equivalent `.gemini/mcp_config.json` / `.claude/mcp_config.json`):
     ```json
     {
       "mcpServers": {
         "codegraph": {
           "command": "codegraph",
           "args": ["mcp", "serve"],
           "env": {
             "CODEGRAPH_DB_PATH": ".ai-context/codegraph.sqlite"
           }
         }
       }
     }
     ```

3. **Project State Classification & Initial Indexing Execution**:
   - **Greenfield Project** (No existing source code implementation): Initialize project CodeGraph SQLite file (`.ai-context/codegraph.sqlite`) with a minimal empty schema without treating an empty graph as an error.
   - **Legacy / Ongoing Project** (Existing codebase detected): Immediately execute automated initial indexing on disk via terminal:
     `codegraph index --force --db .ai-context/codegraph.sqlite`
     This indexing operation MUST complete BEFORE reverse engineering (`int-reverse-engine-workflow`) or SDD planning begins.

4. **Record Metadata in Project Context**:
   - Record CodeGraph configuration in `.ai-context/project_context.md`:
     ```json
     {
       "codeGraph": {
         "enabled": true,
         "version": "x.x.x",
         "indexStatus": "READY",
         "dbPath": ".ai-context/codegraph.sqlite",
         "lastSyncAt": "YYYY-MM-DD HH:mm:ss",
         "syncMode": "incremental"
       }
     }
     ```


# Required Project Information Collection & Governance Validation Protocol

Before creating or syncing the project structure, collect and validate all required project technology and governance information. When running `/int-project-setup` on a new OR existing project, the system MUST inspect `.ai-context/project_context.md` and `.ai-context/constitution.md` to verify that all necessary aspects and assigned reviewer rosters are populated with real names and emails.

Do NOT infer, invent, or leave default placeholders (`<Name>`, `<email@domain.com>`, `<Technical Lead Name>`, `<Project Manager Name>`). If any information is missing or contains placeholders, prompt the developer to provide it:

1. Project name
2. Project type (Full Stack, Frontend Only, Backend Only, Mobile)
3. Frontend technology
4. Backend technology
5. Database
6. ORM / Data Access Technology
7. Authentication mechanism
8. Deployment target, if known
9. Architecture style (Default: Modular Monolith + Microservice Ready)
10. **Governance Aspect & Reviewer Roster Validation (MANDATORY)**:
    - **Gate 0 Reviewer(s) (BRD Review)**: Business Analyst / Project Manager / Product Owner Name & Email
    - **Gate 1 Reviewer(s) (Spec Review)**: Project Manager / Product Owner / Tech Lead Name & Email
    - **Gate 2 Reviewer(s) (Code Review)**: Technical Lead / Architect / Senior Developer Name & Email
    - **Senior Software Engineer / Spec Author**: Name & Email
    - **Git Developer Email Alignment (`git config user.email`)**: Confirm developer's authenticated email matches their designated role or assigned reviewer/author roster.

Populate and update `.ai-context/project_context.md`, `.ai-context/constitution.md`, and `.ai-context/architecture.md` immediately with these validated parameters.

---

# Existing Project Protection

Before creating files:

1. Inspect the workspace.
2. Determine whether it is empty or already contains application code.
3. Never overwrite existing files without explicit approval.
4. If an existing `.agent` directory is present, compare it before modifying it.
5. Preserve existing project code and configurations.
6. Report conflicts before modifying existing files.

---

# Related INT Workflow Skills

Once initial project setup is complete, use the dedicated INT workflow skills for ongoing lifecycle tasks:

- **BRD Ingestion & Module Structure**: See `int-brd-ingestion`
- **Feature Development & SDD Lifecycle**: See `int-sdd-lifecycle`
- **Production Incident Management**: See `int-incident-management`
- **Hotfix Management**: See `int-hotfix-management`
- **Release Management**: See `int-release-management`
- **Session Continuation**: See `int-session-continuation`

---

# Final Response Checklist

After successful initialization, report:

1. Project information collected.
2. Architecture style selected.
3. INT Control Plane status (`.agent`).
4. AI context status (`.ai-context`).
5. Execution layer status (`src`, `tests`, `docs`).
6. Whether a BRD was provided.
7. Complete project directory structure created.
