---
sidebar_position: 7
title: Server API Reference
---

# Server API Reference

`ragaxis.server` exposes a RAG Axis pipeline as a standalone REST service, intended for deployments that want to run retrieval and generation behind a network boundary rather than as an embedded library.

The server is planned for the post-v1.0 milestone. Per invariant I6, it is designed to start successfully even when external services such as the vector store or LLM provider are unavailable, returning a degraded status from its health endpoint rather than failing to start.

Endpoint-by-endpoint reference will be published once the server package reaches its first stable release. See [Deploying the Server](/docs/guides/deploying-server) for the deployment guide.
