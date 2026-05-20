# rag-axis: Single Point of Reference

**A production contract layer for RAG systems.**
**Typed. Explicit. Observable. Composable.**

---

## 1. Vision & Mission

### Vision
rag-axis exists to make every RAG system run in production truthful, reproducible, and inspectable.

Not by hiding complexity. By making it explicit.

### The Problem
Production RAG systems fail silently. They return HTTP 200 with fluent, confident answers that are wrong. The failures are not LLM hallucinations. They are engineering failures:

- Retrieval that returns nothing useful
- Embedding model mismatch between index and query
- Context truncation that drops critical information
- Cost explosions from naive scaling
- Stale knowledge that answers with deprecated facts
- Unreproducible runs due to hidden configuration drift

Current libraries abstract these failures. Engineers discover them only after deployment in production.

### Mission
rag-axis is the production contract layer for RAG systems.

**Every RunResult answers six categories of truth:**

- Can I trust this answer?
- What did it depend on?
- How good was retrieval?
- What actually happened?
- What did it cost?
- Can I reproduce or compare it?

---

## 2. Core Philosophy

### Non-Negotiable Principles

**Explicit over Hidden**
Every failure mode must be visible. Complexity is not abstracted—it is explained through typed contracts and audit trails.

**Contracts over Abstractions**
Strong, typed boundaries between stages. Each layer has an explicit input and output contract. Composition is type-safe, not configuration-based.

**Truthful over Fluent**
We refuse to promise fluent answers. We promise truthful outcomes with complete audit trails. If retrieval fails, you know immediately. If context is truncated, it is logged. If confidence is unknown, it is a sentinel type, never None.

**Observable by Default**
Cost tracking, error events, audit trails, and spans are native to the system. Not bolted on. Not logs—return types. Not opt-in—opt-out only.

**Immutability as Enforcement**
State cannot drift silently between stages. All cross-layer boundaries are frozen dataclasses. Modification only via typed replacement. This prevents configuration debt and makes failures reproducible.

**No Auto-Configuration**
Every parameter is explicit. No magic. No smart defaults that hide tuning. You own every invariant.

---

## 3. The 7 Invariants (I1-I7)

These are non-negotiable. Every type, every function, every adapter must satisfy them.

### I1 — Provenance Enforcement
Every chunk carries immutable provenance metadata: parent document ID, position, embedding model ID. Missing provenance raises an error at initialization. Chunks never escape their origin.

### I2 — No Silent Failures
Content truncation, dropped information, or degraded retrieval must be explicitly logged in audit trails. No operation succeeds without reporting what was lost, why, and where.

### I3 — Confidence Calibration
All scores use typed confidence: either a float in [0, 1] or a ConfidenceUnknown sentinel. Unknown confidence is never None. Never implicit.

### I4 — Typed Error Hierarchy
Every failure is a named, typed exception. No bare Exception raises. The hierarchy is explicit: RagAxisError (fatal, system stops) → DegradedError (system continues, warning emitted) → specialized exceptions for each failure mode.

### I5 — No Provider Dependencies in Core
Core packages import no LLM SDK, no embedding library, no vector DB client. Reference implementations exist in adapters. Integrations use typing.Protocol with runtime_checkable decorators.

### I6 — Immutable Stage Boundaries
All cross-stage types are frozen dataclasses. Mutation only via dataclasses.replace(). This prevents silent state drift and makes every run reproducible by inspecting the output types.

### I7 — Cost Tracking Native
Every result (RetrievalResult, PipelineResult) embeds a CostReport with token counts, latency, and estimated cost per stage. Not in logs. In return types. Not aggregated later. Measured at execution.

---

## 4. Layered Architecture

rag-axis is organized as three lifecycle layers, not a monolithic pipeline. Each layer accepts a contract, performs transformations, and emits a frozen output contract.

### Layer 1: Index Layer
**Purpose:** Knowledge preparation and corpus management.

Takes raw documents and transforms them into an indexed, versioned, provenance-tracked corpus ready for retrieval.

**Responsibility:**
- Document ingestion and metadata extraction
- Chunking strategies (semantic, structural, fixed-size, hierarchical)
- Embedding and versioning
- Corpus version management and staleness tracking

