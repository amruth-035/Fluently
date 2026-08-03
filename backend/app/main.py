import logging

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.dashboard import router as dashboard_router
from app.api.health import router as health_router
from app.api.sessions import router as sessions_router
from app.api.users import router as users_router
from app.config import settings
from app.utils.exception_handlers import http_exception_handler, validation_exception_handler
from app.utils.logging import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title="Fluently API", version="0.1.0")

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(users_router)
app.include_router(dashboard_router)
app.include_router(sessions_router)


@app.on_event("startup")
def on_startup() -> None:
    logger.info("Fluently API starting (CORS origins: %s)", settings.cors_origins_list)
