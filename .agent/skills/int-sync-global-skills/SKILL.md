---
name: int-sync-global-skills
description: Synchronize and upgrade local project repository skills, workflows, and rules directly from the master global INT configuration.
---

# INT Global Skill & Control Plane Synchronization Skill

## Purpose
Allow Technical Leads and developers to upgrade an existing project's local `.agent/` control plane (skills, workflows, rules) directly from the master global INT configuration maintained in `$env:USERPROFILE\.gemini\config\`.

---

# Execution Protocol

### Step 1 — Clean Pre-Existing Legacy / Extra Directories
Execute PowerShell cleanup to remove any root `workflows/`, `.agents/` (plural), or nested resource folders:
```powershell
Remove-Item -Recurse -Force ".agents" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "workflows" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".agent\skills\int-project-setup\resources" -ErrorAction SilentlyContinue
```

### Step 2 — Sync Rules to `.agent/rules/`
Copy rules from global Control Plane resource directly into `.agent/rules/`:
```powershell
New-Item -ItemType Directory -Force -Path ".agent\rules" | Out-Null
Copy-Item -Recurse -Force "$env:USERPROFILE\.gemini\config\skills\int-project-setup\resources\INT-Control-Plane\.agent\rules\*" ".agent\rules\"
```

### Step 3 — Sync Workflows to `.agent/workflows/`
Copy global workflows directly into `.agent/workflows/`:
```powershell
New-Item -ItemType Directory -Force -Path ".agent\workflows" | Out-Null
Copy-Item -Recurse -Force "$env:USERPROFILE\.gemini\config\global_workflows\*" ".agent\workflows\"
```

### Step 4 — Sync Skills to `.agent/skills/` (Clean Copy — SKILL.md Only)
Iterate over all skills in `$env:USERPROFILE\.gemini\config\skills\` and copy ONLY `SKILL.md` per skill into `.agent/skills/`:
```powershell
Get-ChildItem "$env:USERPROFILE\.gemini\config\skills" -Directory | ForEach-Object {
    $skillName = $_.Name
    $targetAgent = ".agent\skills\$skillName"
    
    New-Item -ItemType Directory -Force -Path $targetAgent | Out-Null
    
    if (Test-Path "$($_.FullName)\SKILL.md") {
        Copy-Item -Force "$($_.FullName)\SKILL.md" "$targetAgent\SKILL.md"
    }
}
```

### Step 5 — Sync Vendor Bridge Adapters & Update .gitignore (Claude, Cursor, Windsurf)
Execute automatic zero-duplication vendor bridge creation to allow Claude Code, Claude Desktop, Cursor, and Windsurf users to execute slash commands natively without adding vendor files to Git:

1. **Update `.gitignore`**:
   Ensure project `.gitignore` includes vendor ignore boundaries (`CLAUDE.md`, `.claude/`, `.cursor/`, `.cursorrules`).
2. **Auto-Generate `CLAUDE.md` Import Pointer**:
   Create `CLAUDE.md` in project root containing `@AGENTS.md`.
3. **Auto-Create `.claude/` Directory Junction Links**:
   Create junction links so `.claude/` points directly to `.agent/`:
   - `.claude/commands` ──► `.agent/workflows`
   - `.claude/skills` ──► `.agent/skills`
   - `.claude/rules` ──► `.agent/rules`

### Step 6 — Verification & Summary
Confirm that `.agent/` is the single control plane directory containing ONLY:
- `.agent/rules/`
- `.agent/skills/` (with ONLY `SKILL.md` in each skill subfolder)
- `.agent/workflows/`
Report completion summary to the user.

