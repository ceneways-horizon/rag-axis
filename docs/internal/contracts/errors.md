# Error Contracts — Formal Exception Definitions

**Purpose:** Complete enumeration of every named exception in ragaxis. Developers implement these exactly. No bare `Exception` raises anywhere in ragaxis code (I4).

**Reference:** [Invariants](../../shared/invariants.md#i4--typed-error-hierarchy) · [Types](types.md) · [Adapters](adapters.md)

---

## Conventions

- All ragaxis errors inherit from `RagAxisError` (fatal) or `DegradedError` (non-fatal)
- `RagAxisError` → pipeline halts, exception propagates to caller
- `DegradedError` → pipeline continues, warning recorded in `audit_trail` and `warnings_and_errors`
- Every error carries `message: str` and `context: dict` — no bare string messages
- `run_id` is attached by the System Layer before surfacing to callers
- Location prefix `_errors` means the class lives in `ragaxis.<package>._errors` and is re-exported at the package root

---

## Base Hierarchy

```python
# ragaxis.core._errors

class RagAxisError(Exception):
    """Base for all fatal errors. Pipeline stops. Always propagates."""
    def __init__(self, message: str, context: dict | None = None) -> None:
        self.message = message
        self.context = context or {}
        super().__init__(message)

class DegradedError(RagAxisError):
    """Base for non-fatal warnings. Pipeline continues. Recorded in audit trail."""
    pass
```

| Class | Severity | Pipeline behaviour |
| --- | --- | --- |
| `RagAxisError` | Fatal | Halts immediately, propagates to caller |
| `DegradedError` | Warning | Continues, appends to `warnings_and_errors` |

---

## Shared Errors (all layers)

These live in `ragaxis.core._errors` and may be raised from any package.

---

### MissingProvenanceError

```python
class MissingProvenanceError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.core._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | A `Chunk` is constructed with a missing or empty `parent_doc_id`, `position`, or `embedding_model_id` |
| **Message pattern** | `"Chunk provenance incomplete: missing {field}. chunk_id={chunk_id}"` |
| **Recovery** | Fix the chunking/ingestion pipeline that produced the incomplete chunk. This is always a caller bug, not a runtime condition. |

---

### ConfidenceCalibrationError

```python
class ConfidenceCalibrationError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.core._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | A `ConfidenceScore` float value is outside `[0.0, 1.0]`, or `None` is passed where `ConfidenceScore` is expected |
| **Message pattern** | `"Invalid confidence value {value}: must be float in [0.0, 1.0] or ConfidenceUnknown"` |
| **Recovery** | Fix the scoring component returning the invalid value. Use `ConfidenceUnknown` when confidence cannot be computed. |

---

### ConfigurationError

```python
class ConfigurationError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.core._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | Any config object fails validation at construction time (missing required field, out-of-range value, incompatible combination) |
| **Message pattern** | `"Invalid configuration for {component}: {reason}. field={field}, value={value}"` |
| **Recovery** | Fix the configuration before constructing the pipeline. Always a caller error. |

---

### ValidationError

```python
class ValidationError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.core._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | A cross-layer contract validation fails at runtime (e.g., `IndexedCorpus.corpus_id` does not match `corpus_version.corpus_id`) |
| **Message pattern** | `"Contract validation failed in {layer}: {reason}"` |
| **Recovery** | Indicates a bug in the layer that produced the invalid result. Investigate the producing layer. |

---

## Index Layer Errors

These live in `ragaxis.core._errors` (Index Layer is part of `ragaxis.core`).

---

### IngestionError

```python
class IngestionError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.core._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | Document loading fails — file not found, unsupported format, encoding error, permission denied |
| **Message pattern** | `"Failed to ingest document {doc_id}: {reason}. source={source_path}"` |
| **Recovery** | Verify the document source is accessible and in a supported format. Remove the document from the ingestion batch if non-critical. |

---

### ChunkingError

```python
class ChunkingError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.core._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | The chunking strategy fails to produce any chunks from a document, or produces chunks with invalid provenance |
| **Message pattern** | `"Chunking failed for document {doc_id} using strategy {strategy}: {reason}"` |
| **Recovery** | Check chunking config (chunk size, overlap, strategy type). Verify the document is non-empty and parseable. |

---

### EmbeddingError

```python
class EmbeddingError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.core._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | The `EmbedderAdapter.embed()` call fails, or the returned vector dimension does not match `CorpusVersion.embedding_dimension` |
| **Message pattern** | `"Embedding failed for batch of {n} chunks: {reason}. model={model_id}"` |
| **Recovery** | Check embedder availability and API credentials. If dimension mismatch, the embedding model changed — rebuild the corpus with the new model. |

---

### CorpusVersionError

```python
class CorpusVersionError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.core._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | An `IndexedCorpus` is constructed with inconsistent version metadata (e.g., `corpus_id` mismatch, invalid `schema_version`) |
| **Message pattern** | `"Corpus version inconsistency: {reason}. corpus_id={corpus_id}"` |
| **Recovery** | Rebuild the corpus cleanly. Indicates a bug in the corpus construction pipeline. |

---

## Retrieval Layer Errors

These live in `ragaxis.retrieval._errors`.

---

### EmptyRetrievalError

```python
class EmptyRetrievalError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.retrieval._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | The vector store returns zero results for the query after applying all filters |
| **Message pattern** | `"Retrieval returned no chunks for query. corpus_id={corpus_id}, k={k}, filters={filters}"` |
| **Recovery** | Broaden the query, increase `k`, relax metadata filters, or verify the corpus is not empty. Do not proceed to synthesis with zero chunks. |

---

### EmbedderMismatchError

```python
class EmbedderMismatchError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.retrieval._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | `EmbedderAdapter.get_model_id()` does not match `IndexedCorpus.corpus_version.embedding_model_id` |
| **Message pattern** | `"Embedder mismatch: query uses '{query_model}' but corpus was indexed with '{corpus_model}'. Re-index corpus or switch embedder."` |
| **Recovery** | Either re-index the corpus with the current embedder, or configure retrieval to use the model that matches the corpus. Never allow retrieval to proceed with mismatched embedders. |

---

### CorpusVersionMismatchError

```python
class CorpusVersionMismatchError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.retrieval._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | The corpus staleness age exceeds the configured `max_staleness_seconds` threshold |
| **Message pattern** | `"Corpus {corpus_id} is stale: last updated {age_days} days ago, threshold is {threshold_days} days."` |
| **Recovery** | Re-index the corpus or increase the staleness threshold if the current age is acceptable for the use case. |

---

### ScoreCollapseWarning

```python
class ScoreCollapseWarning(DegradedError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.retrieval._errors` |
| **Severity** | Warning (Degraded) |
| **Inherits from** | `DegradedError` |
| **When raised** | `max(scores) - min(scores) < score_collapse_threshold` (default threshold: `0.05`) |
| **Message pattern** | `"Score collapse detected: score range is {range:.4f} (threshold {threshold}). Signal quality is weak. top_score={top_score:.4f}"` |
| **Recovery** | Pipeline continues. Synthesis receives the chunks with a `ScoreCollapseWarning` in the audit trail. Downstream: consider broadening query, increasing `k`, or adjusting retrieval strategy. |

---

### RetrievalQualityWarning

```python
class RetrievalQualityWarning(DegradedError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.retrieval._errors` |
| **Severity** | Warning (Degraded) |
| **Inherits from** | `DegradedError` |
| **When raised** | Retrieved chunks fall below the configured `min_score_threshold`, or `top_5_diversity_score` is below the diversity threshold |
| **Message pattern** | `"Retrieval quality degraded: {reason}. best_score={best_score:.4f}, diversity={diversity:.4f}"` |
| **Recovery** | Pipeline continues with low-quality results. Flag for human review via `RunResult.quality_summary`. |

---

## Synthesis Layer Errors

These live in `ragaxis.synthesis._errors`.

---

### ContextBudgetExceededError

```python
class ContextBudgetExceededError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.synthesis._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | The minimum required context (e.g., a single chunk) exceeds `SynthesisConfig.context_token_budget` — truncation cannot help because even one chunk is too large |
| **Message pattern** | `"Context budget exhausted: smallest chunk ({min_tokens} tokens) exceeds budget ({budget} tokens). Cannot assemble context."` |
| **Recovery** | Increase `context_token_budget`, use a smaller chunking strategy, or switch to a model with a larger context window. |

---

### ContextTruncationWarning

```python
class ContextTruncationWarning(DegradedError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.synthesis._errors` |
| **Severity** | Warning (Degraded) |
| **Inherits from** | `DegradedError` |
| **When raised** | Context assembly drops one or more chunks to fit within `context_token_budget` (I2) |
| **Message pattern** | `"Context truncated: dropped {n_chunks} chunks ({tokens_dropped} tokens) to fit budget of {budget} tokens. strategy={strategy}"` |
| **Recovery** | Pipeline continues. Truncation event recorded in `PipelineResult.truncation_audit`. Consider increasing budget or reducing `k` to retrieve fewer, higher-quality chunks. |

---

### GenerationError

```python
class GenerationError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.synthesis._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | `LLMAdapter.complete()` raises, times out, or returns an empty string |
| **Message pattern** | `"LLM generation failed: {reason}. model={model_id}, prompt_tokens={n}"` |
| **Recovery** | Check LLM adapter credentials and availability. Implement retry logic in the `LLMAdapter` implementation before raising `GenerationError`. |

---

### CitationError

```python
class CitationError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.synthesis._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | Citation injection references a `chunk_id` not present in the `RetrievalResult` that was passed to synthesis |
| **Message pattern** | `"Citation references unknown chunk_id='{chunk_id}'. Available chunk_ids: {available}"` |
| **Recovery** | Indicates a bug in the citation injection logic. The chunk set must not change between retrieval and citation injection. |

---

### OutputValidationError

```python
class OutputValidationError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.synthesis._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | The generated answer fails post-generation validation: empty string, exceeds max length, or fails a configured output guard |
| **Message pattern** | `"Output validation failed: {reason}. answer_length={n}, model={model_id}"` |
| **Recovery** | Check generation config (temperature, max_tokens). If the LLM consistently fails validation, review the prompt template. |

---

## System Layer Errors

These live in `ragaxis.system._errors`.

---

### PipelineExecutionError

```python
class PipelineExecutionError(RagAxisError):
    pass
```

| Property | Value |
| --- | --- |
| **Location** | `ragaxis.system._errors` |
| **Severity** | Fatal |
| **Inherits from** | `RagAxisError` |
| **When raised** | Cross-layer validation fails during `RunResult` assembly — e.g., `RetrievalResult.query` does not match the original query, or an unexpected error escapes a layer without being typed |
| **Message pattern** | `"Pipeline execution failed at {stage}: {reason}. run_id={run_id}"` |
| **Recovery** | Investigate the stage identified in the message. This error wraps unexpected failures that bypassed layer-level error handling. |

---

## Adapter Transport Errors

These are raised by adapter implementations and must **not** be suppressed into generic `Exception` (I4). They live in the relevant adapter module.

```python
# ragaxis.adapters._errors

class RateLimitError(RagAxisError):
    """Provider rate limit hit. Adapter should implement retry before raising."""
    pass

class ContextLengthError(RagAxisError):
    """Prompt exceeds provider's context window. Reduce prompt before retrying."""
    pass

class ProviderSchemaError(RagAxisError):
    """Provider returned an unexpected response schema. Adapter version mismatch."""
    pass

class TransportError(RagAxisError):
    """Network-level failure (timeout, DNS, TLS). Adapter should implement retry."""
    pass
```

| Error | When raised | Recovery |
| --- | --- | --- |
| `RateLimitError` | Provider returns 429 or equivalent | Back off and retry; expose retry-after header in `context` |
| `ContextLengthError` | Prompt token count exceeds provider limit | Reduce prompt size before retrying; surface to `ContextBudgetExceededError` |
| `ProviderSchemaError` | Provider response does not match expected schema | Update adapter to match current provider API |
| `TransportError` | Network timeout, DNS failure, TLS error | Retry with exponential backoff; fail with `TransportError` after max retries |

---

## Error Hierarchy Summary

```text
Exception
└── RagAxisError                        ragaxis.core._errors         [FATAL]
    ├── MissingProvenanceError           ragaxis.core._errors         [FATAL]
    ├── ConfidenceCalibrationError       ragaxis.core._errors         [FATAL]
    ├── ConfigurationError               ragaxis.core._errors         [FATAL]
    ├── ValidationError                  ragaxis.core._errors         [FATAL]
    ├── IngestionError                   ragaxis.core._errors         [FATAL]
    ├── ChunkingError                    ragaxis.core._errors         [FATAL]
    ├── EmbeddingError                   ragaxis.core._errors         [FATAL]
    ├── CorpusVersionError               ragaxis.core._errors         [FATAL]
    ├── EmptyRetrievalError              ragaxis.retrieval._errors    [FATAL]
    ├── EmbedderMismatchError            ragaxis.retrieval._errors    [FATAL]
    ├── CorpusVersionMismatchError       ragaxis.retrieval._errors    [FATAL]
    ├── ContextBudgetExceededError       ragaxis.synthesis._errors    [FATAL]
    ├── GenerationError                  ragaxis.synthesis._errors    [FATAL]
    ├── CitationError                    ragaxis.synthesis._errors    [FATAL]
    ├── OutputValidationError            ragaxis.synthesis._errors    [FATAL]
    ├── PipelineExecutionError           ragaxis.system._errors       [FATAL]
    ├── RateLimitError                   ragaxis.adapters._errors     [FATAL]
    ├── ContextLengthError               ragaxis.adapters._errors     [FATAL]
    ├── ProviderSchemaError              ragaxis.adapters._errors     [FATAL]
    ├── TransportError                   ragaxis.adapters._errors     [FATAL]
    └── DegradedError                    ragaxis.core._errors         [WARNING]
        ├── ScoreCollapseWarning         ragaxis.retrieval._errors    [WARNING]
        ├── RetrievalQualityWarning      ragaxis.retrieval._errors    [WARNING]
        └── ContextTruncationWarning     ragaxis.synthesis._errors    [WARNING]
```

---

## Invariant I4 Enforcement Checklist

Every adapter and layer function must satisfy:

- [ ] No `except Exception` anywhere in ragaxis code
- [ ] Every provider SDK error is caught and re-raised as a typed `RagAxisError` subclass
- [ ] `DegradedError` subclasses are caught at the layer boundary, recorded in `audit_trail`, and execution continues
- [ ] `RagAxisError` subclasses propagate to `ragaxis.system`, which wraps them in `PipelineExecutionError` before returning to caller
- [ ] Every error carries `message` (str) and `context` (dict) — never a bare string
