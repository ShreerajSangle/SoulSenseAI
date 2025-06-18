import { apiRequest } from "./queryClient";
import type { Persona, Conversation, Message, Session } from "@shared/schema";

export const api = {
  // Personas
  getPersonas: async (): Promise<Persona[]> => {
    const response = await apiRequest("/api/personas", "GET");
    return response.json();
  },

  getPersona: async (id: string): Promise<Persona> => {
    const response = await apiRequest(`/api/personas/${id}`, "GET");
    return response.json();
  },

  // Chat
  getGreeting: async (data: {
    personaId: string;
    userId?: string;
  }) => {
    const response = await apiRequest("/api/chat/greeting", "POST", data);
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
    const response = await apiRequest("/api/chat/message", "POST", data);
    return response.json();
  },

  // Conversations
  getConversations: async (userId: string = "anonymous") => {
    const response = await apiRequest(`/api/conversations?userId=${userId}`, "GET");
    return response.json();
  },

  getConversationMessages: async (conversationId: number): Promise<Message[]> => {
    const response = await apiRequest(`/api/conversations/${conversationId}/messages`, "GET");
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
    const response = await apiRequest("/api/sessions", "POST", data);
    return response.json();
  },

  getSession: async (conversationId: number): Promise<Session> => {
    const response = await apiRequest(`/api/sessions/${conversationId}`, "GET");
    return response.json();
  },

  // Health check
  healthCheck: async () => {
    const response = await apiRequest("/api/health", "GET");
    return response.json();
  },
};
