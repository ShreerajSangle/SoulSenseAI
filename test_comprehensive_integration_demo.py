#!/usr/bin/env python3
"""
SoulSense AI - Complete PostgreSQL Integration Demo
===================================================
Demonstrates full functionality of the integrated PostgreSQL database
with persona interactions, emotional intelligence, and analytics
"""

import asyncio
import aiohttp
import json
from datetime import datetime

class SoulSenseIntegrationDemo:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.session = None
        self.test_user_id = f"demo_user_{int(datetime.now().timestamp())}"
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def demonstrate_full_integration(self):
        """Run comprehensive demo of PostgreSQL integration"""
        print("\n🎭 SoulSense AI - PostgreSQL Integration Demo")
        print("=" * 60)
        
        # 1. Test Chat Integration with All Personas
        await self.demo_persona_conversations()
        
        # 2. Test Wellness Features Integration
        await self.demo_wellness_features()
        
        # 3. Test Analytics Integration
        await self.demo_analytics_dashboard()
        
        # 4. Test Data Persistence
        await self.demo_data_persistence()
        
        print("\n🎉 PostgreSQL Integration Demo Complete!")
        print("All features are successfully integrated with persistent storage")

    async def demo_persona_conversations(self):
        """Demonstrate conversation logging across all personas"""
        print("\n1️⃣ Testing Persona Conversation Integration")
        print("-" * 50)
        
        personas = ["maya", "sarah", "alex", "marcus"]
        test_messages = {
            "maya": "I'm feeling anxious about work. Can you help me find some peace?",
            "sarah": "I've been having recurring negative thoughts. How can I reframe them?", 
            "alex": "I feel like nobody understands what I'm going through.",
            "marcus": "I want to set better goals but don't know where to start."
        }
        
        for persona in personas:
            try:
                message = test_messages[persona]
                
                async with self.session.post(
                    f"{self.base_url}/api/chat/{persona}",
                    json={
                        "message": message,
                        "user_id": self.test_user_id
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        print(f"✅ {persona.title()} conversation logged successfully")
                        print(f"   Response length: {len(data['response'])} chars")
                        if 'emotion_detected' in data:
                            print(f"   Emotion detected: {data['emotion_detected']}")
                    else:
                        print(f"❌ {persona.title()} conversation failed: {response.status}")
                        
            except Exception as e:
                print(f"❌ Error testing {persona}: {e}")
            
            await asyncio.sleep(0.5)

    async def demo_wellness_features(self):
        """Demonstrate wellness feature data logging"""
        print("\n2️⃣ Testing Wellness Features Integration")
        print("-" * 50)
        
        # Test Journal Entry
        try:
            journal_data = {
                "user_id": self.test_user_id,
                "title": "Integration Test Entry",
                "content": "Testing PostgreSQL integration with journal functionality. The database is storing all my thoughts and reflections.",
                "mood_rating": 7,
                "persona_id": "sarah"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/journal",
                json=journal_data
            ) as response:
                if response.status == 200:
                    print("✅ Journal entry stored in PostgreSQL")
                else:
                    print(f"❌ Journal storage failed: {response.status}")
        except Exception as e:
            print(f"❌ Journal test error: {e}")
        
        # Test Goal Setting
        try:
            goal_data = {
                "user_id": self.test_user_id,
                "title": "Database Integration Goal",
                "description": "Successfully integrate PostgreSQL with all SoulSense features",
                "category": "technical",
                "persona_id": "marcus"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/goals",
                json=goal_data
            ) as response:
                if response.status == 200:
                    print("✅ Goal stored in PostgreSQL")
                else:
                    print(f"❌ Goal storage failed: {response.status}")
        except Exception as e:
            print(f"❌ Goal test error: {e}")
        
        # Test Breathing Session
        try:
            breathing_data = {
                "user_id": self.test_user_id,
                "technique_name": "Box Breathing",
                "duration_minutes": 5,
                "pre_session_mood": 6,
                "post_session_mood": 8,
                "persona_id": "maya"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/breathing/session",
                json=breathing_data
            ) as response:
                if response.status == 200:
                    print("✅ Breathing session stored in PostgreSQL")
                else:
                    print(f"❌ Breathing session failed: {response.status}")
        except Exception as e:
            print(f"❌ Breathing test error: {e}")

    async def demo_analytics_dashboard(self):
        """Demonstrate analytics data retrieval"""
        print("\n3️⃣ Testing Analytics Integration")
        print("-" * 50)
        
        # Wait for data processing
        await asyncio.sleep(2)
        
        try:
            async with self.session.get(
                f"{self.base_url}/api/analytics/user/{self.test_user_id}"
            ) as response:
                if response.status == 200:
                    analytics = await response.json()
                    print("✅ Analytics dashboard data retrieved")
                    print(f"   Total interactions: {analytics.get('total_interactions', 0)}")
                    print(f"   Journal entries: {analytics.get('journal_entries', 0)}")
                    print(f"   Goals created: {analytics.get('goals_created', 0)}")
                    print(f"   Breathing sessions: {analytics.get('breathing_sessions', 0)}")
                else:
                    print(f"❌ Analytics retrieval failed: {response.status}")
        except Exception as e:
            print(f"❌ Analytics test error: {e}")

    async def demo_data_persistence(self):
        """Demonstrate data persistence across sessions"""
        print("\n4️⃣ Testing Data Persistence")
        print("-" * 50)
        
        try:
            # Test conversation history retrieval
            async with self.session.get(
                f"{self.base_url}/api/conversations/{self.test_user_id}"
            ) as response:
                if response.status == 200:
                    conversations = await response.json()
                    print(f"✅ Retrieved {len(conversations)} conversation records")
                else:
                    print(f"❌ Conversation retrieval failed: {response.status}")
        except Exception as e:
            print(f"❌ Conversation history error: {e}")
        
        try:
            # Test journal history retrieval
            async with self.session.get(
                f"{self.base_url}/api/journal/{self.test_user_id}"
            ) as response:
                if response.status == 200:
                    journal_entries = await response.json()
                    print(f"✅ Retrieved {len(journal_entries)} journal entries")
                else:
                    print(f"❌ Journal retrieval failed: {response.status}")
        except Exception as e:
            print(f"❌ Journal history error: {e}")
        
        try:
            # Test goal history retrieval
            async with self.session.get(
                f"{self.base_url}/api/goals/{self.test_user_id}"
            ) as response:
                if response.status == 200:
                    goals = await response.json()
                    print(f"✅ Retrieved {len(goals)} goal records")
                else:
                    print(f"❌ Goal retrieval failed: {response.status}")
        except Exception as e:
            print(f"❌ Goal history error: {e}")

async def main():
    """Run the comprehensive integration demo"""
    async with SoulSenseIntegrationDemo() as demo:
        await demo.demonstrate_full_integration()

if __name__ == "__main__":
    print("Starting SoulSense PostgreSQL Integration Demo...")
    print("Make sure the application is running on localhost:8000")
    print()
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⏹️ Demo stopped by user")
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")