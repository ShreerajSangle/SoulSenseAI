import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// import { setupAuth, isAuthenticated } from "./replitAuth";
import { claudeConversationSystem } from "./claude_conversation_system";
import { naturalConversationSystem } from "./natural_conversation_system";
import { supabaseSync } from "./supabase-sync";
import { insertConversationSchema, insertMessageSchema, insertSessionSchema } from "@shared/schema";
import { z } from "zod";
import personaRoutes from "./persona_routes";

// Request schemas
const createChatMessageRequestSchema = z.object({
  message: z.string().min(1),
  personaId: z.string(),
  conversationId: z.number().optional().nullable(),
  userId: z.string().default("anonymous"),
  isFirstMessage: z.boolean().default(false),
  userMood: z.string().optional(),
});

const moodCheckRequestSchema = z.object({
  personaId: z.string(),
  userId: z.string().default("anonymous"),
});

const createSessionSummaryRequestSchema = z.object({
  conversationId: z.number(),
  summary: z.string().optional(),
  keyTopics: z.array(z.string()).optional(),
  techniquesUsed: z.array(z.string()).optional(),
  homework: z.array(z.string()).optional(),
  moodBefore: z.string().optional(),
  moodAfter: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  // await setupAuth(app);

  // Add dedicated persona routes for modular architecture
  app.use("/api", personaRoutes);

  // Personas
  app.get("/api/personas", async (req, res) => {
    try {
      const personas = await storage.getPersonas();
      res.json(personas);
    } catch (error) {
      console.error("Error fetching personas:", error);
      res.status(500).json({ error: "Failed to fetch personas" });
    }
  });

  app.get("/api/personas/:id", async (req, res) => {
    try {
      const persona = await storage.getPersona(req.params.id);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }
      res.json(persona);
    } catch (error) {
      console.error("Error fetching persona:", error);
      res.status(500).json({ error: "Failed to fetch persona" });
    }
  });

  // Core chat functionality
  app.post("/api/chat/message", async (req, res) => {
    try {
      const { message, personaId, conversationId, userId, isFirstMessage, userMood } = 
        createChatMessageRequestSchema.parse(req.body);

      // Get or create conversation
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const conversation = await storage.createConversation({
          userId,
          personaId,
          title: `Chat with ${personaId}`,
        });
        currentConversationId = conversation.id;
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId: currentConversationId,
        content: message,
        sender: "user",
      });

      // Background sync user message
      supabaseSync.syncMessage(userId, currentConversationId.toString(), {
        sender: "user",
        content: message,
        timestamp: new Date()
      });

      // Generate AI response using Claude
      const conversationHistory = await storage.getConversationMessages(currentConversationId);
      
      try {
        const responseGenerator = await naturalConversationSystem.generateNaturalResponse(
          message,
          personaId,
          conversationHistory,
          userId
        );

        const { value: firstChunk } = await responseGenerator.next();
        const fullContent = firstChunk?.content || "I hear you, and I'm here to support you through this.";
        const emotionalTone = firstChunk?.emotion || "supportive";

        console.log('Claude response processed successfully:', fullContent.substring(0, 50) + '...');

        // Save AI message
        const aiMessage = await storage.createMessage({
          conversationId: currentConversationId,
          content: fullContent,
          sender: "ai",
          emotionDetected: emotionalTone,
        });

        // Background sync AI message
        supabaseSync.syncMessage(userId, currentConversationId.toString(), {
          sender: "ai",
          content: fullContent,
          emotionDetected: emotionalTone,
          timestamp: new Date()
        });

        res.json({
          conversationId: currentConversationId,
          message: aiMessage,
          aiResponse: fullContent,
          emotionDetected: emotionalTone,
          followUpQuestions: [],
          therapeuticTechniques: []
        });

      } catch (claudeError) {
        console.error("Claude API error:", claudeError);
        
        // Fallback response when Claude fails
        const fallbackResponse = "I hear you, and I want you to know that your feelings are completely valid. Sometimes it helps to take a moment and acknowledge what we're experiencing. What feels most important for you to talk about right now?";
        
        const aiMessage = await storage.createMessage({
          conversationId: currentConversationId,
          content: fallbackResponse,
          sender: "ai",
          emotionDetected: "supportive",
        });

        res.json({
          conversationId: currentConversationId,
          message: aiMessage,
          aiResponse: fallbackResponse,
          emotionDetected: "supportive",
          followUpQuestions: [],
          therapeuticTechniques: []
        });
      }
    } catch (error) {
      console.error("Error processing chat message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request format", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const conversations = await storage.getUserConversations(userId);
      
      const conversationsWithPersonas = await Promise.all(
        conversations.map(async (conv) => {
          const persona = await storage.getPersona(conv.personaId);
          return { ...conv, persona };
        })
      );
      
      res.json(conversationsWithPersonas);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Get persona details
      const persona = await storage.getPersona(conversation.personaId);
      const conversationWithPersona = { ...conversation, persona };

      res.json(conversationWithPersona);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Sessions
  app.post("/api/sessions", async (req, res) => {
    try {
      const { conversationId, summary, keyTopics, techniquesUsed, homework, moodBefore, moodAfter } = req.body;
      const session = await storage.createSession({
        conversationId,
        summary: summary || null,
        keyTopics: keyTopics || [],
        techniquesUsed: techniquesUsed || [],
        homework: homework || [],
        moodBefore: moodBefore || null,
        moodAfter: moodAfter || null
      });
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Diary entries
  app.post('/api/diary-entries', async (req, res) => {
    try {
      const entry = await storage.createDiaryEntry(req.body);
      
      // Background sync to Supabase
      supabaseSync.syncDiaryEntry(req.body.userId || 'anonymous', entry);
      
      res.json(entry);
    } catch (error) {
      console.error("Error creating diary entry:", error);
      res.status(500).json({ message: "Failed to create diary entry" });
    }
  });

  app.get('/api/diary-entries', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const entries = await storage.getDiaryEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
      res.status(500).json({ message: "Failed to fetch diary entries" });
    }
  });

  app.put('/api/diary-entries/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedEntry = await storage.updateDiaryEntry(id, req.body);
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating diary entry:", error);
      res.status(500).json({ message: "Failed to update diary entry" });
    }
  });

  app.delete('/api/diary-entries/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDiaryEntry(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting diary entry:", error);
      res.status(500).json({ message: "Failed to delete diary entry" });
    }
  });

  // Profile management
  app.get('/api/profile', async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const profile = await storage.getUserProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put('/api/profile', async (req, res) => {
    try {
      const userId = req.body.userId || "anonymous";
      const updatedProfile = await storage.updateUserProfile(userId, req.body);
      
      // Background sync to Supabase
      supabaseSync.syncProfile(userId, req.body);
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Goals
  app.post('/api/goals', async (req, res) => {
    try {
      const { userId, title, description, category, customizations = {} } = req.body;

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 56);

      const goal = await storage.createGoal({
        userId,
        title,
        description,
        category,
        type: "personal",
        personaId: customizations.personaId || null,
        priority: customizations.priority || 'medium',
        targetDate,
        tags: customizations.tags || [],
        metadata: customizations.metadata || {},
        status: 'active',
        progress: 0,
        milestones: []
      });

      // Background sync to Supabase
      supabaseSync.syncGoal(userId, {
        title,
        description,
        category,
        status: 'active',
        progress: 0,
        targetDate,
        createdAt: new Date()
      });

      res.json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ error: "Failed to create goal" });
    }
  });

  app.get('/api/goals', async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const status = req.query.status as string;
      
      let goals = await storage.getUserGoals(userId);
      
      if (status) {
        goals = goals.filter((goal: any) => goal.status === status);
      }

      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.put('/api/goals/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedGoal = await storage.updateGoal(id, req.body);
      
      // Background sync goal update
      supabaseSync.syncGoalUpdate(id.toString(), req.body);
      
      res.json(updatedGoal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  // Mood tracking
  app.post('/api/mood-entries', async (req, res) => {
    try {
      const entry = await storage.createMoodEntry(req.body);
      
      // Background sync to Supabase
      supabaseSync.syncMoodEntry(req.body.userId || 'anonymous', entry);
      
      res.json(entry);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(500).json({ message: "Failed to create mood entry" });
    }
  });

  app.get('/api/mood-entries', async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const entries = await storage.getUserMoodEntries(userId, "all");
      res.json(entries);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  // Journal entries
  app.post('/api/journal-entries', async (req, res) => {
    try {
      const entryData = {
        ...req.body,
        userId: req.body.userId || "anonymous",
        createdAt: new Date()
      };
      
      const entry = await storage.createDiaryEntry(entryData);
      
      // Background sync to Supabase
      supabaseSync.syncDiaryEntry(entryData.userId, entry.id.toString(), {
        content: entry.content,
        moods: entryData.moods || [],
        personaId: entryData.personaId,
        conversationId: entryData.conversationId,
        createdAt: new Date()
      });
      
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ error: "Failed to create journal entry" });
    }
  });

  app.get('/api/journal-entries', async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const entries = await storage.getDiaryEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  // Session recaps
  app.post('/api/session-recaps', async (req, res) => {
    try {
      const recapData = {
        ...req.body,
        userId: req.body.userId || "anonymous",
        createdAt: new Date()
      };
      
      // Store recap as a special diary entry for now
      const recap = await storage.createDiaryEntry({
        ...recapData,
        content: recapData.summary,
        type: 'session_recap'
      });
      
      // Background sync to Supabase
      supabaseSync.syncSessionRecap(recapData.userId, recap.id.toString(), {
        conversationId: recapData.conversationId,
        summary: recapData.summary,
        emotions: recapData.emotions || [],
        topics: recapData.topics || [],
        toolsUsed: recapData.toolsUsed || [],
        insights: recapData.insights || [],
        createdAt: new Date()
      });
      
      res.json(recap);
    } catch (error) {
      console.error("Error creating session recap:", error);
      res.status(500).json({ error: "Failed to create session recap" });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/dashboard/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get session analytics directly
      const sessions = await storage.getUserSessionAnalytics(userId);
      const completedSessions = sessions.filter(s => s.endTime !== null);
      const activeSessions = sessions.filter(s => s.endTime === null);
      
      // Basic dashboard data without complex joins
      const dashboardData = {
        totalSessions: completedSessions.length,
        activeSessions: activeSessions.length,
        currentStreak: 0, // Simplified for now
        averageMood: 0, // Simplified for now
        favoritePersona: 'sarah', // Simplified for now
        sessionHistory: sessions.slice(0, 10).map(session => ({
          date: session.createdAt,
          personaId: session.personaId,
          duration: session.duration,
          sessionType: session.sessionType,
        })),
        moodTrends: [], // Simplified for now
        goals: {
          total: 0,
          completed: 0,
          inProgress: 0,
        },
      };
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ error: "Failed to fetch dashboard analytics" });
    }
  });

  app.post('/api/analytics/session', async (req, res) => {
    try {
      const sessionAnalytic = await storage.createSessionAnalytic(req.body);
      res.json(sessionAnalytic);
    } catch (error) {
      console.error("Error creating session analytic:", error);
      res.status(500).json({ error: "Failed to create session analytic" });
    }
  });

  // End a session
  app.post('/api/chat/end-session', async (req, res) => {
    try {
      const { sessionId, userId, duration, messageCount } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      
      // Update session analytic to mark as completed
      const updatedSession = await storage.updateSessionAnalytic(sessionId, {
        endTime: new Date(),
        duration: duration || 0,
        messageCount: messageCount || 0,
        completionStatus: 'completed',
      });
      
      if (updatedSession) {
        res.json({ 
          message: 'Session ended successfully',
          sessionId: sessionId 
        });
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    } catch (error) {
      console.error("Error ending session:", error);
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  app.get('/api/analytics/sessions/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { start, end } = req.query;
      
      const dateRange = start && end ? {
        start: new Date(start as string),
        end: new Date(end as string)
      } : undefined;
      
      const sessions = await storage.getUserSessionAnalytics(userId, dateRange);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching session analytics:", error);
      res.status(500).json({ error: "Failed to fetch session analytics" });
    }
  });

  app.put('/api/analytics/streak/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { streakType, activityDate } = req.body;
      
      const streak = await storage.updateUserStreak(
        userId, 
        streakType, 
        new Date(activityDate)
      );
      res.json(streak);
    } catch (error) {
      console.error("Error updating user streak:", error);
      res.status(500).json({ error: "Failed to update user streak" });
    }
  });

  app.get('/api/analytics/streaks/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const streaks = await storage.getUserStreaks(userId);
      res.json(streaks);
    } catch (error) {
      console.error("Error fetching user streaks:", error);
      res.status(500).json({ error: "Failed to fetch user streaks" });
    }
  });

  app.get('/api/analytics/personas/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const personaStats = await storage.getPersonaUsageStats(userId);
      res.json(personaStats);
    } catch (error) {
      console.error("Error fetching persona usage stats:", error);
      res.status(500).json({ error: "Failed to fetch persona usage stats" });
    }
  });

  app.put('/api/analytics/personas/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { personaId, sessionData } = req.body;
      
      const stats = await storage.updatePersonaUsageStats(userId, personaId, sessionData);
      res.json(stats);
    } catch (error) {
      console.error("Error updating persona usage stats:", error);
      res.status(500).json({ error: "Failed to update persona usage stats" });
    }
  });

  // Debug dashboard endpoints
  app.get('/api/debug/conversation-logs', (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = claudeConversationSystem.getDebugLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching debug logs:", error);
      res.status(500).json({ error: "Failed to fetch debug logs" });
    }
  });

  app.get('/api/debug/memory-stats/:userId/:personaId', (req, res) => {
    try {
      const { userId, personaId } = req.params;
      const stats = claudeConversationSystem.getConversationMemoryStats(userId, personaId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching memory stats:", error);
      res.status(500).json({ error: "Failed to fetch memory stats" });
    }
  });

  // Health check and status
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/supabase/status", (req, res) => {
    const syncStatus = supabaseSync.getSyncStatus();
    res.json({
      ...syncStatus,
      message: syncStatus.enabled ? "Supabase sync active - data is being backed up to cloud" : "Supabase sync disabled - using local database only"
    });
  });

  // Mood Timeline endpoint
  app.get("/api/mood-timeline", async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const period = (req.query.period as 'week' | 'month') || 'week';
      
      const timeline = naturalConversationSystem.getMoodTimeline(userId, period);
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching mood timeline:", error);
      res.status(500).json({ error: "Failed to fetch mood timeline" });
    }
  });

  // Daily Reflection endpoint
  app.get("/api/daily-reflection", async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const personaId = req.query.personaId as string;
      
      if (!personaId) {
        return res.status(400).json({ error: "Persona ID required" });
      }
      
      const reflection = naturalConversationSystem.generateDailyReflection(userId, personaId);
      res.json({ reflection });
    } catch (error) {
      console.error("Error generating daily reflection:", error);
      res.status(500).json({ error: "Failed to generate daily reflection" });
    }
  });

  // Debug API key endpoint
  app.get("/api/debug/api-key", async (req, res) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    res.json({
      hasApiKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 10) || 'none'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}