from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.orm import Session

from ragaxis.server.services.base_service import BaseService


class HealthService(BaseService):
    def __init__(self, db: Session) -> None:
        super().__init__(db)

    def check(self) -> dict:  # type: ignore[type-arg]
        db_ok = False
        try:
            self.db.execute(text("SELECT 1"))
            db_ok = True
        except Exception:  # noqa: BLE001
            pass

        return {
            "status": "ok" if db_ok else "degraded",
            "database": "ok" if db_ok else "error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
