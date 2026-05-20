# PR Invariant Checklist

Every PR must pass this checklist before requesting review. These are **not guidelines** — they are **contracts**.

## Pre-PR Checklist

- [ ] `make typecheck` passes (mypy --strict with zero errors)
- [ ] `make lint` passes (ruff check with zero errors)
- [ ] `make format-check` passes (code is formatted)
- [ ] `make test` passes (all tests pass, ≥80% coverage)
- [ ] Pre-commit hooks installed and passing

## Code Quality Invariants

### I1 — Dependency Direction
- [ ] No circular imports (checked by CI)
- [ ] `rag_axis.core` imports only from `aiprims` and stdlib
- [ ] No other `rag_axis.*` subpackages imported by core

### I2 — Error Taxonomy
- [ ] No bare `Exception` raises anywhere
- [ ] Every error type is in the error taxonomy (extends `AiprimsError` or subclasses)
- [ ] Every error carries `message`, `context`, and `run_id`

### I3 — Return Types
- [ ] No pipeline functions return `None`
- [ ] Optional results use typed unions (e.g., `Result | ErrorType`)

### I4 — Immutability
- [ ] All dataclasses crossing stage boundaries are `frozen=True`
- [ ] Every frozen dataclass has a test asserting mutation raises `FrozenInstanceError`

### I5 — Adapter Tests
- [ ] Every adapter reference implementation has an integration test
- [ ] Integration tests can run against local/mocked providers

### I6 — Server Resilience
- [ ] Server can start with no external services available
- [ ] `/health` endpoint returns degraded status (not crashed)

### I7 — Type Coverage
- [ ] `mypy --strict` passes on all files in `rag_axis.core` and `rag_axis.adapters`
- [ ] No `Any` types in core or adapters (checked by mypy)

### I8 — Structured Logging
- [ ] All log lines are structured JSON via `aiprims.StructuredLogger`
- [ ] No f-string log lines anywhere (`grep -r 'logging.*f"' rag_axis` returns nothing)

### I9 — Evaluation Default
- [ ] `bench` is enabled by default in server config
- [ ] Disabling bench requires explicit config
- [ ] Startup emits `EvaluationNotRunningWarning` if bench is disabled

### I10 — Documentation
- [ ] Public functions have docstrings
- [ ] ADRs updated if architectural decisions were made
- [ ] CHANGELOG.md updated if user-facing changes

## Testing Requirements

- [ ] New code has unit tests
- [ ] Critical paths have integration tests
- [ ] Edge cases are tested (empty retrieval, truncation, version mismatch, etc.)
- [ ] Error paths are tested (every custom error type raised somewhere)

## Before Requesting Review

- [ ] Branch is up-to-date with main
- [ ] All CI checks are passing
- [ ] This checklist is complete
- [ ] PR description explains what/why, not just how

## Reviewer Checklist

- [ ] All invariants verified
- [ ] Test coverage is adequate
- [ ] No new tech debt introduced
- [ ] Documentation is clear
