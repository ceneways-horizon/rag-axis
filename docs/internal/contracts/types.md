# Type Contracts — Formal Dataclass Definitions

**Purpose:** Formal field-level specifications for every cross-layer type in ragaxis. These are blueprints for Python implementation. Developers implement these exactly.

**Reference:** [Architecture: 3-Layer Model](../../shared/architecture.md) · [Packages](../../shared/packages.md) · [Invariants](../../shared/invariants.md)

---

## Conventions

- Cross-stage types (`IndexedCorpus`, `RetrievalResult`, `PipelineResult`, `RunResult`) are `@dataclass(frozen=True)` — enforced by I6
- Supporting types (`Chunk`, `RankedChunk`, `Citation`, `Cost`, `Provenance`, `CorpusVersion`) are also `@dataclass(frozen=True)` — immutable throughout their lifetime
- All types live in `ragaxis.core._types` unless noted
- `ConfidenceScore` is a union, not a dataclass — see §3
- `Vector` is a type alias: `Vector = List[float]`

```python
from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Dict, Any, Union
```

---

## 1. Provenance

**Location:** `ragaxis.core._types`
**Responsibility:** Records the immutable origin of a chunk. Required by I1 — any chunk without all three fields raises `MissingProvenanceError` at construction.
**Usage:** Created in Index Layer; carried unchanged through Retrieval and Synthesis layers.

```python
@dataclass(frozen=True)
class Provenance:
    parent_doc_id: str
    position: int
    embedding_model_id: str
```

| Field | Type | Required | Description | Validation |
|---|---|---|---|---|
| `parent_doc_id` | `str` | Yes | ID of the source document | Non-empty string |
| `position` | `int` | Yes | Byte/token offset of the chunk within the source document | `>= 0` |
| `embedding_model_id` | `str` | Yes | Canonical ID of the embedding model used at index time | Non-empty string |

**Notes:**
- `parent_doc_id` must reference a document in the corpus registry
- `position` is an opaque integer — the chunking strategy defines its unit (byte offset, token offset, paragraph index)
- `embedding_model_id` is compared against the query embedder at retrieval time (I1 + EmbedderMismatchError)

---

## 2. Cost

**Location:** `ragaxis.core._types`
**Responsibility:** Records resource consumption for a single stage. Every result type embeds a `Cost` instance — required by I7.
**Usage:** Created by each adapter call; aggregated by System Layer into `RunResult.aggregated_cost`.

```python
@dataclass(frozen=True)
class Cost:
    tokens_used: int
    latency_ms: int
    estimated_cost_usd: float
```

| Field | Type | Required | Description | Validation |
|---|---|---|---|---|
| `tokens_used` | `int` | Yes | Total tokens consumed (prompt + completion, or embedding tokens) | `>= 0` |
| `latency_ms` | `int` | Yes | Wall-clock time for this stage in milliseconds | `>= 0` |
| `estimated_cost_usd` | `float` | Yes | Estimated dollar cost at provider's current pricing | `>= 0.0` |

**Notes:**
- For embedding operations, `tokens_used` is the number of tokens submitted to the embedder
- For LLM operations, `tokens_used` = `prompt_tokens + completion_tokens`
- `estimated_cost_usd` is advisory — billing is authoritative; use for monitoring only
- Zero-cost stages (e.g., cached results) use `Cost(tokens_used=0, latency_ms=0, estimated_cost_usd=0.0)`

---

## 3. ConfidenceScore

**Location:** `ragaxis.core._types`
**Responsibility:** Typed confidence signal. Required by I3 — confidence is never `None`, never implicit. Either a calibrated float or an explicit sentinel.
**Usage:** Used in `RankedChunk.confidence`, `PipelineResult.answer_confidence`, `Citation.confidence`.

```python
@dataclass(frozen=True)
class ConfidenceUnknown:
    """Explicit sentinel for unknown confidence. Not None. Never implicit."""
    reason: str = "confidence not computable"

# Type alias used throughout the codebase
ConfidenceScore = Union[float, ConfidenceUnknown]
```

