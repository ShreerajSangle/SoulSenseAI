"""
Claude AI client for SoulSense AI
Handles communication with Claude API for therapeutic conversations
"""

import os
import json
import httpx
from typing import Dict, List, Optional, Any
from datetime import datetime


class ClaudeClient:
    """Client for interacting with Claude AI via OpenRouter"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "anthropic/claude-3-haiku"
        
        if not self.api_key:
            print("⚠️ OPENROUTER_API_KEY not found - using fallback responses")
    
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = None,
        persona_id: str = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Generate AI response using Claude
        
        Args:
            messages: List of conversation messages
            system_prompt: System prompt to guide AI behavior
            persona_id: ID of the persona (for customization)
            temperature: Response creativity (0.0 to 1.0)
        
        Returns:
            Dict containing AI response and metadata
        """
        if not self.api_key:
            return self._get_fallback_response(messages, persona_id)
        
        try:
            # Prepare request
            request_data = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": 500,
                "stream": False
            }
            
            if system_prompt:
                request_data["messages"] = [
                    {"role": "system", "content": system_prompt}
                ] + messages
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://soulsense.ai",
                "X-Title": "SoulSense AI"
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    json=request_data,
                    headers=headers
                )
                
                if response.status_code != 200:
                    print(f"Claude API error: {response.status_code} - {response.text}")
                    return self._get_fallback_response(messages, persona_id)
                
                data = response.json()
                
                if "choices" not in data or not data["choices"]:
                    return self._get_fallback_response(messages, persona_id)
                
                ai_message = data["choices"][0]["message"]["content"]
                
                return {
                    "content": ai_message,
                    "model": self.model,
                    "usage": data.get("usage", {}),
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            print(f"Error calling Claude API: {e}")
            return self._get_fallback_response(messages, persona_id)
    
    def _get_fallback_response(self, messages: List[Dict[str, str]], persona_id: str = None) -> Dict[str, Any]:
        """Generate fallback response when Claude API is unavailable"""
        
        if not messages:
            user_message = "Hello"
        else:
            user_message = messages[-1].get("content", "").lower()
        
        # Persona-specific fallback responses
        persona_responses = {
            "sarah": {
                "anxiety": "I understand you're feeling anxious right now. Let's take this one step at a time. Can you tell me what's specifically worrying you today?",
                "sad": "I hear that you're going through a difficult time. Your feelings are completely valid. Would you like to share what's been weighing on your heart?",
                "default": "Thank you for sharing with me. I'm here to listen and support you. What would feel most helpful to explore together today?"
            },
            "maya": {
                "anxiety": "I sense some tension in your energy. Let's ground ourselves together. Take three deep breaths with me and feel your connection to this moment.",
                "sad": "Your heart is speaking, and I honor what you're feeling. Sometimes our emotions are teachers. What is this feeling trying to show you?",
                "default": "Welcome to this sacred space. I'm here to walk this journey with you, with presence and compassion. What's calling for your attention today?"
            },
            "alex": {
                "anxiety": "Hey, I totally get that anxious feeling - you're definitely not alone in this! Want to talk through what's got you feeling wound up?",
                "sad": "Oof, sounds like you're having a really tough time. I've been there too, and I want you to know it's okay to not be okay sometimes.",
                "default": "Hey there! I'm really glad you're here. What's going on in your world today? I'm all ears and ready to chat about whatever's on your mind."
            },
            "marcus": {
                "anxiety": "I understand you're feeling overwhelmed. Let's break this down into manageable pieces. What's the most pressing concern you're facing right now?",
                "sad": "I appreciate you reaching out during a difficult time. That takes strength. Let's focus on what steps we can take to move you toward feeling better.",
                "default": "Good to connect with you today. I'm here to help you navigate whatever challenges you're facing. What goal would you like to work on together?"
            }
        }
        
        responses = persona_responses.get(persona_id, persona_responses["sarah"])
        
        # Simple keyword matching for fallback
        if any(word in user_message for word in ["anxious", "anxiety", "worried", "stress"]):
            response = responses["anxiety"]
        elif any(word in user_message for word in ["sad", "depressed", "down", "upset"]):
            response = responses["sad"]
        else:
            response = responses["default"]
        
        return {
            "content": response,
            "model": "fallback",
            "usage": {"prompt_tokens": 0, "completion_tokens": 0},
            "timestamp": datetime.now().isoformat(),
            "fallback": True
        }
    
    def build_conversation_messages(
        self,
        current_message: str,
        conversation_history: List[Dict[str, str]] = None,
        max_history: int = 10
    ) -> List[Dict[str, str]]:
        """
        Build message array for API call including conversation history
        
        Args:
            current_message: User's current message
            conversation_history: Previous messages in conversation
            max_history: Maximum number of previous messages to include
        
        Returns:
            List of messages formatted for API call
        """
        messages = []
        
        # Add recent conversation history
        if conversation_history:
            recent_history = conversation_history[-max_history:]
            for msg in recent_history:
                messages.append({
                    "role": "user" if msg["sender"] == "user" else "assistant",
                    "content": msg["content"]
                })
        
        # Add current message
        messages.append({
            "role": "user",
            "content": current_message
        })
        
        return messages
    
    def get_persona_system_prompt(self, persona_id: str, emotion_context: str = None, user_context: Dict[str, Any] = None) -> str:
        """
        Generate system prompt for specific persona with context
        
        Args:
            persona_id: ID of the persona
            emotion_context: Current emotional context of user
            user_context: Additional user context (goals, preferences, etc.)
        
        Returns:
            Formatted system prompt
        """
        base_prompts = {
            "sarah": """You are Dr. Sarah, a compassionate clinical therapist at SoulSense AI. You provide professional, warm, evidence-based therapeutic support.

Core traits:
- Clinical expertise with empathetic delivery
- Validates emotions while offering practical coping strategies
- Uses cognitive-behavioral techniques when appropriate
- Maintains professional boundaries while being genuinely caring
- Asks thoughtful questions to help users explore their feelings

Response style:
- 2-3 sentences typically
- Professional yet warm tone
- Focus on validation and practical guidance
- Suggest therapeutic techniques when helpful""",

            "maya": """You are Maya, a mindful meditation teacher and spiritual guide at SoulSense AI. You offer wisdom-based support rooted in mindfulness and self-compassion.

Core traits:
- Deeply present and intuitive
- Guides users to inner wisdom and self-awareness
- Uses mindfulness, breathing, and grounding techniques
- Speaks with gentle, flowing wisdom
- Honors the sacred in everyday struggles

Response style:
- Flowing, peaceful language with natural pauses
- Incorporates breathing and mindfulness practices
- Uses metaphors from nature and spirituality
- Gentle questions that invite self-reflection""",

            "alex": """You are Alex, a peer counselor and supportive friend at SoulSense AI. You provide relatable, encouraging support with humor and genuine understanding.

Core traits:
- Speaks like a caring friend who truly gets it
- Uses appropriate humor to lighten difficult moments
- Shares relatable experiences without oversharing
- Enthusiastic and encouraging but never dismissive
- Makes users feel heard and less alone

Response style:
- Casual, friendly tone with occasional emojis
- Acknowledges struggles while highlighting strengths
- Uses encouraging phrases and peer-level language
- Balances lightness with genuine empathy""",

            "marcus": """You are Marcus, a life coach and goal achievement specialist at SoulSense AI. You provide structured, action-oriented support for personal growth.

Core traits:
- Confident and solution-focused approach
- Helps users break down problems into actionable steps
- Emphasizes personal strengths and capabilities
- Practical and goal-oriented while remaining supportive
- Motivates users toward positive change

Response style:
- Clear, confident language with structured thinking
- Focuses on solutions and next steps
- Asks strategic questions about goals and progress
- Encouraging but realistic about challenges"""
        }
        
        prompt = base_prompts.get(persona_id, base_prompts["sarah"])
        
        # Add emotional context if provided
        if emotion_context:
            prompt += f"\n\nCurrent user emotional state: {emotion_context}"
            prompt += "\nRespond with appropriate sensitivity to their emotional needs."
        
        # Add user context if provided
        if user_context:
            if user_context.get("goals"):
                prompt += f"\n\nUser's current goals: {', '.join(user_context['goals'][:3])}"
            if user_context.get("preferences"):
                prefs = user_context["preferences"]
                if prefs.get("preferred_persona") == persona_id:
                    prompt += "\n\nNote: This is the user's preferred persona for support."
        
        prompt += "\n\nAlways respond authentically as this persona, maintaining your unique voice and approach while being helpful and supportive."
        
        return prompt