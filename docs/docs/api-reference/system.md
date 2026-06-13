---
sidebar_position: 6
title: System API Reference
---

# System API Reference

The system layer covers the packages that run continuously in the background rather than on the live query path: `ragaxis.guards`, `ragaxis.cache`, `ragaxis.telemetry`, and `ragaxis.bench`.

`ragaxis.telemetry` emits OpenTelemetry spans for every stage of a run as a non-optional part of the pipeline, along with cost aggregation and structured logging via structlog. `ragaxis.bench` defines the `EvaluationHook` Protocol and bridges to evaluation frameworks such as RAGAS, DeepEval, and TruLens, so that quality drift is measured continuously rather than discovered after the fact.

A complete background run is represented as a `RunResult`, which aggregates telemetry and evaluation output across a batch of pipeline executions.

Detailed type-by-type and function-by-function reference will be published as the system layer's public API stabilizes.
