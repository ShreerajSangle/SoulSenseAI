import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { gpt4oConversationSystem } from "./gpt4o_conversation_system";
import { gpt4oPersonaSystem } from "./gpt4o_persona_system";
import { supabaseSync } from "./supabase-sync";
import { insertConversationSchema, insertMessageSchema, insertSessionSchema } from "@shared/schema";
import { z } from "zod";

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
  await setupAuth(app);

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

      // Generate AI response using GPT-4o
      const aiResponse = await gpt4oPersonaSystem.generateResponse(
        personaId,
        message,
        userId,
        { userMood, isFirstMessage }
      );

      // Save AI message
      const aiMessage = await storage.createMessage({
        conversationId: currentConversationId,
        content: aiResponse.content,
        sender: "ai",
        emotionDetected: aiResponse.emotionalTone,
      });

      // Background sync AI message
      supabaseSync.syncMessage(userId, currentConversationId.toString(), {
        sender: "ai",
        content: aiResponse.content,
        emotionDetected: aiResponse.emotionalTone,
        timestamp: new Date()
      });

      res.json({
        conversationId: currentConversationId,
        message: aiMessage,
        aiResponse: aiResponse.content,
        emotionDetected: aiResponse.emotionalTone,
        followUpQuestions: aiResponse.followUpQuestions || [],
        therapeuticTechniques: aiResponse.therapeuticTechniques || []
      });
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

  app.put('/api/profile/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
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

  const httpServer = createServer(app);
  return httpServer;
}