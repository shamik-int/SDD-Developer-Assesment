# Architecture

## Style
Modular Monolith + Microservice Ready. Business modules live under `backend/src/modules/` and are added per approved spec; no business modules exist yet.

## Technology
- Frontend: Next.js (TypeScript, App Router), Bootstrap
- Backend: Node.js, Express (TypeScript, ESM), Mongoose
- Database: MongoDB
- Authentication: JWT
- Deployment: Docker (`docker-compose.yml`, per-service `Dockerfile`)

## Directory Structure (scanned from disk after scaffolding)
```text
.
├── .agent/                 INT Control Plane (rules, workflows, skills)
├── .ai-context/            Project knowledge base (BRD, specs, plans, tasks, templates, ...)
├── .claude/                Junction links to .agent (commands, skills, rules)
├── AGENTS.md
├── CLAUDE.md
├── docker-compose.yml
├── docs/                   Client BRDs / requirement documents
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts          Express app (helmet, cors, json, GET /health)
│       ├── server.ts       Entry point (Mongoose connect + listen)
│       ├── config/env.ts   Environment configuration
│       ├── modules/        Business modules (empty)
│       └── shared/         Cross-cutting code (empty)
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── src/app/            layout.tsx (imports Bootstrap CSS), page.tsx, globals.css
└── tests/
    ├── frontend/
    └── backend/
```

## Entry Points
- Backend: `backend/src/server.ts` (app in `backend/src/app.ts`)
- Frontend: `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx`

## Module Boundaries
Each backend module under `backend/src/modules/<name>/` owns its routes, service, and Mongoose model, and must not import another module's internals, so it can be extracted into a service later.
