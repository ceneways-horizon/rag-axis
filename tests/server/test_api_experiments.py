from __future__ import annotations

from typing import TYPE_CHECKING

import pytest

if TYPE_CHECKING:
    from fastapi.testclient import TestClient


def _make_project(client: TestClient) -> str:
    return client.post("/api/projects", json={"name": "Test Project"}).json()["id"]


def _make_corpus(client: TestClient, project_id: str) -> str:
    resp = client.post(
        f"/api/projects/{project_id}/knowledge/corpus",
        json={"name": "Test Corpus", "embedding_model_id": "text-embedding-3-small"},
    )
    return resp.json()["id"]


def _make_experiment(
    client: TestClient, project_id: str, corpus_id: str, name: str = "Exp1"
) -> str:
    resp = client.post(
        f"/api/projects/{project_id}/experiments",
        json={"name": name, "corpus_id": corpus_id, "config": {"top_k": 5}},
    )
    assert resp.status_code == 201
    return resp.json()["id"]


@pytest.mark.unit
def test_create_experiment(client: TestClient):
    pid = _make_project(client)
    cid = _make_corpus(client, pid)
    resp = client.post(
        f"/api/projects/{pid}/experiments",
        json={"name": "My Experiment", "corpus_id": cid, "config": {"top_k": 10}},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "My Experiment"
    assert data["status"] == "active"
    assert data["config"]["top_k"] == 10


@pytest.mark.unit
def test_create_experiment_invalid_corpus(client: TestClient):
    pid = _make_project(client)
    resp = client.post(
        f"/api/projects/{pid}/experiments",
        json={"name": "Exp", "corpus_id": "bad-corpus-id", "config": {}},
    )
    assert resp.status_code == 404


@pytest.mark.unit
def test_list_experiments_empty(client: TestClient):
    pid = _make_project(client)
    resp = client.get(f"/api/projects/{pid}/experiments")
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.unit
def test_list_experiments(client: TestClient):
    pid = _make_project(client)
    cid = _make_corpus(client, pid)
    _make_experiment(client, pid, cid, "E1")
    _make_experiment(client, pid, cid, "E2")
    resp = client.get(f"/api/projects/{pid}/experiments")
    assert resp.status_code == 200
    assert resp.json()["total"] == 2


@pytest.mark.unit
def test_get_experiment(client: TestClient):
    pid = _make_project(client)
    cid = _make_corpus(client, pid)
    eid = _make_experiment(client, pid, cid)
    resp = client.get(f"/api/projects/{pid}/experiments/{eid}")
    assert resp.status_code == 200
    assert resp.json()["id"] == eid


@pytest.mark.unit
def test_get_experiment_not_found(client: TestClient):
    pid = _make_project(client)
    resp = client.get(f"/api/projects/{pid}/experiments/bad-id")
    assert resp.status_code == 404


@pytest.mark.unit
def test_execute_run(client: TestClient):
    pid = _make_project(client)
    cid = _make_corpus(client, pid)
    eid = _make_experiment(client, pid, cid)
    resp = client.post(
        f"/api/projects/{pid}/experiments/{eid}/run",
        json={"query": "What is RAG?"},
    )
    assert resp.status_code == 202
    data = resp.json()
    assert "job_id" in data
    assert data["status"] == "accepted"


@pytest.mark.unit
def test_list_runs_empty(client: TestClient):
    pid = _make_project(client)
    cid = _make_corpus(client, pid)
    eid = _make_experiment(client, pid, cid)
    resp = client.get(f"/api/projects/{pid}/experiments/{eid}/runs")
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.unit
def test_get_run_not_found(client: TestClient):
    pid = _make_project(client)
    cid = _make_corpus(client, pid)
    eid = _make_experiment(client, pid, cid)
    resp = client.get(f"/api/projects/{pid}/experiments/{eid}/runs/bad-id")
    assert resp.status_code == 404


@pytest.mark.unit
def test_get_metrics_empty(client: TestClient):
    pid = _make_project(client)
    cid = _make_corpus(client, pid)
    eid = _make_experiment(client, pid, cid)
    resp = client.get(f"/api/projects/{pid}/experiments/{eid}/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_runs"] == 0
    assert data["success_rate"] == 0.0
