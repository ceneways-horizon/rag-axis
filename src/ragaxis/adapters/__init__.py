"""
ragaxis.adapters: Concrete implementations of adapter protocols.

Provides plug-and-play implementations for embedding, vector store, and LLM providers.
Core packages never import from this package — they use protocols from ragaxis.core._protocols.

See: docs/internal/contracts/adapters.md
Phase: 0 (parallel with core)
"""

from __future__ import annotations

from ragaxis.adapters.embedding.anthropic import AnthropicEmbedder
from ragaxis.adapters.embedding.hugging_face import HuggingFaceEmbedder

# Embedders
from ragaxis.adapters.embedding.openai import OpenAIEmbedder
from ragaxis.adapters.llm.anthropic import AnthropicLLM

# LLMs
from ragaxis.adapters.llm.openai import OpenAILLM
from ragaxis.adapters.vector_store.milvus import MilvusVectorStore

# Vector stores
from ragaxis.adapters.vector_store.pinecone import PineconeVectorStore
from ragaxis.adapters.vector_store.weaviate import WeaviateVectorStore

__all__ = [
    "AnthropicEmbedder",
    "AnthropicLLM",
    "HuggingFaceEmbedder",
    "MilvusVectorStore",
    "OpenAIEmbedder",
    "OpenAILLM",
    "PineconeVectorStore",
    "WeaviateVectorStore",
]
