import os
import asyncio
from typing import AsyncGenerator, Optional
from contextlib import asynccontextmanager
from sqlalchemy import create_engine, text, MetaData
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool
import asyncpg

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Convert sync postgres URL to async and handle SSL
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Remove sslmode parameter as asyncpg doesn't support it
if "sslmode=" in DATABASE_URL:
    import re
    DATABASE_URL = re.sub(r'[&?]sslmode=\w+', '', DATABASE_URL)

class Base(DeclarativeBase):
    """Base class for all database models"""
    pass

class DatabaseManager:
    """Database connection and session management"""
    
    def __init__(self):
        self.engine = create_async_engine(
            DATABASE_URL,
            echo=False,  # Set to True for SQL logging
            pool_pre_ping=True,
            pool_recycle=300,
        )
        
        self.async_session = async_sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
    
    async def create_tables(self):
        """Create all database tables"""
        async with self.engine.begin() as conn:
            # Import models to ensure they're registered
            import models
            
            # Create tables
            await conn.run_sync(Base.metadata.create_all)
            
            # Seed personas if they don't exist
            await self._seed_personas()
    
    async def _seed_personas(self):
        """Seed initial personas data"""
        from models import Persona
        
        personas_data = [
            {
                "id": "sarah",
                "name": "Dr. Sarah",
                "role": "Clinical Therapist",
                "specialty": "Cognitive Behavioral Therapy",
                "description": "A warm, professional therapist specializing in CBT techniques and emotional processing.",
                "avatar_url": "/personas/sarah.jpg",
                "color": "#10B981"
            },
            {
                "id": "alex",
                "name": "Alex",
                "role": "Peer Support Specialist",
                "specialty": "Peer Support & Relatability",
                "description": "A relatable friend who offers peer support with humor and understanding.",
                "avatar_url": "/personas/alex.jpg",
                "color": "#F59E0B"
            },
            {
                "id": "marcus",
                "name": "Marcus",
                "role": "Life Coach",
                "specialty": "Goal Setting & Achievement",
                "description": "A confident coach focused on goal-setting, productivity, and personal achievement.",
                "avatar_url": "/personas/marcus.jpg",
                "color": "#3B82F6"
            },
            {
                "id": "maya",
                "name": "Maya",
                "role": "Mindfulness Guide",
                "specialty": "Meditation & Breathwork",
                "description": "A serene guide specializing in mindfulness, meditation, and spiritual wellness.",
                "avatar_url": "/personas/maya.jpg",
                "color": "#8B5CF6"
            }
        ]
        
        async with self.async_session() as session:
            try:
                # Check if personas already exist
                result = await session.execute(text("SELECT COUNT(*) FROM personas"))
                count = result.scalar()
                
                if count == 0:
                    # Insert personas
                    for persona_data in personas_data:
                        persona = Persona(**persona_data)
                        session.add(persona)
                    
                    await session.commit()
                    print("✓ Personas seeded successfully")
                else:
                    print("✓ Personas already exist")
                    
            except Exception as e:
                print(f"Error seeding personas: {e}")
                await session.rollback()
    
    async def get_session(self) -> AsyncSession:
        """Get a database session"""
        return self.async_session()
    
    async def close(self):
        """Close database connections"""
        await self.engine.dispose()

# Global database manager instance
db_manager = DatabaseManager()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session"""
    async with db_manager.async_session() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()

# Test connection function
async def test_connection():
    """Test database connection"""
    try:
        async with db_manager.engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("✓ Database connection successful")
            return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    # Test the connection
    asyncio.run(test_connection())