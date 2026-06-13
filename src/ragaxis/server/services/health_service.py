from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import text

from ragaxis.server.services.base_service import BaseService

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class HealthService(BaseService):
    def __init__(self, db: Session) -> None:
        super().__init__(db)

    def check(self) -> dict:  # type: ignore[type-arg]
        db_ok = False
        try:
            self.db.execute(text("SELECT 1"))
            db_ok = True
        except Exception:
            logger.debug("Database health check failed", exc_info=True)

        return {
            "status": "ok" if db_ok else "degraded",
            "database": "ok" if db_ok else "error",
            "timestamp": datetime.now(UTC).isoformat(),
        }
