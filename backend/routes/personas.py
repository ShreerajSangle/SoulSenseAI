"""
Personas API routes
Handles persona management and information
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from db.database import get_db
from db.models import PersonaModel
from models.schemas import Persona
from models.responses import PersonasResponse

router = APIRouter()


@router.get("/personas", response_model=List[Persona])
async def get_personas(db: AsyncSession = Depends(get_db)):
    """Get all available personas"""
    try:
        result = await db.execute(select(PersonaModel))
        personas = result.scalars().all()
        
        return [
            Persona(
                id=p.id,
                name=p.name,
                role=p.role,
                specialty=p.specialty,
                description=p.description,
                avatar_url=p.avatar_url,
                color=p.color
            )
            for p in personas
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch personas: {str(e)}")


@router.get("/personas/{persona_id}", response_model=Persona)
async def get_persona(persona_id: str, db: AsyncSession = Depends(get_db)):
    """Get specific persona by ID"""
    try:
        result = await db.execute(
            select(PersonaModel).where(PersonaModel.id == persona_id)
        )
        persona = result.scalar_one_or_none()
        
        if not persona:
            raise HTTPException(status_code=404, detail="Persona not found")
        
        return Persona(
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