| Value | Type | When to use |
|---|---|---|
| `float` in `[0.0, 1.0]` | `float` | Confidence is calibrated and meaningful |
| `ConfidenceUnknown(reason="...")` | `ConfidenceUnknown` | Score could not be computed or is unreliable |

**Validation:**
- If type is `float`, value must be in `[0.0, 1.0]` — raises `ConfidenceCalibrationError` otherwise
- `None` is never a valid `ConfidenceScore` — type checkers enforce this

**Pattern for downstream code:**
```python
def use_confidence(score: ConfidenceScore) -> None:
    if isinstance(score, ConfidenceUnknown):
        # Handle unknown — log, use fallback, or skip
        ...
    else:
        # score is float, safe to use
        ...
```

---

## 4. CorpusVersion

**Location:** `ragaxis.core._types`
**Responsibility:** Immutable metadata snapshot of an indexed corpus. Used for staleness detection and embedder compatibility checks.
**Usage:** Embedded in `IndexedCorpus`; carried into `RetrievalResult.validation_result`; stored in `RunResult.reproducibility_metadata`.

```python
@dataclass(frozen=True)
class CorpusVersion:
    corpus_id: str
    created_at: str
    embedding_model_id: str
    embedding_dimension: int
    schema_version: str
```

| Field | Type | Required | Description | Validation |
|---|---|---|---|---|
| `corpus_id` | `str` | Yes | Unique identifier for this corpus | Non-empty string |
| `created_at` | `str` | Yes | ISO 8601 timestamp of corpus creation | Must parse as valid ISO 8601 |
| `embedding_model_id` | `str` | Yes | Canonical ID of the embedding model used to build this corpus | Non-empty string |
| `embedding_dimension` | `int` | Yes | Dimensionality of the embedding vectors in this corpus | `> 0` |
| `schema_version` | `str` | Yes | Version of the `CorpusVersion` schema itself (for future migrations) | Non-empty string, e.g. `"1.0"` |

**Notes:**
- `embedding_model_id` must match the query embedder's `get_model_id()` at retrieval time — mismatch raises `EmbedderMismatchError`
- `created_at` is compared against staleness thresholds in `RetrievalConfig`

---

## 5. Chunk

**Location:** `ragaxis.core._types`
**Responsibility:** Atomic unit of retrieval. A piece of indexed text with its embedding and immutable provenance.
**Usage:** Created in Index Layer; stored in `IndexedCorpus.chunks`; carried into `RetrievalResult` as `RankedChunk`.

```python
@dataclass(frozen=True)
class Chunk:
    id: str
    text: str
    embedding: List[float]
    provenance: Provenance
    metadata: Dict[str, Any]
```

| Field | Type | Required | Description | Validation |
|---|---|---|---|---|
| `id` | `str` | Yes | Stable unique identifier for this chunk | Non-empty string; globally unique within corpus |
| `text` | `str` | Yes | Raw text content of the chunk | Non-empty string |
| `embedding` | `List[float]` | Yes | Dense vector representation | Length must match `CorpusVersion.embedding_dimension` |
| `provenance` | `Provenance` | Yes | Immutable origin metadata (I1) | All provenance fields must be non-empty |
| `metadata` | `Dict[str, Any]` | Yes | Custom key-value metadata from the source document | Can be empty dict `{}`, never `None` |

**Notes:**
- `id` is typically derived from `provenance.parent_doc_id + str(provenance.position)` via a deterministic hash
- `embedding` length is validated against `CorpusVersion.embedding_dimension` at indexing time — mismatch raises `EmbeddingError`
- `metadata` carries document-level fields (author, date, tags) that pass through to retrieval results

---

## 6. IndexedCorpus

**Location:** `ragaxis.core._types`
**Layer boundary:** Index Layer output contract. **Frozen.**
**Responsibility:** Complete, versioned, queryable knowledge base. The output of the Index Layer and the input to the Retrieval Layer.
**Usage:** Produced by `ragaxis.core`; consumed by `ragaxis.retrieval`.

```python
@dataclass(frozen=True)
class IndexedCorpus:
    corpus_id: str
    corpus_version: CorpusVersion
    chunks: tuple[Chunk, ...]          # tuple, not list — enforces immutability
    cost_report: Cost
    staleness_metadata: Dict[str, Any]
```

