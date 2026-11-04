---
name: int-code-review
description: Senior Technical Lead code review for security, performance, reliability, and INT SDD standards.
---

# INT Senior Technical Lead Code Review Protocol

Execute a rigorous code review covering:
1. Security Posture (Zero hardcoded secrets, input validation, RBAC)
2. Spec & AC Compliance (All acceptance criteria implemented and verified)
3. Test Suite Integrity (All unit and integration tests passing GREEN)
4. Performance & Reliability (No blocking main thread calls, resource leak prevention)
5. Architecture Compliance (Matches .ai-context/architecture.md boundaries)
6. CodeGraph & Traceability Compliance (Task comments `@task`, `@requirement`, `@spec`, `@description` present and valid; CodeGraph call graph impact verified)
