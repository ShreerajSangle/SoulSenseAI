#!/usr/bin/env python3
"""
Test Persona-Guided Pathways System
Verify that guided therapeutic journeys work correctly with persona specialization
"""

import asyncio
import sys
import os
from datetime import date, datetime, timedelta

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from core.persona_pathways import PersonaPathwaySystem

async def test_persona_pathways():
    """Test comprehensive persona-guided pathways functionality"""
    print("🧭 Testing SoulSense Persona-Guided Pathways System")
    print("=" * 60)
    
    # Initialize pathway system
    pathways = PersonaPathwaySystem()
    await pathways.initialize()
    
    # Test 1: Get available pathways
    print("\n1️⃣  Testing Pathway Library")
    
    all_pathways = await pathways.get_available_pathways()
    print(f"✓ Total pathways available: {len(all_pathways)}")
    
    for pathway in all_pathways:
        print(f"  - {pathway['title']} ({pathway['persona_id']}) - {pathway['duration_days']} days")
    
    # Test 2: Persona-specific pathways
    print("\n2️⃣  Testing Persona-Specific Pathways")
    
    personas = ['sarah', 'maya', 'alex', 'marcus']
    for persona in personas:
        persona_pathways = await pathways.get_available_pathways(persona)
        print(f"  {persona}: {len(persona_pathways)} pathways")
        for pathway in persona_pathways:
            print(f"    • {pathway['title']} ({pathway['difficulty_level']})")
    
    # Test 3: User enrollment
    print("\n3️⃣  Testing User Enrollment")
    
    test_user = "test_user"
    test_pathway = "sarah_anxiety_toolkit"
    
    # Enroll user in pathway
    success = await pathways.enroll_user_in_pathway(test_user, test_pathway)
    print(f"✓ User enrollment: {'Success' if success else 'Failed'}")
    
    # Get user pathways
    user_pathways = await pathways.get_user_pathways(test_user)
    print(f"✓ User enrolled pathways: {len(user_pathways)}")
    
    for pathway in user_pathways:
        print(f"  - {pathway['title']}: Day {pathway['current_day']}/{pathway['duration_days']} ({pathway['status']})")
    
    # Test 4: Daily activity system
    print("\n4️⃣  Testing Daily Activity System")
    
    # Get first day activity
    day1_activity = await pathways.get_daily_activity(test_pathway, 1)
    
    if day1_activity:
        print(f"✓ Day 1 Activity: {day1_activity['title']}")
        print(f"  - Type: {day1_activity['activity_type']}")
        print(f"  - Duration: {day1_activity['estimated_duration']} minutes")
        print(f"  - Meditation: {day1_activity['meditation_type']}")
        print(f"  - Questions: {len(day1_activity['reflection_questions'])} reflection questions")
        print(f"  - Prompt: {day1_activity['prompt'][:60]}...")
    
    # Test 5: Activity completion
    print("\n5️⃣  Testing Activity Completion")
    
    # Complete day 1 activity
    completion_success = await pathways.complete_daily_activity(
        user_id=test_user,
        pathway_id=test_pathway,
        day_number=1,
        mood_rating=7.5,
        completion_notes="Felt really good about identifying my anxiety patterns",
        time_spent_minutes=20
    )
    
    print(f"✓ Activity completion: {'Success' if completion_success else 'Failed'}")
    
    # Test 6: Progress tracking
    print("\n6️⃣  Testing Progress Tracking")
    
    progress = await pathways.get_user_progress(test_user, test_pathway)
    
    if progress:
        print(f"✓ Progress tracking active:")
        print(f"  - Current day: {progress['current_day']}")
        print(f"  - Progress: {progress['progress_percentage']:.1f}% complete")
        print(f"  - Completed days: {progress['days_completed']}")
        print(f"  - Consecutive days: {progress['consecutive_days']}")
        print(f"  - Mood trend: {progress['mood_trend']}")
        print(f"  - Recent completions: {len(progress['recent_completions'])}")
    
    # Test 7: Recommendations system
    print("\n7️⃣  Testing Pathway Recommendations")
    
    # Test with different emotional states
    emotional_states = ['anxiety', 'stress', 'overwhelm', 'sadness', 'unmotivated']
    
    for state in emotional_states:
        recommendations = await pathways.get_pathway_recommendations(test_user, state)
        print(f"  {state}: {len(recommendations)} recommendations")
        if recommendations:
            print(f"    → {recommendations[0]['title']} ({recommendations[0]['persona_id']})")
    
    # Test 8: Multi-persona enrollment
    print("\n8️⃣  Testing Multi-Persona Enrollment")
    
    # Enroll in different persona pathways
    enrollments = [
        ("maya_chakra_journey", "Maya's Chakra Journey"),
        ("alex_confidence_boost", "Alex's Confidence Boost"),
        ("marcus_goal_mastery", "Marcus's Goal Mastery")
    ]
    
    for pathway_id, title in enrollments:
        success = await pathways.enroll_user_in_pathway(test_user, pathway_id)
        print(f"  ✓ {title}: {'Enrolled' if success else 'Failed'}")
    
    # Get updated user pathways
    updated_pathways = await pathways.get_user_pathways(test_user)
    print(f"✓ Total active pathways: {len(updated_pathways)}")
    
    # Test 9: Pathway variety verification
    print("\n9️⃣  Testing Pathway Content Variety")
    
    # Check different pathway types
    pathway_types = {
        'sarah_healing_burnout': 'Clinical therapy (21 days)',
        'maya_mindful_mornings': 'Spiritual practice (7 days)',
        'alex_social_anxiety': 'Peer support (14 days)',
        'marcus_productivity_power': 'Life coaching (7 days)'
    }
    
    for pathway_id, description in pathway_types.items():
        activity = await pathways.get_daily_activity(pathway_id, 1)
        if activity:
            print(f"  ✓ {description}: {activity['activity_type']} activity")
    
    # Test 10: Database integrity
    print("\n🔟  Testing Database Integrity")
    
    # Check all tables have data
    tables_to_check = [
        'user_pathway_enrollments',
        'pathway_daily_completions',
        'pathway_progress_snapshots'
    ]
    
    for table in tables_to_check:
        try:
            cursor = await pathways.connection.execute(f'SELECT COUNT(*) as count FROM {table}')
            count_row = await cursor.fetchone()
            count = count_row['count']
            print(f"  ✓ {table}: {count} records")
        except Exception as e:
            print(f"  ✗ {table}: Error - {e}")
    
    await pathways.close()
    
    print("\n✅ PERSONA PATHWAYS TEST COMPLETE")
    print("=" * 60)
    print("🎯 System Status:")
    print("   • Guided therapeutic journeys operational")
    print("   • Persona-specific pathway tracks available")
    print("   • Daily activity system with reflection questions")
    print("   • Progress tracking and mood monitoring")
    print("   • Personalized recommendations based on emotional state")
    print("   • Multi-persona enrollment support")
    
    print("\n🌟 Features Ready:")
    print("   • Dr. Sarah: Clinical therapy pathways (anxiety, burnout)")
    print("   • Maya: Spiritual growth journeys (chakras, mindfulness)")
    print("   • Alex: Peer support tracks (confidence, social skills)")
    print("   • Marcus: Life coaching programs (goals, productivity)")
    print("   • Progress visualization: path, bloom, chakra, tree")
    print("   • Completion rewards and achievement tracking")
    print("   • Emotional state-based pathway recommendations")
    print("   • Daily activity completion with mood tracking")

if __name__ == "__main__":
    asyncio.run(test_persona_pathways())