**Output:** IndexedCorpus (frozen contract)

### Layer 2: Retrieval Layer
**Purpose:** Query execution and ranked chunk selection.

Takes a query and an indexed corpus, executes retrieval, detects degradation, and returns ranked chunks with confidence scores.

**Responsibility:**
- Dense retrieval (vector similarity)
- Sparse retrieval (term-based, inverted index)
- Hybrid fusion (score normalization, ranking)
- Pre-retrieval validation (embedder match, corpus staleness)
- Score collapse detection and warning
- Explicit audit of retrieval quality

**Input:** Query + IndexedCorpus
**Output:** RetrievalResult (frozen contract)

### Layer 3: Synthesis Layer
**Purpose:** Answer generation from retrieved context.

Takes retrieved chunks and the original query, assembles context, reranks, generates an answer with citations, and validates output.

**Responsibility:**
- Context assembly with relationship graph (ADJACENT, SHARED_ENTITY, SEMANTIC_OVERLAP, PARENT_CHILD)
- Intelligent truncation with audit trails
- Token budget enforcement
- Cross-encoder reranking and score recalibration
- Prompt assembly and output parsing
- Citation injection and link preservation
- Output guards and fallback strategies

**Input:** RetrievalResult + Query
**Output:** PipelineResult (frozen contract)

---

## 5. Layer Contracts

Each layer has explicit input and output contracts. These are immutable, versioned, and never modified in place.

### Index Layer Output: IndexedCorpus

Frozen dataclass representing the prepared knowledge base.

Contains:
- Collection of indexed chunks (each with Provenance: parent_doc_id, position, embedding_model_id)
- CorpusVersion metadata (embedding_model, creation_timestamp, corpus_id)
- Staleness metadata for detection
- CostReport for index construction

### Retrieval Layer Input & Output

**Input:** Query + IndexedCorpus

**Output: RetrievalResult**

Frozen dataclass containing:
- Ranked list of retrieved chunks with confidence scores
- Score range and score collapse detection flags
- Validation results (embedder match, corpus staleness)
- Audit trail of retrieval execution
- CostReport for retrieval stage

### Synthesis Layer Input & Output

**Input:** RetrievalResult + Query

**Output: PipelineResult**

Frozen dataclass containing:
- Generated answer text
- Citations and chunk references
- Context assembly metadata (chunks used, chunks truncated, budget remaining)
- Relationship graph (how chunks connect)
- Confidence on final answer
- Complete audit trail of truncation events
- CostReport for synthesis stage

### System Layer Output: RunResult

Frozen dataclass aggregating all three layers.

Contains:
- Original query and all inputs
- IndexedCorpus metadata
- RetrievalResult
- PipelineResult
- Aggregated CostReport (index, retrieval, synthesis breakdown)
- Complete audit trail across all stages
- Reproducibility metadata (version of all components)
- Failure signals and degradation warnings

---

## 6. Package Structure

Nine packages, each with clear scope and responsibility. Internal shared types (_types/, _protocols_, _errors_) are not part of the public API.

### ragaxis.core

**Scope:** Index Layer primitives and shared type contracts.

**Contains:**
- ingestion: Document loaders, metadata extraction, registry
- chunking: Chunking strategies (semantic, structural, fixed-size, hierarchical)
- corpus: CorpusVersion tracking, staleness detection, version locking

**Does NOT contain:** LLM, embedding, or vector store implementations. Those live in adapters.

**Public API:** Index layer operations and type imports.

### ragaxis.retrieval

**Scope:** Retrieval Layer end-to-end.

**Contains:**
- dense: Vector similarity search
- sparse: Term-based retrieval (BM25, SPLADE)
- hybrid: Fusion algorithms (RRF), score normalization
- validation: Pre-retrieval checks (embedder match, corpus staleness)
- scoring: Score collapse detection, confidence calibration

**Public API:** Query execution, RetrievalResult assembly.

### ragaxis.synthesis

**Scope:** Synthesis Layer end-to-end.

