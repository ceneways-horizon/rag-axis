# Architecture: The 3-Layer Model

**rag-axis is organized as three lifecycle layers, each with explicit input and output contracts.**

This is not a framework with hidden internals. Each layer accepts known types, performs transformations, and emits frozen results. Composition is type-safe.

---

## Why Three Layers?

Think of a professional kitchen:

- **Prep station** (Index Layer): Raw ingredients arrive, get cleaned, chopped, organized into mise en place
- **Cooking station** (Retrieval Layer): Chef selects prepared ingredients for this specific dish, applies heat and technique
- **Plating station** (Synthesis Layer): Final ingredients are arranged, sauce is added, garnish is placed

Each station has a specific job. Each station's output is the next station's input. You cannot plate a dish without cooking. You cannot cook without prepped ingredients.

If something fails at the cooking station (no heat, wrong pan), the problem is obvious. You don't blame prep or plating. The boundary between stations is clear.

rag-axis applies this principle to RAG.

---

## Layer 1: Index Layer

**Transforms raw documents into an indexed, versioned, queryable knowledge base.**

### What It Does

Takes unstructured documents and produces:
- Chunked text (with semantic meaning preserved)
- Embeddings (vector representations)
- Metadata (which document, what position, what model)
- Versioning (timestamp, model IDs, configuration snapshot)

### Input Contract

```
Raw documents + configuration
├── Documents: PDFs, markdown files, database records, web pages
├── ChunkingConfig: strategy (semantic, fixed-size, hierarchical), parameters
├── EmbeddingConfig: model (OpenAI, Anthropic, Hugging Face), batch size
└── CorpusConfig: corpus ID, versioning strategy
```

### Output Contract: IndexedCorpus (Frozen)

```
IndexedCorpus
├── corpus_id: str (unique identifier)
├── corpus_version: CorpusVersion (immutable metadata)
│   ├── created_at: timestamp
│   ├── embedding_model_id: "text-embedding-3-large"
│   ├── embedding_dimension: 1536
│   └── schema_version: "1.0"
├── chunks: List[Chunk] (frozen)
│   └── Each chunk:
│       ├── id: str
│       ├── text: str
│       ├── embedding: Vector
│       ├── provenance: Provenance (I1)
│       │   ├── parent_doc_id: str
│       │   ├── position: int
│       │   └── embedding_model_id: str
│       └── metadata: dict (custom fields)
├── cost_report: CostReport (I7)
│   ├── embedding_tokens: int
│   ├── indexing_latency_ms: int
│   └── estimated_cost: float
└── staleness_metadata: StalnessMetadata
    ├── last_updated: timestamp
    └── refresh_interval: seconds
```

### Key Guarantees

- ✅ Every chunk carries Provenance (I1)
- ✅ Frozen (I6) — cannot be modified after creation
- ✅ Cost is tracked (I7) — knows how many tokens were used
- ✅ Versioning is explicit — knows which embedding model was used

### Real Analogy

Think of a library. The Index Layer is the cataloging process:
- Books arrive (documents)
- Librarians index them (create summaries, extract keywords, assign shelf location)
- Catalog cards are created (embeddings, metadata)
- Card catalog is versioned (updated quarterly, old versions archived)

The output is a queryable catalog. You know exactly what's in the library and where to find it.

---

## Layer 2: Retrieval Layer

**Searches the indexed knowledge base and returns ranked chunks relevant to the query.**

### What It Does

Takes a query and an IndexedCorpus, executes:
- Dense retrieval (semantic similarity via embeddings)
- Sparse retrieval (term-based matching)
- Hybrid fusion (ranking combination)
- Score collapse detection
- Pre-retrieval validation

Outputs ranked chunks with confidence scores and audit trail.

### Input Contract

```
Query + IndexedCorpus + RetrievalConfig
├── Query: str (user's question or request)
├── IndexedCorpus: frozen result from Index Layer
└── RetrievalConfig: configuration
    ├── k: int (how many chunks to retrieve, default 10)
    ├── dense_weight: float (0.6 for dense, 0.4 for sparse hybrid)
    ├── sparse_weight: float
    ├── score_collapse_threshold: float (0.05, warn if scores too close)
    └── validate_embedder: bool (check query embedder matches corpus)
```

### Output Contract: RetrievalResult (Frozen)

