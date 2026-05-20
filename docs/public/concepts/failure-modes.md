# RAG Failure Modes

Seven failure classifications documented in production deployments.
rag-axis makes each one a named, catchable type.

## Missing Content
The correct document does not exist in the corpus.
The model fabricates a plausible answer.
**rag-axis response**: EmptyRetrievalError with corpus coverage signal.

## Missed Top-K
The correct chunk is indexed but scored too low to survive the top-k cutoff.
The system behaves as if the data is missing.
**rag-axis response**: BelowThresholdRetrieval with highest_score exposed.

## Out-of-Context Chunk
The chunk is retrieved but the chunking algorithm severed semantic dependencies.
The LLM misinterprets the isolated fragment.
**rag-axis response**: Chunk provenance (position, parent doc) mandatory via I1.

## Not Extracted
The relevant context is retrieved and injected but the LLM ignores it.
Lost-in-the-middle syndrome.
**rag-axis response**: Context ordering strategy in rag_axis.context.

## Wrong Format
The LLM ignores output schema constraints.
Downstream services crash on unparseable payloads.
**rag-axis response**: Schema-enforced output parsing in rag_axis.generation.

## Incorrect Specificity
The response is factually accurate but misaligned with user intent.
**rag-axis response**: Intent classification hook in query processing.

## Incomplete Generation
The response addresses only part of a multi-intent query.
**rag-axis response**: Multi-intent decomposition in query processing.

## Silent Failures
The most dangerous class. HTTP 200, normal latency, confident but wrong answer.
Caused by relevance drift, knowledge staleness, and embedding model mismatch.
**rag-axis response**: corpus_version, content_age_days, EmbeddingModelMismatchError,
ScoreCollapseWarning — all mandatory signals, never optional.
