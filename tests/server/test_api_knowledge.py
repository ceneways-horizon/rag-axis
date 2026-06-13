from __future__ import annotations

import io
from typing import TYPE_CHECKING

import pytest

if TYPE_CHECKING:
    from fastapi.testclient import TestClient


def _make_project(client: TestClient, name: str = "Test Project") -> str:
    resp = client.post("/api/projects", json={"name": name})
    return resp.json()["id"]


def _make_corpus(client: TestClient, project_id: str, name: str = "Test Corpus") -> str:
    resp = client.post(
        f"/api/projects/{project_id}/knowledge/corpus",
        json={"name": name, "embedding_model_id": "text-embedding-3-small"},
    )
    assert resp.status_code == 201
    return resp.json()["id"]


@pytest.mark.unit
def test_create_corpus(client: TestClient):
    pid = _make_project(client)
    resp = client.post(
        f"/api/projects/{pid}/knowledge/corpus",
        json={"name": "My Corpus", "embedding_model_id": "text-embedding-3-small"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "My Corpus"
    assert data["embedding_model_id"] == "text-embedding-3-small"
    assert data["status"] == "indexing"
    assert data["document_count"] == 0


@pytest.mark.unit
def test_create_corpus_project_not_found(client: TestClient):
    resp = client.post(
        "/api/projects/bad-id/knowledge/corpus",
        json={"name": "Corpus", "embedding_model_id": "model"},
    )
    assert resp.status_code == 404


@pytest.mark.unit
def test_list_corpus_empty(client: TestClient):
    pid = _make_project(client)
    resp = client.get(f"/api/projects/{pid}/knowledge/corpus")
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.unit
def test_list_corpus(client: TestClient):
    pid = _make_project(client)
    _make_corpus(client, pid, "Corpus A")
    _make_corpus(client, pid, "Corpus B")
    resp = client.get(f"/api/projects/{pid}/knowledge/corpus")
    assert resp.status_code == 200
    assert resp.json()["total"] == 2


@pytest.mark.unit
def test_get_corpus(client: TestClient):
    pid = _make_project(client)
    cid = _make_corpus(client, pid)
    resp = client.get(f"/api/projects/{pid}/knowledge/corpus/{cid}")
    assert resp.status_code == 200
    assert resp.json()["id"] == cid


@pytest.mark.unit
def test_get_corpus_not_found(client: TestClient):
    pid = _make_project(client)
    resp = client.get(f"/api/projects/{pid}/knowledge/corpus/bad-id")
    assert resp.status_code == 404


@pytest.mark.unit
def test_list_documents_empty(client: TestClient):
    pid = _make_project(client)
    cid = _make_corpus(client, pid)
    resp = client.get(f"/api/projects/{pid}/knowledge/documents?corpus_id={cid}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.unit
def test_upload_documents(client: TestClient):
    pid = _make_project(client)
    cid = _make_corpus(client, pid)
    files = [("files", ("test.txt", io.BytesIO(b"hello world"), "text/plain"))]
    data = {"corpus_id": cid}
    resp = client.post(
        f"/api/projects/{pid}/knowledge/documents",
        files=files,
        data=data,
    )
    assert resp.status_code == 202
    result = resp.json()
    assert "job_id" in result
    assert result["status"] == "accepted"


@pytest.mark.unit
def test_delete_document_not_found(client: TestClient):
    pid = _make_project(client)
    resp = client.delete(f"/api/projects/{pid}/knowledge/documents/bad-id")
    assert resp.status_code == 404
