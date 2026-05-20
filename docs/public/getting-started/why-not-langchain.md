---
title: "Why Not LangChain"
description: "An honest, evidence-backed comparison of rag-axis against LangChain and LlamaIndex."
---

# Why Not LangChain

This is not a criticism of LangChain. It is a positioning statement.

## Different Goals

| | LangChain / LlamaIndex | rag-axis |
|---|---|---|
| Primary goal | Rapid prototyping, broad coverage | Production correctness, explicit contracts |
| Failure handling | Generic exceptions, often silent | Named types, mandatory signals |
| Cost tracking | Optional, plugin-based | Core return type on every result |
| Adapter boundary | Class inheritance | `typing.Protocol` — zero coupling |
| Abstraction philosophy | Abstract complexity away | Make complexity explicit and manageable |
| Target user | Anyone building with LLMs | Engineers owning production RAG systems |

## When to Use LangChain

- You need a working prototype in hours
- You are exploring capabilities across many providers
- You are building a demo or tutorial

## When to Use rag-axis

- You are building a RAG system that will be in production
- You need per-stage cost and latency visibility
- You need retrieval failures to be named, typed, and catchable
- You need your pipeline to be independently testable at every stage

<Warning>
  rag-axis is not a drop-in replacement for LangChain. It is a different tool for a different job.
</Warning>
