VENV := venv
PYTHON := $(VENV)/Scripts/python.exe
PIP := $(VENV)/Scripts/pip.exe
PYTEST := $(VENV)/Scripts/pytest.exe
MYPY := $(VENV)/Scripts/mypy.exe
RUFF := $(VENV)/Scripts/ruff.exe
PRECOMMIT := $(VENV)/Scripts/pre-commit.exe

.PHONY: check typecheck lint format test security install setup

check: typecheck lint format test security
	@cmd /c echo All checks passed.

typecheck:
	$(MYPY) --strict rag_axis/

lint:
	$(RUFF) check rag_axis/ tests/

format:
	$(RUFF) format --check rag_axis/ tests/

test:
	$(PYTEST) tests/ --cov=rag_axis --cov-fail-under=80

security:
	$(VENV)/Scripts/pip-audit.exe

install:
	$(PIP) install -e ".[dev]"

setup:
	python -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -e ".[dev]"
	$(PRECOMMIT) install
