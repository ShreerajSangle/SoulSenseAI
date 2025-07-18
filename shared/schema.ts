// Shared types for SoulSense AI

export interface Persona {
  id: string;
  name: string;
  role: string;
  specialty: string;
  description: string;
  avatar_url: string;
  color: string;
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: number;
  userId: string;
  personaId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  content: string;
  role: 'user' | 'assistant';
  emotionDetected?: string;
  timestamp: string;
}

export interface Session {
  id: number;
  conversationId: number;
  summary?: string;
  keyTopics?: string[];
  techniquesUsed?: string[];
  homework?: string[];
  moodBefore?: number;
  moodAfter?: number;
  createdAt: string;
}

export interface ChatResponse {
  message: string;
  persona_id: string;
  conversation_id: number;
  quick_replies: string[];
  emotion_detected: string;
  suggestions: string[];
}