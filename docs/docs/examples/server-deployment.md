---
sidebar_position: 3
title: "Example: Server Deployment"
---

# Example: Server Deployment

This example deploys `ragaxis.server` with a Pinecone vector store adapter using Docker Compose.

```yaml
version: "3.9"
services:
  ragaxis-server:
    image: ragaxis/server:latest
    ports:
      - "8000:8000"
    environment:
      RAGAXIS_VECTOR_STORE: pinecone
      PINECONE_API_KEY: ${PINECONE_API_KEY}
      PINECONE_INDEX: ragaxis-prod
      RAGAXIS_LLM_PROVIDER: openai
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    restart: unless-stopped
```

Start the service with:

```bash
docker compose up -d
```

Once running, the server exposes a `/health` endpoint. Per invariant I6, this endpoint reports a degraded status rather than failing to start if Pinecone or the configured LLM provider is unreachable, so you can deploy the server before all dependencies are fully configured and observe exactly what is missing.

See [Deploying the Server](/docs/guides/deploying-server) for the full deployment guide, including Kubernetes manifests and configuration reference.
