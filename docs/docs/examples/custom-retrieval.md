---
sidebar_position: 2
title: "Example: Custom Retrieval"
---

# Example: Custom Retrieval

This example compares dense-only retrieval against hybrid retrieval on the same query, and shows how the resulting `RetrievalResult` objects differ.

```python
from ragaxis.retrieval import DenseRetriever, HybridRetriever

dense = DenseRetriever(store=store)
hybrid = HybridRetriever(store=store, rrf_k=60)

query = "How is chunk provenance tracked?"

dense_result = dense.query(query)
hybrid_result = hybrid.query(query)

print("dense:", [c.position for c in dense_result.chunks])
print("hybrid:", [c.position for c in hybrid_result.chunks])
```

Hybrid retrieval combines dense and sparse rankings using Reciprocal Rank Fusion. The `rrf_k` parameter controls how much weight lower-ranked results retain in the fused list; the default of 60 matches the value used throughout RAG Axis documentation and tests.

Both `dense_result` and `hybrid_result` carry a confidence signal. If either retriever returns no candidates above the configured threshold, the result includes `ConfidenceUnknown` rather than an empty list with no explanation, per invariant I3.
