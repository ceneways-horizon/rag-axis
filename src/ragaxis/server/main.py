from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ragaxis.server.api.middleware.error_handler import ErrorHandlerMiddleware
from ragaxis.server.api.middleware.request_logger import RequestLoggerMiddleware
from ragaxis.server.api.routes import health, projects, knowledge, experiments, configurations
from ragaxis.server.config import get_config
from ragaxis.server.database.session import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    cfg = get_config()

    app = FastAPI(
        title="RAG Axis Dashboard API",
        version="0.0.1",
        description="Production contract layer for RAG systems",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    origins = ["*"] if cfg.debug else cfg.cors_origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggerMiddleware)
    app.add_middleware(ErrorHandlerMiddleware)

    app.include_router(health.router)
    app.include_router(projects.router, prefix="/api")
    app.include_router(knowledge.router, prefix="/api")
    app.include_router(experiments.router, prefix="/api")
    app.include_router(configurations.router, prefix="/api")

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()
        logger.info("Database initialized")

    return app
