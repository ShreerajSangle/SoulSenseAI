"""
PostgreSQL Database setup for SoulSense AI
Using SQLAlchemy with async support
"""

import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from .models import Base
import asyncpg


# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./soulsense.db")

# Convert postgres:// to postgresql+asyncpg:// for async support
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

# For SQLite, use aiosqlite
if "sqlite" in DATABASE_URL and "aiosqlite" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True if os.getenv("DEBUG") == "true" else False,
    future=True
)

# Session factory
async_session = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)


async def get_db():
    """Database dependency for FastAPI"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_database():
    """Initialize database and create tables"""
    print("🔄 Initializing database...")
    
    try:
        async with engine.begin() as conn:
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            
        print("✅ Database tables created")
        
        # Insert default personas
        await create_default_personas()
        
        # Create default user
        await create_default_user()
        
        print("✅ Database initialization complete")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        raise


async def create_default_personas():
    """Create default personas if they don't exist"""
    from .models import PersonaModel
    
    personas_data = [
        {
            "id": "sarah",
            "name": "Dr. Sarah",
            "role": "Clinical Therapist",
            "specialty": "Trauma-informed therapy and CBT",
            "description": "Compassionate therapist specializing in CBT and emotional healing",
            "avatar_url": "",
            "color": "#8b5cf6"
        },
        {
            "id": "alex", 
            "name": "Alex",
            "role": "Digital Best Friend",
            "specialty": "Peer support and humor therapy",
            "description": "Witty, supportive companion with humor and peer support",
            "avatar_url": "",
            "color": "#f59e0b"
        },
        {
            "id": "marcus",
            "name": "Marcus", 
            "role": "Life Coach",
            "specialty": "Goal-setting and motivation",
            "description": "Confident mentor focused on goal-setting and motivation",
            "avatar_url": "",
            "color": "#10b981"
        },
        {
            "id": "maya",
            "name": "Maya",
            "role": "Spiritual Guide", 
            "specialty": "Yoga, meditation and spiritual wellness",
            "description": "Serene wellness guide specializing in yoga and meditation",
            "avatar_url": "",
            "color": "#06b6d4"
        }
    ]
    
    async with async_session() as session:
        for persona_data in personas_data:
            # Check if persona exists
            result = await session.execute(
                text("SELECT id FROM personas WHERE id = :id"),
                {"id": persona_data["id"]}
            )
            existing = result.fetchone()
            
            if not existing:
                await session.execute(
                    text("""
                        INSERT INTO personas (id, name, role, specialty, description, avatar_url, color)
                        VALUES (:id, :name, :role, :specialty, :description, :avatar_url, :color)
                    """),
                    persona_data
                )
        
        await session.commit()
        print("✅ Default personas created")


async def create_default_user():
    """Create default anonymous user"""
    async with async_session() as session:
        # Check if user exists
        result = await session.execute(
            text("SELECT id FROM users WHERE id = :id"),
            {"id": "anonymous"}
        )
        existing = result.fetchone()
        
        if not existing:
            await session.execute(
                text("""
                    INSERT INTO users (id, name, email, first_name, last_name)
                    VALUES (:id, :name, :email, :first_name, :last_name)
                """),
                {
                    "id": "anonymous",
                    "name": "Anonymous User",
                    "email": "",
                    "first_name": "Anonymous",
                    "last_name": "User"
                }
            )
            await session.commit()
            print("✅ Default user created")