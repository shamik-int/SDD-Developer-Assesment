---
name: int-generate-tests
description: Unit test generation workflow following TDD standards and Jest/Vitest testing guidelines.
---

# INT Unit Test Generation Protocol

1. Read approved feature spec `.ai-context/specs/<feature-slug>.spec.md` and test cases `.ai-context/test_cases/<feature-slug>.test_cases.md`.
2. Generate executable unit test files in `tests/frontend/` or `tests/backend/`.
3. Confirm tests fail RED before writing implementation code GREEN.
