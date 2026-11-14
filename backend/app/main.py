"""FastAPI Main Application.
AI-Powered Career Path Recommendation System.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.exceptions import register_exception_handlers
from app.core.logging import logger, setup_logging
from app.schemas.common import APIResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and logger is ready
    setup_logging()
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
    yield
    # Shutdown
    logger.info("Shutting down application...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Deterministic, pure Python career path recommendation engine, "
        "comprehensive student profiling, skill gap analysis, and phased learning roadmaps."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Centralized Error Handlers
register_exception_handlers(app)

# CORS Middleware
origins = settings.BACKEND_CORS_ORIGINS
if isinstance(origins, str):
    origins = [origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get(
    "/",
    response_model=APIResponse[dict],
    tags=["Health & Status"],
    summary="Root service welcome & info",
)
def root():
    return APIResponse(
        success=True,
        data={
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "operational",
            "docs": "/docs",
            "openapi": "/openapi.json",
        },
        message="Career Recommendation Backend Service is operational.",
    )


@app.get(
    "/health",
    response_model=APIResponse[dict],
    tags=["Health & Status"],
    summary="Health check probe",
)
def health_check():
    return APIResponse(
        success=True,
        data={
            "status": "healthy",
            "environment": settings.ENVIRONMENT,
            "database": "connected",
        },
        message="Service is healthy.",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
