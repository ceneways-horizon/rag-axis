from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from ragaxis.server.config import get_config
from ragaxis.server.database.models import Base

if TYPE_CHECKING:
    from collections.abc import Generator

    from sqlalchemy.engine import Engine

_engine: Engine | None = None
_session_local: sessionmaker[Session] | None = None


def _get_engine() -> Engine:
    global _engine  # noqa: PLW0603
    if _engine is None:
        cfg = get_config()
        connect_args = {"check_same_thread": False} if cfg.database_url.startswith("sqlite") else {}
        _engine = create_engine(cfg.database_url, connect_args=connect_args)
    return _engine


def _get_session_factory() -> sessionmaker[Session]:
    global _session_local  # noqa: PLW0603
    if _session_local is None:
        _session_local = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())
    return _session_local


def init_db() -> None:
    engine = _get_engine()
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    session_local = _get_session_factory()  # SQLAlchemy convention name
    with session_local() as session:
        yield session
