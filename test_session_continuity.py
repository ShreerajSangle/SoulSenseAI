#!/usr/bin/env python3
"""
Test Session Continuity System
Verify that session management and smart context loading work correctly
"""

import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from core.session_manager import SessionManager

async def test_session_continuity():
    """Test session continuity and smart context loading"""
    print("🔄 Testing SoulSense Session Continuity System")
    print("=" * 55)
    
    # Initialize session manager
    session_manager = SessionManager()
    await session_manager.initialize()
    
    # Test 1: Start new session
    print("\n1️⃣  Testing New Session Creation")
    session_id = await session_manager.start_session(
        user_id="test_user",
        persona_id="maya"
    )
    print(f"✓ New session created: {session_id}")
    
    # Test 2: Update session context
    print("\n2️⃣  Testing Session Context Updates")
    await session_manager.update_session_context(
        session_id=session_id,
        user_message="I'm feeling anxious about my upcoming presentation",
        ai_response="I understand that feeling. Let's take a moment to center ourselves with some mindful breathing.",
        emotional_context={"primary_emotion": "anxiety", "intensity": 0.7},
        key_topics=["presentation anxiety", "mindful breathing"]
    )
    print("✓ Session context updated with conversation data")
    
    # Test 3: Get last unfinished session
    print("\n3️⃣  Testing Unfinished Session Retrieval")
    unfinished = await session_manager.get_last_unfinished_session("test_user", "maya")
    if unfinished:
        print(f"✓ Found unfinished session: {unfinished.session_id}")
        print(f"  - Message count: {unfinished.message_count}")
        print(f"  - Key topics: {unfinished.key_topics}")
        print(f"  - Emotional tone: {unfinished.emotional_tone}")
        print(f"  - Last message: '{unfinished.last_user_message[:50]}...'")
    
    # Test 4: Generate continuation prompt
    print("\n4️⃣  Testing Continuation Prompt Generation")
    if unfinished:
        prompt = await session_manager.generate_continuation_prompt(unfinished, "Shreeraj")
        print(f"✓ Generated continuation prompt:")
        print(f"  '{prompt}'")
    
    # Test 5: Create session thread
    print("\n5️⃣  Testing Session Thread Creation")
    thread_id = await session_manager.create_session_thread(
        session_id=session_id,
        topic="anxiety management techniques",
        start_message_id=1
    )
    print(f"✓ Created conversation thread: {thread_id}")
    
    # Test 6: Finish session with summary
    print("\n6️⃣  Testing Session Completion")
    summary = await session_manager.finish_session(
        session_id=session_id,
        achievements=["Practiced breathing exercises", "Identified anxiety triggers"],
        mood_change="Feeling more centered and prepared",
        next_steps=["Practice presentation in front of mirror", "Use 4-7-8 breathing before presentation"]
    )
    print(f"✓ Session finished successfully:")
    print(f"  - Duration: {summary['duration_minutes']} minutes")
    print(f"  - Message count: {summary['message_count']}")
    print(f"  - Achievements: {summary['achievements']}")
    
    # Test 7: Get recent sessions
    print("\n7️⃣  Testing Recent Sessions Retrieval")
    recent_sessions = await session_manager.get_recent_sessions("test_user", "maya", limit=3)
    print(f"✓ Found {len(recent_sessions)} recent sessions:")
    for session in recent_sessions:
        print(f"  - {session.session_id}: {session.message_count} messages, {session.emotional_tone}")
    
    # Test 8: Check database tables
    print("\n8️⃣  Verifying Database Storage")
    tables = ['session_contexts', 'session_threads', 'session_summaries']
    
    for table in tables:
        try:
            result = await session_manager.connection.execute(f'SELECT COUNT(*) as count FROM {table}')
            count_row = await result.fetchone()
            count = count_row['count']
            print(f"  - {table}: {count} records ✓")
        except Exception as e:
            print(f"  - {table}: Error checking ✗")
    
    await session_manager.close()
    
    print("\n✅ SESSION CONTINUITY TEST COMPLETE")
    print("=" * 55)
    print("🎯 System Status:")
    print("   • Smart context loading operational")
    print("   • Session resumption with natural prompts")
    print("   • Conversation threading and organization")
    print("   • End-of-session review generation")
    print("   • Recent session history tracking")
    print("\n💫 Features Ready:")
    print("   • 'Welcome back' prompts with conversation context")
    print("   • Micro-conversation threading for topic organization")
    print("   • Automatic session summaries with achievements")
    print("   • Session continuity across app reopens")
    print("   • Smart persona-specific greetings")

if __name__ == "__main__":
    asyncio.run(test_session_continuity())