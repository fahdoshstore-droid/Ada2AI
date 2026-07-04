"""Standalone Ada2Physique FastAPI app — for Cloud Run / Docker deployment.

Run:  uvicorn backend.physique.app:app --host 0.0.0.0 --port 8080
"""
from __future__ import annotations
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import router as physique_router
from .config import get_settings

settings = get_settings()

app = FastAPI(
    title="Ada2Physique API",
    description="AI Bodybuilding Intelligence Platform — Phase 1 Coaching Service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in [settings.cors_origin, os.getenv("CORS_ORIGIN", "")] if o],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(physique_router)


@app.get("/")
def root() -> dict:
    return {"service": "ada2physique", "docs": "/docs", "health": "/physique/v1/health"}