**Contains:**
- context: Context assembly, relationship graph, truncation audit, token budget
- reranking: Cross-encoder reranking, score recalibration
- generation: Prompt assembly, answer generation, citation injection
- guards: Output validation, fallback strategies

**Public API:** Answer generation, PipelineResult assembly.

### ragaxis.adapters

**Scope:** Concrete implementations of adapter protocols.

**Contains:**
- embedding: Batch embedding, version locking, cost tracking (OpenAI, Anthropic, Hugging Face, etc.)
- vector_store: VectorStoreAdapter implementations (Pinecone, Weaviate, Milvus, etc.)
- llm: LLMAdapter implementations (OpenAI, Anthropic, etc.)

**Note:** Core packages depend on _protocols (interface definitions). Adapters depend on both _protocols and concrete SDKs.

### ragaxis.system

**Scope:** Orchestration and lifecycle management across all three layers.

**Contains:**
- pipeline: Index → Retrieval → Synthesis composition
- executor: Cross-layer validation, error handling, lifecycle
- result: RunResult assembly, audit trail aggregation

**Public API:** End-to-end pipeline execution, RunResult output.

### ragaxis.bench

**Scope:** Evaluation and acceptance testing framework.

**Contains:**
- Phase-specific evals (index quality, retrieval quality, synthesis quality)
- Rapid evaluation harness
- Acceptance criteria per phase

**Public API:** Testing and validation utilities.

### ragaxis.otel

**Scope:** Observability and telemetry.

**Contains:**
- OTel span instrumentation (active by default, opt-out only)
- Evaluation hook dispatch
- Event routing

**Public API:** Telemetry configuration, span attachment points.

### ragaxis.ldk

**Scope:** Layer Development Kit—pre-wired, opinionated components for users who want to build RAG systems without deep customization.

**Contains:**
- index: Pre-composed ingestion + chunking + corpus (sensible defaults)
- retrieval: Pre-composed dense + sparse + RRF (default weights, k=60)
- synthesis: Pre-composed context + reranking + generation (default budgets)
- pipeline: Index → Retrieval → Synthesis end-to-end

**Philosophy:** Beginners start here. Understand the three-layer model by using it.

### ragaxis.server

**Scope:** Single-click deployable subsystem (REST/gRPC wrapper).

**Contains:**
- HTTP/gRPC endpoints wrapping core, retrieval, synthesis, system
- Configuration deserialization (YAML/JSON → typed dataclasses)
- Error serialization (RagAxisError → HTTP status codes)
- Adapter registration and management

**Note:** Shipped post-v1.0. Designed for serialization from the start.

---

## 7. Design Patterns

### Frozen Dataclasses for Immutability
All cross-layer boundary types are frozen dataclasses. This prevents silent mutation. State changes are explicit: construct new instances via dataclasses.replace(). This makes runs reproducible and auditable.

### Protocol-Based Adapter Integration
Adapters are defined as typing.Protocol with runtime_checkable decorators. Core packages never import concrete SDKs. Adapters plug in via protocol satisfaction, not inheritance. This decouples core from external dependencies and allows multiple implementations per interface.

### Typed Error Hierarchy
Errors follow a clear hierarchy: RagAxisError (fatal) → DegradedError (warning, system continues) → specialized exceptions (EmptyRetrievalError, EmbedderMismatchError, etc.). Every error is named and typed. No bare Exception raises.

### Audit Trails as First-Class Types
Truncation events, validation results, and retrieval quality metrics are not logged. They are structured types attached to result contracts (ContextTruncationEvent, ValidationResult, ScoreCollapseWarning). Audit trails flow through the return values, not side channels.

### Cost as Native Return Data
Cost tracking is not instrumentation bolted on. Every result embeds a CostReport with token counts, latency, and estimated cost per stage. Cost is visible immediately, not aggregated from logs later.

---

## 8. Adapter Integration

External systems (LLM providers, embedding models, vector stores) are integrated via Protocol contracts, not concrete dependencies.

### The Adapter Pattern

Each integration point (LLM, embedding, vector store) is defined as a Protocol that describes required methods and signatures. Implementations satisfy the protocol without inheriting from a base class.