| Field | Type | Required | Description | Validation |
|---|---|---|---|---|
| `corpus_id` | `str` | Yes | Must match `corpus_version.corpus_id` | Non-empty string |
| `corpus_version` | `CorpusVersion` | Yes | Immutable metadata for this corpus | All fields non-empty |
| `chunks` | `tuple[Chunk, ...]` | Yes | All indexed chunks | Non-empty; each chunk's `embedding_model_id` must match `corpus_version.embedding_model_id` |
| `cost_report` | `Cost` | Yes | Cost of building this corpus (I7) | `tokens_used >= 0` |
| `staleness_metadata` | `Dict[str, Any]` | Yes | Staleness configuration and detection state | Expected keys: `last_updated` (ISO 8601 str), `refresh_interval_seconds` (int) |

**Notes:**
- `chunks` uses `tuple` (not `list`) so that frozen dataclass enforcement extends to the collection
- `corpus_id` and `corpus_version.corpus_id` must be identical — validated at construction
- `staleness_metadata` is intentionally `dict` for extensibility — future typed version in `ragaxis.corpus`

---

## 7. RankedChunk

**Location:** `ragaxis.core._types`
**Responsibility:** A retrieved chunk with its ranking signal. The retrieval-time view of a `Chunk`.
**Usage:** Produced by `ragaxis.retrieval`; carried in `RetrievalResult.chunks`.

```python
@dataclass(frozen=True)
class RankedChunk:
    chunk_id: str
    text: str
    raw_score: float
    confidence: ConfidenceScore        # float | ConfidenceUnknown — never None
    rank: int
    provenance: Provenance
```

| Field | Type | Required | Description | Validation |
|---|---|---|---|---|
| `chunk_id` | `str` | Yes | References `Chunk.id` in the indexed corpus | Non-empty string |
| `text` | `str` | Yes | Text content (copied from `Chunk.text`) | Non-empty string |
| `raw_score` | `float` | Yes | Raw similarity or BM25 score before fusion | `[0.0, 1.0]` after normalisation |
| `confidence` | `ConfidenceScore` | Yes | Calibrated confidence in this chunk's relevance (I3) | `float` in `[0.0, 1.0]` or `ConfidenceUnknown` |
| `rank` | `int` | Yes | 1-based rank in the result list (1 = most relevant) | `>= 1` |
| `provenance` | `Provenance` | Yes | Carried unchanged from the source `Chunk` (I1) | All fields non-empty |

---

## 8. RetrievalResult

**Location:** `ragaxis.core._types`
**Layer boundary:** Retrieval Layer output contract. **Frozen.**
**Responsibility:** Complete output of a retrieval operation — ranked chunks, quality signals, audit trail, and cost.
**Usage:** Produced by `ragaxis.retrieval`; consumed by `ragaxis.synthesis`.

```python
@dataclass(frozen=True)
class RetrievalResult:
    query: str
    chunks: tuple[RankedChunk, ...]
    retrieval_metrics: Dict[str, Any]
    validation_result: Dict[str, Any]
    audit_trail: tuple[str, ...]
    cost_report: Cost
    quality_signals: Dict[str, Any]
```

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | `str` | Yes | Original query string |
| `chunks` | `tuple[RankedChunk, ...]` | Yes | Ranked chunks, sorted descending by confidence |
| `retrieval_metrics` | `Dict[str, Any]` | Yes | Keys: `chunks_evaluated`, `chunks_returned`, `score_range` (tuple), `score_collapse_detected` (bool), `top_5_diversity_score` (float) |
| `validation_result` | `Dict[str, Any]` | Yes | Keys: `embedder_match` (bool), `corpus_freshness` (bool), `corpus_version` (str) |
| `audit_trail` | `tuple[str, ...]` | Yes | Ordered log of retrieval events (I2) |
| `cost_report` | `Cost` | Yes | Retrieval stage cost — embedding tokens + search latency (I7) |
| `quality_signals` | `Dict[str, Any]` | Yes | Keys: `best_score` (float), `worst_score` (float), `signal_strength` (`"strong"` \| `"moderate"` \| `"weak"`), `recommended_action` (str) |

