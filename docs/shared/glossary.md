# Glossary: Key Terminology

**A reference for terms used throughout rag-axis documentation and code.**

Definitions are concise. Cross-references point to detailed explanations elsewhere.

---

## A

**aiprims**
The broader AI orchestration framework that rag-axis integrates into as the RAG subsystem. aiprims handles agent planning, tool selection, and execution flow; rag-axis handles retrieval-augmented generation.

rag-axis can be used fully independently of aiprims.

See: [Relationship to aiprims](architecture.md#relationship-to-aiprims)

**aiprims.core**
The core orchestration layer in aiprims. Handles agent planning, decision-making, tool selection, and execution flow.

When `aiprims.core` needs to answer a question using external knowledge, it delegates to `aiprims.rag`, which routes the request to `ragaxis.system`.

**aiprims.rag**
The RAG integration point in aiprims. Routes retrieval-augmented generation queries to `ragaxis.system` and returns results back to `aiprims.core`.

See: [Relationship to aiprims](architecture.md#relationship-to-aiprims)

**Adapter**
A concrete implementation of a protocol. Adapters plug external systems (LLMs, embedding models, vector stores) into rag-axis without coupling core to specific providers.

Example: `OpenAIEmbedder` is an EmbedderAdapter that implements embedding via OpenAI API.

See: [Packages: ragaxis.adapters](packages.md#4-ragaxisadapters--integration-station)

**Audit Trail**
A structured log of what happened during execution: which chunks were retrieved, how much context was truncated, what errors were detected, etc.

Audit trails are part of result contracts (RetrievalResult, PipelineResult), not logs.

See: [Architecture: Audit Trail Events](architecture.md#layer-2-retrieval-layer)

---

## C

**Chunk**
A piece of text extracted from a document. Chunks are atomic units of retrieval—they are the "chunks" the Retrieval Layer returns.

Each chunk carries Provenance (parent document, position, embedding model).

See: [Index Layer](architecture.md#layer-1-index-layer)

**Chunking Strategy**
An algorithm for splitting documents into chunks. rag-axis supports:
- Fixed-size (e.g., 256 tokens per chunk)
- Semantic (split on semantic boundaries)
- Structural (split on document structure: headings, paragraphs)
- Hierarchical (parent-child relationships)

See: [Architecture: Index Layer](architecture.md#layer-1-index-layer)

**Citation**
A reference from the generated answer back to a source chunk. Citations preserve traceability—readers can verify claims by checking the source.

See: [Architecture: Synthesis Layer](architecture.md#layer-3-synthesis-layer)

**Confidence (Confidence Score)**
A measure of how sure the system is about a score or prediction. Values are either:
- A float between 0.0 and 1.0 (explicit confidence)
- ConfidenceUnknown sentinel (explicit acknowledgment of uncertainty)

Never None, never implicit.

See: [Invariant I3: Confidence Calibration](invariants.md#i3--confidence-calibration)

**Contract**
An explicit agreement between layers about input and output types. Contracts are:
- Frozen (immutable)
- Versioned (stable across major versions)
- Type-checked (enforced by type checkers)

Example: Retrieval Layer's input contract is "IndexedCorpus + Query." Its output contract is "RetrievalResult."

See: [Principle 2: Contracts Over Abstractions](philosophy.md#principle-2-contracts-over-abstractions)

**CorpusVersion**
Metadata about an indexed knowledge base: when it was created, which embedding model was used, schema version, etc.

Used for staleness detection (is the corpus too old?) and embedder matching (does the query embedder match the corpus embedder?).

See: [Architecture: IndexedCorpus](architecture.md#output-contract-indexedcorpus-frozen)

**Cost (CostReport)**
Measured resource usage: tokens (for LLM/embedding), latency, estimated cost in dollars.

Cost is tracked per stage (index, retrieval, synthesis) and aggregated in RunResult.

See: [Invariant I7: Cost Tracking Native](invariants.md#i7--cost-tracking-native)

---

## D

**Dense Retrieval**
Semantic search using vector embeddings. A query is embedded, then matched against chunk embeddings using cosine similarity or other distance metrics.

Finds semantically similar chunks, even if keywords don't match.

See: [Architecture: Retrieval Layer](architecture.md#layer-2-retrieval-layer)

**Degraded (DegradedError)**
A non-fatal error. The system continues but emits a warning. Example: score collapse detected, context truncated, embedder mismatch.

Contrast: RagAxisError (fatal, system stops).

See: [Invariant I4: Typed Error Hierarchy](invariants.md#i4--typed-error-hierarchy)

---

## E

**Embedding**
A vector representation of text. Embeddings encode semantic meaning—semantically similar texts have embeddings close in vector space.

Example: "The revenue was $50M" and "Quarterly sales totaled $50M" have similar embeddings.

See: [Index Layer](architecture.md#layer-1-index-layer)

**Embedder (EmbedderAdapter)**
A system that produces embeddings. Examples: OpenAI's text-embedding-3-large, Anthropic's embeddings.

rag-axis requires embedder model IDs to match between indexing (Index Layer) and querying (Retrieval Layer).

See: [Packages: ragaxis.adapters](packages.md#4-ragaxisadapters--integration-station)

---

## F

**Frozen (Immutability)**
A dataclass is frozen when its fields cannot be modified after creation. To change a field, create a new instance via dataclasses.replace().

All cross-stage types are frozen to prevent silent mutations.

See: [Invariant I6: Immutable Stage Boundaries](invariants.md#i6--immutable-stage-boundaries)

---

## G

**Glossary**
This document. A reference for terminology.

---

## H

**Hybrid Retrieval**
A combination of dense and sparse retrieval. Dense finds semantically similar chunks. Sparse finds keyword matches. Results are fused (ranked and combined).

Example: RRF (Reciprocal Rank Fusion) is a hybrid fusion algorithm.

See: [Architecture: Retrieval Layer](architecture.md#layer-2-retrieval-layer)

---

## I

**Index Layer**
The first of three layers in rag-axis. Transforms raw documents into an indexed, versioned, queryable knowledge base (IndexedCorpus).

See: [Architecture: Layer 1 Index Layer](architecture.md#layer-1-index-layer)

**IndexedCorpus**
The output of the Index Layer. A frozen dataclass containing:
- Chunks (with embeddings and provenance)
- CorpusVersion metadata
- Cost report
- Staleness metadata

Ready for retrieval queries.

See: [Architecture: IndexedCorpus](architecture.md#output-contract-indexedcorpus-frozen)

**Invariant (I1-I7)**
A non-negotiable rule that every component must follow. The 7 invariants enforce provenance, explicit failures, confidence calibration, typed errors, provider independence, immutability, and cost tracking.

See: [The 7 Invariants](invariants.md)

---

## K

**k (top-k)**
The number of results to retrieve. Example: "Retrieve top-10" means k=10.

In Retrieval Layer, k is the number of chunks returned. In reranking, top-k is the number of chunks to rerank.

---

## L

**Layer**
One of three stages in rag-axis: Index Layer, Retrieval Layer, Synthesis Layer. Each layer has explicit input and output contracts.

See: [Architecture: The 3-Layer Model](architecture.md)

**LDK (Layer Development Kit)**
Pre-wired, opinionated components for beginners. Provides ready-to-use functions with sensible defaults.

Teaches the 3-layer model through usage.

See: [Packages: ragaxis.ldk](packages.md#8-ragaxisldk--convenience-shop-pre-wired-components)

**LLM (LLMAdapter)**
Large Language Model. An external system that generates text. rag-axis uses LLMAdapters to plug in OpenAI, Anthropic, etc.

See: [Packages: ragaxis.adapters](packages.md#4-ragaxisadapters--integration-station)

---

## M

**MkDocs**
A documentation generator used for internal team docs. Renders markdown files locally (mkdocs serve).

See: [Shared Folder: Documentation](packages.md#documentation)

**Mintlify**
A documentation platform used for public-facing docs. Renders from /docs/public/ folder, auto-deployed.

See: [Shared Folder: Documentation](packages.md#documentation)

---

## O

**OTel (OpenTelemetry)**
A standard for instrumentation. rag-axis emits OTel spans (for distributed tracing) and events (evaluation hooks) automatically.

See: [Packages: ragaxis.otel](packages.md#7-ragaxisotel--observability)

---

## P

**Package**
A Python module in rag-axis. The 9 packages are: core, retrieval, synthesis, adapters, system, bench, otel, ldk, server.

See: [Packages Overview](packages.md)

**Pipeline (RAGPipeline)**
A composed, end-to-end RAG system: Index Layer → Retrieval Layer → Synthesis Layer → RunResult.

Managed by the System Layer.

See: [Architecture: Layer 4 System Layer](architecture.md#layer-4-system-layer-orchestration)

**PipelineResult**
The output of Synthesis Layer. A frozen dataclass containing:
- Generated answer
- Citations (with source chunks)
- Context assembly details
- Truncation audit trail
- Answer confidence
- Cost report

See: [Architecture: Synthesis Layer Output](architecture.md#output-contract-pipelineresult-frozen)

**Protocol**
A typing.Protocol (interface) that defines required methods. Adapters implement protocols without inheritance.

Example: EmbedderAdapter protocol defines embed() method.

See: [Invariant I5: No Provider Dependencies](invariants.md#i5--no-provider-dependencies-in-core)

**Provenance**
Metadata about a chunk's origin: parent document ID, position in document, embedding model ID.

Every chunk carries immutable provenance. Essential for I1 enforcement.

See: [Invariant I1: Provenance Enforcement](invariants.md#i1--provenance-enforcement)

---

## R

**Reranking**
Fine-tuning the order of retrieved chunks using a cross-encoder or other ranking model. Applied after retrieval to improve quality.

Optional in Synthesis Layer.

See: [Architecture: Synthesis Layer](architecture.md#layer-3-synthesis-layer)

**Retrieval Layer**
The second of three layers in rag-axis. Searches the indexed knowledge base and returns ranked chunks with confidence scores.

See: [Architecture: Layer 2 Retrieval Layer](architecture.md#layer-2-retrieval-layer)

**RetrievalResult**
The output of Retrieval Layer. A frozen dataclass containing:
- Ranked chunks (with confidence scores)
- Retrieval metrics (score range, diversity)
- Validation results (embedder match, corpus freshness)
- Audit trail (what happened)
- Cost report

See: [Architecture: Retrieval Layer Output](architecture.md#output-contract-retrievalresult-frozen)

**RRF (Reciprocal Rank Fusion)**
A hybrid retrieval fusion algorithm that combines rankings from dense and sparse search without requiring score normalization.

See: [Packages: ragaxis.retrieval](packages.md#2-ragaxisretrieval--retrieval-layer)

**RunResult**
The final output of the System Layer. A complete, immutable record of an end-to-end execution:
- Answer
- Sources/citations
- Cost (aggregated across all stages)
- Audit trails (from all stages)
- Reproducibility metadata (versions, config, timestamps)

Enables reproducibility and auditability.

See: [Architecture: Layer 4 System Layer](architecture.md#output-contract-runresult-frozen)

---

## S

**Score Collapse**
When retrieval scores are too similar to each other (narrow range), the signal is weak. Example: top 10 results all have scores 0.85-0.87 (range of 0.02).

Detected and warned in Retrieval Layer.

See: [Invariant I2: No Silent Failures](invariants.md#i2--no-silent-failures)

**Semantic (Semantic Search)**
Search based on meaning, not keywords. Dense retrieval is semantic—it finds chunks similar in embedding space.

Contrast: Sparse (keyword-based).

See: [Retrieval Layer](architecture.md#layer-2-retrieval-layer)

**Sparse Retrieval**
Keyword-based search using inverted indices (BM25, SPLADE). Finds chunks with matching keywords.

Contrast: Dense (semantic).

See: [Retrieval Layer](architecture.md#layer-2-retrieval-layer)

**Staleness**
How old an indexed corpus is. Staleness detection warns if corpus is older than a threshold (e.g., "corpus is 90 days old").

Used in pre-retrieval validation.

See: [Architecture: Retrieval Layer Validation](architecture.md#layer-2-retrieval-layer)

**Synthesis Layer**
The third of three layers in rag-axis. Generates an answer from retrieved chunks and original query, with citations and audit trails.

See: [Architecture: Layer 3 Synthesis Layer](architecture.md#layer-3-synthesis-layer)

**System Layer**
Orchestrates all three layers (Index → Retrieval → Synthesis) and produces RunResult.

See: [Architecture: Layer 4 System Layer](architecture.md#layer-4-system-layer-orchestration)

---

## T

**Truncation**
Removing chunks from context to fit within a token budget. When truncation happens, a TruncationEvent is logged.

See: [Invariant I2: No Silent Failures](invariants.md#i2--no-silent-failures)

**Type (Typed, Type-Safe)**
Every value has a declared type. Type checkers (mypy) verify types match at development time.

rag-axis uses types as enforcement mechanism (e.g., frozen dataclasses, error hierarchy).

See: [Invariant I4: Typed Error Hierarchy](invariants.md#i4--typed-error-hierarchy)

---

## V

**Vector (Vector Embedding, Vector Store)**
A vector is a list of numbers representing semantic meaning. A vector store is a database optimized for storing and searching vectors.

Example: Pinecone, Weaviate, Milvus.

See: [Packages: ragaxis.adapters](packages.md#4-ragaxisadapters--integration-station)

---

## X

(No X terms currently. Reserved for future.)

---

## Y

(No Y terms currently. Reserved for future.)

---

## Z

(No Z terms currently. Reserved for future.)

---

## Acronyms

| Acronym | Meaning |
|---------|---------|
| API | Application Programming Interface |
| BM25 | Best Matching 25 (sparse retrieval algorithm) |
| LDK | Layer Development Kit |
| LLM | Large Language Model |
| OTel | OpenTelemetry |
| RAG | Retrieval-Augmented Generation |
| RRF | Reciprocal Rank Fusion |
| SPLADE | Sparse Lexical and Expansion |
| SDK | Software Development Kit |

---

## Cross-References

**By concept:**
- **Layers:** Index Layer, Retrieval Layer, Synthesis Layer, System Layer
- **Results:** IndexedCorpus, RetrievalResult, PipelineResult, RunResult
- **Invariants:** I1 (Provenance), I2 (No Silent Failures), I3 (Confidence), I4 (Typed Errors), I5 (No Provider Dependencies), I6 (Immutable), I7 (Cost)
- **Philosophy:** Explicit, Contracts, Truthful, Observable, Immutability, No Auto-Config
- **Packages:** core, retrieval, synthesis, adapters, system, bench, otel, ldk, server

**By use case:**
- Building an index: Chunk, Chunking Strategy, Index Layer, IndexedCorpus
- Retrieving: Dense Retrieval, Sparse Retrieval, Hybrid Retrieval, RetrievalResult, Score Collapse
- Generating answers: Synthesis Layer, PipelineResult, Citations, Reranking
- End-to-end: Pipeline, System Layer, RunResult, Reproducibility
- Integration: Adapter, Embedder, LLM, Vector Store, Protocol
- Observability: OTel, Audit Trail, Cost, Staleness

---

## Additional Resources

For detailed explanations:
- [The 7 Invariants](invariants.md)
- [Architecture: The 3-Layer Model](architecture.md)
- [Packages: The 9 Building Blocks](packages.md)
- [Philosophy: Why rag-axis Is Built This Way](philosophy.md)
