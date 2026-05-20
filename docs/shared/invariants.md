# The 7 Invariants

**Non-negotiable rules that every rag-axis component must satisfy.**

These invariants are not guidelines. They are enforcement mechanisms. They prevent silent failures and make systems reproducible.

> **Important:** Relaxing any invariant is a breaking change — major version bump required. The 7 invariants are frozen for the lifetime of v1.x and beyond.

---

## I1 — Provenance Enforcement

**Every chunk carries immutable metadata about its origin. Missing provenance raises an error immediately.**

### What It Means

Every piece of text (chunk) retrieved from your knowledge base must remember:
- Which document it came from (parent_doc_id)
- Where it lived in that document (position)
- Which embedding model was used to index it (embedding_model_id)

This metadata is locked. It cannot be lost, modified, or forgotten as the chunk moves through the system.

### Why It Matters

Think of it like a food supply chain. A grocery store shelf item must know:
- Which farm/factory produced it
- What batch number it belongs to
- When and how it was processed

If you lose that information, you cannot trace contamination, verify authenticity, or understand quality. A chunk without provenance is anonymous text floating in the system—you cannot trust it or debug it.

### Real Example

Your RAG system retrieves a chunk: *"The quarterly revenue was $50M."*

Without I1, you might ask: "Where did this come from? Is it recent? From which document? Can I verify it?"

With I1, the chunk carries:
- parent_doc_id = "financial-report-2026-q1"
- position = 342 (byte offset in document)
- embedding_model_id = "text-embedding-3-large"

Now you know exactly what to trust, where to look, and if the embedding model changed, you know this chunk may be stale.

### How It's Enforced

When a chunk is created, rag-axis validates:
- `parent_doc_id` is not None or empty
- `position` is a valid integer
- `embedding_model_id` matches a known model

If any field is missing, it raises `MissingProvenanceError` immediately. You cannot proceed with incomplete metadata.

---

## I2 — No Silent Failures

**If something goes wrong, it must be logged explicitly. Operations never succeed by hiding what was lost.**

### What It Means

When the system degrades, truncates, or drops information, it doesn't pretend everything is fine. It explicitly reports what happened, where, and why.

Examples:
- Retrieval returned only 3 chunks instead of 10 → logged
- Context was truncated to fit token budget → logged, with event details
- Embedder model changed → detected and reported
- Score quality degraded → warning emitted

### Why It Matters

Think of a bridge inspection system. If an inspector finds a crack but doesn't report it because "the bridge still stands," people might drive over it unknowingly and get hurt.

In RAG, if you silently drop context or return low-confidence results, your users act on incomplete information. Silent failures are the worst kind—confident but wrong.

### Real Example

Your Synthesis Layer (answer generation) has a token budget of 4,096 tokens. The context assembled from Retrieval Layer is 6,000 tokens.

**Without I2:** The system silently truncates the context to fit. The answer is generated. The user never knows that critical information was dropped.

**With I2:** A `ContextTruncationEvent` is emitted:
```
{
  "chunks_dropped": 3,
  "tokens_dropped": 1904,
  "reason": "token_budget_exceeded",
  "position": "end_of_context",
  "timestamp": "2026-05-20T14:32:00Z"
}
```

The user (or monitoring system) sees this event and knows the answer is based on truncated context. They can decide: accept the partial answer or increase budget.

### How It's Enforced

Every result contract (`RetrievalResult`, `PipelineResult`) includes an audit trail. Audit trails are not optional logs—they are part of the return type. You cannot generate a result without declaring what was lost.

---

## I3 — Confidence Calibration

**Confidence is never implicit, never None, never vague. Unknown confidence is a sentinel type, never omitted.**

### What It Means

Every score or prediction has an explicit confidence level:
- Either a float between 0.0 and 1.0 (meaning "I am X% sure")
- Or a `ConfidenceUnknown` sentinel (meaning "I genuinely don't know")

There is no middle ground. No `None`. No `?` placeholders. No assumptions.

### Why It Matters

Think of a weather forecast. If a meteorologist says "Rain possible today" but doesn't specify confidence (40%? 90%? 5%?), you cannot make good decisions.

In RAG, confidence scores guide downstream decisions:
- Should I trust this chunk for answering?
- Should I rerank these candidates?
- Should I retry with a different retrieval strategy?

Without calibrated confidence, every decision is a guess.

### Real Example

Retrieval Layer returns three chunks with similarity scores:

