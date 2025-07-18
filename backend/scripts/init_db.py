#!/usr/bin/env python3
"""
Database initialization script for SoulSense AI
Creates all necessary tables and initial data
"""

import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path so we can import from core
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from core.database import Database


async def init_database():
    """Initialize the SoulSense AI database"""
    print("🔄 Initializing SoulSense AI Database...")
    
    # Initialize database
    database = Database()
    await database.initialize()
    
    # Create all tables
    await database.create_tables()
    print("✅ Database tables created successfully")
    
    # Check if personas exist
    cursor = await database.connection.execute(
        "SELECT COUNT(*) FROM personas"
    )
    count = (await cursor.fetchone())[0]
    
    if count == 0:
        # Insert default personas
        personas = [
            {
                'id': 'sarah',
                'name': 'Dr. Sarah',
                'role': 'Clinical Therapist',
                'description': 'Trauma-informed therapist specializing in CBT and emotional healing',
                'color': '#8b5cf6',
                'emoji': '🌸'
            },
            {
                'id': 'alex',
                'name': 'Alex',
                'role': 'Digital Best Friend',
                'description': 'Witty, supportive companion with humor and peer support',
                'color': '#f59e0b',
                'emoji': '🤗'
            },
            {
                'id': 'marcus',
                'name': 'Marcus',
                'role': 'Life Coach',
                'description': 'Confident mentor focused on goal-setting and motivation',
                'color': '#10b981',
                'emoji': '💪'
            },
            {
                'id': 'maya',
                'name': 'Maya',
                'role': 'Spiritual Guide',
                'description': 'Serene wellness guide specializing in yoga and meditation',
                'color': '#06b6d4',
                'emoji': '🧘‍♀️'
            }
        ]
        
        for persona in personas:
            await database.connection.execute(
                """
                INSERT INTO personas (id, name, role, description, color, emoji)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (persona['id'], persona['name'], persona['role'], 
                 persona['description'], persona['color'], persona['emoji'])
            )
        
        await database.connection.commit()
        print("✅ Default personas created")
    else:
        print(f"✅ Found {count} existing personas")
    
    # Close database
    await database.close()
    print("✅ Database initialization complete")


if __name__ == "__main__":
    asyncio.run(init_database())