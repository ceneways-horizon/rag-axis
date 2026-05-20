# Packages: The 9 Building Blocks

**rag-axis is organized into 9 packages, each with a clear responsibility.**

Understanding the packages helps you know where to look, what to import, and how to extend the system.

---

## The Big Picture

Think of rag-axis like a modular factory:

- **Three Production Lines** (core, retrieval, synthesis) → produce the RAG pipeline
- **Integration Station** (adapters) → plugs in external tools
- **Quality Control** (bench) → validates everything works
- **Monitoring Station** (otel) → watches what's happening
- **Convenience Shop** (ldk) → pre-packaged solutions for beginners
- **Shipping Department** (system) → orchestrates and delivers
- **Service Window** (server) → deployed as a subsystem

Each has a purpose. Each serves a different need.

---

## 1. ragaxis.core — Foundation Layer

**Purpose:** Shared types, Index Layer implementation, adapter interfaces

**What It Provides**

The foundation of everything. Core defines:
- **Shared types** that all layers understand (Provenance, Cost, ConfidenceScore, exceptions)
- **Index Layer** implementation (ingestion, chunking, corpus versioning)
- **Adapter protocols** (LLMAdapter, EmbedderAdapter, VectorStoreAdapter) that other packages implement

**What It Does NOT Do**

- Import any LLM SDK (OpenAI, Anthropic, etc.)
- Import any embedding library
- Import any vector database client

This keeps core lightweight and decoupled.

**Who Uses It**

- Index Layer builders (ingest documents, create indexed corpus)
- Developers extending rag-axis
- Type checkers (mypy uses core types)

**Real Example**

You have company documents (financial reports, product specs, team wikis). You use `ragaxis.core` to:
- Load documents
- Split them into chunks
- Prepare metadata (provenance, versioning)
- Output an IndexedCorpus ready for retrieval

The IndexedCorpus is frozen and versioned—you can store it, share it, or archive it.

**When It Ships**

Phase 0 (first delivery)

---

## 2. ragaxis.retrieval — Retrieval Layer

**Purpose:** Search the indexed knowledge base and rank results

**What It Provides**

