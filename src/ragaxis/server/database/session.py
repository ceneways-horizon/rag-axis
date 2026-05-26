from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from ragaxis.server.config import get_config
from ragaxis.server.database.models import Base

_engine = None
_SessionLocal = None


def _get_engine() -> object:
    global _engine  # noqa: PLW0603
    if _engine is None:
        cfg = get_config()
        connect_args = {"check_same_thread": False} if cfg.database_url.startswith("sqlite") else {}
        _engine = create_engine(cfg.database_url, connect_args=connect_args)
    return _engine


def _get_session_factory() -> sessionmaker:  # type: ignore[type-arg]
    global _SessionLocal  # noqa: PLW0603
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())
    return _SessionLocal


def init_db() -> None:
    engine = _get_engine()
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    SessionLocal = _get_session_factory()
    with SessionLocal() as session:
        yield session
