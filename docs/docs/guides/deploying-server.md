---
sidebar_position: 7
title: Deploying the Server
---

# Deploying the Server

`ragaxis.server` packages a RAG Axis pipeline behind a FastAPI service, so it can run as a standalone subsystem rather than an embedded library. This guide covers running it with Docker and with Kubernetes.

## Docker

The server image expects its adapters and pipeline configuration to be supplied via environment variables. At minimum, configure an LLM provider and a vector store:

```bash
docker run -p 8000:8000 \
  -e RAGAXIS_LLM_PROVIDER=openai \
  -e OPENAI_API_KEY=sk-... \
  -e RAGAXIS_VECTOR_STORE=pinecone \
  -e PINECONE_API_KEY=... \
  -e PINECONE_INDEX=ragaxis-prod \
  ragaxis/server:latest
```

See [Example: Server Deployment](/docs/examples/server-deployment) for a Docker Compose configuration.

## Kubernetes

A minimal deployment runs the server image with the same environment variables, sourced from a `Secret` and `ConfigMap`, and exposes port 8000 via a `Service`. Because the server is designed to start even when external services are unreachable (invariant I6), readiness probes should check `/health` rather than relying on a successful boot alone, since a healthy process can still report a degraded status if a dependency is down.

## Health and Readiness

The `/health` endpoint reports the status of each configured adapter independently. A response of `degraded` with a healthy process means the server is up but one or more providers are unreachable, this is the expected behaviour during a rolling deploy or a provider outage, not a crash.

## Scaling

The server holds no mutable state between requests; every pipeline result is immutable and request-scoped. This means it can be scaled horizontally behind a load balancer without coordination between replicas. Caching (via `ragaxis.cache`) and corpus state live in the configured vector store and cache backend, not in the server process.
