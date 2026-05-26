# Local Development Setup

This guide will get you from zero to running tests in under 5 minutes.

## Prerequisites

- Python 3.11 or 3.12
- Git
- Basic command line knowledge

## Quick Setup

Run the setup script:

```bash
bash setup-dev.sh
```

This will:
1. Create a virtual environment
2. Install all dependencies in editable mode
3. Install pre-commit hooks

## Manual Setup

If you prefer to set up manually:

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install package with all dependencies
pip install -e ".[dev,all]"

# Install pre-commit hooks
pre-commit install
```

## Verify Installation

```bash
# Run tests
make test

# Run type checking
make typecheck

# Run linting
make lint

# Run all checks
make check
```

All checks should pass.

## Development Workflow

### 1. Create a branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make changes

Write code in `rag_axis/` and tests in `tests/`.

### 3. Run checks locally

```bash
make check  # Runs typecheck + lint + format-check + test
```

### 4. Commit

Pre-commit hooks will run automatically. If they fail, fix the issues and commit again.

```bash
git add .
git commit -m "feat: your change description"
```

### 5. Push and open PR

```bash
git push origin feature/your-feature-name
```

Open a PR on GitHub. CI will run automatically.

## Common Commands

```bash
make help              # Show all available commands
make install           # Install dependencies
make test              # Run all tests
make test-unit         # Run only unit tests (fast)
make typecheck         # Run mypy
make lint              # Run ruff linting
make format            # Format code with ruff
make check             # Run all checks (CI equivalent)
make clean             # Clean build artifacts
make pre-commit        # Run pre-commit on all files
```

## Project Structure

```
rag-axis/
├── rag_axis/           # Main package
│   ├── core/           # Core types and functions
│   ├── adapters/       # Adapter protocols and implementations
│   ├── retrieval/      # Retrieval logic
│   ├── context/        # Context assembly
│   ├── bench/          # Evaluation
│   └── telemetry/      # Observability
├── tests/              # Test suite
│   ├── unit/           # Unit tests (fast, no external deps)
│   ├── integration/    # Integration tests (require services)
│   └── invariants/     # Invariant tests
├── docs/               # Documentation
│   ├── adr/            # Architecture Decision Records
│   └── contributing/   # Contributing guides
└── server/             # Server implementation (FastAPI)
```

## Before Submitting a PR

1. **Read the invariants checklist**: `docs/contributing/invariants.md`
2. **Run all checks**: `make check`
3. **Verify no warnings**: `make typecheck` should show 0 errors
4. **Update CHANGELOG.md** if user-facing changes
5. **Check the PR template** and fill it out completely

## Debugging

### Type errors

```bash
mypy rag_axis --strict --show-error-codes
```

### Linting errors

```bash
ruff check rag_axis tests --fix
```

### Test failures

```bash
pytest -v --pdb  # Drop into debugger on failure
pytest -k test_name  # Run specific test
```

### Pre-commit failures

```bash
pre-commit run --all-files  # Run all hooks manually
```

## Tips for Fast Iteration

1. **Run unit tests only** during development: `make test-unit`
2. **Use watch mode** for tests: `pytest-watch` (install separately)
3. **Type check one file** at a time: `mypy rag_axis/core/types.py`
4. **Skip slow tests** during iteration: `pytest -m "not slow"`

## Getting Help

- Read the architecture doc: `ARCHITECTURE.md`
- Check existing ADRs: `docs/adr/`
- Open an issue on GitHub
- Ask in the discussion forum

## What to Work On

Check the [roadmap document](../../RAG_AXIS_SPEC_V1.md) for component priorities.

Critical path for v1:
1. `rag_axis.core` (types, functions)
2. `rag_axis.adapters` (protocols + reference implementations)
3. `rag_axis.retrieval` (dense, sparse, hybrid)
4. `rag_axis.context` (assembly, truncation)
5. `rag_axis.telemetry` (OTel, structlog)
6. `rag_axis.bench` (evaluation)

Start with unit tests for core types — they're the foundation for everything else.
