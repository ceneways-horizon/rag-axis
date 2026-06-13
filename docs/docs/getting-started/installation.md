---
sidebar_position: 1
title: Installation
---

# Installation

RAG Axis requires Python 3.11 or 3.12. The recommended way to install it is with [uv](https://docs.astral.sh/uv/), though plain `pip` works as well.

## Using uv (recommended)

```bash
uv venv
uv pip install ragaxis
```

## Using pip

```bash
python3 -m venv venv
source venv/bin/activate
pip install ragaxis
```

## Optional Extras

RAG Axis ships its core types and adapter protocols with zero provider-specific dependencies. Install extras for the providers and components you need:

```bash
# Reference adapters for common providers
pip install "ragaxis[adapters]"

# Server (FastAPI-based deployment)
pip install "ragaxis[server]"

# Telemetry (OpenTelemetry exporters)
pip install "ragaxis[telemetry]"

# Everything, including development tools
pip install "ragaxis[dev,all]"
```

## Verifying the Install

```bash
python -c "import ragaxis; print(ragaxis.__version__)"
```

If this prints a version number without errors, you are ready to continue with the [Quickstart](./quickstart.md).