```
RetrievalResult
├── query: str (original query)
├── chunks: List[RankedChunk] (sorted by confidence)
│   └── Each chunk:
│       ├── chunk_id: str
│       ├── text: str
│       ├── raw_score: float (0.0-1.0, from vector similarity or BM25)
│       ├── confidence: float | ConfidenceUnknown (I3)
│       ├── rank: int (1-based, 1 = most relevant)
│       └── provenance: Provenance (preserved from index)
├── retrieval_metrics: RetrievalMetrics
│   ├── chunks_evaluated: int
│   ├── chunks_returned: int
│   ├── score_range: (min_score, max_score)
│   ├── score_collapse_detected: bool
│   └── top_5_diversity_score: float (are top 5 semantically diverse?)
├── validation_result: ValidationResult
│   ├── embedder_match: bool (query embedder == corpus embedder?)
│   ├── corpus_freshness: bool (is corpus newer than staleness threshold?)
│   └── corpus_version: CorpusVersion
├── audit_trail: List[RetrievalEvent]
│   ├── dense_search_executed (chunks found, latency)
│   ├── sparse_search_executed (chunks found, latency)
│   ├── rrf_fusion_applied (score normalization details)
│   ├── score_collapse_detected (if applicable, with metrics)
│   └── validation_checks_passed (or failed with reason)
├── cost_report: CostReport (I7)
│   ├── embedding_tokens: int (for query embedding)
│   ├── retrieval_latency_ms: int
│   └── estimated_cost: float
└── quality_signals: QualitySignals (metadata for downstream)
    ├── best_score: float
    ├── worst_score: float
    ├── signal_strength: "strong" | "moderate" | "weak"
    └── recommended_action: "use_directly" | "rerank" | "retry_with_different_params"
```

### Key Guarantees

- ✅ Every chunk's confidence is explicit (I3)
- ✅ All failures and degradations logged in audit trail (I2)
- ✅ Pre-retrieval validation prevents silent embedding model drift (I5 + I2)
- ✅ Score collapse detected and warned (not silent)
- ✅ Frozen (I6) — cannot be modified
- ✅ Cost tracked (I7) — knows tokens and latency

### Real Analogy

Think of a search engine retrieving web results.

User searches "capital of France"

Search engine:
- Embeds the query (dense)
- Looks for exact matches (sparse)
- Ranks results by relevance
- Detects if results quality is poor (score collapse)
- Returns top 10 links with confidence scores

The output tells you:
- What it found
- How confident it is
- What strategy it used
- If something went wrong

---

## Layer 3: Synthesis Layer

**Assembles retrieved context and generates a final answer with citations.**

### What It Does

Takes RetrievalResult and the original query, performs:
- Context assembly (arrange chunks in optimal order)
- Relationship graph (understand how chunks connect)
- Intelligent truncation (fit within token budget)
- Cross-encoder reranking (fine-tune chunk order with LLM scorer)
- Answer generation (feed context to LLM)
- Citation injection (link answer statements back to source chunks)
- Output validation (is the answer reasonable?)

### Input Contract

```
RetrievalResult + Query + SynthesisConfig
├── RetrievalResult: frozen output from Retrieval Layer
├── Query: original user query
└── SynthesisConfig: configuration
    ├── context_token_budget: int (max tokens for context, e.g., 4000)
    ├── truncation_strategy: "end_first" | "middle_first" | "importance_weighted"
    ├── reranking_enabled: bool
    ├── reranking_top_k: int (rerank top 10, not all 100)
    ├── generation_max_tokens: int
    ├── generation_temperature: float
    └── citation_enabled: bool
```

### Output Contract: PipelineResult (Frozen)

