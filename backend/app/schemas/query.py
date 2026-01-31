"""
AI Schema Architect - Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class SchemaRequest(BaseModel):
    """Request for schema generation."""
    description: str = Field(..., description="Natural language description of the app")
    complexity: str = Field("standard", description="simple | standard | enterprise")


class ColumnDef(BaseModel):
    """Column definition."""
    name: str
    type: str
    nullable: bool = True
    primary_key: bool = False
    unique: bool = False
    default: Optional[str] = None
    description: Optional[str] = None


class IndexDef(BaseModel):
    """Index definition."""
    name: str
    columns: List[str]
    unique: bool = False


class TableDef(BaseModel):
    """Table definition."""
    name: str
    description: Optional[str] = None
    columns: List[ColumnDef]
    indexes: List[IndexDef] = []


class RelationshipDef(BaseModel):
    """Relationship definition."""
    from_table: str
    from_column: str
    to_table: str
    to_column: str
    type: str  # one_to_one, one_to_many, many_to_one, many_to_many
    on_delete: Optional[str] = "CASCADE"


class GeneratedSchema(BaseModel):
    """Generated schema structure."""
    name: str
    description: Optional[str] = None
    tables: List[TableDef]
    relationships: List[RelationshipDef] = []
    suggestions: List[str] = []


class SchemaResponse(BaseModel):
    """Response for schema generation."""
    status: str
    schema: Optional[GeneratedSchema] = None
    error: Optional[str] = None


class ExportRequest(BaseModel):
    """Request for schema export."""
    schema: Dict[str, Any]
    format: str = Field("postgresql", description="postgresql | mysql | prisma | drizzle")


class ExportResponse(BaseModel):
    """Response for schema export."""
    status: str
    code: Optional[str] = None
    format: str
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    llm_provider: str
    llm_configured: bool
