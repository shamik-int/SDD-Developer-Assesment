---
name: int-project-setup
description: Initialize a new software project using the INT AI-First standard Control Plane, project-specific AI context, technology discovery gate, and repository baseline.
---

# INT AI-First Project Setup Workflow

This workflow triggers the **`int-project-setup`** skill.

For the full detailed specification, templates, and execution protocols, see:
[int-project-setup/SKILL.md](.agents/skills/int-project-setup/SKILL.md) (or `<global-skills-root>/int-project-setup/SKILL.md`)

## Summary of Steps:

1. **Existing Codebase Detection, User Confirmation Halt & Technology Discovery Gate**:
   - **Inspect Disk First**: Check for existing codebase manifests (`package.json`, `pom.xml`, `go.mod`, `src/`, `controllers/`, etc.).
   - **Zero-Harm Guarantee**: No existing codebase files or folders will ever be altered, deleted, overwritten, or harmed.
   - **User Confirmation Halt**: If an existing codebase is detected, halt and prompt the user to choose:
     - **Option 1 (Auto-Detect)**: Inspect codebase to auto-populate `project_context.md` and `architecture.md` without asking redundant stack questions.
     - **Option 2 (Manual Entry)**: Answer interactive discovery questions to manually define or verify technology stack & architecture parameters.
   - **Bypass CLI Scaffolding**: In both options for existing codebases, CLI scaffolding (`create-vite`, `@nestjs/cli`, etc.) is completely bypassed.
   - For brand new empty projects: Confirm Project Type, Architecture Style, Tech Stack, DB, ORM, and Reviewer Roster before scaffolding.
   - **Governance Aspect & Reviewer Roster Validation (MANDATORY)**: Inspect `.ai-context/project_context.md` and `.ai-context/constitution.md`. If TL, PM, or reviewer emails are missing or default placeholders (`<email@domain.com>`), prompt the developer to input real emails and update `project_context.md` and `constitution.md` automatically!
2. **Native OS Bulk Copy INT Control Plane & Setup Governance**:
   - Execute bulk native OS copy of `resources/INT-Control-Plane/.agent/` to `.agent/` (Excludes `int-sync-global-skills.md` which is strictly restricted to master admin).
   - Auto-generate `AGENTS.md` in workspace root for vendor-agnostic governance.
   - Execute bulk native OS copy of sub-skills into `.agent/skills/` (**STRICT RULE: Copy ONLY skill directory and `SKILL.md` file**, strictly excluding nested `resources/` subfolders).
   - Auto-generate `.gitignore` with standard rules protecting `.agent/`, `.ai-context/`, and `.agents/`.
3. **Initialize `.ai-context/` Knowledge Base**:
   - Create subdirectories (`specs`, `plans`, `tasks`, `test_cases`, etc.).
   - Execute bulk native OS copy of all 12 mandatory engineering templates from global config `templates/` into `.ai-context/templates/`.
   - Initialize `constitution.md`, `project_context.md`, `architecture.md`, `BRD.md`, `assumptions.md`, `brd-change-log.md`, `status.md`, `prompt_history.md`.

4. **Automated CLI-Driven Scaffolding & Dynamic Architecture Sync**:
   - Map confirmed technology stack (Frontend, Backend, Database, ORM, Architecture style) to its official framework CLI generator tool.
   - Execute the CLI generator command via CMD / terminal in non-interactive mode (`npx create-vite`, `npx @nestjs/cli`, `dotnet new`, `django-admin`, `cargo new`, `composer create-project`, `flutter create`, `curl start.spring.io`).
   - Scan generated directory structure from disk (`list_dir`).
   - Dynamically populate `.ai-context/architecture.md` and `.ai-context/project_context.md` with the scanned actual folder hierarchy, entry points, and module boundaries.

5. **Automated CodeGraph Auto-Installation & Project Dependencies Setup**:
   - Inspect environment for CodeGraph CLI / MCP server (`codegraph --version`).
   - If missing, automatically execute auto-installation of CodeGraph CLI / MCP server and project-level runtime AST dependencies (`@codegraph/cli`, `sqlite3`, tree-sitter parsers) via terminal (`npm install -g @codegraph/cli`, `pip install codegraph-mcp`).
   - Automatically configure project MCP server (`.mcp/config.json`, `.gemini/mcp_config.json`, `.claude/mcp_config.json`).
   - Classify project state: **Greenfield** (initialize empty `.ai-context/codegraph.sqlite`) vs **Legacy / Ongoing** (automatically trigger initial indexing `codegraph index --force --db .ai-context/codegraph.sqlite` before reverse engineering).
   - Record metadata in `.ai-context/project_context.md` (`"codeGraph": { "enabled": true, "indexStatus": "READY", "dbPath": ".ai-context/codegraph.sqlite" }`).
