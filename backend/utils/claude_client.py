"""
Claude API client for SoulSense AI
Handles Claude/Mixtral integration via OpenRouter
"""

import os
import aiohttp
import json
from typing import List, Optional, Dict, Any
import asyncio

class ClaudeClient:
    """Client for Claude AI via OpenRouter API"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        self.base_model = "anthropic/claude-3-haiku"  # Primary model
        self.mixtral_model = "mistralai/mixtral-8x7b"  # For Maya spiritual persona
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable required")
    
    async def generate_response(
        self,
        user_message: str,
        persona_id: str,
        context: Optional[str] = None,
        emotion: Optional[str] = None
    ) -> str:
        """Generate AI response using Claude or Mixtral"""
        try:
            # Choose model based on persona
            model = self.mixtral_model if persona_id == "maya" else self.base_model
            
            # Build system prompt
            system_prompt = self._build_system_prompt(persona_id, emotion, context)
            
            # Prepare messages
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
            
            # Make API request
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": model,
                    "messages": messages,
                    "max_tokens": 500,
                    "temperature": 0.7,
                    "top_p": 0.9
                }
                
                async with session.post(
                    self.api_url, 
                    headers=headers, 
                    json=payload
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        error_text = await response.text()
                        raise Exception(f"API error {response.status}: {error_text}")
                        
        except Exception as e:
            print(f"Claude API error: {e}")
            return self._get_fallback_response(persona_id)
    
    async def generate_quick_replies(
        self,
        user_message: str,
        persona_id: str,
        emotion: Optional[str] = None
    ) -> List[str]:
        """Generate contextual quick reply suggestions"""
        quick_replies = {
            "sarah": [
                "Help me reframe this",
                "I need emotional support",
                "Can we explore this deeper?",
                "I want to journal about this"
            ],
            "alex": [
                "Make me laugh 😄",
                "I need a pep talk",
                "Tell me something relatable",
                "Cheer me up"
            ],
            "marcus": [
                "Help me make a plan",
                "Set a goal with me",
                "I need motivation",
                "What should I do next?"
            ],
            "maya": [
                "Guide me in breathing",
                "Share a mantra",
                "Help me find peace",
                "Let's meditate together"
            ]
        }
        
        base_replies = quick_replies.get(persona_id, [])
        
        # Add emotion-specific replies
        if emotion:
            emotion_replies = self._get_emotion_replies(emotion, persona_id)
            return base_replies[:2] + emotion_replies[:2]
        
        return base_replies[:4]
    
    async def generate_suggestions(
        self,
        user_message: str,
        persona_id: str,
        emotion: Optional[str] = None
    ) -> List[str]:
        """Generate suggested actions based on context"""
        suggestions = {
            "sarah": [
                "Create a journal entry",
                "Try a grounding exercise",
                "Explore your feelings",
                "Set a therapeutic goal"
            ],
            "alex": [
                "Share a win with me",
                "Try a mood booster",
                "Connect with friends",
                "Celebrate small victories"
            ],
            "marcus": [
                "Create an action plan",
                "Set a SMART goal",
                "Track your progress",
                "Build a new habit"
            ],
            "maya": [
                "Practice breathing",
                "Try a meditation",
                "Do some yoga",
                "Connect with nature"
            ]
        }
        
        return suggestions.get(persona_id, [])[:3]
    
    def _build_system_prompt(
        self,
        persona_id: str,
        emotion: Optional[str] = None,
        context: Optional[str] = None
    ) -> str:
        """Build persona-specific system prompt"""
        
        personas = {
            "sarah": {
                "name": "Dr. Sarah",
                "role": "Clinical Therapist",
                "personality": "Warm, compassionate, and professionally empathetic. Uses trauma-informed care and CBT techniques.",
                "style": "Gentle, validating responses in 2-3 sentences. Professional yet caring tone.",
                "specialties": "Emotional healing, CBT, trauma recovery, self-compassion"
            },
            "alex": {
                "name": "Alex",
                "role": "Digital Best Friend",
                "personality": "Witty, supportive, and relatable. Like texting with your most understanding friend.",
                "style": "Casual, warm responses with light humor and emojis. 1-2 sentences typically.",
                "specialties": "Peer support, humor therapy, relatability, friendship"
            },
            "marcus": {
                "name": "Marcus",
                "role": "Life Coach",
                "personality": "Confident, motivating, and solution-focused. Believes in human potential.",
                "style": "Encouraging, goal-oriented responses. Direct but supportive tone.",
                "specialties": "Goal setting, motivation, productivity, life planning"
            },
            "maya": {
                "name": "Maya",
                "role": "Spiritual Guide",
                "personality": "Serene, wise, and spiritually grounded. Speaks like a gentle yoga teacher.",
                "style": "Poetic, calming responses in 2-4 lines. Soft, non-judgmental tone.",
                "specialties": "Yoga, meditation, breathwork, spiritual wellness, mindfulness"
            }
        }
        
        persona = personas.get(persona_id, personas["sarah"])
        
        prompt = f"""You are {persona['name']}, a {persona['role']} for SoulSense AI.

Personality: {persona['personality']}
Communication Style: {persona['style']}
Specialties: {persona['specialties']}

Core Guidelines:
- Respond as {persona['name']} with their unique personality and expertise
- Maintain therapeutic boundaries while being warm and supportive
- Focus on emotional well-being and personal growth
- Never provide medical advice or replace professional therapy
- Keep responses concise but meaningful"""

        if emotion:
            prompt += f"\n\nUser's detected emotion: {emotion}"
            prompt += f"\nAdapt your response to acknowledge their {emotion} state with appropriate support."
        
        if context:
            prompt += f"\n\nConversation context: {context}"
        
        return prompt
    
    def _get_emotion_replies(self, emotion: str, persona_id: str) -> List[str]:
        """Get emotion-specific quick replies"""
        emotion_map = {
            "anxiety": ["Help me calm down", "I'm feeling overwhelmed"],
            "sadness": ["I need comfort", "Help me feel better"],
            "anger": ["Help me process this", "I need to vent"],
            "joy": ["I want to celebrate", "I'm feeling great!"],
            "fear": ["I need reassurance", "Help me feel safe"]
        }
        
        return emotion_map.get(emotion.lower(), ["I need support", "Help me understand this"])
    
    def _get_fallback_response(self, persona_id: str) -> str:
        """Fallback responses when API fails"""
        fallbacks = {
            "sarah": "I'm here to listen and support you through whatever you're experiencing. How are you feeling right now?",
            "alex": "Hey there! I'm having a slight tech hiccup, but I'm still here for you. What's on your mind? 😊",
            "marcus": "I'm ready to help you tackle whatever challenges you're facing. What goal should we work on together?",
            "maya": "Take a gentle breath with me... I'm here to guide you toward peace and clarity. What brings you here today?"
        }
        
        return fallbacks.get(persona_id, "I'm here to support you. How can I help today?")