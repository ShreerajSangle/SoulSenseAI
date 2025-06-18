import { 
  personas, 
  conversations, 
  messages, 
  sessions,
  type Persona, 
  type InsertPersona,
  type Conversation, 
  type InsertConversation,
  type Message, 
  type InsertMessage,
  type Session,
  type InsertSession
} from "@shared/schema";

export interface IStorage {
  // Personas
  getPersonas(): Promise<Persona[]>;
  getPersona(id: string): Promise<Persona | undefined>;
  
  // Conversations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getConversationSession(conversationId: number): Promise<Session | undefined>;
}

export class MemStorage implements IStorage {
  private personas: Map<string, Persona>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private sessions: Map<number, Session>;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentSessionId: number;

  constructor() {
    this.personas = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.sessions = new Map();
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentSessionId = 1;
    
    // Initialize personas
    this.initializePersonas();
  }

  private initializePersonas() {
    const defaultPersonas: Persona[] = [
      {
        id: "dr-sarah",
        name: "Dr. Sarah Chen",
        role: "Clinical Psychologist",
        specialty: "CBT Therapy",
        description: "Warm, professional therapist specializing in CBT and evidence-based approaches",
        avatarUrl: "https://images.unsplash.com/photo-1594824395806-2457c11b9e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        color: "#8b5cf6"
      },
      {
        id: "alex",
        name: "Alex Rodriguez",
        role: "Peer Counselor",
        specialty: "Relatability",
        description: "Friendly peer who understands your struggles and speaks your language",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        color: "#f59e0b"
      },
      {
        id: "marcus",
        name: "Marcus Thompson",
        role: "Life Coach",
        specialty: "Goal Achievement",
        description: "Motivational coach focused on personal growth and achieving your goals",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        color: "#ef4444"
      },
      {
        id: "maya",
        name: "Maya Patel",
        role: "Mindfulness Expert",
        specialty: "Meditation & Mindfulness",
        description: "Calm guide for mindfulness, meditation, and present-moment awareness",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        color: "#10b981"
      }
    ];

    defaultPersonas.forEach(persona => {
      this.personas.set(persona.id, persona);
    });
  }

  async getPersonas(): Promise<Persona[]> {
    return Array.from(this.personas.values());
  }

  async getPersona(id: string): Promise<Persona | undefined> {
    return this.personas.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const now = new Date();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated = { ...conversation, ...updates, updatedAt: new Date() };
    this.conversations.set(id, updated);
    return updated;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    
    // Update conversation timestamp
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      await this.updateConversation(conversation.id, { updatedAt: new Date() });
    }
    
    return message;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const session: Session = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getConversationSession(conversationId: number): Promise<Session | undefined> {
    return Array.from(this.sessions.values())
      .find(session => session.conversationId === conversationId);
  }
}

export const storage = new MemStorage();
