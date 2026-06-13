---
sidebar_position: 3
title: Retrieval API Reference
---

# Retrieval API Reference

`ragaxis.retrieval` is part of the Retrieval Core layer and runs on the live query path. It provides dense, sparse, and hybrid retrieval, with hybrid fusion implemented via Reciprocal Rank Fusion (RRF, k=60 by default).

Every query executed through this package returns a `RetrievalResult`, which carries the retrieved chunks alongside a confidence signal (or `ConfidenceUnknown`, per invariant I3) and metadata about the query that produced it. Retrieval configuration includes metadata filters, top-k limits, and the fusion strategy used when combining dense and sparse results.

Detailed type-by-type and function-by-function reference will be published as the retrieval package's public API stabilizes.