```
PipelineResult
├── query: str (original query)
├── answer: str (generated answer text)
├── citations: List[Citation]
│   └── Each citation:
│       ├── statement: str (excerpt from answer)
│       ├── chunk_id: str (which chunk supports this)
│       ├── chunk_text: str (full chunk text)
│       ├── confidence: float (how confident is this citation?)
│       └── provenance: Provenance (source document)
├── context_assembly: ContextAssembly
│   ├── chunks_used: int
│   ├── total_context_tokens: int
│   ├── context_budget: int
│   ├── relationship_graph: Graph (how chunks relate)
│   │   └── Edges: ADJACENT, SHARED_ENTITY, SEMANTIC_OVERLAP, PARENT_CHILD
│   └── chunk_order: List[chunk_id] (final order in context window)
├── truncation_audit: List[TruncationEvent]
│   └── Each event:
│       ├── chunks_dropped: int
│       ├── tokens_dropped: int
│       ├── reason: "token_budget_exceeded" | "low_relevance" | etc.
│       ├── position: "start" | "middle" | "end"
│       └── timestamp: when truncation occurred
├── reranking_details: RerangingDetails (if enabled)
│   ├── chunks_reranked: int
│   ├── reranker_model: str
│   ├── score_adjustment: List[adjustment per chunk]
│   └── latency_ms: int
├── answer_confidence: float | ConfidenceUnknown (I3)
│   (How confident are we in the final answer?)
├── generation_metadata: GenerationMetadata
│   ├── llm_model: str
│   ├── prompt_tokens: int
│   ├── completion_tokens: int
│   ├── total_tokens: int
│   ├── temperature_used: float
│   └── generation_latency_ms: int
├── audit_trail: List[SynthesisEvent]
│   ├── context_assembled
│   ├── relationship_graph_built
│   ├── truncation_applied (if any)
│   ├── reranking_executed (if enabled)
│   ├── answer_generated
│   ├── citations_injected
│   └── output_validated
├── cost_report: CostReport (I7)
│   ├── reranking_tokens: int (if applicable)
│   ├── generation_tokens: int
│   ├── generation_latency_ms: int
│   └── estimated_cost: float
└── quality_signals: QualitySignals
    ├── answer_length: int (word count)
    ├── citation_coverage: float (% of answer supported by citations)
    ├── confidence_level: "high" | "medium" | "low"
    └── recommended_review: bool (should human review this?)
```

### Key Guarantees

- ✅ Truncation always logged (I2)
- ✅ Answer confidence explicit or unknown (I3)
- ✅ Every citation tied to source (provenance preserved)
- ✅ Frozen (I6) — result is immutable
- ✅ Cost tracked (I7) — knows generation tokens and latency

### Real Analogy

Think of a journalist writing an article:

- Gets research notes (retrieved chunks)
- Reads through notes, understands connections (relationship graph)
- Decides which points to include within article length (context assembly)
- Writes the article (answer generation)
- Adds citations and sources for every claim (citation injection)
- Fact-checks the article (validation)

The output is a readable article with clear sources. You can verify every claim.

---

## Layer 4: System Layer (Orchestration)

**Composes all three layers and produces RunResult (the complete story of what happened).**

### What It Does

- Manages pipeline execution: Index → Retrieval → Synthesis
- Cross-layer validation and error handling
- Aggregates audit trails from all layers
- Aggregates costs across all layers
- Produces RunResult (single source of truth)

### Input Contract

```
Documents + Query + FullConfig
├── Documents: for indexing
├── Query: for retrieval + synthesis
└── FullConfig: aggregates Index/Retrieval/Synthesis configs
```

### Output Contract: RunResult (Frozen)

```
RunResult
├── query: str
├── indexed_corpus: IndexedCorpus
├── retrieval_result: RetrievalResult
├── pipeline_result: PipelineResult
├── aggregated_cost: CostReport
│   ├── index_stage_cost: Cost
│   ├── retrieval_stage_cost: Cost
│   ├── synthesis_stage_cost: Cost
│   └── total_cost: Cost (sum across stages)
├── aggregated_audit_trail: List[Event]
│   (all events from all layers, chronologically ordered)
├── reproducibility_metadata: ReproducibilityMetadata
│   ├── rag_axis_version: str
│   ├── timestamp: ISO 8601
│   ├── config_snapshot: full config used
│   ├── embedding_model_id: str
│   ├── llm_model_id: str
│   ├── corpus_version: CorpusVersion
│   ├── retrieval_strategy_used: str (dense, sparse, hybrid)
│   └── reranking_enabled: bool
├── quality_summary: QualitySummary
│   ├── retrieval_quality: score
│   ├── answer_quality: score
│   ├── citation_quality: score
│   └── overall_confidence: float
└── warnings_and_errors: List[Issue]
    ├── [fatal errors that stopped execution]
    ├── [degradation warnings that let execution continue]
    └── [recommendations for improvement]
```

