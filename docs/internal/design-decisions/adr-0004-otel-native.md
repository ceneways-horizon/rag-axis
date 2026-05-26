# ADR-0004: OpenTelemetry as Native Non-Optional Telemetry

## Status
Accepted

## Context
Production RAG failures are predominantly silent — the system returns HTTP 200
with a confident but incorrect response. Without per-stage span tracing,
engineers cannot identify which pipeline stage introduced the failure.
Telemetry that requires opt-in is rarely enabled until after the first
production incident.

## Decision
rag_axis.telemetry emits OpenTelemetry spans automatically for every
pipeline stage. No opt-in required. Engineers can route spans to any
OTel-compatible backend (Datadog, Grafana, Jaeger) without touching
pipeline code. Disabling telemetry requires explicit opt-out.

## Consequences
- Every pipeline execution is traceable from ingestion to generation
- TTFT, retrieval latency, reranking latency, and token counts per stage
  are available without additional instrumentation
- Adds opentelemetry-sdk as a core dependency of rag_axis.telemetry
- Engineers must configure an OTel exporter for production use

## Alternatives Considered
- **structlog only**: Rejected. Logs are not traces. Cannot reconstruct
  stage-level latency or causal chains from logs alone.
- **Opt-in telemetry**: Rejected. Violates P1 (Zero Silent Failures).
  Telemetry that is off by default is telemetry that does not exist in production.
- **Custom metrics format**: Rejected. Vendor lock-in. OTel is the standard.
