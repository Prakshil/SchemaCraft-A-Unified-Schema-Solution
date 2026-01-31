"""
AI Schema Architect - API Routes
"""
from fastapi import APIRouter, HTTPException

from ..schemas.query import (
    SchemaRequest, SchemaResponse,
    ExportRequest, ExportResponse,
    HealthResponse
)
from ..services.schema_service import get_schema_service
from ..config import get_settings

router = APIRouter(prefix="/api", tags=["Schema Architect"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        llm_provider=settings.llm_provider,
        llm_configured=bool(settings.groq_api_key or settings.openai_api_key)
    )


@router.post("/generate")
async def generate_schema(request: SchemaRequest):
    """
    Generate database schema from app description.
    
    Returns:
    - Complete normalized schema
    - Table definitions with columns
    - Relationships between tables
    - Index suggestions
    """
    if not request.description.strip():
        raise HTTPException(status_code=400, detail="Description cannot be empty")
    
    if len(request.description) < 10:
        raise HTTPException(status_code=400, detail="Description too short. Please provide more detail.")
    
    service = get_schema_service()
    result = await service.generate_schema(
        description=request.description,
        complexity=request.complexity
    )
    
    return result


@router.post("/export", response_model=ExportResponse)
async def export_schema(request: ExportRequest):
    """
    Export schema to different formats.
    
    Supported formats:
    - postgresql: PostgreSQL DDL
    - mysql: MySQL DDL
    - prisma: Prisma schema file
    - drizzle: Drizzle ORM schema
    """
    service = get_schema_service()
    
    try:
        schema = request.schema
        
        if request.format == "postgresql":
            code = service.generate_postgresql(schema)
        elif request.format == "prisma":
            code = service.generate_prisma(schema)
        else:
            code = service.generate_postgresql(schema)  # Default
        
        return ExportResponse(
            status="success",
            code=code,
            format=request.format
        )
    except Exception as e:
        return ExportResponse(
            status="error",
            format=request.format,
            error=str(e)
        )


@router.get("/examples")
async def get_examples():
    """Get example app descriptions for inspiration."""
    return {
        "examples": [
            {
                "title": "E-Commerce Platform",
                "description": "An online store with users, products, categories, shopping cart, orders, payments, and reviews"
            },
            {
                "title": "Project Management Tool",
                "description": "A SaaS for teams with workspaces, projects, tasks, comments, file attachments, and time tracking"
            },
            {
                "title": "Social Media App",
                "description": "A platform with user profiles, posts, likes, comments, followers, direct messages, and notifications"
            },
            {
                "title": "Learning Management System",
                "description": "An LMS with courses, lessons, quizzes, student progress, certificates, and instructor analytics"
            },
            {
                "title": "Restaurant Booking",
                "description": "A reservation system with restaurants, tables, bookings, menu items, reviews, and loyalty points"
            }
        ]
    }
