import {
  users,
  personas,
  conversations,
  messages,
  sessions,
  userMemories,
  moodEntries,
  microToolUsage,
  messageFeedback,
  sessionFeedback,
  diaryEntries,
  userProfiles,
  goals,
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
  type Goal,
  type InsertGoal,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { SupabaseStorage } from "./supabase-storage";

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
  getConversationByUserAndPersona(userId: string, personaId: string): Promise<Conversation | undefined>;
  endConversation(id: number): Promise<Conversation | undefined>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getConversationSession(conversationId: number): Promise<Session | undefined>;
  
  // Memory & Context
  getUserMemories(userId: string): Promise<any[]>;
  saveUserMemory(userId: string, memory: any): Promise<void>;
  
  // Mood tracking
  createMoodEntry(entry: any): Promise<any>;
  getUserMoodEntries(userId: string, range?: string): Promise<any[]>;
  
  // Micro-tools tracking
  createMicroToolUsage(usage: any): Promise<any>;
  
  // Message feedback
  createMessageFeedback(feedback: any): Promise<any>;
  
  // Session feedback
  createSessionFeedback(feedback: any): Promise<any>;
  
  // Diary entries
  createDiaryEntry(entry: any): Promise<any>;
  getDiaryEntries(userId: string): Promise<any[]>;
  updateDiaryEntry(id: number, updates: any): Promise<any>;
  deleteDiaryEntry(id: number): Promise<void>;
  
  // User profiles
  getUserProfile(userId: string): Promise<any>;
  createUserProfile(profile: any): Promise<any>;
  updateUserProfile(userId: string, updates: any): Promise<any>;
  
  // Goals
  createGoal(goal: InsertGoal): Promise<Goal>;
  getUserGoals(userId: string): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal>;
  deleteGoal(id: number): Promise<void>;
  updateGoalStatus(id: number, status: string, completedDate?: Date): Promise<Goal>;
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

  // Mood tracking methods
  async createMoodEntry(entry: any): Promise<any> {
    const [moodEntry] = await db
      .insert(moodEntries)
      .values({
        userId: entry.userId,
        sessionId: entry.sessionId,
        moodRating: entry.moodRating,
        emotions: entry.emotions || null,
        notes: entry.notes,
        triggers: entry.triggers || null,
        type: entry.type,
      })
      .returning();
    return moodEntry;
  }

  async getUserMoodEntries(userId: string, range: string): Promise<any[]> {
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.createdAt));
  }

  // Micro-tools tracking
  async createMicroToolUsage(usage: any): Promise<any> {
    const [toolUsage] = await db
      .insert(microToolUsage)
      .values({
        userId: usage.userId,
        sessionId: usage.sessionId,
        toolType: usage.toolType,
        toolName: usage.toolName,
        duration: usage.duration,
        completed: usage.completed,
        effectiveness: usage.effectiveness,
      })
      .returning();
    return toolUsage;
  }

  // Message feedback
  async createMessageFeedback(feedback: any): Promise<any> {
    const [feedbackEntry] = await db
      .insert(messageFeedback)
      .values({
        messageId: feedback.messageId,
        userId: feedback.userId,
        rating: feedback.rating,
        feedback: feedback.feedback,
      })
      .returning();
    return feedbackEntry;
  }

  // Session feedback
  async createSessionFeedback(feedback: any): Promise<any> {
    const [feedbackEntry] = await db
      .insert(sessionFeedback)
      .values({
        conversationId: feedback.conversationId,
        personaId: feedback.personaId,
        rating: feedback.rating,
        feedback: feedback.feedback,
        helpfulness: feedback.helpfulness,
        wouldRecommend: feedback.wouldRecommend,
        sessionDuration: feedback.sessionDuration,
      })
      .returning();
    return feedbackEntry;
  }

  // Diary entries
  async createDiaryEntry(entry: any): Promise<any> {
    const [diaryEntry] = await db
      .insert(diaryEntries)
      .values({
        userId: entry.userId,
        title: entry.title,
        content: entry.content,
        moodRating: entry.moodRating,
        emotions: entry.emotions,
        gratitude: entry.gratitude,
        goals: entry.goals,
        reflections: entry.reflections,
        tags: entry.tags,
      })
      .returning();
    return diaryEntry;
  }

  async getDiaryEntries(userId: string): Promise<any[]> {
    const entries = await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.createdAt));
    return entries;
  }

  async updateDiaryEntry(id: number, updates: any): Promise<any> {
    const [updatedEntry] = await db
      .update(diaryEntries)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(diaryEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteDiaryEntry(id: number): Promise<void> {
    await db
      .delete(diaryEntries)
      .where(eq(diaryEntries.id, id));
  }

  // User profiles
  async getUserProfile(userId: string): Promise<any> {
    // Get user data from users table - primary source of profile data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      // Create user if doesn't exist
      const [newUser] = await db
        .insert(users)
        .values({
          id: userId,
          name: "",
          pronouns: "",
          moodTagline: "",
          bio: "",
          preferences: {
            preferredPersona: "sarah",
            voiceEnabled: false,
            darkMode: false,
            notifications: {
              dailyCheckins: true,
              sessionReminders: true,
              progressUpdates: true
            },
            privacy: {
              shareAnalytics: true,
              dataRetention: "1year"
            }
          }
        })
        .returning();
      
      return {
        userId: newUser.id,
        name: newUser.name || "",
        pronouns: newUser.pronouns || "",
        moodTagline: newUser.moodTagline || "",
        bio: newUser.bio || "",
        avatar: newUser.profileImageUrl,
        preferences: newUser.preferences,
        goals: newUser.goals || [],
        stats: {
          totalSessions: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageMood: 0,
          favoriteEmotion: "calm"
        }
      };
    }
    
    return {
      userId: user.id,
      name: user.name || "",
      pronouns: user.pronouns || "",
      moodTagline: user.moodTagline || "",
      bio: user.bio || "",
      avatar: user.profileImageUrl,
      preferences: user.preferences,
      goals: user.goals || [],
      stats: {
        totalSessions: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageMood: 0,
        favoriteEmotion: "calm"
      }
    };
  }

  async createUserProfile(profile: any): Promise<any> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values({
        userId: profile.userId,
        bio: profile.bio,
        avatar: profile.avatar,
        preferences: profile.preferences,
        goals: profile.goals,
        interests: profile.interests,
        mentalHealthFocus: profile.mentalHealthFocus,
        stats: profile.stats,
      })
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, updates: any): Promise<any> {
    // Update the users table with enhanced profile data
    const [updatedUser] = await db
      .update(users)
      .set({
        name: updates.name,
        pronouns: updates.pronouns,
        moodTagline: updates.moodTagline,
        firstName: updates.name ? updates.name.split(' ')[0] : undefined,
        lastName: updates.name ? updates.name.split(' ').slice(1).join(' ') : undefined,
        email: updates.email,
        bio: updates.bio,
        preferences: updates.preferences,
        goals: updates.goals,
        interests: updates.interests,
        mentalHealthFocus: updates.mentalHealthFocus,
        privacySettings: updates.privacySettings,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    // Return the updated user profile data
    return {
      userId: updatedUser[0].id,
      name: updatedUser[0].name || "",
      pronouns: updatedUser[0].pronouns || "",
      moodTagline: updatedUser[0].moodTagline || "",
      bio: updatedUser[0].bio || "",
      avatar: updatedUser[0].profileImageUrl,
      preferences: updatedUser[0].preferences,
      goals: updatedUser[0].goals || [],
      stats: {
        totalSessions: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageMood: 0,
        favoriteEmotion: "calm"
      }
    };
  }

  // GDPR Compliance Methods
  async deleteAllUserData(userId: string): Promise<void> {
    // Delete all user-related data in the correct order
    await db.delete(messageFeedback).where(eq(messageFeedback.userId, userId));
    await db.delete(microToolUsage).where(eq(microToolUsage.userId, userId));
    await db.delete(moodEntries).where(eq(moodEntries.userId, userId));
    await db.delete(userMemories).where(eq(userMemories.userId, userId));
    await db.delete(goals).where(eq(goals.userId, userId));
    
    // Delete conversations and related data
    const userConversations = await db.select().from(conversations).where(eq(conversations.userId, userId));
    for (const conversation of userConversations) {
      await db.delete(sessionFeedback).where(eq(sessionFeedback.conversationId, conversation.id));
      await db.delete(sessions).where(eq(sessions.conversationId, conversation.id));
      await db.delete(messages).where(eq(messages.conversationId, conversation.id));
    }
    await db.delete(conversations).where(eq(conversations.userId, userId));
    
    // Delete profile data
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  }

  // Goals
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db
      .insert(goals)
      .values({
        ...goal,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newGoal;
  }

  async getUserGoals(userId: string): Promise<Goal[]> {
    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
    return userGoals;
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id));
    return goal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal> {
    // Convert string dates to Date objects for timestamp fields
    const processedUpdates = { ...updates };
    if (processedUpdates.targetDate && typeof processedUpdates.targetDate === 'string') {
      processedUpdates.targetDate = new Date(processedUpdates.targetDate);
    }
    if (processedUpdates.completedDate && typeof processedUpdates.completedDate === 'string') {
      processedUpdates.completedDate = new Date(processedUpdates.completedDate);
    }
    if (processedUpdates.createdAt && typeof processedUpdates.createdAt === 'string') {
      processedUpdates.createdAt = new Date(processedUpdates.createdAt);
    }

    const [updatedGoal] = await db
      .update(goals)
      .set({
        ...processedUpdates,
        updatedAt: new Date(),
      })
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<void> {
    await db
      .delete(goals)
      .where(eq(goals.id, id));
  }

  async updateGoalStatus(id: number, status: string, completedDate?: Date): Promise<Goal> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (status === 'completed' && completedDate) {
      updateData.completedDate = completedDate;
      updateData.progress = 100;
    }
    
    const [updatedGoal] = await db
      .update(goals)
      .set(updateData)
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }

  // Session History Management
  async getConversationByUserAndPersona(userId: string, personaId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId) && eq(conversations.personaId, personaId))
      .orderBy(desc(conversations.updatedAt));
    return conversation;
  }

  async endConversation(id: number): Promise<Conversation | undefined> {
    const messages = await this.getConversationMessages(id);
    const persona = await this.getPersona((await this.getConversation(id))?.personaId || '');
    
    // Generate creative session name
    const creativeName = this.generateCreativeSessionName(persona, messages);
    
    const [updatedConversation] = await db
      .update(conversations)
      .set({
        title: creativeName,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, id))
      .returning();
    return updatedConversation;
  }

  private generateCreativeSessionName(persona: Persona | undefined, messages: Message[]): string {
    if (!persona || messages.length < 2) {
      return `Session - ${new Date().toLocaleDateString()}`;
    }

    // Analyze session content for creative naming
    const userMessages = messages.filter(m => m.sender === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content.toLowerCase() || '';
    
    // Session type detection
    const sessionTypes = {
      vent: ['frustrated', 'angry', 'upset', 'annoyed', 'stressed', 'overwhelmed', 'vent', 'rant'],
      motivation: ['goal', 'achieve', 'motivation', 'inspire', 'success', 'progress', 'accomplish'],
      anxiety: ['anxious', 'worry', 'nervous', 'panic', 'scared', 'afraid', 'anxiety'],
      support: ['help', 'support', 'lonely', 'sad', 'depressed', 'down', 'difficult'],
      mindfulness: ['calm', 'peace', 'meditate', 'breathe', 'mindful', 'relax', 'center']
    };

    let sessionType = 'chat';
    for (const [type, keywords] of Object.entries(sessionTypes)) {
      if (keywords.some(keyword => lastUserMessage.includes(keyword))) {
        sessionType = type;
        break;
      }
    }

    // Generate creative names based on persona and session type
    const nameTemplates = {
      sarah: {
        vent: ['Therapeutic Vent', 'Processing Session', 'Emotional Release'],
        motivation: ['Growth Session', 'Therapeutic Progress', 'Healing Journey'],
        anxiety: ['Anxiety Support', 'Calming Session', 'Coping Strategies'],
        support: ['Supportive Chat', 'Clinical Check-in', 'Therapeutic Support'],
        mindfulness: ['Mindful Moment', 'Grounding Session', 'Peaceful Chat'],
        chat: ['Therapy Session', 'Clinical Chat', 'Supportive Talk']
      },
      alex: {
        vent: ['Vent with Alex', 'Real Talk', 'Honest Chat'],
        motivation: ['Motivation Session', 'Peer Support', 'Encouragement Chat'],
        anxiety: ['Anxiety Check-in', 'Peer Counseling', 'Support Session'],
        support: ['Heart-to-Heart', 'Supportive Chat', 'Understanding Session'],
        mindfulness: ['Mindful Chat', 'Peaceful Moment', 'Calming Talk'],
        chat: ['Peer Session', 'Friend Chat', 'Support Talk']
      },
      marcus: {
        vent: ['Energy Release', 'Power Session', 'Breakthrough Chat'],
        motivation: ['Goal Session', 'Achievement Talk', 'Success Planning'],
        anxiety: ['Confidence Building', 'Strength Session', 'Empowerment Chat'],
        support: ['Coaching Session', 'Life Chat', 'Growth Talk'],
        mindfulness: ['Focus Session', 'Centered Chat', 'Mindful Coaching'],
        chat: ['Coaching Session', 'Growth Chat', 'Success Talk']
      },
      maya: {
        vent: ['Mindful Venting', 'Emotional Flow', 'Release Session'],
        motivation: ['Mindful Goals', 'Intentional Growth', 'Peaceful Progress'],
        anxiety: ['Calming Practice', 'Peaceful Session', 'Anxiety Relief'],
        support: ['Gentle Support', 'Mindful Care', 'Compassionate Chat'],
        mindfulness: ['Meditation Chat', 'Mindful Moment', 'Zen Session'],
        chat: ['Mindful Session', 'Peaceful Chat', 'Zen Talk']
      }
    };

    const personaTemplates = nameTemplates[persona.id as keyof typeof nameTemplates] || nameTemplates.sarah;
    const templates = personaTemplates[sessionType as keyof typeof personaTemplates] || personaTemplates.chat;
    const baseName = templates[Math.floor(Math.random() * templates.length)];
    
    // Add date for uniqueness
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    return `${baseName} - ${dateStr}`;
  }
}

export const storage = new DatabaseStorage();