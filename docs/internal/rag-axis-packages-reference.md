# rag-axis: Package Reference

**Single point of reference for all 9 packages in rag-axis.**

Each package has explicit scope, responsibility, dependencies, and public API surface.

---

## 1. ragaxis.core

**Purpose:** Index Layer primitives and shared type contracts

**Responsibility:**
- Define all shared types (Provenance, Cost, ConfidenceScore, exceptions)
- Implement Index Layer: ingestion, chunking, corpus versioning
- Define adapter protocols (interfaces, not implementations)
- Enforce the 7 Invariants (I1-I7) at the type level

**Scope:**
- `ingestion/` — Document loaders, metadata extraction, registry
- `chunking/` — Fixed-size, semantic, structural, hierarchical chunking strategies
- `corpus/` — CorpusVersion tracking, staleness detection, version locking

**Internal Modules (not public):**
- `_types/` — Provenance, IndexedCorpus, Cost, ConfidenceScore, [others from Tier 1 contracts]
- `_protocols/` — LLMAdapter, EmbedderAdapter, VectorStoreAdapter (typing.Protocol only)
- `_errors/` — RagAxisError hierarchy (from Tier 1 error taxonomy)

**Dependencies:**
- stdlib: dataclasses, typing, uuid
- pydantic (for validation)
- Nothing else (no external SDKs)

**Public API Surface:**
```
from ragaxis.core import (
    Provenance, IndexedCorpus, CorpusVersion,
    Cost, ConfidenceScore,
    RagAxisError, DegradedError, [specific errors],
    ingest_documents, chunk_documents, prepare_corpus
)
```

**Phase Shipped:** Phase 0

**What Users Do:**
- Prepare knowledge: ingest docs → chunk → create IndexedCorpus
- Understand: read Provenance metadata, check CostReport

---

## 2. ragaxis.retrieval

**Purpose:** Retrieval Layer end-to-end

**Responsibility:**
- Execute dense retrieval (vector search)
- Execute sparse retrieval (term-based)
- Fuse rankings (hybrid)
- Detect score collapse
- Validate pre-retrieval (embedder match, corpus staleness)
- Emit audit trail events

**Scope:**
- `dense/` — Vector similarity search, scoring
- `sparse/` — BM25, SPLADE implementations
- `hybrid/` — RRF fusion, score normalization
- `validation/` — Pre-retrieval checks (embedder mismatch, corpus version)
- `scoring/` — Score collapse detection, confidence calibration

**Internal Modules:**
- `_types/` — RankedChunk, RetrievalResult, audit event types
- `_errors/` — EmptyRetrievalError, EmbedderMismatchError, ScoreCollapseWarning, [from Tier 1]
- `_protocols/` — Uses VectorStoreAdapter, EmbedderAdapter from core

**Dependencies:**
- ragaxis.core
- No external vector DB or embedding SDKs (uses adapters)

**Public API Surface:**
```
from ragaxis.retrieval import (
    execute_retrieval,  # main entry point
    RetrievalResult,
    EmptyRetrievalError, EmbedderMismatchError, ScoreCollapseWarning
)
```

**Phase Shipped:** Phase 1

**What Users Do:**
- Query execution: execute_retrieval(query, indexed_corpus, config)
- Inspect results: check RetrievalResult.chunks, scores, audit_trail, cost_report

---

## 3. ragaxis.synthesis

**Purpose:** Synthesis Layer end-to-end

**Responsibility:**
- Assemble context from retrieved chunks
- Build relationship graph
- Truncate intelligently with audit trail
- Enforce token budget
- Rerank (cross-encoder)
- Generate answer with citations
- Validate output

**Scope:**
- `context/` — Context assembly, relationship graph, truncation audit, budget enforcement
- `reranking/` — Cross-encoder rescoring, confidence recalibration
- `generation/` — Prompt assembly, answer generation, output parsing
- `guards/` — Input validation, output validation, fallback strategies

**Internal Modules:**
- `_types/` — ContextAssembly, TruncationEvent, PipelineResult, event types
- `_errors/` — ContextBudgetExceededError, GenerationError, CitationError, [from Tier 1]
- `_protocols/` — Uses LLMAdapter from core

**Dependencies:**
- ragaxis.core
- ragaxis.retrieval
- No external LLM SDKs (uses adapters)

**Public API Surface:**
```
from ragaxis.synthesis import (
    synthesize,  # main entry point
    PipelineResult,
    ContextBudgetExceededError, GenerationError, CitationError
)
```

**Phase Shipped:** Phase 2

**What Users Do:**
- Answer generation: synthesize(retrieval_result, query, config)
- Inspect results: check PipelineResult.answer, citations, truncation_audit, confidence

---

## 4. ragaxis.adapters

**Purpose:** Concrete adapter implementations (LLM, embedding, vector store)

