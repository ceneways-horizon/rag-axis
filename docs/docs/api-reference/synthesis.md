---
sidebar_position: 4
title: Synthesis API Reference
---

# Synthesis API Reference

`ragaxis.synthesis` covers the final stages of the Retrieval Core layer: context assembly, the LLM generation call, output parsing, and citation injection.

Context assembly enforces the `ContextBudget` passed into it, deduplicates overlapping chunks, orders them to reduce lost-in-the-middle effects, and emits a `ContextTruncationEvent` if any chunk has to be dropped (invariant I2). Generation produces a `PipelineResult`, which includes the answer, the chunks used to produce it, and a `CostReport` covering every stage of the run.

Detailed type-by-type and function-by-function reference will be published as the synthesis package's public API stabilizes.
