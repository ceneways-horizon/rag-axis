from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sqlalchemy.orm import Session


class BaseService:
    def __init__(self, db: Session) -> None:
        self.db = db
