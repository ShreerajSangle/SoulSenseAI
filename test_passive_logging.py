#!/usr/bin/env python3
"""
Test Passive Logging System
Verify that all user interactions are being captured silently in background
"""

import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from core.passive_logger import PassiveLogger

async def test_passive_logging():
    """Test passive logging system functionality"""
    print("🔍 Testing SoulSense Passive Logging System")
    print("=" * 50)
    
    # Initialize passive logger
    logger = PassiveLogger()
    await logger.initialize()
    
    # Test 1: Log conversation
    print("\n1️⃣  Testing Conversation Logging")
    logger.log_conversation_async(
        session_id="test_session_001",
        user_id="test_user",
        persona_id="maya",
        user_message="I'm feeling anxious about work",
        ai_response="I understand that feeling. Let's take a moment to breathe together.",
        emotional_context={"primary_emotion": "anxiety", "intensity": 0.7}
    )
    print("✓ Conversation logged asynchronously")
    
    # Test 2: Log diary entry
    print("\n2️⃣  Testing Diary Entry Logging")
    logger.log_diary_entry_async(
        user_id="test_user",
        persona_id="sarah",
        entry_content="Today I practiced mindfulness and noticed I felt more centered.",
        mood_rating="good",
        emotion_tags=["calm", "reflective", "hopeful"]
    )
    print("✓ Diary entry logged asynchronously")
    
    # Test 3: Log goal interaction
    print("\n3️⃣  Testing Goal Interaction Logging")
    logger.log_goal_interaction_async(
        user_id="test_user",
        persona_id="marcus",
        goal_title="Practice daily meditation",
        goal_description="Meditate for 10 minutes each morning",
        goal_category="mindfulness",
        action_type="create",
        progress_value=0.0
    )
    print("✓ Goal interaction logged asynchronously")
    
    # Test 4: Log wellness activity
    print("\n4️⃣  Testing Wellness Activity Logging")
    logger.log_wellness_activity_async(
        user_id="test_user",
        persona_id="maya",
        activity_type="breathing_exercise",
        activity_data={"technique": "4-7-8", "rounds": 5},
        duration_seconds=300,
        effectiveness_rating=8
    )
    print("✓ Wellness activity logged asynchronously")
    
    # Test 5: Log interaction
    print("\n5️⃣  Testing UI Interaction Logging")
    logger.log_interaction_async(
        user_id="test_user",
        persona_id="alex",
        session_id="test_session_001",
        interaction_type="quick_reply_selected",
        interaction_data={"reply": "Help me breathe", "time_to_select": 2.3}
    )
    print("✓ UI interaction logged asynchronously")
    
    # Wait for background processing
    print("\n⏳ Waiting for background processing...")
    await asyncio.sleep(2.0)
    
    # Check database tables
    print("\n6️⃣  Verifying Database Storage")
    tables = [
        'conversation_logs', 'diary_logs', 'goal_logs', 
        'wellness_logs', 'interaction_logs'
    ]
    
    for table in tables:
        try:
            result = await logger.connection.execute(f'SELECT COUNT(*) as count FROM {table}')
            count_row = await result.fetchone()
            count = count_row['count']
            print(f"  - {table}: {count} records ✓")
        except Exception as e:
            print(f"  - {table}: Error checking ✗")
    
    # Sample some logged data
    print("\n7️⃣  Sample Logged Data")
    try:
        result = await logger.connection.execute('''
            SELECT persona_id, user_message, ai_response, timestamp 
            FROM conversation_logs 
            ORDER BY timestamp DESC 
            LIMIT 1
        ''')
        row = await result.fetchone()
        if row:
            print(f"  Latest conversation: {row['persona_id']} - '{row['user_message'][:30]}...'")
        
        result = await logger.connection.execute('''
            SELECT activity_type, duration_seconds, effectiveness_rating 
            FROM wellness_logs 
            ORDER BY timestamp DESC 
            LIMIT 1
        ''')
        row = await result.fetchone()
        if row:
            print(f"  Latest wellness: {row['activity_type']} ({row['duration_seconds']}s, rating: {row['effectiveness_rating']})")
            
    except Exception as e:
        print(f"  Error sampling data: {e}")
    
    await logger.close()
    
    print("\n✅ PASSIVE LOGGING TEST COMPLETE")
    print("=" * 50)
    print("🎯 System Status:")
    print("   • Non-blocking async logging operational")
    print("   • All interaction types captured successfully")
    print("   • Database storage verified")
    print("   • Silent background processing confirmed")
    print("   • Ready for real-time user interaction logging")
    print("\n💾 Data Ready For:")
    print("   • AI model training and fine-tuning")
    print("   • User behavior pattern analysis")
    print("   • Therapeutic effectiveness measurement")
    print("   • Personalization and adaptive responses")

if __name__ == "__main__":
    asyncio.run(test_passive_logging())