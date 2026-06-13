---
sidebar_position: 1
title: "Example: Basic RAG"
---

# Example: Basic RAG

This example uses the `ragaxis.ldk` defaults to build the smallest possible end-to-end pipeline: ingest a handful of documents, run a query, and inspect the result.

```python
from ragaxis.core import Document
from ragaxis.ldk import default_pipeline

pipeline = default_pipeline()

docs = [
    Document(id="1", text="RAG Axis tracks cost per pipeline stage.", metadata={}),
    Document(id="2", text="Every Chunk carries its parent document and position.", metadata={}),
]

pipeline.ingest(docs)

result = pipeline.run("How does RAG Axis track cost?")

print(result.answer)
print(result.cost_report)
```

`default_pipeline()` wires up an in-memory vector store and reference LLM and embedding adapters, so this example runs without any external services configured. For a configuration that uses your own providers, see [Example: Custom Adapters](./with-adapters.md).