**Notes:**
- `chunks` is empty tuple if retrieval returns nothing — this is **not** an error at the type level; `EmptyRetrievalError` is raised by the retrieval layer before this type is constructed
- `audit_trail` entries are plain strings in `"[STAGE] event description"` format
- `retrieval_metrics["score_collapse_detected"] = True` accompanies a `ScoreCollapseWarning` in the audit trail

---

## 9. Citation

**Location:** `ragaxis.core._types`
**Responsibility:** A reference linking a statement in the generated answer back to a source chunk with provenance.
**Usage:** Produced by `ragaxis.synthesis`; carried in `PipelineResult.citations`.

```python
@dataclass(frozen=True)
class Citation:
    statement: str
    chunk_id: str
    chunk_text: str
    confidence: float
    provenance: Provenance
```

| Field | Type | Required | Description | Validation |
|---|---|---|---|---|
| `statement` | `str` | Yes | Excerpt from the answer text that this citation supports | Non-empty string |
| `chunk_id` | `str` | Yes | References `RankedChunk.chunk_id` used during synthesis | Non-empty string |
| `chunk_text` | `str` | Yes | Full text of the source chunk | Non-empty string |
| `confidence` | `float` | Yes | Confidence that this chunk supports this statement | `[0.0, 1.0]` |
| `provenance` | `Provenance` | Yes | Source document metadata (I1) | All fields non-empty |

**Notes:**
- `chunk_id` must reference a chunk present in the `RetrievalResult` that was passed to synthesis — mismatch raises `CitationError`
- `confidence` is a plain `float` here (not `ConfidenceScore`) because citations with unknown confidence are not emitted

---

## 10. PipelineResult

**Location:** `ragaxis.core._types`
**Layer boundary:** Synthesis Layer output contract. **Frozen.**
**Responsibility:** Complete output of synthesis — generated answer, citations, truncation audit, and cost.
**Usage:** Produced by `ragaxis.synthesis`; consumed by `ragaxis.system` for assembly into `RunResult`.

```python
@dataclass(frozen=True)
class PipelineResult:
    query: str
    answer: str
    citations: tuple[Citation, ...]
    context_assembly: Dict[str, Any]
    truncation_audit: tuple[str, ...]
    reranking_details: Dict[str, Any]
    answer_confidence: ConfidenceScore
    generation_metadata: Dict[str, Any]
    audit_trail: tuple[str, ...]
    cost_report: Cost
    quality_signals: Dict[str, Any]
```

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | `str` | Yes | Original query string |
| `answer` | `str` | Yes | Generated answer text |
| `citations` | `tuple[Citation, ...]` | Yes | All citations; may be empty if citation injection is disabled |
| `context_assembly` | `Dict[str, Any]` | Yes | Keys: `chunks_used` (int), `total_context_tokens` (int), `context_budget` (int), `chunk_order` (List[str]) |
| `truncation_audit` | `tuple[str, ...]` | Yes | Truncation events (I2); empty if no truncation occurred |
| `reranking_details` | `Dict[str, Any]` | Yes | Keys: `enabled` (bool), `chunks_reranked` (int), `reranker_model` (str), `latency_ms` (int); all zeros/empty-string if disabled |
| `answer_confidence` | `ConfidenceScore` | Yes | Calibrated confidence in the final answer (I3) |
| `generation_metadata` | `Dict[str, Any]` | Yes | Keys: `llm_model` (str), `prompt_tokens` (int), `completion_tokens` (int), `temperature_used` (float), `generation_latency_ms` (int) |
| `audit_trail` | `tuple[str, ...]` | Yes | Ordered synthesis events (I2) |
| `cost_report` | `Cost` | Yes | Synthesis stage cost — reranking + generation tokens (I7) |
| `quality_signals` | `Dict[str, Any]` | Yes | Keys: `answer_length` (int), `citation_coverage` (float), `confidence_level` (`"high"` \| `"medium"` \| `"low"`), `recommended_review` (bool) |

