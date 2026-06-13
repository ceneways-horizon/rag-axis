from __future__ import annotations

from typing import TYPE_CHECKING

import pytest

if TYPE_CHECKING:
    from fastapi.testclient import TestClient


def _make_project(client: TestClient) -> str:
    return client.post("/api/projects", json={"name": "Config Project"}).json()["id"]


def _make_config(
    client: TestClient, project_id: str, name: str = "MyConfig", version: str = "1.0"
) -> str:
    resp = client.post(
        f"/api/projects/{project_id}/configs",
        json={"name": name, "version": version, "config": {"retrieval": {"top_k": 5}}},
    )
    assert resp.status_code == 201
    return resp.json()["id"]


@pytest.mark.unit
def test_create_configuration(client: TestClient):
    pid = _make_project(client)
    resp = client.post(
        f"/api/projects/{pid}/configs",
        json={"name": "Prod Config", "version": "1.0.0", "config": {"top_k": 10}},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Prod Config"
    assert data["version"] == "1.0.0"
    assert data["status"] == "draft"
    assert data["config"]["top_k"] == 10


@pytest.mark.unit
def test_create_configuration_project_not_found(client: TestClient):
    resp = client.post(
        "/api/projects/bad-id/configs",
        json={"name": "Conf", "version": "1.0", "config": {}},
    )
    assert resp.status_code == 404


@pytest.mark.unit
def test_list_configurations_empty(client: TestClient):
    pid = _make_project(client)
    resp = client.get(f"/api/projects/{pid}/configs")
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.unit
def test_list_configurations(client: TestClient):
    pid = _make_project(client)
    _make_config(client, pid, "C1", "1.0")
    _make_config(client, pid, "C2", "2.0")
    resp = client.get(f"/api/projects/{pid}/configs")
    assert resp.status_code == 200
    assert resp.json()["total"] == 2


@pytest.mark.unit
def test_get_configuration(client: TestClient):
    pid = _make_project(client)
    cid = _make_config(client, pid)
    resp = client.get(f"/api/projects/{pid}/configs/{cid}")
    assert resp.status_code == 200
    assert resp.json()["id"] == cid


@pytest.mark.unit
def test_get_configuration_not_found(client: TestClient):
    pid = _make_project(client)
    resp = client.get(f"/api/projects/{pid}/configs/bad-id")
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "NOT_FOUND"


@pytest.mark.unit
def test_promote_configuration(client: TestClient):
    pid = _make_project(client)
    cid = _make_config(client, pid)
    resp = client.post(f"/api/projects/{pid}/configs/{cid}/promote")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "production"
    assert data["promoted_at"] is not None


@pytest.mark.unit
def test_delete_configuration(client: TestClient):
    pid = _make_project(client)
    cid = _make_config(client, pid)
    resp = client.delete(f"/api/projects/{pid}/configs/{cid}")
    assert resp.status_code == 204
    get_resp = client.get(f"/api/projects/{pid}/configs/{cid}")
    assert get_resp.status_code == 404


@pytest.mark.unit
def test_delete_configuration_not_found(client: TestClient):
    pid = _make_project(client)
    resp = client.delete(f"/api/projects/{pid}/configs/bad-id")
    assert resp.status_code == 404
