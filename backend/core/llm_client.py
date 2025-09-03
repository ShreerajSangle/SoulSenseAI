"""
LLM Client - AI Model Integration
Handles communication with Claude/Mixtral/GPT models via OpenRouter API
"""

import httpx
import json
import asyncio
from typing import Dict, List, Any, Optional
from models.schemas import PersonaConfig
import os
from datetime import datetime

# Add this block to load .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Please install python-dotenv: pip install python-dotenv")
    import sys; sys.exit(1)

class LLMClient:
    """Client for interacting with various LLM models through OpenRouter API"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "anthropic/claude-3-haiku"  # Default model
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://soulsense.ai",
            "X-Title": "SoulSense AI",
            "Content-Type": "application/json"
        }
        
        # Model configurations
        self.model_configs = {
            "claude-3-haiku": {
                "model": "anthropic/claude-3-haiku",
                "max_tokens": 1000,
                "temperature": 0.7,
                "top_p": 0.9
            },
            "claude-3-sonnet": {
                "model": "anthropic/claude-3-sonnet",
                "max_tokens": 1200,
                "temperature": 0.7,
                "top_p": 0.9
            },
            "mixtral-8x7b": {
                "model": "mistralai/mixtral-8x7b-instruct",
                "max_tokens": 1000,
                "temperature": 0.7,
                "top_p": 0.9
            },
            "gpt-4": {
                "model": "openai/gpt-4",
                "max_tokens": 1000,
                "temperature": 0.7,
                "top_p": 0.9
            }
        }
        
    async def generate_response(
        self, 
        system_prompt: str, 
        conversation_history: List[Dict[str, str]], 
        current_message: str,
        persona_config: PersonaConfig,
        model_name: str = "claude-3-haiku"
    ) -> str:
        """Generate response using specified LLM model"""
        
        try:
            # Get model configuration
            model_config = self.model_configs.get(model_name, self.model_configs["claude-3-haiku"])
            
            # Build messages for the API
            messages = self._build_messages(system_prompt, conversation_history, current_message)
            
            # Make API request
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": model_config["model"],
                        "messages": messages,
                        "max_tokens": model_config["max_tokens"],
                        "temperature": model_config["temperature"],
                        "top_p": model_config["top_p"],
                        "stream": False
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"API request failed: {response.status_code}")
                
                result = response.json()
                
                if "choices" not in result or not result["choices"]:
                    raise Exception("No response generated from API")
                
                content = result["choices"][0]["message"]["content"]
                
                # Post-process response based on persona
                processed_content = self._process_persona_response(content, persona_config)
                
                return processed_content
                
        except Exception as e:
            print(f"LLM generation error: {e}")
            return self._fallback_response(persona_config)
    
    def _build_messages(self, system_prompt: str, conversation_history: List[Dict[str, str]], current_message: str) -> List[Dict[str, str]]:
        """Build messages array for API request"""
        messages = []
        
        # Add system message
        messages.append({
            "role": "system",
            "content": system_prompt
        })
        
        # Add conversation history
        for msg in conversation_history:
            messages.append(msg)
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": current_message
        })
        
        return messages
    
    def _process_persona_response(self, content: str, persona_config: PersonaConfig) -> str:
        """Process response based on persona characteristics"""
        
        # Ensure response length matches persona style
        if persona_config.ui_style.get("response_length") == "reflective_short":
            # Sarah's style - keep concise
            content = self._ensure_concise_response(content)
        elif persona_config.ui_style.get("response_length") == "flowing_paragraphs":
            # Maya's style - allow longer, flowing responses
            content = self._ensure_flowing_response(content)
        elif persona_config.ui_style.get("response_length") == "casual_friendly":
            # Alex's style - casual and conversational
            content = self._ensure_casual_response(content)
        elif persona_config.ui_style.get("response_length") == "structured_guidance":
            # Marcus's style - structured and actionable
            content = self._ensure_structured_response(content)
        
        return content
    
    def _ensure_concise_response(self, content: str) -> str:
        """Ensure response is concise and therapeutic"""
        # If too long, truncate at natural break
        if len(content) > 400:
            sentences = content.split('.')
            truncated = []
            char_count = 0
            for sentence in sentences:
                if char_count + len(sentence) < 350:
                    truncated.append(sentence)
                    char_count += len(sentence)
                else:
                    break
            content = '.'.join(truncated) + '.'
        
        return content
    
    def _ensure_flowing_response(self, content: str) -> str:
        """Ensure response has Maya's flowing, spiritual quality"""
        # Maya can have longer responses with spiritual flow
        return content
    
    def _ensure_casual_response(self, content: str) -> str:
        """Ensure response has Alex's casual, friendly tone"""
        # Alex should sound conversational
        return content
    
    def _ensure_structured_response(self, content: str) -> str:
        """Ensure response has Marcus's structured, actionable format"""
        # Marcus should provide clear, structured guidance
        return content
    
    def _fallback_response(self, persona_config: PersonaConfig) -> str:
        """Generate fallback response when API fails"""
        fallback_responses = {
            "maya": "I sense some turbulence in our connection, dear soul. Take a deep breath with me... Let's try again when the energy feels clearer. 🪷",
            "sarah": "I'm experiencing a brief connection issue, but I'm here and want to support you. Could you share that with me again? I'm listening.",
            "alex": "Oops! Something weird happened on my end, but I'm still here for you! 😅 Want to try that again? I'm all ears!",
            "marcus": "Temporary setback - but that's just an opportunity to come back stronger! 💪 Let's refocus. What's the most important thing you want to work on?"
        }
        
        return fallback_responses.get(persona_config.id, "I'm having trouble connecting right now. Please try again in a moment.")
    
    async def test_connection(self) -> bool:
        """Test API connection and authentication"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/models",
                    headers=self.headers
                )
                return response.status_code == 200
        except:
            return False
    
    def set_model(self, model_name: str):
        """Set the default model to use"""
        if model_name in self.model_configs:
            self.model = model_name
    
    def get_available_models(self) -> List[str]:
        """Get list of available models"""
        return list(self.model_configs.keys())