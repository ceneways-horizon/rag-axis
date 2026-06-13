from __future__ import annotations

from typing import TYPE_CHECKING

from ragaxis.server.database.session import get_db as _get_db

if TYPE_CHECKING:
    from collections.abc import Generator

    from sqlalchemy.orm import Session


def get_db() -> Generator[Session, None, None]:
    yield from _get_db()
