from __future__ import annotations

from typing import TYPE_CHECKING

import pytest

if TYPE_CHECKING:
    from fastapi.testclient import TestClient


@pytest.mark.unit
def test_create_project(client: TestClient):
    resp = client.post("/api/projects", json={"name": "My Project", "description": "Test"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "My Project"
    assert data["description"] == "Test"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.unit
def test_create_project_minimal(client: TestClient):
    resp = client.post("/api/projects", json={"name": "Minimal"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Minimal"
    assert data["description"] is None


@pytest.mark.unit
def test_create_project_invalid_empty_name(client: TestClient):
    resp = client.post("/api/projects", json={"name": ""})
    assert resp.status_code == 422


@pytest.mark.unit
def test_list_projects_empty(client: TestClient):
    resp = client.get("/api/projects")
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.unit
def test_list_projects(client: TestClient):
    client.post("/api/projects", json={"name": "P1"})
    client.post("/api/projects", json={"name": "P2"})
    resp = client.get("/api/projects")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


@pytest.mark.unit
def test_get_project(client: TestClient):
    created = client.post("/api/projects", json={"name": "GetMe"}).json()
    project_id = created["id"]
    resp = client.get(f"/api/projects/{project_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == project_id


@pytest.mark.unit
def test_get_project_not_found(client: TestClient):
    resp = client.get("/api/projects/nonexistent-id")
    assert resp.status_code == 404
    data = resp.json()
    assert data["error"]["code"] == "NOT_FOUND"


@pytest.mark.unit
def test_delete_project(client: TestClient):
    created = client.post("/api/projects", json={"name": "DeleteMe"}).json()
    project_id = created["id"]
    resp = client.delete(f"/api/projects/{project_id}")
    assert resp.status_code == 204
    get_resp = client.get(f"/api/projects/{project_id}")
    assert get_resp.status_code == 404


@pytest.mark.unit
def test_delete_project_not_found(client: TestClient):
    resp = client.delete("/api/projects/nonexistent-id")
    assert resp.status_code == 404
