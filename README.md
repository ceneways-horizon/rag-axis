# rag-axis

> Production contract layer for RAG systems.  
> Typed. Explicit. Observable. Composable.

[![PyPI version](https://img.shields.io/pypi/v/rag-axis.svg)](https://pypi.org/project/rag-axis)
[![Python](https://img.shields.io/pypi/pyversions/rag-axis.svg)](https://pypi.org/project/rag-axis)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-ragaxis.cenewayshorizon.com-blue)](https://ragaxis.cenewayshorizon.com)

---

## What This Is

Every production RAG system fails in the same ways:
silent retrieval degradation, embedding model mismatch,
untracked cost explosions, and context assembly that drops
critical information without logging it.

rag-axis does not abstract these problems away.  
It makes them impossible to hide.

---

## What This Is Not

- Not a LangChain replacement by feature parity
- Not a beginner library
- Not a multi-agent orchestration framework
- Not auto-configuring anything

If a feature does not make a failure mode explicit  
or a production constraint enforceable,  
it does not belong in rag-axis.

---

## Core Guarantees

**Zero silent failures** — every failure mode has a name and a type.  
**Cost visibility** — every result carries tokens consumed, latency, and estimated cost per stage.  
**Explicit over magic** — no hidden routing, no undocumented behaviour.  
**Immutable results** — pipeline results cannot be mutated between stages.  
**Typed adapters** — LLM, embedder, and vector store boundaries are enforced via Protocol.

---

## Status
v0.0.1 — Pre-Alpha. Architecture locked. Core types in development.
APIs are unstable until v1.0.0.

| Package | Status |
|---|---|
| `rag_axis.core` | In development |
| `rag_axis.adapters` | Planned |
| `rag_axis.retrieval` | Planned |
| `rag_axis.context` | Planned |
| `rag_axis.generation` | Planned |
| `rag_axis.telemetry` | Planned |
| `rag_axis.bench` | Planned |

---

## Installation

```bash
pip install rag-axis
```

Requires Python 3.11+.

---

## Audience

This library is for engineers building production RAG systems.  
Not tutorials. Not demos. Not proof of concepts.

If you need something working in five minutes, use LangChain.  
If you need something you can trust in production, use rag-axis.

---

## Documentation

Full documentation, architecture, design principles, and invariants:  
[ragaxis.cenewayshorizon.com](https://ragaxis.cenewayshorizon.com)

Architecture overview: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/contributing/setup.md](docs/contributing/setup.md).

All PRs must pass the [invariant checklist](docs/contributing/invariants.md) before review.

---

## License

MIT — see [LICENSE](LICENSE).