**Responsibility:**
- Implement EmbedderAdapter (OpenAI, Anthropic, Hugging Face, etc.)
- Implement VectorStoreAdapter (Pinecone, Weaviate, Milvus, etc.)
- Implement LLMAdapter (OpenAI, Anthropic, etc.)
- Handle external SDK integration
- Enforce adapter protocols from core

**Scope:**
- `embedding/` — Batch embedding, version locking, cost tracking
  - openai.py, anthropic.py, hugging_face.py, [others]
- `vector_store/` — VectorStoreAdapter implementations
  - pinecone.py, weaviate.py, milvus.py, [others]
- `llm/` — LLMAdapter implementations
  - openai.py, anthropic.py, [others]

**Internal Modules:**
- `_utils/` — Cost calculation, error handling, retries (shared across adapters)

**Dependencies:**
- ragaxis.core (protocols only)
- External SDKs: openai, pinecone, weaviate, etc. (per adapter)

**Public API Surface:**
```
from ragaxis.adapters.embedding import OpenAIEmbedder
from ragaxis.adapters.vector_store import PineconeVectorStore
from ragaxis.adapters.llm import OpenAILLM
```

**Phase Shipped:** Parallel with Phase 0 (used by Phase 0 tests and upward)

**What Users Do:**
- Instantiate adapters: `embedder = OpenAIEmbedder(model="text-embedding-3-large")`
- Pass to layers: `indexed_corpus = prepare_corpus(docs, embedder=embedder, ...)`

---

## 5. ragaxis.system

**Purpose:** Orchestration and lifecycle management across all three layers

**Responsibility:**
- Compose Index → Retrieval → Synthesis pipeline
- Cross-layer validation and error handling
- Manage lifecycle (from query to RunResult)
- Aggregate audit trails, costs, metadata
- Assemble RunResult

**Scope:**
- `pipeline/` — Pipeline composition, execution order
- `executor/` — Lifecycle management, error handling
- `result/` — RunResult assembly, audit aggregation

**Internal Modules:**
- `_types/` — RunResult, reproducibility metadata
- `_errors/` — PipelineExecutionError

**Dependencies:**
- ragaxis.core
- ragaxis.retrieval
- ragaxis.synthesis

**Public API Surface:**
```
from ragaxis.system import (
    RAGPipeline,  # main orchestrator
    execute_pipeline,  # end-to-end execution
    RunResult
)
```

**Phase Shipped:** Phase 3

**What Users Do:**
- Create pipeline: `pipeline = RAGPipeline(index_config, retrieval_config, synthesis_config)`
- Execute: `run_result = pipeline.execute(query, indexed_corpus)`
- Inspect: RunResult has everything (audit, cost, reproducibility, all layers)

---

## 6. ragaxis.bench

**Purpose:** Evaluation and acceptance testing framework

**Responsibility:**
- Define acceptance criteria per phase
- Provide rapid evaluation harness
- Test layer isolation and integration
- Measure quality metrics (retrieval, synthesis, cost)

**Scope:**
- `phase_0/` — Acceptance tests for Index Layer
- `phase_1/` — Acceptance tests for Retrieval Layer
- `phase_2/` — Acceptance tests for Synthesis Layer
- `phase_3/` — Acceptance tests for System Layer
- `fixtures/` — Shared test data, mocks, fixtures
- `metrics/` — Quality measurement (recall, precision, diversity, cost)

**Dependencies:**
- ragaxis.core, ragaxis.retrieval, ragaxis.synthesis, ragaxis.system
- pytest (testing framework)

**Public API Surface:**
```
from ragaxis.bench import (
    get_test_corpus,  # test data
    mock_embedder, mock_vector_store, mock_llm,  # mocks
    acceptance_criteria,  # phase requirements
    evaluate_retrieval_quality, evaluate_synthesis_quality
)
```

**Phase Shipped:** Parallel (used to validate each phase)

**What Users Do:**
- Validate phases: run acceptance tests to know when phase is done
- Prototype: use mocks to test components in isolation

---

## 7. ragaxis.otel

**Purpose:** Observability and telemetry

**Responsibility:**
- OTel span instrumentation (active by default)
- Evaluation hook dispatch
- Event routing (audit events → telemetry)
- Configurable telemetry (opt-out only)

**Scope:**
- `spans/` — OTel span creation and attachment
- `hooks/` — EvaluationHook protocol and dispatcher
- `config/` — TelemetryConfig (what to instrument, what to disable)
- `events/` — Event routing (ContextTruncationEvent → OTel, etc.)

**Dependencies:**
- ragaxis.core
- opentelemetry-api (for span creation)

**Public API Surface:**
```
from ragaxis.otel import (
    TelemetryConfig,
    get_active_span,  # for manual span attachment
    emit_event  # manual event emission
)
```

**Phase Shipped:** Phase 3 (wired into layers post-Phase 2)

