---
sidebar_position: 5
title: Adapters API Reference
---

# Adapters API Reference

`ragaxis.adapters` defines the three Protocol contracts that connect RAG Axis to external providers: `LLMAdapter`, `EmbedderAdapter`, and `VectorStoreAdapter`. Each is a `typing.Protocol` with `runtime_checkable`, so implementations are structural: a class does not need to inherit from any RAG Axis base class to satisfy the contract.

Per invariant I4, no adapter may suppress a provider error into a generic `Exception`. Adapters must raise typed errors such as `RateLimitError`, `ContextLengthError`, `ProviderSchemaError`, or `TransportError` so callers can handle each case appropriately.

This package also ships reference implementations for common providers, intended both as working adapters and as examples for implementing your own. See [Building a Custom Adapter](/docs/guides/building-custom-adapter) for a guide to writing one.
