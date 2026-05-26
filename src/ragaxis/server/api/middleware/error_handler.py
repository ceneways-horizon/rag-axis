from __future__ import annotations

import logging

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        try:
            return await call_next(request)
        except ValueError as exc:
            logger.warning("Validation error: %s", exc)
            return JSONResponse(
                status_code=400,
                content={"error": {"code": "BAD_REQUEST", "message": str(exc), "details": {}}},
            )
        except KeyError as exc:
            logger.warning("Not found: %s", exc)
            return JSONResponse(
                status_code=404,
                content={"error": {"code": "NOT_FOUND", "message": str(exc), "details": {}}},
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception("Unhandled server error")
            return JSONResponse(
                status_code=500,
                content={
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An unexpected error occurred",
                        "details": {"type": type(exc).__name__},
                    }
                },
            )