**Notes:**
- `truncation_audit` is non-empty whenever context was dropped — `ContextTruncationWarning` is emitted alongside (I2)
- `answer` must not be empty string — `OutputValidationError` is raised if the LLM returns an empty completion

---

## 11. RunResult

**Location:** `ragaxis.core._types`
**Layer boundary:** System Layer output contract. **Frozen.**
**Responsibility:** Complete, auditable, reproducible record of an end-to-end pipeline execution. Single source of truth.
**Usage:** Produced by `ragaxis.system`; returned to the caller.

```python
@dataclass(frozen=True)
class RunResult:
    query: str
    indexed_corpus: IndexedCorpus
    retrieval_result: RetrievalResult
    pipeline_result: PipelineResult
    aggregated_cost: Cost
    aggregated_audit_trail: tuple[str, ...]
    reproducibility_metadata: Dict[str, Any]
    quality_summary: Dict[str, Any]
    warnings_and_errors: tuple[str, ...]
```

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | `str` | Yes | Original query string |
| `indexed_corpus` | `IndexedCorpus` | Yes | Corpus used for this run |
| `retrieval_result` | `RetrievalResult` | Yes | Complete retrieval output |
| `pipeline_result` | `PipelineResult` | Yes | Complete synthesis output |
| `aggregated_cost` | `Cost` | Yes | Sum of all stage costs: index + retrieval + synthesis (I7) |
| `aggregated_audit_trail` | `tuple[str, ...]` | Yes | All events from all layers in chronological order (I2) |
| `reproducibility_metadata` | `Dict[str, Any]` | Yes | Keys: `ragaxis_version` (str), `timestamp` (ISO 8601 str), `config_snapshot` (dict), `embedding_model_id` (str), `llm_model_id` (str), `corpus_version` (str), `retrieval_strategy_used` (str), `reranking_enabled` (bool) |
| `quality_summary` | `Dict[str, Any]` | Yes | Keys: `retrieval_quality` (float), `answer_quality` (float), `citation_quality` (float), `overall_confidence` (float) |
| `warnings_and_errors` | `tuple[str, ...]` | Yes | Degraded warnings that did not stop execution; empty on clean runs |

**Notes:**
- `aggregated_cost` is constructed as `Cost(tokens_used=sum_of_all_stages, latency_ms=sum_of_all_stages, estimated_cost_usd=sum_of_all_stages)`
- `reproducibility_metadata["config_snapshot"]` is a deep copy of the full config at execution time — allows replay
- `warnings_and_errors` contains string representations of `DegradedError` instances that were caught and continued

---

## Type Dependency Graph

```
Provenance ──────────────────────────────────────────────────────────────────────────┐
                                                                                     │
Cost ────────────────────────────────────────────────────────────────────────────────┤
                                                                                     │
ConfidenceUnknown ──────────────────────┐                                            │
                                        ↓                                            │
CorpusVersion ──→ IndexedCorpus ──→ [Retrieval Layer] ──→ RankedChunk ──→ RetrievalResult
                       │                                       │                     │
                       │                                       └─────────────────────┤
                       │                                                             │
                       └──→ Chunk ──────────────────────────────────────────────────┘
                                                                                     │
                                                     Citation ──→ PipelineResult ───┘
                                                                          │
                                                                          ↓
                                                                      RunResult
```

---

## Invariant Checklist for Types

| Invariant | Type | Check |
|---|---|---|
| I1 (Provenance) | `Chunk`, `RankedChunk`, `Citation` | `provenance` field present and non-null |
| I2 (No Silent Failures) | `RetrievalResult`, `PipelineResult`, `RunResult` | `audit_trail` and `truncation_audit` non-null |
| I3 (Confidence) | `RankedChunk`, `PipelineResult` | `confidence` is `float \| ConfidenceUnknown`, never `None` |
| I6 (Immutable) | `IndexedCorpus`, `RetrievalResult`, `PipelineResult`, `RunResult` | `@dataclass(frozen=True)`, collections use `tuple` |
| I7 (Cost) | All result types | `cost_report: Cost` field present on every result |
