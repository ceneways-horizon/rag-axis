---
title: "What is rag-axis"
description: "Production contract layer for RAG systems — typed, explicit, observable, composable."
---

# What is rag-axis

Every production RAG system fails in the same ways: silent retrieval degradation, embedding model mismatch, untracked cost explosions, and context assembly that drops critical information without logging it.

rag-axis does not abstract these problems away. It makes them impossible to hide.

## Core Guarantees

- **Zero silent failures** — every failure mode has a name and a type
- **Cost visibility** — every result carries tokens consumed, latency, and estimated cost per stage
- **Explicit over magic** — no hidden routing, no undocumented behaviour
- **Immutable results** — pipeline results cannot be mutated between stages
- **Typed adapters** — LLM, embedder, and vector store boundaries enforced via Protocol

## Who This Is For

Engineers building production RAG systems. Not tutorials. Not demos.

If you need something working in five minutes, use LangChain.
If you need something you can trust in production, use rag-axis.

<Info>
  Full architecture overview: [ARCHITECTURE.md](https://github.com/saiharsha-k/rag-axis/blob/main/ARCHITECTURE.md)
</Info>
