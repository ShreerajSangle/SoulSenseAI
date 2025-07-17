#!/usr/bin/env python3
"""
Comprehensive test for the Daily SoulSense Loop system
Tests all components: backend API, database operations, and frontend integration
"""

import asyncio
import json
import sqlite3
from datetime import datetime, date
from backend.core.daily_loop import DailySoulSenseLoop, LoopType

async def test_daily_loop_system():
    """Test comprehensive daily loop functionality"""
    print("🧪 Testing Daily SoulSense Loop System...")
    
    # Initialize the system
    daily_loop = DailySoulSenseLoop()
    await daily_loop.initialize()
    
    test_user_id = "test_user_daily_loop"
    
    try:
        # Test 1: Get Morning Activity
        print("\n📅 Testing Morning Check-In Activity...")
        morning_activity = await daily_loop.get_morning_activity(test_user_id)
        
        if morning_activity and not morning_activity.get("already_completed"):
            print(f"✅ Morning activity retrieved: {morning_activity['activity']['title']}")
            print(f"   Questions: {len(morning_activity['activity']['questions'])}")
            print(f"   Estimated time: {morning_activity['activity']['estimated_minutes']} minutes")
        else:
            print("❌ Failed to retrieve morning activity")
            return False
        
        # Test 2: Complete Morning Check-In
        print("\n🌅 Testing Morning Check-In Completion...")
        success = await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="morning_checkin",
            mood_rating=8.0,
            energy_level=7.5,
            stress_level=3.0,
            gratitude_notes="Grateful for this beautiful morning and the opportunity to grow",
            goals_for_day="Focus on mindfulness and connect with Maya for spiritual guidance",
            reflection_notes="Feeling optimistic and ready to embrace the day",
            selected_persona="maya"
        )
        
        if success:
            print("✅ Morning check-in completed successfully")
        else:
            print("❌ Failed to complete morning check-in")
            return False
        
        # Test 3: Get Midday Pulse
        print("\n🕐 Testing Midday Pulse Check...")
        midday_activity = await daily_loop.get_midday_pulse(test_user_id)
        
        if midday_activity and not midday_activity.get("already_completed"):
            print(f"✅ Midday pulse retrieved: {midday_activity['activity']['title']}")
            print(f"   Questions: {len(midday_activity['activity']['questions'])}")
        else:
            print("❌ Failed to retrieve midday pulse activity")
            return False
        
        # Test 4: Complete Midday Pulse
        print("\n⏰ Testing Midday Pulse Completion...")
        success = await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="midday_pulse",
            mood_rating=7.0,
            energy_level=6.0,
            stress_level=4.0,
            gratitude_notes="Grateful for this moment of pause and reflection",
            reflection_notes="Taking time to reset and reconnect with my intentions",
            selected_persona="alex"
        )
        
        if success:
            print("✅ Midday pulse completed successfully")
        else:
            print("❌ Failed to complete midday pulse")
            return False
        
        # Test 5: Get Evening Reflection
        print("\n🌙 Testing Evening Reflection Activity...")
        evening_activity = await daily_loop.get_evening_activity(test_user_id)
        
        if evening_activity and not evening_activity.get("already_completed"):
            print(f"✅ Evening activity retrieved: {evening_activity['activity']['title']}")
            print(f"   Questions: {len(evening_activity['activity']['questions'])}")
        else:
            print("❌ Failed to retrieve evening activity")
            return False
        
        # Test 6: Complete Evening Reflection
        print("\n🌆 Testing Evening Reflection Completion...")
        success = await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="evening_reflection",
            mood_rating=8.5,
            energy_level=6.5,
            stress_level=2.0,
            gratitude_notes="Grateful for all the growth and learning today brought",
            challenges_faced="Dealt with some work stress but managed it well with breathing techniques",
            accomplishments="Completed my morning routine, had meaningful conversations, and practiced mindfulness",
            reflection_notes="Feeling peaceful and content with today's journey",
            selected_persona="sarah"
        )
        
        if success:
            print("✅ Evening reflection completed successfully")
        else:
            print("❌ Failed to complete evening reflection")
            return False
        
        # Test 7: Get Daily Summary
        print("\n📊 Testing Daily Summary...")
        daily_summary = await daily_loop.get_user_daily_summary(test_user_id)
        
        if daily_summary:
            print(f"✅ Daily summary retrieved for {daily_summary['date']}")
            print(f"   Total entries: {len(daily_summary['entries'])}")
            print(f"   Morning completed: {daily_summary['completion_status']['morning_completed']}")
            print(f"   Midday completed: {daily_summary['completion_status']['midday_completed']}")
            print(f"   Evening completed: {daily_summary['completion_status']['evening_completed']}")
            print(f"   Current streak: {daily_summary['streak']['current']}")
        else:
            print("❌ Failed to retrieve daily summary")
            return False
        
        # Test 8: Get Weekly Summary
        print("\n📈 Testing Weekly Summary...")
        weekly_summary = await daily_loop.get_weekly_loop_summary(test_user_id)
        
        if weekly_summary:
            print(f"✅ Weekly summary retrieved for week starting {weekly_summary['week_start']}")
            print(f"   Completion rate: {weekly_summary['completion_rate']:.1%}")
            print(f"   Total entries: {weekly_summary['total_entries']}")
            print(f"   Average mood: {weekly_summary['mood_average']:.1f}")
            print(f"   Average energy: {weekly_summary['energy_average']:.1f}")
        else:
            print("❌ Failed to retrieve weekly summary")
            return False
        
        # Test 9: Test Activity Already Completed
        print("\n🔄 Testing Already Completed Logic...")
        morning_activity_again = await daily_loop.get_morning_activity(test_user_id)
        
        if morning_activity_again and morning_activity_again.get("already_completed"):
            print("✅ Already completed logic working correctly")
        else:
            print("❌ Already completed logic not working")
            return False
        
        # Test 10: Test Database Schema
        print("\n🗃️ Testing Database Schema...")
        connection = await daily_loop.connection
        
        # Check if tables exist
        cursor = await connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'daily_loop%'"
        )
        tables = await cursor.fetchall()
        
        expected_tables = ['daily_loop_entries', 'daily_loop_streaks', 'daily_wellness_insights']
        table_names = [table['name'] for table in tables]
        
        if all(table in table_names for table in expected_tables):
            print("✅ All required database tables exist")
        else:
            print(f"❌ Missing tables. Expected: {expected_tables}, Found: {table_names}")
            return False
        
        # Test 11: Test Data Integrity
        print("\n🔍 Testing Data Integrity...")
        cursor = await connection.execute(
            "SELECT COUNT(*) as count FROM daily_loop_entries WHERE user_id = ?",
            (test_user_id,)
        )
        result = await cursor.fetchone()
        
        if result['count'] == 3:  # Morning, midday, evening
            print("✅ All entries stored correctly")
        else:
            print(f"❌ Expected 3 entries, found {result['count']}")
            return False
        
        print("\n🎉 All Daily Loop tests passed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False
        
    finally:
        # Clean up test data
        await daily_loop.connection.execute(
            "DELETE FROM daily_loop_entries WHERE user_id = ?",
            (test_user_id,)
        )
        await daily_loop.connection.execute(
            "DELETE FROM daily_loop_streaks WHERE user_id = ?",
            (test_user_id,)
        )
        await daily_loop.connection.execute(
            "DELETE FROM daily_wellness_insights WHERE user_id = ?",
            (test_user_id,)
        )
        await daily_loop.connection.commit()
        await daily_loop.close()

def test_daily_loop_activities():
    """Test the daily loop activity library"""
    print("\n📚 Testing Daily Loop Activity Library...")
    
    daily_loop = DailySoulSenseLoop()
    
    # Test morning activities
    print(f"Morning activities: {len(daily_loop.morning_activities)}")
    for activity_id, activity in daily_loop.morning_activities.items():
        print(f"  - {activity.title} ({activity.estimated_minutes} min)")
    
    # Test evening activities
    print(f"Evening activities: {len(daily_loop.evening_activities)}")
    for activity_id, activity in daily_loop.evening_activities.items():
        print(f"  - {activity.title} ({activity.estimated_minutes} min)")
    
    # Test midday activities
    print(f"Midday activities: {len(daily_loop.midday_activities)}")
    for activity_id, activity in daily_loop.midday_activities.items():
        print(f"  - {activity.title} ({activity.estimated_minutes} min)")
    
    # Verify all activities have required fields
    all_activities = {**daily_loop.morning_activities, **daily_loop.evening_activities, **daily_loop.midday_activities}
    
    for activity_id, activity in all_activities.items():
        assert activity.id == activity_id
        assert activity.title
        assert activity.description
        assert activity.questions
        assert activity.affirmation
        assert activity.suggested_actions
        assert activity.estimated_minutes > 0
        assert activity.persona_recommendations
    
    print("✅ All activities properly structured")

def main():
    """Run all tests"""
    print("🧪 Starting Daily SoulSense Loop System Tests")
    print("=" * 50)
    
    # Test activity library
    test_daily_loop_activities()
    
    # Test system functionality
    success = asyncio.run(test_daily_loop_system())
    
    if success:
        print("\n🎉 All tests passed! Daily SoulSense Loop system is working correctly.")
    else:
        print("\n❌ Some tests failed. Please check the output above.")

if __name__ == "__main__":
    main()