**Without I3:**
- Chunk 1: score = 0.87
- Chunk 2: score = 0.82
- Chunk 3: score = None (embedder couldn't compute it)

What does None mean? Is it bad? Should we skip it? Unclear.

**With I3:**
- Chunk 1: score = 0.87, confidence = 0.95 (confident in this score)
- Chunk 2: score = 0.82, confidence = 0.88 (confident but slightly less)
- Chunk 3: score = 0.73, confidence = ConfidenceUnknown (the score is uncertain, maybe embedder was stressed)

Now downstream code knows: Chunk 1 is trustworthy. Chunk 3's score is questionable—maybe verify it or use it cautiously.

### How It's Enforced

Typed as: `score: float | ConfidenceUnknown`

If a function tries to return a None confidence, type checkers catch it. If it tries to ignore ConfidenceUnknown, the code path is explicit (e.g., `if confidence is ConfidenceUnknown: raise Error`).

---

## I4 — Typed Error Hierarchy

**Every failure is a named, typed exception. No bare Exception raises. The error tells you exactly what went wrong.**

### What It Means

Instead of generic exceptions (`Exception`, `RuntimeError`, `ValueError`), rag-axis uses a hierarchy of specific, typed errors:

- `RagAxisError` (base, fatal—system must stop)
  - `EmptyRetrievalError` (no chunks returned from search)
  - `EmbedderMismatchError` (query embedding model ≠ corpus embedding model)
  - `ContextBudgetExceededError` (context window exceeds token limit)
- `DegradedError` (base, warning—system continues)
  - `ScoreCollapseWarning` (score range too narrow, signal is weak)
  - `ContextTruncationWarning` (context was truncated, but answer generated anyway)

### Why It Matters

Think of a car's dashboard. Instead of a vague "Error" light, you get specific warnings:
- "Check engine" → engine issue
- "Low fuel" → refuel
- "Door open" → close door

Each error tells you exactly what to do next.

In RAG, catching `except Exception` is useless. But catching `except EmbedderMismatchError` lets you re-index the corpus. Catching `except ContextBudgetExceededError` lets you increase token limit.

### Real Example

Your Retrieval Layer executes a search. Multiple failure modes possible:

**Without I4:**
```
try:
    chunks = search(query)
except Exception as e:
    # What do we do? Retry? Log? Fail?
    # Impossible to know from generic Exception
```

**With I4:**
```
try:
    chunks = search(query)
except EmptyRetrievalError:
    # No results. Try with different parameters.
    chunks = search(query, k=100)
except EmbedderMismatchError:
    # Embedding model changed. Re-index corpus first.
    raise  # Fatal, cannot continue
except ScoreCollapseWarning:
    # Weak signal, but we have results. Log and continue.
    log_warning("Score collapse detected")
```

Each error is actionable.

### How It's Enforced

The error hierarchy is defined in `_errors.py` in each package. Type checkers ensure:
- No bare `Exception` raises in core code
- Specific exceptions are caught, not generic ones
- Errors are propagated or handled explicitly

---

## I5 — No Provider Dependencies in Core

**The core library imports no LLM SDK, no embedding library, no vector database client. Integrations are pluggable.**

### What It Means

When you `pip install rag-axis`, you get:
- Core types and logic
- No OpenAI SDK bloat
- No Pinecone client dependencies
- No Anthropic library

Integrations (embedding, LLM, vector store) are optional, plugged in via adapters.

### Why It Matters

Think of a universal power outlet adapter system. A device doesn't ship with every possible plug type (US, EU, UK, etc.). Instead, it has a standard socket, and you buy the adapter for your region.

If core bundled all SDKs, users who only need Retrieval Layer would be forced to install LLM dependencies they don't use. Build times explode. Security surface expands. Versions conflict.

### Real Example

**Without I5:**
```bash
pip install rag-axis
# Installs: rag-axis + openai + pinecone + anthropic + weaviate + ...
# 200+ dependencies, even if you only need dense retrieval
```

**With I5:**
```bash
pip install rag-axis
# Installs: rag-axis + pydantic + opentelemetry-api (minimal)

# Then, per your adapter choice:
pip install rag-axis[adapters-openai-pinecone]
# Or:
pip install rag-axis[adapters-anthropic-weaviate]
```

Each team picks their stack. Core stays light and stable.

### How It's Enforced

Core packages (`ragaxis.core`, `ragaxis.retrieval`, etc.) define protocols (interfaces). Adapters implement these protocols.

When you instantiate an adapter:
```python
from ragaxis.adapters.embedding import OpenAIEmbedder
embedder = OpenAIEmbedder(api_key="...")
```

You're bringing in the OpenAI dependency at that moment, not at library import time.

---

## I6 — Immutable Stage Boundaries

**All cross-stage types are frozen dataclasses. State changes only via typed replacement, never mutation.**

### What It Means

When a layer outputs a result (IndexedCorpus, RetrievalResult, PipelineResult), that result is frozen. You cannot modify it in place. To change a field, you create a new version via `dataclasses.replace()`.

### Why It Matters

Think of sealed containers on an assembly line. Once a container is sealed and passed to the next station, that station cannot modify it secretly. If the next station wants to change something, it creates a new sealed container.

This prevents:
- Silent configuration changes between stages
- Bugs where stage N modifies something stage M depends on
- Unreproducible runs (because state drifted mid-execution)

### Real Example

Retrieval Layer produces a `RetrievalResult` with 10 chunks and a cost report showing 100 tokens used.

Synthesis Layer receives this result. A bug in the code tries to modify the cost report:

**Without I6 (mutable):**
```python
result.cost_report.tokens_used = 200  # Silently mutates!
# Now the audit trail is wrong. The original retrieval cost is lost.
```

**With I6 (frozen):**
```python
result.cost_report.tokens_used = 200
# AttributeError: cannot assign to frozen dataclass
# Caught immediately.
```

To change it, you must be explicit:
```python
updated_result = dataclasses.replace(
    result,
    cost_report=dataclasses.replace(result.cost_report, tokens_used=200)
)
```

Now it's clear: you're creating a new result, not modifying the original.

### How It's Enforced

All cross-stage types are decorated with `@dataclass(frozen=True)`. Python prevents any attribute assignment. Type checkers see this and enforce it.

---

## I7 — Cost Tracking Native

**Every result embeds a CostReport with tokens, latency, and estimated cost per stage. Not in logs. In return types.**

### What It Means

When you execute a query, you get back:
- The answer (PipelineResult)
- Citations
- Audit trails
- **CostReport**: tokens used per stage, latency, estimated dollars

This cost is part of the result object, not printed to a log file you have to parse later.

### Why It Matters

Think of a grocery receipt. When you buy groceries, you don't get:
- A vague "Thank you for shopping" message
- A log file you have to read later to learn what you spent
- A promise that "we'll email you the total tomorrow"

You get an itemized receipt in your hand immediately. Same stage: Item 1 cost $3, Item 2 cost $5, Total: $8.

In RAG, cost is critical for production:
- How many tokens did this query cost?
- Which stage dominated the cost (retrieval vs generation)?
- Is my daily budget exceeded?

If cost is buried in logs, you cannot monitor in real-time or make per-query decisions.

### Real Example

You execute a query. Without I7, you might get:

```python
result = pipeline.execute(query)
print(result.answer)
# "The revenue was $50M"
# Cost? Check the logs... grep for "tokens_used"... maybe in stderr?
```

With I7:

```python
result = pipeline.execute(query)
print(result.answer)
# "The revenue was $50M"

print(result.cost_report)
# CostReport(
#   index_stage=Cost(tokens=0, latency_ms=0),
#   retrieval_stage=Cost(tokens=150, latency_ms=450),
#   synthesis_stage=Cost(tokens=320, latency_ms=800),
#   total_tokens=470,
#   estimated_cost_usd=0.012
# )
```

Now you know immediately: synthesis dominated, cost is $0.012. You can decide: is this acceptable?

### How It's Enforced

Every result contract includes a `cost_report: CostReport` field. Type checkers ensure:
- You cannot create a result without specifying cost
- Cost is always present, never optional
- Every component (embedder, LLM, vector store) reports cost back to its caller

---

## Summary

| Invariant | Purpose | Enforces |
|-----------|---------|----------|
| **I1** | Provenance Enforcement | Chunks know their origin, always |
| **I2** | No Silent Failures | Degradation is logged, never hidden |
| **I3** | Confidence Calibration | Uncertainty is explicit or unknown, never vague |
| **I4** | Typed Error Hierarchy | Every failure is specific and actionable |
| **I5** | No Provider Dependencies | Core stays light, integrations pluggable |
| **I6** | Immutable Stage Boundaries | State changes only via typed replacement |
| **I7** | Cost Tracking Native | Cost is observable, not hidden in logs |

---

## How to Verify Invariants

When building components or reviewing code, ask:

- **I1:** Does every chunk carry parent_doc_id, position, embedding_model_id?
- **I2:** Is every failure logged in the audit trail (not silently skipped)?
- **I3:** Is every confidence float | ConfidenceUnknown (never None)?
- **I4:** Is every exception a named subclass of RagAxisError or DegradedError?
- **I5:** Does core/ import only stdlib, pydantic, otel-api (no provider SDKs)?
- **I6:** Are all cross-stage types @dataclass(frozen=True)?
- **I7:** Does every result include a CostReport field with stage breakdown?

If any invariant is violated, it's a blocker. The PR does not merge.
