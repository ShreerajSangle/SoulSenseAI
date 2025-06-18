import {
  users,
  personas,
  conversations,
  messages,
  sessions,
  userMemories,
  type User,
  type UpsertUser,
  type Persona,
  type InsertPersona,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Session,
  type InsertSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  
  // Memory & Context
  getUserMemories(userId: string): Promise<any[]>;
  saveUserMemory(userId: string, memory: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializePersonas();
  }

  private async initializePersonas() {
    // Check if personas already exist
    const existingPersonas = await db.select().from(personas);
    if (existingPersonas.length > 0) {
      return;
    }

    // Insert default personas
    const defaultPersonas: InsertPersona[] = [
      {
        id: "sarah",
        name: "Dr. Sarah",
        role: "Clinical Therapist",
        specialty: "Cognitive Behavioral Therapy",
        description: "A compassionate therapist specializing in anxiety, depression, and trauma recovery.",
        avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
        color: "bg-blue-500"
      },
      {
        id: "alex",
        name: "Alex",
        role: "Peer Counselor",
        specialty: "Lived Experience Support",
        description: "A peer counselor who understands your journey and offers genuine support.",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        color: "bg-green-500"
      },
      {
        id: "marcus",
        name: "Marcus",
        role: "Life Coach",
        specialty: "Goal Setting & Motivation",
        description: "An energetic coach focused on helping you achieve your personal and professional goals.",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        color: "bg-orange-500"
      },
      {
        id: "maya",
        name: "Maya",
        role: "Mindfulness Expert",
        specialty: "Meditation & Stress Relief",
        description: "A mindfulness practitioner guiding you through meditation and stress management.",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        color: "bg-purple-500"
      }
    ];

    await db.insert(personas).values(defaultPersonas);
  }

  // User operations (required for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Personas
  async getPersonas(): Promise<Persona[]> {
    return await db.select().from(personas);
  }

  async getPersona(id: string): Promise<Persona | undefined> {
    const [persona] = await db.select().from(personas).where(eq(personas.id, id));
    return persona || undefined;
  }

  // Conversations
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  // Messages
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  // Sessions
  async createSession(insertSession: InsertSession): Promise<Session> {
    try {
      const [session] = await db
        .insert(sessions)
        .values({
          conversationId: insertSession.conversationId,
          summary: insertSession.summary,
          keyTopics: insertSession.keyTopics,
          techniquesUsed: insertSession.techniquesUsed,
          homework: insertSession.homework,
          moodBefore: insertSession.moodBefore,
          moodAfter: insertSession.moodAfter,
        } as any)
        .returning();
      return session;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  async getConversationSession(conversationId: number): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.conversationId, conversationId));
    return session || undefined;
  }

  // Memory & Context
  async getUserMemories(userId: string): Promise<any[]> {
    const memories = await db
      .select()
      .from(userMemories)
      .where(eq(userMemories.userId, userId))
      .orderBy(desc(userMemories.createdAt));
    
    return memories.map(memory => ({
      type: memory.type,
      content: memory.content,
      metadata: memory.metadata,
      personaId: memory.personaId,
      conversationId: memory.conversationId,
      createdAt: memory.createdAt
    }));
  }

  async saveUserMemory(userId: string, memory: any): Promise<void> {
    await db.insert(userMemories).values({
      userId,
      type: memory.type || 'general',
      content: memory.content,
      metadata: memory.metadata || {},
      personaId: memory.personaId,
      conversationId: memory.conversationId
    });
  }
}

export const storage = new DatabaseStorage();