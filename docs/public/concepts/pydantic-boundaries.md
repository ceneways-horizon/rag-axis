# Pydantic Usage Boundaries

## The Problem

Pydantic BaseModel instantiation is approximately 8x more expensive
than a standard Python class. Using it for internal domain objects
introduces measurable overhead on the hot path.

## Four Rules

**Rule 1 — Pydantic at Boundaries Only**
BaseModel is used only at external boundaries:
config ingestion, provider response parsing, user-facing API types.

**Rule 2 — Frozen Dataclasses for Domain Objects**
Document, Chunk, CostReport, and all internal pipeline objects
are @dataclass(frozen=True). Immutable. Zero validation overhead.

**Rule 3 — TypedDict for Wire Types**
Raw provider responses before validation are TypedDict.
Zero runtime cost. Parsed once at the adapter boundary.

**Rule 4 — Discriminated Unions for Stage Results**
RetrievalResult and PipelineResult are Pydantic discriminated unions
because they cross stage boundaries and must be pattern-matched by type.
This is the one justified exception to Rule 1 inside the pipeline.

## The Boundary Model
External Boundary Internal Pipeline
──────── ──────── ─────────────────
User Config → BaseModel → @dataclass(frozen=True)
Provider Resp → TypedDict → BaseModel validate → @dataclass
Stage Result → Discriminated Union (crosses stage boundaries)
```
Validate once. Pass frozen objects through. Never validate twice.
```