**What Users Do:**
- Enable telemetry: `config = TelemetryConfig(enabled=True)`
- Disable specific spans: `config.disable_synthesis_spans = True`
- Export spans: configure OTel exporter (Jaeger, Datadog, etc.)

---

## 8. ragaxis.ldk

**Purpose:** Layer Development Kit — pre-wired, opinionated components for beginners

**Responsibility:**
- Provide pre-composed, default-configured layers
- Teach the 3-layer model through usage
- Lower barrier to entry for new users
- Abstract component wiring, not complexity

**Scope:**
- `index/` — Pre-composed Index Layer (default chunking, embedding, corpus prep)
- `retrieval/` — Pre-composed Retrieval Layer (default dense + sparse + RRF, k=60)
- `synthesis/` — Pre-composed Synthesis Layer (default context budget, reranking, generation)
- `pipeline/` — End-to-end Index → Retrieval → Synthesis (one function call)

**Dependencies:**
- ragaxis.core, ragaxis.retrieval, ragaxis.synthesis, ragaxis.system
- ragaxis.adapters (default implementations)

**Public API Surface:**
```
from ragaxis.ldk import (
    prepare_index,  # index layer, sensible defaults
    execute_retrieval,  # retrieval layer, sensible defaults
    generate_answer,  # synthesis layer, sensible defaults
    RAG  # end-to-end, all three layers
)
```

**Phase Shipped:** Post-Phase 2 (or Phase 1 bonus, depends on scope)

**What Users Do (Beginner Journey):**
1. `from ragaxis.ldk import RAG` → works immediately
2. Read how RAG uses layers → understand architecture
3. Graduate to `from ragaxis.retrieval import execute_retrieval` → customize
4. Drop to `from ragaxis.core import ingest_documents` → full control

---

## 9. ragaxis.server

**Purpose:** Single-click deployable RAG subsystem

**Responsibility:**
- Wrap core, retrieval, synthesis, system in HTTP/gRPC endpoints
- Deserialize YAML/JSON config → typed dataclasses
- Serialize errors → HTTP status codes
- Manage adapter registration and lifecycle
- Serve as subsystem in larger AI systems

**Scope:**
- `http/` — FastAPI or similar HTTP server
- `grpc/` — gRPC service definitions (if applicable)
- `config/` — Config deserialization, validation
- `adapters/` — Adapter instantiation, registration
- `middleware/` — Request validation, error handling, telemetry
- `dev/` — Development server, hot reload (for local testing)

**Dependencies:**
- ragaxis.core, ragaxis.retrieval, ragaxis.synthesis, ragaxis.system
- fastapi (or similar HTTP framework)
- pydantic (config validation)

**Public API Surface:**
```
# Server runs as standalone service
# Clients send HTTP POST /query with { query, corpus_id, config }
# Server returns { answer, citations, audit_trail, cost_report, ... }
```

**Phase Shipped:** Post-v1.0 (v2.0+) as development server, parallel for testing

**What Users Do:**
- Deploy: `docker run ragaxis-server`
- Query: `curl -X POST http://localhost:8000/query -d '{"query": "...", "corpus_id": "..."}'`
- Integrate: call from agents, orchestration layers, other services

---

## Summary Table

| Package | Purpose | Phase | Dependency Graph |
|---------|---------|-------|------------------|
| **core** | Shared types, Index Layer | 0 | None (stdlib + pydantic) |
| **retrieval** | Retrieval Layer | 1 | core |
| **synthesis** | Synthesis Layer | 2 | core + retrieval |
| **adapters** | Concrete integrations | 0+ | core only |
| **system** | Orchestration | 3 | core + retrieval + synthesis |
| **bench** | Testing framework | 0+ | all (parallel) |
| **otel** | Observability | 3 | core (wired into layers) |
| **ldk** | Pre-wired components | 1+ | core + retrieval + synthesis |
| **server** | Deployable subsystem | 2.0+ | all (parallel for testing) |

---

## Internal Modules Across All Packages

Every package has (optionally):
- `_types/` — Internal type definitions (not exported)
- `_protocols/` — Internal protocol definitions (not exported)
- `_errors/` — Internal error subclasses (exported as public errors)
- `_utils/` — Internal utilities (cost calc, validation, etc.)

**Rule:** Anything prefixed with `_` is implementation detail. Users import from top level.

---

## What's NOT in Any Package

- ❌ Auto-configuration (no magic defaults)
- ❌ Provider lock-in (no hardcoded OpenAI, Pinecone, etc. in core)
- ❌ Framework coupling (not a FastAPI plugin, not a Django middleware)
- ❌ Side-channel logging (events are return types, not logs)
- ❌ Implicit state (frozen dataclasses everywhere)

---

## How Packages Grow

**During Phase 0-3:** Packages are minimal, focused on contracts.
**Post-v1.0:** Packages expand with convenience wrappers, integrations, but contracts remain stable.
**v1.0 → v3.0:** Contract stability. Major version bump only if contracts break. Semver enforced.
