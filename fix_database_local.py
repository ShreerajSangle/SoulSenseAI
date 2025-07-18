#!/usr/bin/env python3
"""
SoulSense AI - Database Fix Script for Local Development
Fixes database schema and initialization issues
"""

import asyncio
import os
import sys
import sqlite3
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from core.database import Database


async def fix_database():
    """Fix database issues for local development"""
    print("🔧 Fixing SoulSense AI Database Issues...")
    
    # Remove any existing corrupted databases
    db_files = ["soulsense.db", "backend/soulsense.db", "./soulsense.db"]
    for db_file in db_files:
        if os.path.exists(db_file):
            print(f"🗑️ Removing existing database: {db_file}")
            os.remove(db_file)
    
    # Ensure backend directory exists
    os.makedirs("backend", exist_ok=True)
    
    # Initialize fresh database in backend directory
    print("📁 Creating fresh database in backend/soulsense.db...")
    database = Database("backend/soulsense.db")
    await database.initialize()
    
    # Create all tables
    await database.create_tables()
    print("✅ Database tables created successfully")
    
    # Insert default personas with correct schema
    personas = [
        {
            'id': 'sarah',
            'name': 'Dr. Sarah',
            'role': 'Clinical Therapist',
            'specialty': 'Trauma-informed therapy and CBT',
            'description': 'Trauma-informed therapist specializing in CBT and emotional healing',
            'avatar_url': '',
            'color': '#8b5cf6'
        },
        {
            'id': 'alex',
            'name': 'Alex',
            'role': 'Digital Best Friend',
            'specialty': 'Peer support and humor therapy',
            'description': 'Witty, supportive companion with humor and peer support',
            'avatar_url': '',
            'color': '#f59e0b'
        },
        {
            'id': 'marcus',
            'name': 'Marcus',
            'role': 'Life Coach',
            'specialty': 'Goal-setting and motivation',
            'description': 'Confident mentor focused on goal-setting and motivation',
            'avatar_url': '',
            'color': '#10b981'
        },
        {
            'id': 'maya',
            'name': 'Maya',
            'role': 'Spiritual Guide',
            'specialty': 'Yoga, meditation and spiritual wellness',
            'description': 'Serene wellness guide specializing in yoga and meditation',
            'avatar_url': '',
            'color': '#06b6d4'
        }
    ]
    
    print("👥 Inserting default personas...")
    for persona in personas:
        await database._connection.execute(
            """
            INSERT OR REPLACE INTO personas 
            (id, name, role, specialty, description, avatar_url, color)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (persona['id'], persona['name'], persona['role'], 
             persona['specialty'], persona['description'], 
             persona['avatar_url'], persona['color'])
        )
    
    await database._connection.commit()
    print("✅ Default personas created")
    
    # Create default anonymous user
    print("👤 Creating default anonymous user...")
    await database._connection.execute(
        """
        INSERT OR REPLACE INTO users 
        (id, name, email, first_name, last_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        ('anonymous', 'Anonymous User', '', 'Anonymous', 'User', 
         '2025-01-01 00:00:00')
    )
    await database._connection.commit()
    print("✅ Default user created")
    
    # Verify database integrity
    print("🔍 Verifying database integrity...")
    
    # Check personas
    cursor = await database._connection.execute("SELECT COUNT(*) FROM personas")
    persona_count = (await cursor.fetchone())[0]
    print(f"✅ Found {persona_count} personas")
    
    # Check users
    cursor = await database._connection.execute("SELECT COUNT(*) FROM users")
    user_count = (await cursor.fetchone())[0]
    print(f"✅ Found {user_count} users")
    
    # List all tables
    cursor = await database._connection.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )
    tables = await cursor.fetchall()
    print(f"✅ Created {len(tables)} tables: {', '.join([t[0] for t in tables])}")
    
    # Close database
    await database.close()
    
    # Set proper file permissions
    db_file = "backend/soulsense.db"
    if os.path.exists(db_file):
        os.chmod(db_file, 0o666)
        print(f"✅ Set database file permissions: {db_file}")
    
    print()
    print("🎉 Database fix complete!")
    print("📍 Database location: backend/soulsense.db")
    print("🚀 You can now run: uvicorn main:app --reload from the backend directory")


if __name__ == "__main__":
    asyncio.run(fix_database())