Core packages define _protocols/:
- LLMAdapter: Completion interface
- EmbedderAdapter: Batch embedding interface with model_id tracking
- VectorStoreAdapter: Search and index interface with corpus_version validation

Concrete implementations live in ragaxis.adapters/:
- EmbedderAdapter: OpenAI, Anthropic, Hugging Face implementations
- VectorStoreAdapter: Pinecone, Weaviate, Milvus implementations
- LLMAdapter: OpenAI, Anthropic, etc. implementations

### Version Locking

Adapters validate that embedding_model_id in the query matches embedding_model_id in the indexed corpus. Mismatch raises EmbedderMismatchError immediately. This prevents silent retrieval degradation from model drift.

### Cost Tracking in Adapters

Adapters report cost metadata (tokens, latency) back to the calling layer. This cost is embedded in the result contract, not lost in logs.

---

## 9. Observable by Design

Observability is not an afterthought. It is wired into every decision.

### OpenTelemetry Spans
OTel instrumentation is active by default. Opt-out via TelemetryConfig, not opt-in. Every stage (index, retrieval, synthesis) emits spans with full context.

### Evaluation Hooks
Layers emit evaluation events (retrieval quality metrics, truncation decisions, score distributions) to an EvaluationHook interface. Hooks are routed through telemetry, not coupled to specific logging systems.

### Audit Trails
Every result carries structured audit trails: what happened, why it happened, what was lost. These are return types, not side channels.

### Cost Transparency
Every result embeds stage-level cost (tokens, latency, estimated dollars). No aggregation needed. Cost is visible at query time.

### Reproducibility Metadata
RunResult includes versions of all components, configuration snapshots, and corpus metadata. A saved RunResult can be compared or re-executed with full context.

---

## 10. LDK: User Progression Model

Users progress through three levels of complexity, with each level building on the previous.

### Beginner: Pre-Wired LDK
Start with ragaxis.ldk. Import pre-composed, opinionated components (index, retrieval, synthesis). Everything is wired correctly. Understand the three-layer model by using it.

Use cases: Building a quick RAG system, learning the architecture, proof-of-concept.

### Intermediate: Layer Composition
Graduate to ragaxis.retrieval, ragaxis.synthesis. Compose components from individual layers. Customize retrieval strategy (dense-only vs. hybrid), reranking threshold, truncation budget. Adapt to your domain.

Use cases: Domain-specific RAG (MedicalRAG, LegalRAG), custom retrieval algorithms, A/B testing strategies.

### Advanced: Core Primitives
Drop to ragaxis.core. Build adapters, custom chunking strategies, novel retrieval fusion algorithms. Own every invariant and contract.

Use cases: Research, full-stack ownership, custom RAG pipelines, exotic integrations.

---

## 11. Server Subsystem

rag-axis can be deployed as a single-click, self-hosted RAG subsystem that other services communicate with via REST or gRPC.

### Purpose
A complex AI system may embed RAG as one subsystem among many (agents, planning, memory, etc.). Instead of importing rag-axis as a library, teams deploy it as a service.

### Design Constraints

**Type Serialization:** All _types (Provenance, ConfidenceScore, RunResult) must serialize to JSON or protobuf. Designed from the start with POD (plain old data) structures.

**Configuration Management:** Configuration is deserialized from YAML/JSON into typed dataclasses. No dynamic loading of arbitrary Python modules. Pre-built adapters are registered by name.

**Error Codes:** RagAxisError and subclasses map to HTTP status codes. Clients understand failure modes by status code and error type name.

**Adapter Registration:** Adapters are instantiated server-side. Clients specify which adapter by name and configuration, not by providing custom code.

### Deployment Model
Runs as a standalone service (Docker container, Kubernetes pod). Exposes REST or gRPC endpoints. Clients send queries, receive RunResult objects. The server handles Index Layer caching, Retrieval, Synthesis, and returns complete RunResults with audit trails.

---

## 12. Intended Audiences

rag-axis is designed for four groups. Each group uses different packages and entry points.

### Group 1: Core Engineers
Direct users of ragaxis.core, ragaxis.retrieval, ragaxis.synthesis.

Build RAG from primitives. Own every invariant and contract. Full control over every stage.

