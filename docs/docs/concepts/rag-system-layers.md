---
sidebar_position: 1
title: RAG System Layers
---

# RAG System Layers

A complete RAG system has three operational layers.
Understanding this model is required before using RAG Axis.

## Pre-Retrieval

Runs offline and asynchronously before any query arrives.
Failure here causes silent quality degradation, not user-facing errors.
The system keeps running and returning answers. The answers get worse.

Components: ingestion, chunking, embedding, indexing, corpus management.

Key risk: stale corpus, wrong chunking strategy, embedding model mismatch
between index time and query time.

## Retrieval Core

The live query pipeline. Runs on every user query.
Every millisecond is user-facing. Latency budget: 200ms to 2 seconds.
Failure here is immediate and visible.

Components: query processing, retrieval, reranking,
context assembly, generation, output validation.

Key risk: empty retrieval, score collapse, silent context truncation,
LLM ignoring retrieved context.

## System Layer

Runs continuously in the background.
Failure here is invisible in the short term but compounds over time.
No direct latency impact. Significant cost and quality impact.

Components: caching, observability, evaluation, corpus versioning, guardrails.

Key risk: no eval means blind to quality drift.
No caching means cost scales linearly with traffic.
No corpus versioning means stale answers with no signal.

## Why This Model Matters

Each layer has a different operational profile, failure consequence,
and latency budget. RAG Axis sub-packages are built and consumed
in system-building order: pre-retrieval first, retrieval core second,
system layer third.
