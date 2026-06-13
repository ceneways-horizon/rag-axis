---
sidebar_position: 8
title: Troubleshooting
---

# Troubleshooting

### EmbeddingModelMismatchError

This error is raised when the embedding model used to index a chunk does not match the embedding model used to embed the current query. It usually means the corpus was indexed with a different `embedding_model_id` than the one configured for query-time embedding, often after upgrading an embedding model without re-indexing.

Resolution: re-embed and re-index the corpus with the new model, or pin the query-time embedder to the model recorded on existing chunks until re-indexing completes.

### ScoreCollapseWarning

This warning fires when reranked scores for the returned candidates are all very close together, which usually means the reranker is not meaningfully distinguishing between candidates for this query.

Resolution: check whether the candidate set passed to the reranker is too narrow (for example, retrieval already filtered too aggressively), or whether the query is genuinely ambiguous relative to the corpus.

### ContextTruncationEvent

This event is emitted whenever context assembly drops one or more chunks to fit the configured `ContextBudget`. It is not an error, it is the mandatory signal required by invariant I2.

Resolution: inspect the event's dropped chunks. If important context is being dropped consistently, increase the `ContextBudget`, reduce the number of chunks retrieved, or adjust the context ordering strategy so higher-value chunks are prioritized.

### EmptyRetrievalError

Raised when retrieval returns no candidates above the configured threshold. See [RAG Failure Modes](/docs/concepts/failure-modes) for the corpus coverage signal this error carries and how it differs from `BelowThresholdRetrieval`.

### Adapter raises a generic exception instead of a typed error

Per invariant I4, no adapter should suppress a provider error into a generic `Exception`. If you see this from a third-party adapter, it is a bug in that adapter. If you are writing your own adapter, see [Building a Custom Adapter](/docs/guides/building-custom-adapter) for the typed errors (`RateLimitError`, `ContextLengthError`, `ProviderSchemaError`, `TransportError`) you are expected to raise.
