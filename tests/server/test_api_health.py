from __future__ import annotations

from typing import TYPE_CHECKING

import pytest

if TYPE_CHECKING:
    from fastapi.testclient import TestClient


@pytest.mark.unit
def test_health_ok(client: TestClient):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
    assert data["version"] == "0.0.1"


@pytest.mark.unit
def test_telemetry(client: TestClient):
    resp = client.get("/api/telemetry")
    assert resp.status_code == 200
    data = resp.json()
    assert "python_version" in data
    assert "platform" in data
    assert "timestamp" in data
