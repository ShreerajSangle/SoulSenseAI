import { apiRequest } from "./queryClient";
import type { Persona, Conversation, Message, Session } from "@shared/schema";

export const api = {
  // Personas
  getPersonas: async (): Promise<Persona[]> => {
    const response = await apiRequest("GET", "/api/personas");
    return response.json();
  },

  getPersona: async (id: string): Promise<Persona> => {
    const response = await apiRequest("GET", `/api/personas/${id}`);
    return response.json();
  },

  // Chat
  getGreeting: async (data: {
    personaId: string;
    userId?: string;
  }) => {
    const response = await apiRequest("POST", "/api/chat/greeting", data);
    return response.json();
  },

  sendMessage: async (data: {
    message: string;
    personaId: string;
    conversationId?: number;
    userId?: string;
    isFirstMessage?: boolean;
    userMood?: string;
  }) => {
    const response = await apiRequest("POST", "/api/chat/message", data);
    return response.json();
  },

  // Conversations
  getConversations: async (userId: string = "anonymous") => {
    const response = await apiRequest("GET", `/api/conversations?userId=${userId}`);
    return response.json();
  },

  getConversationMessages: async (conversationId: number): Promise<Message[]> => {
    const response = await apiRequest("GET", `/api/conversations/${conversationId}/messages`);
    return response.json();
  },

  // Sessions
  createSession: async (data: {
    conversationId: number;
    summary?: string;
    keyTopics?: string[];
    techniquesUsed?: string[];
    homework?: string[];
    moodBefore?: number;
    moodAfter?: number;
  }): Promise<Session> => {
    const response = await apiRequest("POST", "/api/sessions", data);
    return response.json();
  },

  getSession: async (conversationId: number): Promise<Session> => {
    const response = await apiRequest("GET", `/api/sessions/${conversationId}`);
    return response.json();
  },

  // Health check
  healthCheck: async () => {
    const response = await apiRequest("GET", "/api/health");
    return response.json();
  },
};