### Key Guarantee

RunResult is the **single source of truth**. Everything that happened is here:
- The answer
- The sources
- The costs
- The audit trail
- Whether it was successful
- Whether it can be reproduced

---

## Relationship to aiprims

aiprims is the broader AI orchestration framework. rag-axis (`ragaxis.core`, `ragaxis.retrieval`, `ragaxis.synthesis`) plugs into aiprims as the RAG subsystem.

- **aiprims.core:** Agent and planning layer. Makes high-level decisions about what to do and when to retrieve information.
- **aiprims.rag:** RAG integration point. Routes retrieval-augmented generation queries to `ragaxis.system` and returns results back to `aiprims.core`.

rag-axis is fully independent — you can use it without aiprims. But it is designed to integrate cleanly into aiprims-based orchestration systems. Think of rag-axis as a specialized subsystem that aiprims can delegate to when RAG is needed.

---

## Data Flow Diagram

```
Documents
    ↓
[INDEX LAYER]
    ├─ Ingest
    ├─ Chunk
    ├─ Embed
    └─ Produce: IndexedCorpus (frozen, versioned, costed)
    ↓
Query + IndexedCorpus
    ↓
[RETRIEVAL LAYER]
    ├─ Validate (embedder match, corpus freshness)
    ├─ Dense search + Sparse search
    ├─ Fuse rankings
    ├─ Detect score collapse
    └─ Produce: RetrievalResult (ranked, audited, costed)
    ↓
RetrievalResult + Query
    ↓
[SYNTHESIS LAYER]
    ├─ Assemble context
    ├─ Build relationship graph
    ├─ Truncate intelligently
    ├─ Rerank (optional)
    ├─ Generate answer
    ├─ Inject citations
    ├─ Validate output
    └─ Produce: PipelineResult (answer, citations, audited, costed)
    ↓
All three results
    ↓
[SYSTEM LAYER]
    ├─ Aggregate costs
    ├─ Aggregate audit trails
    ├─ Add reproducibility metadata
    └─ Produce: RunResult (complete, immutable, reproducible)
    ↓
RunResult (to user)
```

---

## Why This Architecture?

### Clear Boundaries

Each layer has explicit input and output contracts. Composition is type-safe. You cannot pass the wrong type to the wrong layer—type checkers catch it.

### Testable Isolation

You can test Retrieval Layer independently by mocking IndexedCorpus. You can test Synthesis Layer by mocking RetrievalResult. No full end-to-end required for unit tests.

### Observable at Every Stage

Each layer produces audit trails and cost reports. You see exactly what happened and where. No black boxes.

### Reproducible Runs

Every layer's output includes versions, configs, timestamps. A saved RunResult can be replayed with full context.

### Composable

You can:
- Use only Index Layer (prepare a corpus, query it elsewhere)
- Use Index + Retrieval (build a search engine)
- Use all three (full RAG system)
- Swap implementations (different embedders, LLMs, vector stores)

### Explicit Complexity

The three layers map to actual RAG problems:
1. Index Layer: "How do I prepare my knowledge?"
2. Retrieval Layer: "How do I find relevant chunks?"
3. Synthesis Layer: "How do I generate an answer from chunks?"

There's no hidden magic. You see the complexity and control it.

---

## Contracts are Sacred

The input and output types for each layer are frozen. They do not change between minor versions. They are the **public API** of rag-axis.

Breaking a contract = major version bump.

This stability is intentional. You can depend on these contracts for years.

---

## Versioning Contract

rag-axis follows semantic versioning with a specific stability guarantee:

**v0.x.y (current):** Contracts may evolve. Breaking changes may occur with minor version notice in CHANGELOG. Not yet production-stable.

**v1.0.0 (target):** Contracts are locked. Layer input/output types (`IndexedCorpus`, `RetrievalResult`, `PipelineResult`, `RunResult`) are frozen and will not change within v1.x.

**v1.x → v2.x and beyond:** Contracts remain stable. If a contract must change, it requires a major version bump — no exceptions.

**Invariant relaxation:** Relaxing any of the 7 Invariants (I1–I7) is always a breaking change, regardless of what else changed in the release. For example: if v1.2 were to allow `None` confidence instead of `ConfidenceUnknown` (relaxing I3), that release becomes v2.0.
