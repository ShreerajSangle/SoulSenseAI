#!/usr/bin/env python3
"""Debug PostgreSQL table structure"""

import asyncio
import os
from backend.core.postgres_database import PostgreSQLDatabase

async def debug_tables():
    postgres_db = PostgreSQLDatabase()
    
    try:
        await postgres_db.initialize()
        
        async with postgres_db.pool.acquire() as conn:
            # Check if users table exists and its structure
            result = await conn.fetch("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            """)
            
            print("Users table structure:")
            for row in result:
                print(f"  {row['column_name']}: {row['data_type']} {'NULL' if row['is_nullable'] == 'YES' else 'NOT NULL'}")
            
            # Try a simple insert test
            print("\nTesting simple insert...")
            try:
                await conn.execute("""
                    INSERT INTO users (id, name) VALUES ($1, $2)
                    ON CONFLICT (id) DO NOTHING
                """, "test_user_debug", "Test User")
                print("✅ Simple insert successful")
            except Exception as e:
                print(f"❌ Simple insert failed: {e}")
        
        await postgres_db.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_tables())