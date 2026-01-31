"""
Schema Generation Service
Generates database schemas from natural language descriptions
"""
import json
import re
from typing import Optional, List, Dict, Any
from groq import Groq
from openai import OpenAI

from ..config import get_settings
from ..system_prompt import get_schema_architect_prompt


class SchemaService:
    """Service for AI-powered schema generation."""
    
    def __init__(self):
        self.settings = get_settings()
        self._groq_client: Optional[Groq] = None
        self._openai_client: Optional[OpenAI] = None
        
    @property
    def groq_client(self) -> Optional[Groq]:
        if self._groq_client is None and self.settings.groq_api_key:
            self._groq_client = Groq(api_key=self.settings.groq_api_key)
        return self._groq_client
    
    @property
    def openai_client(self) -> Optional[OpenAI]:
        if self._openai_client is None and self.settings.openai_api_key:
            self._openai_client = OpenAI(api_key=self.settings.openai_api_key)
        return self._openai_client
    
    def _extract_json(self, text: str) -> dict:
        """Extract JSON from LLM response."""
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if json_match:
            text = json_match.group(1)
        text = text.strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
            raise
    
    def _call_llm(self, system_prompt: str, user_message: str) -> str:
        """Call the configured LLM provider."""
        if self.settings.llm_provider == "groq" and self.groq_client:
            response = self.groq_client.chat.completions.create(
                model=self.settings.llm_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.2,
                max_tokens=4096
            )
            return response.choices[0].message.content
        elif self.settings.llm_provider == "openai" and self.openai_client:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.2,
                max_tokens=4096
            )
            return response.choices[0].message.content
        else:
            raise ValueError("No LLM provider configured")
    
    async def generate_schema(self, description: str, complexity: str = "standard") -> Dict[str, Any]:
        """Generate database schema from app description."""
        try:
            user_message = f"""
Generate a {complexity} database schema for the following application:

{description}

Remember to:
- Use proper normalization
- Include all necessary tables and relationships
- Add appropriate indexes
- Follow naming conventions
"""
            response_text = self._call_llm(get_schema_architect_prompt(), user_message)
            data = self._extract_json(response_text)
            
            # Ensure we have the schema structure
            if "schema" not in data:
                data = {"status": "success", "schema": data}
            
            return data
            
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def generate_postgresql(self, schema: Dict[str, Any]) -> str:
        """Generate PostgreSQL DDL from schema."""
        ddl_parts = []
        
        for table in schema.get("tables", []):
            columns = []
            for col in table.get("columns", []):
                col_def = f"    {col['name']} {col['type']}"
                if col.get("primary_key"):
                    col_def += " PRIMARY KEY"
                if not col.get("nullable", True):
                    col_def += " NOT NULL"
                if col.get("unique"):
                    col_def += " UNIQUE"
                if col.get("default"):
                    col_def += f" DEFAULT {col['default']}"
                columns.append(col_def)
            
            ddl = f"CREATE TABLE {table['name']} (\n"
            ddl += ",\n".join(columns)
            ddl += "\n);\n"
            ddl_parts.append(ddl)
        
        # Add foreign keys
        for rel in schema.get("relationships", []):
            fk = f"ALTER TABLE {rel['from_table']} ADD CONSTRAINT fk_{rel['from_table']}_{rel['to_table']} "
            fk += f"FOREIGN KEY ({rel['from_column']}) REFERENCES {rel['to_table']}({rel['to_column']})"
            if rel.get("on_delete"):
                fk += f" ON DELETE {rel['on_delete']}"
            fk += ";\n"
            ddl_parts.append(fk)
        
        # Add indexes
        for table in schema.get("tables", []):
            for idx in table.get("indexes", []):
                unique = "UNIQUE " if idx.get("unique") else ""
                idx_ddl = f"CREATE {unique}INDEX {idx['name']} ON {table['name']} ({', '.join(idx['columns'])});\n"
                ddl_parts.append(idx_ddl)
        
        return "\n".join(ddl_parts)
    
    def generate_prisma(self, schema: Dict[str, Any]) -> str:
        """Generate Prisma schema from schema."""
        models = []
        
        type_map = {
            "INT": "Int",
            "SERIAL": "Int @id @default(autoincrement())",
            "UUID": "String @id @default(uuid())",
            "VARCHAR": "String",
            "TEXT": "String",
            "BOOLEAN": "Boolean",
            "TIMESTAMP": "DateTime",
            "DECIMAL": "Decimal",
        }
        
        for table in schema.get("tables", []):
            model_name = "".join(word.capitalize() for word in table["name"].split("_"))
            fields = []
            
            for col in table.get("columns", []):
                col_type = col["type"].split("(")[0].upper()
                prisma_type = type_map.get(col_type, "String")
                
                if col.get("primary_key") and "id" not in prisma_type.lower():
                    prisma_type += " @id"
                if col.get("unique") and "unique" not in prisma_type.lower():
                    prisma_type += " @unique"
                if col.get("nullable", True) and not col.get("primary_key"):
                    prisma_type += "?"
                if col.get("default"):
                    prisma_type += f" @default({col['default']})"
                
                fields.append(f"  {col['name']} {prisma_type}")
            
            model = f"model {model_name} {{\n"
            model += "\n".join(fields)
            model += "\n}\n"
            models.append(model)
        
        return "\n".join(models)


# Singleton
_schema_service: Optional[SchemaService] = None


def get_schema_service() -> SchemaService:
    global _schema_service
    if _schema_service is None:
        _schema_service = SchemaService()
    return _schema_service
