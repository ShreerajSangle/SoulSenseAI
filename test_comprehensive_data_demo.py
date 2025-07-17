#!/usr/bin/env python3
"""
Comprehensive Data Pipeline Demo
Tests all data persistence features for SoulSense AI
"""

import asyncio
import json
from datetime import datetime
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from core.database import Database
from core.data_pipeline import DataPipeline
from core.llm_client import LLMClient
# Import only what we need for the demo

async def demo_comprehensive_data_pipeline():
    """Demonstrate complete data persistence system"""
    print("🧠 SoulSense AI - Comprehensive Data Pipeline Demo")
    print("=" * 60)
    
    # Initialize components
    database = Database()
    await database.initialize()
    
    llm_client = LLMClient()
    data_pipeline = DataPipeline(database, llm_client)
    
    # Demo user and session
    user_id = "demo_user_123"
    session_id = f"session_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    print(f"👤 Demo User: {user_id}")
    print(f"📅 Session: {session_id}")
    print()
    
    # Test 1: Log comprehensive conversation with Maya
    print("1️⃣  CONVERSATION LOGGING TEST")
    print("-" * 40)
    
    emotional_context = {
        "primary_emotion": "anxiety",
        "secondary_emotions": ["worry", "overwhelm"],
        "intensity": 0.7,
        "valence": -0.4,
        "arousal": 0.8,
        "confidence": 0.85,
        "triggers": ["work deadline"],
        "support_needs": ["grounding", "breathing"],
        "crisis_indicators": []
    }
    
    quick_replies = [
        {"text": "Help me breathe", "action_type": "breathing", "action_data": {"technique": "4-7-8"}},
        {"text": "I need grounding", "action_type": "grounding", "action_data": {"technique": "5-4-3-2-1"}},
        {"text": "Tell me more", "action_type": "continue", "action_data": {}}
    ]
    
    conversation_id = await data_pipeline.log_conversation(
        user_id=user_id,
        persona_id="maya",
        session_id=session_id,
        user_message="I'm feeling really anxious about my work deadline approaching. My mind is racing and I can't focus.",
        ai_response="I understand that feeling of overwhelm when deadlines approach. Let's take a moment to ground ourselves together. Would you like to try some breathing exercises, or shall we explore what specifically is making this feel so intense?",
        emotional_context=emotional_context,
        quick_replies=quick_replies,
        features_used=["emotional_detection", "anxiety_support", "breathing_recommendation"]
    )
    
    print(f"✓ Conversation logged (ID: {conversation_id})")
    print(f"  - Emotional context: {emotional_context['primary_emotion']} (intensity: {emotional_context['intensity']})")
    print(f"  - Quick replies: {len(quick_replies)} suggestions")
    print(f"  - Features used: {', '.join(['emotional_detection', 'anxiety_support', 'breathing_recommendation'])}")
    
    # Test 2: Log quick reply interaction
    print("\n2️⃣  QUICK REPLY INTERACTION TEST")
    print("-" * 40)
    
    await data_pipeline.log_quick_reply_interaction(
        user_id=user_id,
        persona_id="maya",
        session_id=session_id,
        user_message="I'm feeling really anxious about my work deadline approaching.",
        suggested_replies=quick_replies,
        selected_reply=quick_replies[0],  # User selected "Help me breathe"
        time_to_select=2.3
    )
    
    print("✓ Quick reply interaction logged")
    print(f"  - User selected: '{quick_replies[0]['text']}'")
    print(f"  - Time to select: 2.3 seconds")
    print(f"  - Action triggered: {quick_replies[0]['action_type']}")
    
    # Test 3: Log mood check-in
    print("\n3️⃣  MOOD CHECK-IN TEST")
    print("-" * 40)
    
    await data_pipeline.log_mood_checkin(
        user_id=user_id,
        persona_id="maya",
        session_id=session_id,
        mood_rating=6,
        emotion_tags=["anxious", "motivated", "focused"],
        energy_level=7,
        stress_level=8,
        additional_notes="After breathing exercise, feeling more centered but still concerned about deadline",
        context_activity="work_preparation"
    )
    
    print("✓ Mood check-in logged")
    print("  - Mood rating: 6/10")
    print("  - Energy: 7/10, Stress: 8/10")
    print("  - Emotions: anxious, motivated, focused")
    print("  - Context: work_preparation")
    
    # Test 4: Enhanced journal entry with AI reflection
    print("\n4️⃣  JOURNAL WITH AI REFLECTION TEST")
    print("-" * 40)
    
    # First create a basic journal entry
    journal_entry_id = 1  # Simulated ID
    
    reflection = await data_pipeline.log_journal_with_ai_reflection(
        user_id=user_id,
        persona_id="maya",
        journal_entry_id=journal_entry_id,
        raw_user_input="Today I practiced the breathing technique Maya taught me. I noticed my anxiety didn't completely disappear, but I felt more in control. I think I'm learning to observe my thoughts without being overwhelmed by them. This mindfulness approach is starting to make sense.",
        mood="reflective"
    )
    
    print("✓ Journal reflection generated")
    print(f"  - AI reflection: {reflection.get('reflection', 'Generated successfully')}")
    print(f"  - Follow-up questions: {len(reflection.get('follow_up_questions', []))}")
    print(f"  - Emotional insights: {reflection.get('emotional_insights', 'Captured')}")
    
    # Test 5: Generate session summary
    print("\n5️⃣  SESSION SUMMARY GENERATION TEST")
    print("-" * 40)
    
    # Add a few more conversations to the session for a richer summary
    await data_pipeline.log_conversation(
        user_id=user_id,
        persona_id="maya",
        session_id=session_id,
        user_message="The breathing helped! I feel more grounded now.",
        ai_response="I'm so glad the breathing technique brought you some relief. Notice how you're already developing awareness of what works for you. This is a beautiful step in your mindfulness journey.",
        emotional_context={**emotional_context, "primary_emotion": "calm", "intensity": 0.3},
        quick_replies=[
            {"text": "Practice more", "action_type": "practice", "action_data": {}},
            {"text": "Journal this", "action_type": "journal", "action_data": {}}
        ],
        features_used=["progress_acknowledgment", "mindfulness_guidance"]
    )
    
    summary = await data_pipeline.generate_and_store_session_summary(
        session_id=session_id,
        user_id=user_id,
        persona_id="maya"
    )
    
    print("✓ Session summary generated")
    print(f"  - Key topics: {len(summary.get('key_topics', []))} identified")
    print(f"  - Emotional journey: {summary.get('emotional_journey', 'Tracked')}")
    print(f"  - Effectiveness score: {summary.get('effectiveness_score', 'N/A')}/10")
    
    # Test 6: Get interaction history
    print("\n6️⃣  INTERACTION HISTORY RETRIEVAL TEST")
    print("-" * 40)
    
    history = await data_pipeline.get_user_interaction_history(
        user_id=user_id,
        persona_id="maya",
        days_back=1
    )
    
    print("✓ Interaction history retrieved")
    print(f"  - Total conversations: {history['summary']['total_conversations']}")
    print(f"  - Total quick replies: {history['summary']['total_quick_replies']}")
    print(f"  - Total mood check-ins: {history['summary']['total_mood_checkins']}")
    print(f"  - Engagement score: {history['summary']['engagement_score']}/10")
    
    # Test 7: Database statistics
    print("\n7️⃣  DATABASE STATISTICS TEST")
    print("-" * 40)
    
    # Check table counts
    tables = [
        'conversations', 'conversation_summaries', 'quick_reply_interactions',
        'mood_checkins', 'journal_reflections', 'interaction_training_data'
    ]
    
    for table in tables:
        result = await database.connection.execute(f'SELECT COUNT(*) as count FROM {table}')
        count_row = await result.fetchone()
        print(f"  - {table}: {count_row['count']} records")
    
    print("\n✅ COMPREHENSIVE DATA PIPELINE TEST COMPLETE")
    print("=" * 60)
    print("🎯 Key Achievements:")
    print("   • Full conversation logging with emotional context")
    print("   • Quick reply interaction tracking for AI learning")
    print("   • Detailed mood check-ins with multi-dimensional data")
    print("   • AI-generated journal reflections and insights")
    print("   • Automatic session summarization and analysis")
    print("   • Complete interaction history for adaptive learning")
    print("   • Ready for AI fine-tuning and model improvement")
    print("\n🔮 Next Steps:")
    print("   • Implement embeddings storage for semantic search")
    print("   • Add PostgreSQL migration compatibility")
    print("   • Create fine-tuning data export formats")
    print("   • Build adaptive prompt generation from patterns")
    
    await database.close()

if __name__ == "__main__":
    asyncio.run(demo_comprehensive_data_pipeline())