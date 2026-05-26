from __future__ import annotations

from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class ServerConfig(BaseSettings):
    database_url: str = "sqlite:///./rag-axis.db"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    cors_origins: list[str] = ["*"]

    model_config = ConfigDict(env_prefix="RAGAXIS_")


_config: ServerConfig | None = None


def get_config() -> ServerConfig:
    global _config  # noqa: PLW0603
    if _config is None:
        _config = ServerConfig()
    return _config