End-to-end retrieval:
- Dense retrieval (semantic similarity via embeddings)
- Sparse retrieval (term-based, like search engines)
- Hybrid fusion (combine both strategies)
- Score collapse detection (warn when quality is weak)
- Pre-retrieval validation (ensure embedder model hasn't drifted)

Takes a query and an IndexedCorpus, returns ranked chunks with confidence scores and audit trails.

**Who Uses It**

- RAG pipeline builders
- Search engine builders
- Anyone needing semantic + keyword search

**Real Example**

User asks: "What is our quarterly revenue?"

`ragaxis.retrieval`:
- Embeds the query
- Searches dense index (semantic similarity)
- Searches sparse index (keyword match: "quarterly", "revenue")
- Fuses rankings (hybrid)
- Returns top 10 results with scores
- Emits audit trail: "Retrieved 10 of 500 chunks, score range 0.75-0.92"

The audit trail tells you: quality was good (high scores, narrow range). The output is a RetrievalResult you can trust.

**When It Ships**

Phase 1 (second delivery)

---

## 3. ragaxis.synthesis — Synthesis Layer

**Purpose:** Generate answers from retrieved chunks

**What It Provides**

End-to-end answer generation:
- Context assembly (arrange chunks intelligently)
- Relationship graph (understand how chunks connect)
- Intelligent truncation (fit within token budget, log what was dropped)
- Cross-encoder reranking (fine-tune chunk order with LLM)
- Answer generation (feed context to LLM)
- Citation injection (link answer back to sources)
- Output validation (sanity checks)

Takes a RetrievalResult and the original query, returns an answer with citations and full audit trail.

**Who Uses It**

- Full RAG pipeline builders
- Answer generation systems
- Anyone needing citations and source tracking

**Real Example**

Given retrieved chunks about quarterly revenue, `ragaxis.synthesis`:
- Understands which chunks are adjacent (from same section)
- Understands which chunks mention same entities (connected concepts)
- Fits chunks into 4,000 token budget (logs what was dropped and why)
- Optional: reranks top chunks to best order
- Feeds context to LLM with prompt
- Parses LLM output: "The revenue was $50M"
- Injects citations: "See chunk 3 from financial-report-q1"
- Validates: "Answer mentions revenue and is reasonable length"

Output is a PipelineResult with answer, citations, and complete audit trail of what happened.

**When It Ships**

Phase 2 (third delivery)

---

## 4. ragaxis.adapters — Integration Station

**Purpose:** Concrete implementations of LLM, embedding, and vector store integrations

**What It Provides**

Plug-and-play implementations:
- **Embedding adapters** — OpenAI, Anthropic, Hugging Face (batch embed, version lock, cost track)
- **Vector store adapters** — Pinecone, Weaviate, Milvus (semantic search, version validation)
- **LLM adapters** — OpenAI, Anthropic (completions, token counting, cost tracking)

Core defines protocols (interfaces). Adapters implement them for specific providers.

**Why It's Separate**

Core doesn't import OpenAI SDK. That's in adapters. This means:
- You only install the adapters you use
- Core stays lightweight
- You can add new adapters without changing core

**Who Uses It**

- Anyone deploying rag-axis (must choose adapters for their stack)
- Teams building custom adapters for proprietary systems

**Real Example**

Your team uses:
- OpenAI for embeddings
- Pinecone for vector store
- Anthropic for LLM

You install:
```
ragaxis.adapters[openai,pinecone,anthropic]
```

Now you can instantiate:
```python
embedder = OpenAIEmbedder(api_key="...")
vector_store = PineconeVectorStore(index_name="...")
llm = AnthropicLLM(api_key="...")
```

And pass them to the layers. Each adapter handles cost tracking, error handling, and timeout logic for its provider.

**When It Ships**

Parallel with Phase 0 (needed for testing and early deployments)

---

## 5. ragaxis.system — Orchestration & Lifecycle

**Purpose:** Compose all three layers and produce RunResult

**What It Provides**

End-to-end pipeline orchestration:
- Manages Index → Retrieval → Synthesis execution flow
- Cross-layer validation and error handling
- Aggregates costs across all stages
- Aggregates audit trails from all layers
- Produces RunResult (the complete, immutable result)

Think of it as the conductor of an orchestra—each layer is an instrument, system makes sure they play in harmony.

**Who Uses It**

- Full RAG system builders
- Anyone needing a complete, reproducible pipeline

**Real Example**

You call:
```python
result = pipeline.execute(query="What is our revenue?", corpus=indexed_corpus)
```

Under the hood, `ragaxis.system`:
1. Calls Retrieval Layer (gets RetrievalResult)
2. Checks: "Did retrieval succeed?"
3. If yes, calls Synthesis Layer (gets PipelineResult)
4. Checks: "Did synthesis succeed?"
5. Aggregates: costs, audit trails, metadata
6. Returns RunResult with everything

RunResult is frozen—immutable, reproducible, auditable. You can save it and replay it later.

**When It Ships**

Phase 3 (fourth delivery)

---

## 6. ragaxis.bench — Quality Control

**Purpose:** Evaluation and acceptance testing

**What It Provides**

- **Test fixtures** — Pre-built test data, mock adapters, sample corpus
- **Acceptance criteria** — Phase completion checklists
- **Evaluation metrics** — Measure retrieval quality, answer quality, cost efficiency
- **Test harness** — Run rapid evaluations without full infrastructure

Helps you know: "Is my Phase 0 done? Is my retrieval quality acceptable?"

**Who Uses It**

- Development team (validate each phase)
- Teams writing custom components (verify they meet invariants)

**Real Example**

Phase 1 (Retrieval) is done when:
- RetrievalResult always includes audit trails ✓
- Score collapse is detected and warned ✓
- Pre-retrieval validation works (embedder match checked) ✓
- Cost tracking is present ✓

`ragaxis.bench` lets you run acceptance tests to confirm all four before moving to Phase 2.

**When It Ships**

Parallel with Phase 0 (used immediately for validation)

---

## 7. ragaxis.otel — Observability

**Purpose:** Telemetry and monitoring

**What It Provides**

- **OpenTelemetry spans** — Active by default (opt-out only)
- **Evaluation hooks** — Route layer events to monitoring systems
- **Event routing** — Audit events (truncation, score collapse) → OTel → datadog/datadog/honeycomb/etc.
- **Configuration** — Enable/disable specific instrumentation

Lets you see what's happening in production without parsing logs.

**Who Uses It**

- DevOps and SRE teams
- Anyone needing production observability
- Data teams measuring RAG quality over time

**Real Example**

In production, otel automatically emits spans:
- Retrieval span: latency, chunk count, score range
- Synthesis span: tokens used, reranking applied, generation latency
- Truncation event: chunks dropped, position, reason

You configure OTel exporter (Datadog, Jaeger, etc.) once. Events flow automatically. No code changes needed.

**When It Ships**

Phase 3 (wired into layers post-Phase 2)

---

## 8. ragaxis.ldk — Convenience Shop (Pre-Wired Components)

**Purpose:** Pre-configured, opinionated components for beginners

**What It Provides**

Ready-to-use functions:
- `prepare_index(docs, config)` — Index Layer with sensible defaults
- `execute_retrieval(query, corpus, config)` — Retrieval Layer with sensible defaults
- `generate_answer(retrieval_result, query, config)` — Synthesis Layer with sensible defaults
- `RAG(...)` — Full end-to-end pipeline, one function call

For beginners who want: "Just make RAG work."

**Philosophy**

Don't abstract the complexity. But don't force beginners to understand every knob. LDK teaches the 3-layer model by using it.

**Who Uses It**

- New users learning rag-axis
- Proof-of-concept builders
- Teams who want defaults that work

**Real Example**

Day 1: Use LDK
```python
from ragaxis.ldk import RAG
result = RAG.execute(documents, query)
print(result.answer)
```

Day 5: Understanding layers, switch to composition
```python
from ragaxis.retrieval import execute_retrieval
from ragaxis.synthesis import synthesize
# Now custom retrieval strategy
```

Day 30: Need full control, drop to core
```python
from ragaxis.core import prepare_corpus
# Custom chunking, custom embedder, custom everything
```

**When It Ships**

Post-Phase 2 (once all three layers are stable)

---

## 9. ragaxis.server — Deployed Subsystem

**Purpose:** rag-axis as a self-hosted service (REST/gRPC)

**What It Provides**

- **HTTP API** — `/query`, `/index`, `/health` endpoints
- **Config deserialization** — YAML/JSON → typed dataclasses
- **Error serialization** — RagAxisError → HTTP status codes
- **Adapter management** — Register adapters server-side
- **Development server** — `docker run ragaxis-server`

Think of it as: "rag-axis as a microservice in your system."

**Why It's Separate**

Core is a library. Server wraps it for deployment. Teams can:
- Use core as a Python library (inline)
- Deploy server as a subsystem (microservice)
- Mix both (some services use library, some call server)

**Who Uses It**

- Infrastructure teams
- Teams building multi-service AI systems
- Anyone wanting rag-axis as a deployed service, not a library

**Real Example**

Your AI orchestration system has:
- Agent layer (decides what to do)
- Planning layer (breaks down tasks)
- **RAG layer (answers questions)**
- Memory layer (stores state)

Instead of embedding rag-axis in each service, deploy `ragaxis.server`:

```bash
docker run -p 8000:8000 \
  -e EMBEDDER=openai \
  -e VECTOR_STORE=pinecone \
  -e LLM=anthropic \
  ragaxis-server
```

Now agents query: `POST http://ragaxis:8000/query` with `{"query": "..."}`, get back a RunResult with answer and audit trail.

**When It Ships**

v2.0+ (post-v1.0, after all layers are stable)

---

## 10. ragaxis.corpus — Corpus Management

**Purpose:** Corpus versioning, metadata management, staleness tracking

**What It Provides**

- **Corpus lifecycle management** — create, archive, and retire indexed corpora
- **Version metadata and tracking** — records embedding model, schema version, creation timestamp
- **Staleness detection** — warns when corpus exceeds configured age threshold
- **Document registration** — maintains a registry of what is indexed and when

**Who Uses It**

- Teams managing indexed knowledge bases over time
- Infrastructure managing multiple corpus versions in parallel

**Real Example**

Your team maintains multiple versions of your knowledge base:
- `corpus-v1` (March 2026, `text-embedding-3-large`, 10k documents)
- `corpus-v2` (May 2026, `text-embedding-3-large`, 12k documents with new policies)

`ragaxis.corpus` manages version metadata, tracks staleness (is `corpus-v1` too old to trust?), and validates corpus compatibility when a retrieval query arrives.

**When It Ships**

Phase 4 (post-v1.0)

---

## 11. ragaxis.knowledge — Knowledge Operations

**Purpose:** Document lifecycle management, knowledge base operations, document versioning

**What It Provides**

- **Document registration and metadata extraction** — source, author, date, version
- **Knowledge base lifecycle management** — ingest, update, archive, supersede
- **Document versioning and status tracking** — active, archived, superseded states
- **Knowledge organization and hierarchy** — parent-child document relationships, version chains

**Who Uses It**

- Teams managing document updates and continuous ingestion pipelines
- Infrastructure teams responsible for keeping the knowledge base current

**Real Example**

You ingest a new batch of company policies. `ragaxis.knowledge`:
- Registers each document with metadata (source system, author, effective date)
- Detects that `policy-v1` is superseded by `policy-v2` and marks it archived
- Tracks the parent-child relationship between the original policy and its amendment
- Reports which chunks are now stale and need re-embedding

**When It Ships**

Phase 4 (post-v1.0)

---

## Package Dependency Graph

```
ragaxis.core
    ↑ ↑ ↑
    │ │ └─ Defines protocols (adapters implement these)
    │ └─── Defines types (all layers use these)
    └───── Index Layer (documents → corpus)

ragaxis.retrieval
    ↑ (depends on core)
    └─── Retrieval Layer (query + corpus → ranked chunks)

ragaxis.synthesis
    ↑ (depends on core + retrieval)
    └─── Synthesis Layer (chunks + query → answer)

ragaxis.system
    ↑ (depends on core + retrieval + synthesis)
    └─── Orchestration (Index → Retrieval → Synthesis → RunResult)

ragaxis.adapters
    ↑ (depends on core only)
    └─── Concrete implementations (OpenAI, Pinecone, etc.)

ragaxis.bench
    ↑ (depends on all, but runs tests in isolation)
    └─── Testing and evaluation

ragaxis.otel
    ↑ (depends on core, wired into other packages)
    └─── Observability (optional, can be disabled)

ragaxis.ldk
    ↑ (depends on all three layers + adapters)
    └─── Convenience layer (pre-wired)

ragaxis.server
    ↑ (depends on all, wraps them)
    └─── Deployed subsystem (microservice)

ragaxis.corpus
    ↑ (depends on core only)
    └─── Corpus versioning, staleness tracking, document registry

ragaxis.knowledge
    ↑ (depends on core + corpus)
    └─── Document lifecycle, knowledge base operations
```

---

## Choosing Your Path

### "I want to build RAG from scratch"
→ Start with `ragaxis.core`, then `ragaxis.retrieval`, then `ragaxis.synthesis`

### "I want a quick working RAG system"
→ Use `ragaxis.ldk` (all defaults, all three layers wired)

### "I want custom retrieval strategy"
→ Use `ragaxis.core` for index + `ragaxis.retrieval` customized + `ragaxis.synthesis` with defaults

### "I want to deploy RAG as a service"
→ Use `ragaxis.server` (all layers wrapped in REST API)

### "I'm validating phases"
→ Use `ragaxis.bench` (test each layer independently)

### "I need production visibility"
→ Enable `ragaxis.otel` (all layers emit spans)

### "I'm building a custom adapter"
→ Implement `ragaxis.core._protocols` (EmbedderAdapter, VectorStoreAdapter, or LLMAdapter)

---

## Summary: Which Package, When?

| Package | When to Use | Expertise Level |
|---------|-------------|-----------------|
| **core** | Building index layer, custom chunking | Advanced |
| **retrieval** | Building custom retrieval | Advanced |
| **synthesis** | Building answer generation | Advanced |
| **adapters** | Deploying with specific tools (OpenAI, Pinecone) | Intermediate |
| **system** | Running full end-to-end pipeline | Intermediate |
| **bench** | Validating phases, writing tests | Intermediate |
| **otel** | Production visibility, monitoring | Intermediate |
| **ldk** | Quick start, learning, POC | Beginner |
| **server** | Deploying as microservice | Intermediate |
| **corpus** | Corpus versioning, staleness, document registry | Advanced |
| **knowledge** | Document lifecycle, ingestion pipelines | Advanced |

---

## One More Thing: Internal Modules

Every package has internal modules that users don't import directly:
- `_types/` — Internal type definitions
- `_protocols/` — Internal protocol definitions
- `_errors/` — Internal error classes (exported at package level, not imported from _errors)
- `_utils/` — Internal helper functions

**Rule:** Anything with `_` prefix is implementation detail. You import from the public API only.

Example:
```python
# ✅ Correct
from ragaxis.core import IndexedCorpus, MissingProvenanceError

# ❌ Wrong (don't do this)
from ragaxis.core._types import IndexedCorpus  # internal
from ragaxis.core._errors import MissingProvenanceError  # internal
```
