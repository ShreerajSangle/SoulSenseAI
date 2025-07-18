"""
Personas API endpoints for SoulSense AI
"""

from fastapi import APIRouter, Request, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel

from core.storage import Persona

router = APIRouter()


class PersonaResponse(BaseModel):
    id: str
    name: str
    role: str
    specialty: str
    description: str
    avatar_url: str
    color: str


@router.get("/personas", response_model=List[PersonaResponse])
async def get_personas(request: Request):
    """Get all available personas"""
    try:
        storage = request.app.state.storage
        personas = await storage.get_personas()
        
        return [
            PersonaResponse(
                id=persona.id,
                name=persona.name,
                role=persona.role,
                specialty=persona.specialty,
                description=persona.description,
                avatar_url=persona.avatar_url,
                color=persona.color
            )
            for persona in personas
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch personas: {str(e)}")


@router.get("/personas/{persona_id}", response_model=PersonaResponse)
async def get_persona(persona_id: str, request: Request):
    """Get specific persona by ID"""
    try:
        storage = request.app.state.storage
        persona = await storage.get_persona(persona_id)
        
        if not persona:
            raise HTTPException(status_code=404, detail="Persona not found")
        
        return PersonaResponse(
            id=persona.id,
            name=persona.name,
            role=persona.role,
            specialty=persona.specialty,
            description=persona.description,
            avatar_url=persona.avatar_url,
            color=persona.color
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch persona: {str(e)}")