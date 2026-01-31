"""
AI Schema Architect - FastAPI Application
Generate production-ready database schemas from natural language
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routes.query import router as api_router

settings = get_settings()

app = FastAPI(
    title="SchemaForge",
    version=settings.app_version,
    description="Generate production-ready database schemas from natural language descriptions.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "name": "AI Schema Architect",
        "tagline": "Describe your app → Get a production-ready database",
        "version": settings.app_version,
        "docs": "/docs",
        "endpoints": {
            "generate": "POST /api/generate",
            "export": "POST /api/export",
            "examples": "GET /api/examples"
        }
    }