Use cases: Custom RAG pipelines, research, full-stack ownership, exotic integrations.

### Group 2: Layer Builders
Primary audience for ragaxis.ldk and layer composition.

Need a production RAG layer fast. Want pre-built components wired correctly. Accept truthful failure signals.

Use cases: Company-specific RAG, domain-specific RAG (MedicalRAG, LegalRAG), A/B testing retrieval strategies.

### Group 3: Experimenters
Users of ragaxis.ldk.retrieval and ragaxis.bench.

Test new retrieval strategies, chunking algorithms, rerankers. Need rag-axis contracts but flexible internals.

Use cases: ML research, algorithm prototyping, evaluating novel fusion strategies.

### Group 4: Subsystem Deployers
Users of ragaxis.server.

Want a self-hosted RAG subsystem (REST/gRPC). Deploy as a service, not inline library. Own the infrastructure.

Use cases: Infrastructure teams, managed RAG services, complex AI systems integrating RAG as one layer.

---

## 13. Key Constraints & Non-Goals

### What rag-axis Refuses to Do

**Does NOT hide failures behind generic exceptions.**
Every failure is named, typed, and explicit. EmptyRetrievalError is not an Exception—it is a specific contract violation.

**Does NOT auto-configure anything.**
No magic defaults. No "smart" parameter selection. Every parameter is explicit. You own every invariant.

**Does NOT promise fluent answers over truthful outcomes.**
We refuse the fluency trap. A wrong answer confidently delivered is worse than truthful degradation signals. We optimize for truth.

**Does NOT abstract complexity away instead of making it explicit.**
Complexity is not hidden in libraries. It is made explicit through types, audit trails, and error contracts.

**Does NOT depend on external SDKs in core packages.**
Core is not LangChain or LlamaIndex. It does not bundle OpenAI, Anthropic, or Pinecone. Core is a contract layer. Adapters connect external systems.

**Does NOT allow silent mutation of cross-stage data.**
All boundaries are frozen. Immutability is enforced, not optional.

**Does NOT log side-channel data.**
Cost, audit trails, and metrics are return types, not logs. No async log parsing to understand what happened.

### What rag-axis Is NOT

Not a LangChain/LlamaIndex replacement by feature parity.
Not a beginner-friendly tutorial library.
Not a multi-agent orchestration framework.
Not auto-configuring anything.
Not abstracting production concerns away.

---

## 14. Type Safety & Immutability as Enforcement

Immutability is not a code style choice. It is a design mechanism that prevents silent failures and makes systems reproducible.

### Frozen Dataclasses Prevent Drift
Cross-stage types are frozen. Mutation only via dataclasses.replace(). This prevents:
- Silent configuration changes between stages
- Unauthorized modification of audit trails
- State drift that makes runs unreproducible

### Typed Contracts Prevent Composition Errors
Each layer accepts a specific input contract. Type checkers catch mismatches at development time, not runtime. You cannot pass a RetrievalResult where an IndexedCorpus is expected.

### Immutability Makes Reproducibility Possible
A saved RunResult contains everything needed to understand and reproduce the run. No external state. No logs to parse. Just return types.

### Cost Tracking Via Type System
Cost is not an optional log message. It is embedded in the return type. Every result includes cost. No aggregation needed. No logs to parse.

### Confidence as a Sentinel Type
Confidence is float | ConfidenceUnknown. Never None. Never implicit. The type system enforces truthfulness.

---

## Summary

rag-axis is a production contract layer for RAG systems. It makes complexity explicit, failures loud, and outcomes truthful. It does not hide engineering realities. It exposes them through types, audit trails, and cost tracking.

The three-layer architecture (Index, Retrieval, Synthesis) reflects the actual lifecycle of RAG. Immutable contracts between layers prevent silent failures. Adapter protocols decouple core from external dependencies. Observable by design means cost and audit trails are native, not bolted on.

Users progress from LDK (pre-wired) to layer composition to core primitives. Teams deploy as a library or as a self-hosted subsystem. The architecture scales from experimental notebooks to production infrastructure.

**The invariants are not negotiable. The contracts are sacred. The RunResult tells you everything that happened, why it happened, and whether you can trust it.**
