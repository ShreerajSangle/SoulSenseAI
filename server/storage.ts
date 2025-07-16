import { 
  users, 
  conversations, 
  messages, 
  memories, 
  emotionLogs, 
  therapeuticOutcomes, 
  sessionAnalytics, 
  goals, 
  journalEntries, 
  userBehaviorPatterns, 
  trainingDatasets,
  type User, 
  type InsertUser, 
  type Conversation, 
  type InsertConversation, 
  type Message, 
  type InsertMessage, 
  type Memory, 
  type InsertMemory, 
  type EmotionLog, 
  type InsertEmotionLog,
  type TherapeuticOutcome, 
  type InsertTherapeuticOutcome,
  type SessionAnalytics, 
  type InsertSessionAnalytics,
  type Goal, 
  type InsertGoal,
  type JournalEntry, 
  type InsertJournalEntry,
  type UserBehaviorPattern, 
  type InsertUserBehaviorPattern,
  type TrainingDataset, 
  type InsertTrainingDataset
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Conversation management
  createConversation(insertConversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUser(userId: number): Promise<Conversation[]>;
  updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation>;
  
  // Message management
  createMessage(insertMessage: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  getRecentMessages(userId: number, limit?: number): Promise<Message[]>;
  
  // Memory management
  createMemory(insertMemory: InsertMemory): Promise<Memory>;
  getMemoriesByUser(userId: number, personaId?: string): Promise<Memory[]>;
  getMemoryByImportance(userId: number, personaId: string, minImportance: number): Promise<Memory[]>;
  updateMemory(id: number, updates: Partial<Memory>): Promise<Memory>;
  
  // Emotion tracking
  createEmotionLog(insertEmotionLog: InsertEmotionLog): Promise<EmotionLog>;
  getEmotionLogsByUser(userId: number): Promise<EmotionLog[]>;
  getEmotionTrends(userId: number, days: number): Promise<any[]>;
  
  // Therapeutic outcomes
  createTherapeuticOutcome(insertOutcome: InsertTherapeuticOutcome): Promise<TherapeuticOutcome>;
  getTherapeuticOutcomes(userId: number): Promise<TherapeuticOutcome[]>;
  
  // Session analytics
  createSessionAnalytics(insertAnalytics: InsertSessionAnalytics): Promise<SessionAnalytics>;
  getSessionAnalytics(userId: number): Promise<SessionAnalytics[]>;
  
  // Goal management
  createGoal(insertGoal: InsertGoal): Promise<Goal>;
  getGoalsByUser(userId: number): Promise<Goal[]>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal>;
  
  // Journal entries
  createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntriesByUser(userId: number): Promise<JournalEntry[]>;
  
  // Behavioral patterns
  createUserBehaviorPattern(insertPattern: InsertUserBehaviorPattern): Promise<UserBehaviorPattern>;
  getUserBehaviorPatterns(userId: number): Promise<UserBehaviorPattern[]>;
  
  // Training datasets
  createTrainingDataset(insertDataset: InsertTrainingDataset): Promise<TrainingDataset>;
  getTrainingDatasets(type?: string): Promise<TrainingDataset[]>;
  
  // Comprehensive data collection methods
  collectConversationData(conversationId: number): Promise<any>;
  collectUserPatterns(userId: number): Promise<any>;
  generateTrainingData(userId: number): Promise<any>;
}

// Enhanced database storage with comprehensive data collection
export class DatabaseStorage implements IStorage {
  
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Conversation management with enhanced tracking
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(insertConversation).returning();
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationsByUser(userId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.createdAt));
  }

  async updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation> {
    const [conversation] = await db.update(conversations).set(updates).where(eq(conversations.id, id)).returning();
    return conversation;
  }

  // Message management with comprehensive tracking
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async getRecentMessages(userId: number, limit = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(eq(conversations.userId, userId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  // Advanced memory management
  async createMemory(insertMemory: InsertMemory): Promise<Memory> {
    const [memory] = await db.insert(memories).values(insertMemory).returning();
    return memory;
  }

  async getMemoriesByUser(userId: number, personaId?: string): Promise<Memory[]> {
    let query = db.select().from(memories).where(eq(memories.userId, userId));
    
    if (personaId) {
      query = query.where(eq(memories.personaId, personaId as any));
    }
    
    return await query.orderBy(desc(memories.importance), desc(memories.lastAccessed));
  }

  async getMemoryByImportance(userId: number, personaId: string, minImportance: number): Promise<Memory[]> {
    return await db
      .select()
      .from(memories)
      .where(
        and(
          eq(memories.userId, userId),
          eq(memories.personaId, personaId as any),
          sql`${memories.importance} >= ${minImportance}`
        )
      )
      .orderBy(desc(memories.importance));
  }

  async updateMemory(id: number, updates: Partial<Memory>): Promise<Memory> {
    const [memory] = await db.update(memories).set(updates).where(eq(memories.id, id)).returning();
    return memory;
  }

  // Emotion tracking with comprehensive logging
  async createEmotionLog(insertEmotionLog: InsertEmotionLog): Promise<EmotionLog> {
    const [emotionLog] = await db.insert(emotionLogs).values(insertEmotionLog).returning();
    return emotionLog;
  }

  async getEmotionLogsByUser(userId: number): Promise<EmotionLog[]> {
    return await db.select().from(emotionLogs).where(eq(emotionLogs.userId, userId)).orderBy(desc(emotionLogs.createdAt));
  }

  async getEmotionTrends(userId: number, days: number): Promise<any[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    return await db
      .select({
        date: sql`DATE(${emotionLogs.createdAt})`,
        primary_emotion: emotionLogs.primaryEmotion,
        avg_intensity: sql`AVG(${emotionLogs.intensity})`,
        avg_valence: sql`AVG(${emotionLogs.valence})`,
        count: sql`COUNT(*)`
      })
      .from(emotionLogs)
      .where(
        and(
          eq(emotionLogs.userId, userId),
          sql`${emotionLogs.createdAt} >= ${daysAgo}`
        )
      )
      .groupBy(sql`DATE(${emotionLogs.createdAt})`, emotionLogs.primaryEmotion)
      .orderBy(sql`DATE(${emotionLogs.createdAt})`);
  }

  // Therapeutic outcomes tracking
  async createTherapeuticOutcome(insertOutcome: InsertTherapeuticOutcome): Promise<TherapeuticOutcome> {
    const [outcome] = await db.insert(therapeuticOutcomes).values(insertOutcome).returning();
    return outcome;
  }

  async getTherapeuticOutcomes(userId: number): Promise<TherapeuticOutcome[]> {
    return await db.select().from(therapeuticOutcomes).where(eq(therapeuticOutcomes.userId, userId));
  }

  // Session analytics
  async createSessionAnalytics(insertAnalytics: InsertSessionAnalytics): Promise<SessionAnalytics> {
    const [analytics] = await db.insert(sessionAnalytics).values(insertAnalytics).returning();
    return analytics;
  }

  async getSessionAnalytics(userId: number): Promise<SessionAnalytics[]> {
    return await db.select().from(sessionAnalytics).where(eq(sessionAnalytics.userId, userId));
  }

  // Goal management
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }

  async getGoalsByUser(userId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal> {
    const [goal] = await db.update(goals).set(updates).where(eq(goals.id, id)).returning();
    return goal;
  }

  // Journal entries
  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db.insert(journalEntries).values(insertEntry).returning();
    return entry;
  }

  async getJournalEntriesByUser(userId: number): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.createdAt));
  }

  // Behavioral patterns
  async createUserBehaviorPattern(insertPattern: InsertUserBehaviorPattern): Promise<UserBehaviorPattern> {
    const [pattern] = await db.insert(userBehaviorPatterns).values(insertPattern).returning();
    return pattern;
  }

  async getUserBehaviorPatterns(userId: number): Promise<UserBehaviorPattern[]> {
    return await db.select().from(userBehaviorPatterns).where(eq(userBehaviorPatterns.userId, userId));
  }

  // Training datasets
  async createTrainingDataset(insertDataset: InsertTrainingDataset): Promise<TrainingDataset> {
    const [dataset] = await db.insert(trainingDatasets).values(insertDataset).returning();
    return dataset;
  }

  async getTrainingDatasets(type?: string): Promise<TrainingDataset[]> {
    let query = db.select().from(trainingDatasets);
    
    if (type) {
      query = query.where(eq(trainingDatasets.datasetType, type));
    }
    
    return await query.orderBy(desc(trainingDatasets.createdAt));
  }

  // Comprehensive data collection methods
  async collectConversationData(conversationId: number): Promise<any> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return null;

    const messages = await this.getMessagesByConversation(conversationId);
    const emotionLogs = await db.select().from(emotionLogs).where(eq(emotionLogs.conversationId, conversationId));
    const outcomes = await db.select().from(therapeuticOutcomes).where(eq(therapeuticOutcomes.conversationId, conversationId));
    const analytics = await db.select().from(sessionAnalytics).where(eq(sessionAnalytics.conversationId, conversationId));

    return {
      conversation,
      messages,
      emotionLogs,
      outcomes,
      analytics,
      trainingValue: this.calculateTrainingValue(conversation, messages, emotionLogs, outcomes)
    };
  }

  async collectUserPatterns(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) return null;

    const conversations = await this.getConversationsByUser(userId);
    const emotions = await this.getEmotionLogsByUser(userId);
    const patterns = await this.getUserBehaviorPatterns(userId);
    const goals = await this.getGoalsByUser(userId);
    const journalEntries = await this.getJournalEntriesByUser(userId);

    return {
      user,
      conversations,
      emotions,
      patterns,
      goals,
      journalEntries,
      insights: this.generateUserInsights(user, conversations, emotions, patterns)
    };
  }

  async generateTrainingData(userId: number): Promise<any> {
    const userData = await this.collectUserPatterns(userId);
    if (!userData) return null;

    // Generate training-ready data format
    const trainingData = {
      userId,
      conversationSamples: userData.conversations.map((conv: any) => ({
        personaId: conv.personaId,
        emotionalJourney: conv.emotionalJourney,
        therapeuticTechniques: conv.therapeuticTechniques,
        outcomes: conv.outcomes,
        effectiveness: conv.userSatisfaction
      })),
      emotionalPatterns: this.analyzeEmotionalPatterns(userData.emotions),
      therapeuticResponses: this.analyzeTherapeuticResponses(userData.conversations),
      personalityProfile: this.generatePersonalityProfile(userData),
      privacyConsent: userData.user.consentLevel,
      qualityScore: this.calculateDataQuality(userData)
    };

    // Store in training datasets table
    await this.createTrainingDataset({
      datasetType: 'user_comprehensive',
      dataPoints: trainingData,
      qualityScore: trainingData.qualityScore,
      diversity: this.calculateDiversity(trainingData),
      balance: this.calculateBalance(trainingData),
      consent: { level: userData.user.consentLevel, timestamp: new Date() },
      processingNotes: `Generated from user ${userId} complete data`,
      version: '1.0'
    });

    return trainingData;
  }

  // Helper methods for training data generation
  private calculateTrainingValue(conversation: any, messages: any[], emotionLogs: any[], outcomes: any[]): number {
    let value = 0;
    
    // More messages = more training value
    value += Math.min(messages.length * 0.1, 5);
    
    // Emotional diversity adds value
    const uniqueEmotions = new Set(emotionLogs.map(log => log.primaryEmotion));
    value += uniqueEmotions.size * 0.2;
    
    // Therapeutic outcomes add significant value
    value += outcomes.length * 0.5;
    
    // Session duration adds value
    if (conversation.sessionDuration) {
      value += Math.min(conversation.sessionDuration / 3600, 2); // Max 2 points for 1 hour
    }
    
    return Math.min(value, 10) / 10; // Normalize to 0-1
  }

  private generateUserInsights(user: any, conversations: any[], emotions: any[], patterns: any[]): any {
    return {
      totalInteractions: conversations.length,
      avgSessionDuration: conversations.reduce((sum, c) => sum + (c.sessionDuration || 0), 0) / conversations.length,
      emotionalTrends: this.analyzeEmotionalTrends(emotions),
      preferredPersonas: this.analyzePersonaPreferences(conversations),
      therapeuticProgress: this.analyzeTherapeuticProgress(conversations, emotions),
      riskFactors: this.identifyRiskFactors(emotions, patterns),
      growthAreas: this.identifyGrowthAreas(conversations, patterns)
    };
  }

  private analyzeEmotionalPatterns(emotions: any[]): any {
    const patterns = {
      dominant_emotions: {},
      intensity_trends: [],
      valence_patterns: [],
      temporal_patterns: {}
    };

    emotions.forEach(emotion => {
      // Track dominant emotions
      if (!patterns.dominant_emotions[emotion.primaryEmotion]) {
        patterns.dominant_emotions[emotion.primaryEmotion] = 0;
      }
      patterns.dominant_emotions[emotion.primaryEmotion]++;

      // Track intensity and valence trends
      patterns.intensity_trends.push({
        timestamp: emotion.createdAt,
        intensity: emotion.intensity,
        emotion: emotion.primaryEmotion
      });

      patterns.valence_patterns.push({
        timestamp: emotion.createdAt,
        valence: emotion.valence,
        emotion: emotion.primaryEmotion
      });
    });

    return patterns;
  }

  private analyzeTherapeuticResponses(conversations: any[]): any {
    const responses = {
      techniques_used: {},
      effectiveness_scores: [],
      persona_performance: {},
      intervention_success: []
    };

    conversations.forEach(conv => {
      if (conv.therapeuticTechniques) {
        Object.keys(conv.therapeuticTechniques).forEach(technique => {
          if (!responses.techniques_used[technique]) {
            responses.techniques_used[technique] = 0;
          }
          responses.techniques_used[technique]++;
        });
      }

      if (conv.userSatisfaction) {
        responses.effectiveness_scores.push(conv.userSatisfaction);
      }

      if (!responses.persona_performance[conv.personaId]) {
        responses.persona_performance[conv.personaId] = {
          sessions: 0,
          avg_satisfaction: 0,
          total_satisfaction: 0
        };
      }
      responses.persona_performance[conv.personaId].sessions++;
      if (conv.userSatisfaction) {
        responses.persona_performance[conv.personaId].total_satisfaction += conv.userSatisfaction;
        responses.persona_performance[conv.personaId].avg_satisfaction = 
          responses.persona_performance[conv.personaId].total_satisfaction / 
          responses.persona_performance[conv.personaId].sessions;
      }
    });

    return responses;
  }

  private generatePersonalityProfile(userData: any): any {
    return {
      communication_style: this.analyzeCommunicationStyle(userData.conversations),
      emotional_intelligence: this.analyzeEmotionalIntelligence(userData.emotions),
      growth_mindset: this.analyzeGrowthMindset(userData.goals, userData.journalEntries),
      resilience_factors: this.analyzeResilienceFactors(userData.emotions, userData.patterns),
      therapeutic_needs: this.analyzeTherapeuticNeeds(userData.conversations, userData.emotions)
    };
  }

  private calculateDataQuality(userData: any): number {
    let quality = 0;
    
    // Completeness score
    const completeness = (userData.conversations.length > 0 ? 0.2 : 0) +
                        (userData.emotions.length > 0 ? 0.2 : 0) +
                        (userData.patterns.length > 0 ? 0.2 : 0) +
                        (userData.goals.length > 0 ? 0.2 : 0) +
                        (userData.journalEntries.length > 0 ? 0.2 : 0);
    
    quality += completeness;
    
    // Diversity score (different emotions, personas, etc.)
    const emotionDiversity = new Set(userData.emotions.map(e => e.primaryEmotion)).size / 10; // Max 10 emotions
    const personaDiversity = new Set(userData.conversations.map(c => c.personaId)).size / 4; // Max 4 personas
    
    quality += Math.min(emotionDiversity + personaDiversity, 0.3);
    
    // Consistency score (regular usage)
    const timespan = userData.conversations.length > 1 ? 
      (new Date(userData.conversations[0].createdAt).getTime() - 
       new Date(userData.conversations[userData.conversations.length - 1].createdAt).getTime()) / 
      (1000 * 60 * 60 * 24) : 0; // Days
    
    const consistencyScore = Math.min(timespan / 30, 0.2); // Max 0.2 for 30+ days
    quality += consistencyScore;
    
    return Math.min(quality, 1);
  }

  private calculateDiversity(trainingData: any): number {
    // Calculate demographic and linguistic diversity
    return 0.7; // Placeholder - would implement actual diversity calculation
  }

  private calculateBalance(trainingData: any): number {
    // Calculate class balance for ML training
    return 0.8; // Placeholder - would implement actual balance calculation
  }

  // Additional helper methods would be implemented here
  private analyzeEmotionalTrends(emotions: any[]): any { return {}; }
  private analyzePersonaPreferences(conversations: any[]): any { return {}; }
  private analyzeTherapeuticProgress(conversations: any[], emotions: any[]): any { return {}; }
  private identifyRiskFactors(emotions: any[], patterns: any[]): any { return {}; }
  private identifyGrowthAreas(conversations: any[], patterns: any[]): any { return {}; }
  private analyzeCommunicationStyle(conversations: any[]): any { return {}; }
  private analyzeEmotionalIntelligence(emotions: any[]): any { return {}; }
  private analyzeGrowthMindset(goals: any[], journalEntries: any[]): any { return {}; }
  private analyzeResilienceFactors(emotions: any[], patterns: any[]): any { return {}; }
  private analyzeTherapeuticNeeds(conversations: any[], emotions: any[]): any { return {}; }
}

export const storage = new DatabaseStorage();