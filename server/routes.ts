import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { spawn } from "child_process";
import path from "path";
import { conversationalAI } from "./conversational_ai";
import { emotionDetector } from "./emotion_detection";
import { advancedAI } from "./advanced_ai_engine";
import { replikaEngine } from "./replika_engine";
import { llmEngine } from "./llm_conversation_engine";
import { streamingConversation } from "./streaming_conversation";
import { specializedPersonaEngine } from "./specialized_persona_engine";
import { personaKnowledgeModules } from "./persona_knowledge_modules";
import { soulSensePersonaEngine } from "./soulSense_persona_engine";
import { enhancedConversationSystem } from "./enhanced_conversation_system";
import { cakeChatEngine, type CakeChatResponse } from "./cakechat_engine";
import { advancedLLMEngine } from "./advanced_llm_engine";
import { emotionDetectionEngine } from "./emotion_detection_engine";

// Import Python module interfaces
interface MemoryUpdate {
  update_emotional_pattern: (userId: string, emotion: string, intensity: number, context: string, triggers?: string[]) => void;
  get_emotional_insights: (userId: string) => any;
  get_personalized_recommendations: (userId: string) => any;
}

interface ClinicalOutcomes {
  process_phq9_assessment: (userId: string, responses: Record<string, number>) => any;
  process_gad7_assessment: (userId: string, responses: Record<string, number>) => any;
  generate_clinical_insights: (userId: string) => any;
}

interface DialogueManager {
  make_clinical_decision: (userContext: any) => any;
  explain_intervention: (intervention: string, userContext: any) => any;
}

interface GoalTracker {
  create_personalized_goal: (userId: string, goalType: string, userInput: any) => any;
  generate_journey_dashboard: (userId: string) => any;
  suggest_new_goals: (userId: string, context: any) => any;
}

import { registerClinicalRoutes } from "./clinical_routes";
import { insertConversationSchema, insertMessageSchema, insertSessionSchema } from "@shared/schema";
import { z } from "zod";
import * as fs from "fs";
import * as yaml from "js-yaml";

const createChatMessageRequestSchema = z.object({
  message: z.string().min(1),
  personaId: z.string(),
  conversationId: z.number().optional(),
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
  moodBefore: z.number().min(1).max(5).optional(),
  moodAfter: z.number().min(1).max(5).optional(),
});

const moodEntrySchema = z.object({
  userId: z.string().default("anonymous"),
  sessionId: z.number().optional(),
  moodRating: z.number().min(1).max(5),
  emotions: z.array(z.string()).optional(),
  notes: z.string().optional(),
  triggers: z.array(z.string()).optional(),
  type: z.enum(['check_in', 'check_out', 'daily']),
});

const microToolUsageSchema = z.object({
  userId: z.string().default("anonymous"),
  sessionId: z.number().optional(),
  toolType: z.enum(['breathing', 'grounding', 'cbt_journal']),
  toolName: z.string(),
  duration: z.number().optional(),
  completed: z.boolean().default(false),
  effectiveness: z.number().min(1).max(5).optional(),
});

const messageFeedbackSchema = z.object({
  messageId: z.number(),
  userId: z.string().default("anonymous"),
  rating: z.enum(['thumbs_up', 'thumbs_down']),
  feedback: z.string().optional(),
});

// Load persona configuration
let personaConfig: any = {};
try {
  const configFile = fs.readFileSync('./server/persona_config.yaml', 'utf8');
  personaConfig = yaml.load(configFile) as any;
} catch (error) {
  console.warn('Could not load persona config:', error);
}

// Helper function to call Python modules (simplified for Node.js integration)
async function callPythonFunction(modulePath: string, functionName: string, args: any[]): Promise<any> {
  // For now, we'll implement the core functionality in TypeScript
  // In production, this would interface with the Python modules
  return null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize auth system (commented for now to focus on core functionality)
  // await setupAuth(app);

  // Auth routes (placeholder for now)
  // Profile management routes
  app.get('/api/profile', async (req, res) => {
    try {
      // For now, return a basic profile structure
      const profile = {
        id: "user-1",
        name: "User",
        email: "user@example.com",
        bio: "Tell us about yourself...",
        preferences: {
          preferredPersona: "dr-sarah",
          voiceEnabled: false,
          darkMode: false,
          notifications: {
            dailyCheckins: true,
            sessionReminders: true,
            progressUpdates: true,
          },
          privacy: {
            shareAnalytics: true,
            dataRetention: "2 Years",
          },
        },
        goals: [],
        interests: [],
        stats: {
          sessions: 0,
          dayStreak: 0,
          messages: 0,
          avgMood: 5,
          memberSince: "21/06/2025",
          lastActive: "21/06/2025",
          favoritePersona: "sarah",
        },
      };
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put('/api/profile', async (req, res) => {
    try {
      const updatedProfile = req.body;
      
      // Return the updated profile
      res.json({ success: true, profile: updatedProfile });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    // Return anonymous user for now
    res.json({ id: 'anonymous', email: null });
  });

  // Create conversation endpoint
  app.post('/api/conversations', async (req, res) => {
    try {
      const { userId, personaId, title } = req.body;
      
      if (!userId || !personaId) {
        return res.status(400).json({ error: 'Missing required fields: userId and personaId' });
      }

      const persona = await storage.getPersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: 'Persona not found' });
      }

      const conversation = await storage.createConversation({
        userId,
        personaId,
        title: title || `Chat with ${persona.name}`,
      });

      res.json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  // Get conversation messages
  app.get('/api/conversations/:conversationId/messages', async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: 'Invalid conversation ID' });
      }

      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Diary endpoints
  app.get('/api/diary', async (req, res) => {
    try {
      const entries = await storage.getDiaryEntries('user-1'); // Using default user for now
      res.json(entries);
    } catch (error) {
      console.error('Error fetching diary entries:', error);
      res.status(500).json({ error: 'Failed to fetch diary entries' });
    }
  });

  app.post('/api/diary', async (req, res) => {
    try {
      const { title, content, mood, tags, emotions, gratitude, goals, reflections } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      // Convert mood string to rating (1-10 scale)
      const moodToRating = {
        'very_sad': 1,
        'sad': 2,
        'down': 3,
        'neutral': 5,
        'okay': 5,
        'good': 7,
        'happy': 8,
        'very_happy': 9,
        'excited': 10,
        'anxious': 3,
        'calm': 7,
        'stressed': 2,
        'peaceful': 8,
        'angry': 2,
        'content': 7
      };

      const moodRating = moodToRating[mood?.toLowerCase()] || 5;

      const entry = await storage.createDiaryEntry({
        userId: 'user-1', // Using default user for now
        title,
        content,
        moodRating,
        emotions: emotions || [],
        gratitude: gratitude || null,
        goals: goals || null,
        reflections: reflections || null,
        tags: tags || [],
      });

      res.json(entry);
    } catch (error) {
      console.error('Error creating diary entry:', error);
      res.status(500).json({ error: 'Failed to create diary entry' });
    }
  });

  app.put('/api/diary/:id', async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ error: 'Invalid entry ID' });
      }

      const { title, content, mood, tags } = req.body;
      const entry = await storage.updateDiaryEntry(entryId, {
        title,
        content,
        mood,
        tags,
      });

      if (!entry) {
        return res.status(404).json({ error: 'Diary entry not found' });
      }

      res.json(entry);
    } catch (error) {
      console.error('Error updating diary entry:', error);
      res.status(500).json({ error: 'Failed to update diary entry' });
    }
  });

  app.delete('/api/diary/:id', async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ error: 'Invalid entry ID' });
      }

      await storage.deleteDiaryEntry(entryId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting diary entry:', error);
      res.status(500).json({ error: 'Failed to delete diary entry' });
    }
  });

  // Goals endpoints
  app.get('/api/goals', async (req, res) => {
    try {
      const goals = await storage.getUserGoals('user-1'); // Using default user for now
      res.json(goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ error: 'Failed to fetch goals' });
    }
  });

  app.post('/api/goals', async (req, res) => {
    try {
      const { title, description, category, type, targetDate, personaId } = req.body;
      
      if (!title || !category) {
        return res.status(400).json({ error: 'Title and category are required' });
      }

      // Map category to type if type not provided
      const goalType = type || category || 'general';

      const goal = await storage.createGoal({
        userId: 'user-1', // Using default user for now
        title,
        description: description || '',
        category,
        type: goalType,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        personaId,
        status: 'active',
      });

      res.json(goal);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ error: 'Failed to create goal' });
    }
  });

  app.put('/api/goals/:id', async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      if (isNaN(goalId)) {
        return res.status(400).json({ error: 'Invalid goal ID' });
      }

      const updates = req.body;
      const goal = await storage.updateGoal(goalId, updates);

      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.json(goal);
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ error: 'Failed to update goal' });
    }
  });

  app.delete('/api/goals/:id', async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      if (isNaN(goalId)) {
        return res.status(400).json({ error: 'Invalid goal ID' });
      }

      await storage.deleteGoal(goalId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ error: 'Failed to delete goal' });
    }
  });
  // Get all personas
  app.get("/api/personas", async (req, res) => {
    try {
      const personas = await storage.getPersonas();
      res.json(personas);
    } catch (error) {
      console.error("Error fetching personas:", error);
      res.status(500).json({ error: "Failed to fetch personas" });
    }
  });

  // Get specific persona
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

  // Get personalized greeting
  app.post("/api/chat/greeting", async (req, res) => {
    try {
      const { personaId, userId } = moodCheckRequestSchema.parse(req.body);
      const persona = await storage.getPersona(personaId);
      
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }

      // Get user memories for context
      const memories = await storage.getUserMemories(userId);
      const greeting = generatePersonalizedGreeting(persona, personaId, memories);
      
      res.json({ greeting, requiresMoodCheck: true });
    } catch (error) {
      console.error("Error generating greeting:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request format", details: error.errors });
      }
      res.status(500).json({ error: "Failed to generate greeting" });
    }
  });

  // Send chat message
  app.post("/api/chat/message", async (req, res) => {
    try {
      const { message, personaId, conversationId, userId, isFirstMessage, userMood } = createChatMessageRequestSchema.parse(req.body);
      
      let currentConversationId = conversationId;
      
      // Create new conversation if none exists
      if (!currentConversationId) {
        const persona = await storage.getPersona(personaId);
        if (!persona) {
          return res.status(404).json({ error: "Persona not found" });
        }
        
        const conversation = await storage.createConversation({
          userId,
          personaId,
          title: `Chat with ${persona.name}`,
        });
        currentConversationId = conversation.id;
      }

      // Save user message
      await storage.createMessage({
        conversationId: currentConversationId,
        content: message,
        sender: "user",
      });

      // Check for crisis indicators
      const crisisDetected = detectCrisisKeywords(message);
      
      // Generate AI response using advanced conversational AI
      const persona = await storage.getPersona(personaId);
      const userMemories = await storage.getUserMemories(userId);
      const conversationHistory = await storage.getConversationMessages(currentConversationId);
      
      // Build conversation context
      const conversationContext = {
        userId,
        personaId,
        conversationId: currentConversationId,
        messageHistory: conversationHistory.map(msg => ({
          content: msg.content,
          sender: msg.sender as 'user' | 'ai',
          timestamp: msg.timestamp,
          emotionAnalysis: msg.emotionDetected
        })),
        userProfile: {
          preferences: {},
          emotionalPatterns: {},
          conversationStyle: 'exploratory',
          topics: [],
          goals: []
        },
        sessionContext: {
          duration: 0,
          emotionalJourney: [],
          keyMoments: [],
          therapeuticProgress: {}
        }
      };

      // Generate personalized response using advanced AI
      let aiResponse;
      try {
        aiResponse = await conversationalAI.generatePersonalizedResponse(message, conversationContext);
        
        // Fallback if AI response is undefined or empty
        if (!aiResponse || !aiResponse.content || aiResponse.content.includes('undefined')) {
          aiResponse = generateFallbackResponse(message, persona, userMood);
        }
      } catch (error) {
        console.error("Conversational AI error:", error);
        aiResponse = generateFallbackResponse(message, persona, userMood);
      }
      
      // Save user memory for context
      if (isFirstMessage && userMood) {
        await storage.saveUserMemory(userId, {
          type: 'mood_check',
          mood: userMood,
          personaId: personaId
        });
      }
      
      // Save AI message
      const aiMessage = await storage.createMessage({
        conversationId: currentConversationId,
        content: aiResponse.content,
        sender: "ai",
        emotionDetected: JSON.stringify({
          tone: aiResponse.emotionalTone,
          empathy: aiResponse.empathyLevel,
          strategy: aiResponse.responseStrategy
        }),
      });

      res.json({
        conversationId: currentConversationId,
        message: aiMessage,
        aiResponse: aiResponse.content,
        emotionDetected: aiResponse.emotionalTone,
        crisisDetected: crisisDetected,
        suggestSessionEnd: false,
        followUpQuestions: aiResponse.followUpQuestions,
        therapeuticTechniques: aiResponse.therapeuticTechniques
      });
    } catch (error) {
      console.error("Error processing chat message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request format", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Get conversation messages
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

  // Get user conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const conversations = await storage.getUserConversations(userId);
      
      // Fetch persona info for each conversation
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

  // Create session summary
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = createSessionSummaryRequestSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request format", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Get session summary
  app.get("/api/sessions/:conversationId", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const session = await storage.getConversationSession(conversationId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Enhanced chat endpoint with Replika-quality conversational AI
  app.post("/api/chat/enhanced-message", async (req, res) => {
    try {
      const { message, personaId, userId, conversationId, emotionContext, moodData, isFirstMessage } = req.body;
      
      if (!message || !personaId || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
      } else if (isFirstMessage) {
        conversation = await storage.createConversation({
          userId,
          personaId,
          title: `Session with ${personaId}`
        });
      }

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Create user message first
      const userMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: message,
        sender: 'user'
      });

      // Get conversation history for context
      const messageHistory = await storage.getConversationMessages(conversation.id);
      
      // Generate enhanced conversational response with natural flow
      const persona = await storage.getPersona(personaId);
      
      try {
        const enhancedResponse = await enhancedConversationSystem.generateResponse(
          personaId,
          message,
          messageHistory.map(m => ({
            sender: m.sender,
            content: m.content,
            timestamp: m.timestamp
          })),
          moodData
        );

        // Create AI message with enhanced response
        const aiMessage = await storage.createMessage({
          conversationId: conversation.id,
          content: enhancedResponse.content,
          sender: 'ai',
          emotionDetected: enhancedResponse.emotionalTone
        });

        // Update response data with enhanced insights
        const emotionAnalysis = {
          primary_emotion: enhancedResponse.emotionalTone,
          arousal_level: 0.5,
          crisis_indicators: { level: enhancedResponse.crisisDetected ? 'high' : 'none' }
        };

        res.json({
          conversation,
          aiMessage,
          emotionAnalysis,
          suggestedMicroTools: enhancedResponse.suggestedInterventions || [],
          crisisDetected: enhancedResponse.crisisDetected,
          followUpQuestions: enhancedResponse.followUpQuestions || [],
          therapeuticTechniques: enhancedResponse.therapeuticElements || ["active listening", "empathetic responding"],
          personalityInsight: "supportive",
          memoryReferences: [],
          relationshipDepth: "developing",
          emotionalResonance: "empathetic",
          conversationInsights: [],
          engagementLevel: "high",
          moodInsights: []
        });

      } catch (error) {
        console.error("Enhanced chat error:", error);
        
        // Fallback warm greeting
        const persona = await storage.getPersona(personaId);
        const isFirstMessage = messageHistory.length <= 1;
        
        let fallbackContent = `I understand you're going through a difficult time. Can you tell me more about what's happening?`;
        
        if (isFirstMessage || message.toLowerCase().includes('hello')) {
          fallbackContent = `Hello! I'm ${persona?.name}. I'm here to support you through whatever you're experiencing. How are you feeling today?`;
        }
        
        const aiMessage = await storage.createMessage({
          conversationId: conversation.id,
          content: fallbackContent,
          sender: 'ai',
          emotionDetected: 'welcoming'
        });

        res.json({
          conversation,
          aiMessage,
          emotionAnalysis: { primary_emotion: 'neutral', arousal_level: 0.5, crisis_indicators: { level: 'none' } },
          suggestedMicroTools: [],
          crisisDetected: false,
          followUpQuestions: ["How are you feeling today?", "What's on your mind?"],
          therapeuticTechniques: ["active listening"],
          personalityInsight: "welcoming",
          memoryReferences: [],
          relationshipDepth: "new",
          emotionalResonance: "warm",
          conversationInsights: [],
          engagementLevel: "high",
          moodInsights: []
        });
      }

    } catch (error) {
      console.error("Enhanced chat error:", error);
      res.status(500).json({ error: "Failed to process enhanced message" });
    }
  });

  // Persona switching endpoint
  app.post("/api/chat/switch-persona", async (req, res) => {
    try {
      const { conversationId, newPersonaId, reason, userId } = req.body;
      
      if (!conversationId || !newPersonaId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Update conversation persona
      const updatedConversation = await storage.updateConversation(conversationId, {
        personaId: newPersonaId
      });

      // Get new persona info
      const newPersona = await storage.getPersona(newPersonaId);
      
      // Create transition message
      const transitionMessage = await storage.createMessage({
        conversationId,
        content: `I understand you'd like to continue our conversation with ${newPersona?.name}. ${newPersona?.name} will now take over to provide you with their specialized support. How can I help you today?`,
        sender: 'ai',
        emotionDetected: 'supportive'
      });

      res.json({
        conversation: updatedConversation,
        transitionMessage,
        newPersona
      });

    } catch (error) {
      console.error("Persona switch error:", error);
      res.status(500).json({ error: "Failed to switch persona" });
    }
  });

  // Mood entries endpoint
  app.post("/api/mood-entries", async (req, res) => {
    try {
      const moodEntry = await storage.createMoodEntry(req.body);
      res.json(moodEntry);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(500).json({ error: "Failed to create mood entry" });
    }
  });

  app.get("/api/mood-entries", async (req, res) => {
    try {
      const { userId, range = '30d' } = req.query;
      const entries = await storage.getUserMoodEntries(userId as string, range as string);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ error: "Failed to fetch mood entries" });
    }
  });

  // Micro-tools usage endpoint
  app.post("/api/micro-tools/usage", async (req, res) => {
    try {
      const usage = await storage.createMicroToolUsage(req.body);
      res.json(usage);
    } catch (error) {
      console.error("Error creating micro-tool usage:", error);
      res.status(500).json({ error: "Failed to create micro-tool usage" });
    }
  });

  // Message feedback endpoint
  app.post("/api/messages/:messageId/feedback", async (req, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const feedback = await storage.createMessageFeedback({
        messageId,
        ...req.body
      });
      res.json(feedback);
    } catch (error) {
      console.error("Error creating message feedback:", error);
      res.status(500).json({ error: "Failed to create message feedback" });
    }
  });

  // Diary entry routes
  app.post('/api/diary-entries', async (req, res) => {
    try {
      const entry = await storage.createDiaryEntry(req.body);
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
      res.json({ message: "Diary entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting diary entry:", error);
      res.status(500).json({ message: "Failed to delete diary entry" });
    }
  });

  // User profile routes
  app.get('/api/profile/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
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
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Session feedback endpoint
  app.post('/api/session-feedback', async (req, res) => {
    try {
      const { conversationId, personaId, rating, feedback, helpfulness, wouldRecommend, sessionDuration } = req.body;
      
      const feedbackEntry = await storage.createSessionFeedback({
        conversationId,
        personaId,
        rating,
        feedback,
        helpfulness,
        wouldRecommend,
        sessionDuration,
        submittedAt: new Date()
      });

      res.json(feedbackEntry);
    } catch (error) {
      console.error("Session feedback error:", error);
      res.status(500).json({ error: "Failed to save session feedback" });
    }
  });

  // Specialized persona chat with domain expertise
  app.post('/api/chat/specialized-message', async (req, res) => {
    try {
      const { message, personaId, userId, conversationId, isFirstMessage } = req.body;

      if (!message || !personaId || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
      } else {
        conversation = await storage.createConversation({
          userId,
          personaId,
          title: `Specialized Session with ${personaId}`
        });
      }

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Create user message
      const userMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: message,
        sender: 'user'
      });

      // Get conversation history
      const messageHistory = await storage.getConversationMessages(conversation.id);

      // Analyze emotion and context
      const emotionAnalysis = emotionDetector.analyzeEmotion(message);

      // Generate specialized response using domain expertise
      const specializedResponse = await specializedPersonaEngine.generateSpecializedResponse(
        message,
        personaId,
        userId,
        messageHistory,
        emotionAnalysis
      );

      // Get domain-specific knowledge for additional insights
      const knowledgeModule = personaKnowledgeModules.getKnowledgeModule(personaId);
      const responseTemplates = personaKnowledgeModules.getResponseTemplate(personaId, 'validation');

      // Create AI message with specialized response
      const aiMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: specializedResponse.response,
        sender: 'ai',
        emotionDetected: emotionAnalysis.primary_emotion
      });

      // Get persona insights for learning
      const personaInsights = specializedPersonaEngine.getPersonaInsights(personaId, userId);

      res.json({
        conversation,
        userMessage,
        aiMessage,
        emotionAnalysis,
        specializedResponse: {
          domainExpertise: specializedResponse.personaSpecialization,
          therapeuticApproach: specializedResponse.therapeuticApproach,
          adaptiveLearning: specializedResponse.adaptiveLearning
        },
        personaInsights,
        knowledgeBase: {
          availableInterventions: Object.keys(knowledgeModule?.interventionLibrary || {}),
          responseTemplates: responseTemplates.slice(0, 2),
          crisisProtocols: Object.keys(knowledgeModule?.crisisProtocols || {})
        }
      });

    } catch (error) {
      console.error("Specialized chat error:", error);
      res.status(500).json({ error: "Failed to process specialized message" });
    }
  });

  // SoulSense AI - Advanced persona with emotional intelligence and memory
  app.post('/api/chat/soulsense-message', async (req, res) => {
    try {
      const { message, personaId, userId, isFirstMessage } = req.body;

      if (!message || !personaId || !userId) {
        return res.status(400).json({ error: 'Message, personaId, and userId are required' });
      }

      // Get or create conversation
      let conversation;
      conversation = await storage.getConversationByUserAndPersona(userId, personaId);
      
      if (!conversation) {
        const persona = await storage.getPersona(personaId);
        conversation = await storage.createConversation({
          userId,
          personaId,
          title: `Session with ${persona?.name || personaId}`,
        });
      }

      // Store user message
      const userMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: message,
        sender: 'user',
        emotionDetected: null,
      });

      // Get conversation history for context
      const messageHistory = await storage.getConversationMessages(conversation.id);

      // Analyze emotion and context
      const emotionAnalysis = emotionDetector.analyzeEmotion(message);

      // Generate SoulSense persona response with memory and emotional intelligence
      const soulSenseResponse = await soulSensePersonaEngine.generatePersonaResponse(
        message,
        personaId,
        userId,
        emotionAnalysis,
        messageHistory
      );

      // Store AI response
      const aiMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: soulSenseResponse.response,
        sender: 'ai',
        emotionDetected: soulSenseResponse.emotionalTone,
      });

      res.json({
        conversation,
        userMessage,
        aiMessage,
        emotionAnalysis,
        soulSenseResponse: {
          emotionalTone: soulSenseResponse.emotionalTone,
          memoryIntegration: soulSenseResponse.memoryUpdates,
          therapeuticApproach: soulSenseResponse.therapeuticApproach,
          relationshipDepth: soulSenseResponse.memoryUpdates.relationshipDepth
        },
        followUpQuestions: soulSenseResponse.followUpQuestions,
        personalizedInsights: {
          emotionalPatterns: soulSenseResponse.memoryUpdates.emotionalPattern,
          newInsights: soulSenseResponse.memoryUpdates.newInsights,
          connectionStrength: Math.round(soulSenseResponse.memoryUpdates.relationshipDepth * 100)
        }
      });

    } catch (error) {
      console.error('SoulSense chat error:', error);
      res.status(500).json({ error: 'Failed to process SoulSense message' });
    }
  });

  // Goal Management Routes - Fixed to handle therapeutic goals properly
  app.post('/api/goals', async (req, res) => {
    try {
      const { userId = "anonymous", goalType, customizations = {} } = req.body;
      
      // Template-based goal creation for therapeutic journey
      const goalTemplates = {
        emotional_regulation: {
          title: "Develop Emotional Regulation Skills",
          description: "Learn to recognize and manage emotions effectively",
          category: "emotional_wellness",
          type: "therapeutic"
        },
        anxiety_management: {
          title: "Anxiety Management and Coping",
          description: "Build effective strategies for managing anxiety",
          category: "anxiety_support", 
          type: "therapeutic"
        },
        depression_recovery: {
          title: "Depression Recovery Journey",
          description: "Work towards improved mood and life satisfaction",
          category: "mood_support",
          type: "therapeutic"
        },
        stress_reduction: {
          title: "Stress Reduction Techniques",
          description: "Learn effective stress management strategies",
          category: "stress_management",
          type: "therapeutic"
        },
        mindfulness_practice: {
          title: "Mindfulness and Meditation Practice", 
          description: "Develop mindfulness skills for daily life",
          category: "mindfulness",
          type: "therapeutic"
        },
        custom: {
          title: customizations.title || "Personal Growth Goal",
          description: customizations.description || "Custom therapeutic goal",
          category: "personal_growth",
          type: "therapeutic"
        }
      };

      let template;
      if (goalType && goalTemplates[goalType as keyof typeof goalTemplates]) {
        template = goalTemplates[goalType as keyof typeof goalTemplates];
      } else {
        // Handle direct goal creation
        const { title, description, category, type } = req.body;
        if (!title || !category || !type) {
          return res.status(400).json({ error: 'Title, category, and type are required' });
        }
        template = { title, description, category, type };
      }

      // Calculate target date (8 weeks from now)
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 56);

      const goal = await storage.createGoal({
        userId,
        title: customizations.title || template.title,
        description: customizations.description || template.description,
        category: template.category,
        type: template.type,
        personaId: customizations.personaId || null,
        priority: customizations.priority || 'medium',
        targetDate,
        tags: customizations.tags || [],
        metadata: customizations.metadata || {},
        status: 'active',
        progress: 0,
        milestones: []
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
        goals = goals.filter(goal => goal.status === status);
      }

      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.get('/api/goals/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      const goal = await storage.getGoal(id);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      res.json(goal);
    } catch (error) {
      console.error("Error fetching goal:", error);
      res.status(500).json({ error: "Failed to fetch goal" });
    }
  });

  app.put('/api/goals/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      const updates = req.body;
      const updatedGoal = await storage.updateGoal(id, updates);
      
      res.json(updatedGoal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.put('/api/goals/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const completedDate = status === 'completed' ? new Date() : undefined;
      const updatedGoal = await storage.updateGoalStatus(id, status, completedDate);
      
      res.json(updatedGoal);
    } catch (error) {
      console.error("Error updating goal status:", error);
      res.status(500).json({ error: "Failed to update goal status" });
    }
  });

  app.delete('/api/goals/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      await storage.deleteGoal(id);
      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Goal Dashboard with Analytics - Fixed to properly display created goals
  app.get('/api/goals/dashboard/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const goals = await storage.getUserGoals(userId);
      
      const overview = {
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        overallProgress: goals.length > 0 
          ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length)
          : 0
      };

      const activeGoalsList = goals.filter(g => g.status === 'active');
      const recentAchievements = goals.filter(g => g.status === 'completed').slice(0, 3);
      const upcomingMilestones = goals.flatMap(g => g.milestones || []).slice(0, 5);

      const progressTrends = {
        moodTrend: "stable",
        consistency: overview.totalGoals > 0 ? 75 : 0
      };

      const recommendations = overview.totalGoals === 0 
        ? ["Consider setting your first therapeutic goal", "Start with emotional regulation or anxiety management", "Explore mindfulness practices for daily well-being"]
        : ["Continue working on your active goals", "Consider adding complementary goals", "Track your progress regularly"];

      res.json({
        overview,
        activeGoals: activeGoalsList,
        recentAchievements,
        upcomingMilestones,
        progressTrends,
        recommendations
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Failed to generate dashboard" });
    }
  });

  // Register advanced clinical and personalization routes
  registerClinicalRoutes(app);

  // CakeChat Integration and Model Comparison Routes
  
  // Initialize CakeChat engine
  app.post("/api/cakechat/initialize", async (req, res) => {
    try {
      await cakeChatEngine.initialize();
      const metrics = cakeChatEngine.getModelMetrics();
      
      res.json({
        success: true,
        message: "CakeChat engine initialized successfully",
        metrics
      });
    } catch (error) {
      console.error("CakeChat initialization error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to initialize CakeChat engine",
        details: error.message 
      });
    }
  });

  // Generate CakeChat response
  app.post("/api/cakechat/generate", async (req, res) => {
    try {
      const { userMessage, conversationHistory = [], emotionalTone, persona } = req.body;
      
      const context = {
        userMessage,
        conversationHistory,
        emotionalTone,
        persona
      };

      const cakeChatResponse = await cakeChatEngine.generateResponse(context);
      
      res.json({
        success: true,
        response: cakeChatResponse
      });
    } catch (error) {
      console.error("CakeChat generation error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate CakeChat response",
        details: error.message 
      });
    }
  });

  // Compare CakeChat vs GPT responses
  app.post("/api/cakechat/compare", async (req, res) => {
    try {
      const { userMessage, conversationHistory = [], personaId = 'sarah' } = req.body;
      
      // Get CakeChat response
      const cakeChatContext = {
        userMessage,
        conversationHistory,
        emotionalTone: 'neutral',
        persona: personaId
      };
      
      const cakeChatResponse = await cakeChatEngine.generateResponse(cakeChatContext);
      
      // Get GPT response using existing enhanced conversation system
      const enhancedResponse = await enhancedConversationSystem.generateResponse(
        personaId,
        userMessage,
        conversationHistory.length > 0 ? conversationHistory.map(m => ({
          sender: m.sender,
          content: m.content,
          timestamp: m.timestamp
        })) : [],
        {}
      );

      // Evaluate both responses
      const evaluation = await cakeChatEngine.evaluateResponseQuality(
        userMessage,
        cakeChatResponse.response,
        enhancedResponse.content
      );

      res.json({
        success: true,
        comparison: {
          userMessage,
          cakeChat: {
            response: cakeChatResponse.response,
            confidence: cakeChatResponse.confidence,
            generationMethod: cakeChatResponse.generationMethod,
            emotionalAdaptation: cakeChatResponse.emotionalAdaptation
          },
          gpt: {
            response: enhancedResponse.content,
            emotionalTone: enhancedResponse.emotionalTone,
            therapeuticElements: enhancedResponse.therapeuticElements
          },
          evaluation
        }
      });
    } catch (error) {
      console.error("Model comparison error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to compare models",
        details: error.message 
      });
    }
  });

  // Batch evaluation with test questions
  app.post("/api/cakechat/batch-evaluate", async (req, res) => {
    try {
      const { questionCount = 10, personaId = 'sarah' } = req.body;
      
      const testQuestions = cakeChatEngine.getRandomTestQuestions(questionCount);
      const evaluations = [];

      for (const question of testQuestions) {
        try {
          // Get both responses
          const cakeChatContext = {
            userMessage: question,
            conversationHistory: [],
            emotionalTone: 'neutral',
            persona: personaId
          };
          
          const cakeChatResponse = await cakeChatEngine.generateResponse(cakeChatContext);
          const gptResponse = await enhancedConversationSystem.generateResponse(
            personaId,
            question,
            [],
            {}
          );

          const evaluation = await cakeChatEngine.evaluateResponseQuality(
            question,
            cakeChatResponse.response,
            gptResponse.content
          );

          evaluations.push({
            question,
            cakeChatResponse: cakeChatResponse.response,
            gptResponse: gptResponse.content,
            evaluation
          });
        } catch (evalError) {
          console.error(`Evaluation error for question "${question}":`, evalError);
        }
      }

      // Calculate overall statistics
      const avgCakeChatScore = evaluations.reduce((sum, e) => sum + e.evaluation.cakeChatScore, 0) / evaluations.length;
      const avgGptScore = evaluations.reduce((sum, e) => sum + e.evaluation.gptScore, 0) / evaluations.length;
      
      const cakeChatWins = evaluations.filter(e => e.evaluation.cakeChatScore > e.evaluation.gptScore).length;
      const gptWins = evaluations.filter(e => e.evaluation.gptScore > e.evaluation.cakeChatScore).length;
      const ties = evaluations.filter(e => e.evaluation.cakeChatScore === e.evaluation.gptScore).length;

      res.json({
        success: true,
        batchEvaluation: {
          totalQuestions: evaluations.length,
          averageScores: {
            cakeChat: avgCakeChatScore,
            gpt: avgGptScore
          },
          winCounts: {
            cakeChat: cakeChatWins,
            gpt: gptWins,
            ties
          },
          winPercentages: {
            cakeChat: (cakeChatWins / evaluations.length) * 100,
            gpt: (gptWins / evaluations.length) * 100,
            ties: (ties / evaluations.length) * 100
          },
          evaluations
        }
      });
    } catch (error) {
      console.error("Batch evaluation error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to perform batch evaluation",
        details: error.message 
      });
    }
  });

  // Get CakeChat model metrics
  app.get("/api/cakechat/metrics", async (req, res) => {
    try {
      const metrics = cakeChatEngine.getModelMetrics();
      res.json({
        success: true,
        metrics
      });
    } catch (error) {
      console.error("Metrics retrieval error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve model metrics",
        details: error.message 
      });
    }
  });

  // Enhanced chat endpoint with CakeChat option
  app.post("/api/chat/enhanced-with-cakechat", async (req, res) => {
    try {
      const { conversationId, message, personaId, useCakeChat = false } = req.body;

      if (!conversationId || !message || !personaId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get or create conversation
      let conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        conversation = await storage.createConversation({
          userId: "user-1",
          personaId,
          title: message.substring(0, 50) + "..."
        });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: message,
        sender: 'user',
        emotionDetected: null
      });

      // Get conversation history
      const messageHistory = await storage.getMessages(conversation.id);
      const moodData = await storage.getMoodEntries("user-1");

      let aiResponse;
      let responseMetadata = {};

      if (useCakeChat) {
        // Use CakeChat engine
        const cakeChatContext = {
          userMessage: message,
          conversationHistory: messageHistory.map(m => ({
            sender: m.sender,
            content: m.content,
            timestamp: m.timestamp
          })),
          emotionalTone: 'neutral',
          persona: personaId
        };

        const cakeChatResponse = await cakeChatEngine.generateResponse(cakeChatContext);
        
        aiResponse = await storage.createMessage({
          conversationId: conversation.id,
          content: cakeChatResponse.response,
          sender: 'ai',
          emotionDetected: cakeChatResponse.emotionalAdaptation
        });

        responseMetadata = {
          engine: 'cakechat',
          confidence: cakeChatResponse.confidence,
          generationMethod: cakeChatResponse.generationMethod,
          contextMatches: cakeChatResponse.contextMatches
        };
      } else {
        // Use existing enhanced conversation system
        const enhancedResponse = await enhancedConversationSystem.generateResponse(
          personaId,
          message,
          messageHistory.map(m => ({
            sender: m.sender,
            content: m.content,
            timestamp: m.timestamp
          })),
          moodData
        );

        aiResponse = await storage.createMessage({
          conversationId: conversation.id,
          content: enhancedResponse.content,
          sender: 'ai',
          emotionDetected: enhancedResponse.emotionalTone
        });

        responseMetadata = {
          engine: 'enhanced_gpt',
          therapeuticElements: enhancedResponse.therapeuticElements,
          crisisDetected: enhancedResponse.crisisDetected
        };
      }

      res.json({
        success: true,
        conversation,
        userMessage,
        aiMessage: aiResponse,
        metadata: responseMetadata,
        emotionAnalysis: { 
          primary_emotion: aiResponse.emotionDetected || 'neutral', 
          arousal_level: 0.5, 
          crisis_indicators: { level: 'none' } 
        }
      });

    } catch (error) {
      console.error("Enhanced CakeChat conversation error:", error);
      res.status(500).json({ error: "Failed to process message with CakeChat integration" });
    }
  });

  // Advanced streaming chat routes
  app.post('/api/chat/streaming', async (req, res) => {
    const { message, personaId, userId, conversationHistory } = req.body;

    try {
      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Analyze emotion first
      const emotionAnalysis = await emotionDetectionEngine.analyzeEmotion(
        message,
        userId,
        conversationHistory || []
      );

      // Send emotion analysis
      res.write(`data: ${JSON.stringify({
        type: 'emotion',
        primary: emotionAnalysis.primary,
        intensity: emotionAnalysis.intensity,
        urgency: emotionAnalysis.urgency,
        supportNeeds: emotionAnalysis.supportNeeds
      })}\n\n`);

      // Generate streaming response
      const responseStream = await advancedLLMEngine.generateStreamingResponse(
        personaId,
        message,
        emotionAnalysis,
        conversationHistory || [],
        userId
      );

      for await (const chunk of responseStream) {
        if (chunk.isComplete) {
          res.write(`data: ${JSON.stringify({
            type: 'complete',
            content: chunk.content,
            emotion: chunk.emotion,
            confidence: chunk.confidence,
            memoryUpdates: chunk.memoryUpdates
          })}\n\n`);
        } else {
          res.write(`data: ${JSON.stringify({
            type: 'content',
            content: chunk.content,
            emotion: chunk.emotion,
            confidence: chunk.confidence
          })}\n\n`);
        }
      }

      res.end();
    } catch (error) {
      console.error('Streaming chat error:', error);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: 'Failed to generate response'
      })}\n\n`);
      res.end();
    }
  });

  // Emotion insights endpoint
  app.get('/api/emotion/insights/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const insights = emotionDetectionEngine.getEmotionalInsights(userId);
      res.json({ success: true, insights });
    } catch (error) {
      console.error('Emotion insights error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get emotional insights'
      });
    }
  });

  // Memory stats endpoint  
  app.get('/api/memory/stats/:userId/:personaId', async (req, res) => {
    try {
      const { userId, personaId } = req.params;
      const stats = advancedLLMEngine.getConversationMemoryStats(userId, personaId);
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Memory stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get memory stats'
      });
    }
  });

  // Chat sessions endpoint
  app.get('/api/chat-sessions', async (req, res) => {
    try {
      // Generate sample sessions for demo purposes
      const sessions = [
        {
          id: 'session-1',
          userId: 'user-1',
          personaId: 'sarah',
          personaName: 'Dr. Sarah',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          messageCount: 12,
          duration: 45,
          summary: 'Discussed anxiety management techniques and explored cognitive behavioral therapy strategies for handling work-related stress.',
          emotionalTone: 'anxious',
          topics: ['anxiety', 'work stress', 'CBT'],
          lastMessage: 'Thank you for the helpful breathing exercises. I feel more equipped to handle my anxiety now.',
          status: 'completed'
        },
        {
          id: 'session-2',
          userId: 'user-1',
          personaId: 'alex',
          personaName: 'Alex',
          startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          messageCount: 8,
          duration: 30,
          summary: 'Explored relationship dynamics and communication patterns with romantic partner.',
          emotionalTone: 'neutral',
          topics: ['relationships', 'communication', 'boundaries'],
          lastMessage: 'I understand now how my communication style affects our relationship dynamics.',
          status: 'completed'
        },
        {
          id: 'session-3',
          userId: 'user-1',
          personaId: 'marcus',
          personaName: 'Marcus',
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          messageCount: 15,
          duration: 60,
          summary: 'Set career goals and developed action plans for professional development and skill building.',
          emotionalTone: 'positive',
          topics: ['career goals', 'motivation', 'skill development'],
          lastMessage: 'I have a clear roadmap now. Time to start taking action on my career goals.',
          status: 'completed'
        }
      ];
      
      res.json(sessions);
    } catch (error) {
      console.error('Chat sessions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat sessions'
      });
    }
  });

  // Chat messages endpoint
  app.get('/api/chat-messages/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Generate sample messages for demo purposes
      const messages = [
        {
          id: 'msg-1',
          sessionId,
          sender: 'user',
          content: 'I\'ve been feeling really anxious about work lately. The pressure is overwhelming.',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          emotion: 'anxious'
        },
        {
          id: 'msg-2',
          sessionId,
          sender: 'persona',
          content: 'I understand that work pressure can feel overwhelming. Can you tell me more about what specific situations trigger your anxiety?',
          timestamp: new Date(Date.now() - 44 * 60 * 1000).toISOString()
        },
        {
          id: 'msg-3',
          sessionId,
          sender: 'user',
          content: 'Mostly deadlines and presentations. I start spiraling when I think about them.',
          timestamp: new Date(Date.now() - 43 * 60 * 1000).toISOString(),
          emotion: 'anxious'
        },
        {
          id: 'msg-4',
          sessionId,
          sender: 'persona',
          content: 'That makes sense. Let\'s work on some grounding techniques. Try the 5-4-3-2-1 method: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.',
          timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString()
        }
      ];
      
      res.json(messages);
    } catch (error) {
      console.error('Chat messages error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat messages'
      });
    }
  });

  // Continue with other routes...

  const httpServer = createServer(app);
  return httpServer;
}

// Generate fallback response when AI fails
function generateFallbackResponse(message: string, persona: any, userMood?: string): any {
  const responses = {
    sarah: {
      greeting: "Hello, I'm Dr. Sarah. I understand you're reaching out today, and I want you to know that I'm here to listen and support you.",
      anxiety: "I hear that you're feeling anxious right now. That takes courage to share. Can you tell me a bit more about what's contributing to these feelings?",
      depression: "Thank you for trusting me with how you're feeling. Depression can feel overwhelming, but you've taken an important step by reaching out.",
      general: "I appreciate you sharing that with me. As your therapist, I want to understand your experience better. What would be most helpful for us to focus on today?"
    },
    alex: {
      greeting: "Hey there! I'm Alex, and I'm really glad you decided to reach out today. I've been through some tough times myself, so I get it.",
      anxiety: "I totally understand that anxious feeling - it's like your mind won't stop racing, right? I've been there too. What's going on?",
      depression: "I hear you, and I want you to know you're not alone in feeling this way. I've walked through similar struggles myself.",
      general: "Thanks for sharing that with me. I really appreciate your openness. What's been on your mind lately?"
    },
    marcus: {
      greeting: "Hey! I'm Marcus, your life coach. I'm excited to work with you on turning challenges into opportunities for growth.",
      anxiety: "I can see you're dealing with some anxiety, and that's totally normal. Let's channel that energy into something positive. What's one small step we could take today?",
      depression: "I appreciate you being honest about how you're feeling. Every champion faces tough times - what matters is how we bounce back. What's one thing that usually brings you a little joy?",
      general: "Great to connect with you! I'm all about helping you unlock your potential. What goals are you working toward right now?"
    },
    maya: {
      greeting: "Welcome, I'm Maya. I'm here to guide you toward inner peace and mindfulness. Take a deep breath with me - you're in a safe space.",
      anxiety: "I can sense the tension you're carrying. Let's start by taking three deep breaths together. Anxiety is temporary, but your inner strength is constant.",
      depression: "I hold space for your pain with compassion. Sometimes we need to sit with difficult emotions before we can transform them. You are not your thoughts.",
      general: "Thank you for sharing your experience with me. In this moment, you are exactly where you need to be. What would bring you a sense of peace right now?"
    }
  };

  const personaResponses = responses[persona?.id as keyof typeof responses] || responses.sarah;
  
  // Determine response type based on message content
  let responseType = 'general';
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried') || lowerMessage.includes('nervous')) {
    responseType = 'anxiety';
  } else if (lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('hopeless')) {
    responseType = 'depression';
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    responseType = 'greeting';
  }

  return {
    content: personaResponses[responseType as keyof typeof personaResponses],
    emotionalTone: responseType === 'anxiety' ? 'calm and reassuring' : responseType === 'depression' ? 'warm and supportive' : 'welcoming and empathetic',
    empathyLevel: 0.8,
    responseStrategy: responseType === 'anxiety' ? 'anxiety_support' : responseType === 'depression' ? 'depression_support' : 'general_support',
    followUpQuestions: responseType === 'anxiety' ? 
      ["What thoughts are going through your mind right now?", "Where do you feel this anxiety in your body?"] :
      responseType === 'depression' ?
      ["What has this experience been like for you?", "Are there any moments when you feel a little lighter?"] :
      ["What brought you here today?", "What would be most helpful to explore together?"],
    therapeuticTechniques: responseType === 'anxiety' ? 
      ["mindfulness", "cognitive reframing", "breathing techniques"] :
      responseType === 'depression' ?
      ["validation", "behavioral activation", "cognitive restructuring"] :
      ["active listening", "empathetic responding", "collaborative exploration"]
  };
}

// Helper function to generate personalized greetings
function generatePersonalizedGreeting(persona: any, personaId: string, memories: any[]) {
  const hasHistory = memories.length > 0;
  const lastMood = memories.find(m => m.type === 'mood_check')?.mood;
  
  const greetings = {
    "dr-sarah": hasHistory 
      ? `Hello again! I'm Dr. Sarah. It's good to see you back. Before we continue, how are you feeling today?`
      : `Hello, I'm Dr. Sarah Chen. I'm here to provide you with professional therapeutic support. How are you feeling today?`,
    "alex": hasHistory
      ? `Hey there! Good to see you again. How's it going today?`
      : `Hey! I'm Alex. I'm here as someone who gets it - we've all been through tough times. How are you doing today?`,
    "marcus": hasHistory
      ? `Welcome back, champion! Ready to tackle another day? How are you feeling?`
      : `Hey there! I'm Marcus, your personal development coach. Every great journey starts with one step. How are you feeling today?`,
    "maya": hasHistory
      ? `Welcome back to this peaceful space. Take a deep breath with me. How is your heart feeling today?`
      : `Hello, I'm Maya. Let's create a calm, mindful space together. Take a moment to breathe. How are you feeling in this moment?`
  };
  
  return greetings[personaId as keyof typeof greetings] || greetings["dr-sarah"];
}

// Helper function to detect crisis keywords
function detectCrisisKeywords(message: string): boolean {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end it all', 'hurt myself', 'self harm', 
    'cut myself', 'want to die', 'better off dead', 'no point living',
    'overdose', 'pills', 'jump off', 'hanging'
  ];
  
  const lowerMessage = message.toLowerCase();
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Helper function to generate persona-specific responses
async function generatePersonaResponse(
  userMessage: string, 
  persona: any, 
  personaId: string, 
  memories: any[] = [], 
  userMood?: string, 
  isFirstMessage: boolean = false
) {
  // Enhanced emotion detection
  const emotionDetected = detectEmotion(userMessage);
  const crisisDetected = detectCrisisKeywords(userMessage);
  
  // Check if user has been chatting for a while (suggest session end)
  const recentMemories = memories.filter(m => {
    const memoryTime = new Date(m.timestamp);
    const now = new Date();
    return (now.getTime() - memoryTime.getTime()) < (30 * 60 * 1000); // 30 minutes
  });
  
  const suggestSessionEnd = recentMemories.length > 15; // After 15+ exchanges
  
  let content = "";
  
  if (crisisDetected) {
    content = generateCrisisResponse(personaId);
  } else if (isFirstMessage && userMood) {
    content = generateMoodAwareResponse(userMessage, userMood, personaId);
  } else {
    // Generate response based on persona with memory context
    switch (personaId) {
      case "dr-sarah":
        content = generateTherapistResponse(userMessage, emotionDetected, memories);
        break;
      case "alex":
        content = generatePeerResponse(userMessage, emotionDetected, memories);
        break;
      case "marcus":
        content = generateCoachResponse(userMessage, emotionDetected, memories);
        break;
      case "maya":
        content = generateMindfulnessResponse(userMessage, emotionDetected, memories);
        break;
      default:
        content = "I understand. Can you tell me more about how you're feeling?";
    }
  }
  
  // Add session end suggestion if needed
  if (suggestSessionEnd) {
    content += "\n\nWe've covered a lot of ground today. Would you like to wrap up our session and see a summary of what we've discussed?";
  }

  return { content, emotionDetected, suggestSessionEnd };
}

// Crisis response function
function generateCrisisResponse(personaId: string): string {
  const crisisResponses = {
    "dr-sarah": "I'm deeply concerned about what you've shared. Your safety is the most important thing right now. Please reach out to a crisis helpline immediately - call 988 (Suicide & Crisis Lifeline) or text 'HELLO' to 741741. You don't have to go through this alone.",
    "alex": "Hey, I'm really worried about you right now. What you're feeling is serious, and you deserve support. Please call 988 or text 741741 - there are people who want to help. You matter, and this feeling can change.",
    "marcus": "This is bigger than what we can handle together right now. I need you to reach out for immediate support - call 988 or text 741741. You have strength even when it doesn't feel like it, and getting help is the strongest thing you can do.",
    "maya": "I'm holding space for your pain right now, and I'm concerned for your safety. Please reach out for immediate support - call 988 or text 741741. You are not alone in this darkness, and there are people trained to help guide you to light."
  };
  
  return crisisResponses[personaId as keyof typeof crisisResponses] || crisisResponses["dr-sarah"];
}

// Mood-aware response function
function generateBasicResponse(persona: any, message: string, emotionAnalysis: any): string {
  if (!persona) {
    return "I'm here to listen and support you. How are you feeling today?";
  }

  const responses = {
    'dr-sarah': [
      "I understand you're going through a difficult time. Can you tell me more about what's happening?",
      "That sounds really challenging. How has this been affecting your daily life?",
      "I hear you. Let's work together to find some coping strategies that might help.",
      "It's completely normal to feel this way. What would be most helpful for you right now?"
    ],
    'alex': [
      "Hey, I've been there too. Want to talk about what's going on?",
      "That sounds tough, but you're not alone in this. I'm here to listen.",
      "I can relate to what you're going through. What's been the hardest part?",
      "Thanks for sharing that with me. How are you taking care of yourself lately?"
    ],
    'marcus': [
      "Let's focus on what you can control right now. What's one small step you could take?",
      "I hear you. What specific goal would you like to work on today?",
      "That's a challenging situation. What strengths do you have that could help here?",
      "You've got this. What would success look like for you in this situation?"
    ],
    'maya': [
      "Take a deep breath with me. What are you noticing in your body right now?",
      "Let's pause for a moment. What would feel most soothing to you right now?",
      "I can sense you're carrying a lot. How can we create some space for you to breathe?",
      "Your feelings are valid. What would help you feel more grounded right now?"
    ]
  };

  const personaResponses = responses[persona.id] || responses['dr-sarah'];
  const randomResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)];
  
  return randomResponse;
}

function generateMoodAwareResponse(userMessage: string, userMood: string, personaId: string): string {
  const moodResponses = {
    "dr-sarah": {
      "😊": "I'm glad to hear you're feeling positive today! Let's explore what's contributing to these good feelings and how we can build on them.",
      "😐": "It sounds like you're feeling neutral today. Sometimes that's exactly where we need to be. What's on your mind?",
      "😔": "I can sense you're having a difficult day. Thank you for sharing that with me. What would feel most supportive right now?",
      "😰": "I hear that you're feeling anxious or stressed. That takes courage to acknowledge. Let's work through this together.",
      "😤": "It sounds like frustration or anger might be present for you today. These feelings are valid and important to explore."
    },
    "alex": {
      "😊": "That's awesome that you're feeling good! What's been going well for you lately?",
      "😐": "Okay, so kind of a middle-ground day. I get that - sometimes we're just... existing, you know?",
      "😔": "I can tell things are tough right now. I've been there too, and you don't have to carry this alone.",
      "😰": "Sounds like anxiety is hitting hard today. That's such a overwhelming feeling - what's been weighing on you?",
      "😤": "Feeling frustrated or angry? That's totally valid. Sometimes life just pushes our buttons, right?"
    },
    "marcus": {
      "😊": "I love that energy! When we feel good, that's fuel for even greater things. What victories are you celebrating?",
      "😐": "Neutral days are part of the journey, champion. Sometimes we need to pause before the next breakthrough. What's calling for your attention?",
      "😔": "I see you're facing some challenges today. Every champion has tough rounds - this is where we build resilience. What support do you need?",
      "😰": "Anxiety is trying to protect you, but sometimes it goes overboard. Let's channel that energy into action. What can we tackle together?",
      "😤": "That fire you're feeling? Let's use it constructively. Anger often signals something needs to change. What boundaries or goals need your attention?"
    },
    "maya": {
      "😊": "I can feel the lightness in your words. Let's breathe into this joy and explore what's nurturing your spirit today.",
      "😐": "Neutral can be a peaceful place to rest. Sometimes we just need to be present with what is. What does your heart need right now?",
      "😔": "I'm sensing heaviness in your spirit. Let's create a gentle space for these feelings. You're safe to share whatever comes up.",
      "😰": "Your nervous system seems activated today. Let's start with some grounding. Can you feel your feet on the floor right now?",
      "😤": "There's intensity in your energy today. Sometimes our emotions are messengers. What might this feeling be trying to tell you?"
    }
  };
  
  const responses = moodResponses[personaId as keyof typeof moodResponses];
  return responses?.[userMood as keyof typeof responses] || "Thank you for sharing how you're feeling. Tell me more about what's going on for you today.";
}

function detectEmotion(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("anxious") || lowerMessage.includes("worried") || lowerMessage.includes("stress")) {
    return "anxiety";
  }
  if (lowerMessage.includes("sad") || lowerMessage.includes("depressed") || lowerMessage.includes("down")) {
    return "sadness";
  }
  if (lowerMessage.includes("angry") || lowerMessage.includes("frustrated") || lowerMessage.includes("mad")) {
    return "anger";
  }
  if (lowerMessage.includes("happy") || lowerMessage.includes("good") || lowerMessage.includes("great")) {
    return "joy";
  }
  
  return undefined;
}

function generateTherapistResponse(message: string, emotion?: string, memories: any[] = []): string {
  const responses = {
    anxiety: [
      "I can hear that you're experiencing anxiety. That's completely understandable. Can you help me understand what specifically is contributing to these anxious feelings?",
      "Anxiety can feel overwhelming, but you're taking a positive step by talking about it. Let's explore what thoughts might be driving these feelings.",
      "It sounds like anxiety is affecting you right now. I'd like to help you examine the evidence for and against the thoughts that are making you anxious. What's going through your mind?"
    ],
    sadness: [
      "I can sense the sadness in what you're sharing. These feelings are valid and it takes courage to express them. What's been weighing on you most heavily?",
      "Sadness can feel very isolating, but you're not alone in this. Can you tell me more about what's contributing to these feelings?",
      "Thank you for trusting me with these difficult feelings. Sometimes talking through sadness can help us understand it better. What thoughts accompany this sadness?"
    ],
    anger: [
      "I hear frustration in your words, and that's completely valid. Anger often signals that something important to us feels threatened. Can you help me understand what's behind these feelings?",
      "It sounds like you're dealing with some difficult emotions right now. Anger can be protective, but let's explore what's underneath it.",
      "I can sense your frustration. Sometimes anger masks other emotions like hurt or disappointment. What do you think might be driving these feelings?"
    ],
    joy: [
      "I'm glad to hear some positivity in your message. It's wonderful that you're experiencing good moments. What's contributing to these positive feelings?",
      "That's encouraging to hear. Positive emotions are just as important to explore as difficult ones. What's been going well for you?",
      "I appreciate you sharing the good along with the challenging. What's helping you feel this way today?"
    ]
  };

  const defaultResponses = [
    "I hear you, and I want you to know that your feelings are valid. Can you tell me more about what you're experiencing?",
    "Thank you for sharing that with me. It takes courage to open up. What's been on your mind lately?",
    "I'm here to listen and support you. Sometimes talking through our thoughts and feelings can help us gain clarity. What would be most helpful to explore today?",
    "Your experience matters, and I'm glad you're taking the time to reflect and share. What aspects of this situation feel most significant to you?"
  ];

  if (emotion && responses[emotion as keyof typeof responses]) {
    const emotionResponses = responses[emotion as keyof typeof responses];
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
  }

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function generatePeerResponse(message: string, emotion?: string, memories: any[] = []): string {
  const responses = {
    anxiety: [
      "Hey, I totally get that feeling of anxiety - I've been there too. It's like your mind just won't stop racing, right? What's been triggering it for you lately?",
      "Ugh, anxiety is the worst. I remember when I used to feel like that all the time. You're definitely not alone in this. Want to talk about what's been stressing you out?",
      "I feel you on the anxiety thing. It's so hard when your brain just won't chill out. I've found some things that help - maybe we can figure out what might work for you?"
    ],
    sadness: [
      "I can really hear that you're going through a tough time right now. I've had those days too where everything just feels heavy. You don't have to go through this alone.",
      "That sounds really hard, and I want you to know it's okay to feel sad sometimes. We all go through rough patches. What's been weighing on you?",
      "I hear you, and I'm really sorry you're feeling this way. Sometimes life just hits different, you know? I'm here if you want to talk about what's going on."
    ],
    anger: [
      "Wow, that sounds really frustrating! I can totally understand why you'd be feeling angry about that. Sometimes things just really tick us off, and that's completely normal.",
      "I get it - when things aren't going right, it's so easy to get fired up about it. I've been there too. What's been pushing your buttons lately?",
      "That's got to be so annoying! I hate when stuff like that happens. Want to vent about it? Sometimes it helps just to get it all out."
    ],
    joy: [
      "That's awesome! I love hearing good news. It's so nice when things are going well for a change. What's been making you feel good lately?",
      "Yes! I'm so happy to hear you're doing better. Those good moments are so important - we need to celebrate them when they come!",
      "That's really great to hear! It sounds like things are looking up for you. What's been working well in your life right now?"
    ]
  };

  const defaultResponses = [
    "Thanks for sharing that with me. I really appreciate you being open about what's going on. How are you feeling about everything right now?",
    "I hear you, and I want you to know that what you're going through makes total sense. We've all been in tough spots before. What's on your mind?",
    "That sounds like a lot to deal with. I'm glad you're talking about it though - that's always a good first step. How are you coping with everything?",
    "I can relate to a lot of what you're saying. Life can be pretty overwhelming sometimes. What's been the hardest part for you lately?"
  ];

  if (emotion && responses[emotion as keyof typeof responses]) {
    const emotionResponses = responses[emotion as keyof typeof responses];
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
  }

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function generateCoachResponse(message: string, emotion?: string, memories: any[] = []): string {
  const responses = {
    anxiety: [
      "I can see you're dealing with anxiety, and that shows you care deeply about the outcome. Let's channel that energy into action. What specific steps can we take to address what's worrying you?",
      "Anxiety often signals that something matters to you. That's actually a strength - it means you're invested. Now let's transform that nervous energy into a concrete plan. What's one thing you can control in this situation?",
      "I hear the anxiety, but I also hear someone who wants to succeed. Let's use this as fuel for growth. What would conquering this fear look like for you?"
    ],
    sadness: [
      "I can sense you're going through a difficult time, and that takes real strength to acknowledge. Every champion faces setbacks - it's how we respond that defines us. What can we learn from this experience?",
      "Tough times don't last, but tough people do. You're showing courage by facing these feelings head-on. Let's focus on what we can build from here. What's one small step forward you can take today?",
      "I see someone who's being honest about their struggles, and that's the first step toward breakthrough. Every great comeback starts with acknowledging where we are. What strengths can you draw on right now?"
    ],
    anger: [
      "That fire you're feeling? That's passion and energy that we can redirect toward positive change. Great leaders use frustration as fuel for improvement. What needs to change, and how can you be part of that solution?",
      "I can hear the intensity in your words, and that tells me you care about justice and fairness. That's powerful. Let's channel that energy into creating the change you want to see. What's your next move?",
      "Anger can be a powerful motivator when we use it right. It's telling you something important. What is this emotion trying to teach you, and how can we turn it into action?"
    ],
    joy: [
      "I love hearing that energy in your voice! Success builds on success. This positive momentum is exactly what we need to push toward even bigger goals. What's next on your vision board?",
      "That's the attitude of a winner right there! When we're feeling good, that's the perfect time to set our sights even higher. How can we build on this positive energy?",
      "Yes! This is what I'm talking about. You're in the zone right now. Let's capture this feeling and use it to fuel your next breakthrough. What ambitious goal are you ready to tackle?"
    ]
  };

  const defaultResponses = [
    "I can see there's real potential in what you're sharing. Every challenge is an opportunity in disguise. What's the goal you're working toward, and how can we get you there?",
    "You know what I'm hearing? I'm hearing someone who's ready for growth. That awareness you just showed is the first step toward transformation. What's your vision for where you want to be?",
    "This is exactly the kind of honest reflection that separates achievers from dreamers. You're doing the work. Now let's turn this insight into action. What's one concrete step you can take today?",
    "I respect your willingness to dig deep and examine what's really going on. That's champion-level self-awareness right there. How can we use this understanding to move you forward?"
  ];

  if (emotion && responses[emotion as keyof typeof responses]) {
    const emotionResponses = responses[emotion as keyof typeof responses];
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
  }

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function generateMindfulnessResponse(message: string, emotion?: string, memories: any[] = []): string {
  const responses = {
    anxiety: [
      "I can feel the restless energy in your words. Take a moment with me right now - let's breathe together. Inhale slowly... hold... and release. Anxiety is like clouds passing through the sky of your mind. What do you notice when you simply observe these feelings without judgment?",
      "The anxiety you're experiencing is your mind's way of trying to protect you, but sometimes it gets a bit overprotective. Let's anchor ourselves in this present moment. Can you feel your feet on the ground right now? What sensations do you notice in your body as you read these words?",
      "I hear the worry in your message, and I want you to know that you're safe right here, right now. Sometimes our minds travel to futures that haven't happened yet. Let's gently return to what's actually true in this moment. What are three things you can see around you right now?"
    ],
    sadness: [
      "I can sense the heaviness you're carrying, and I want you to know that sadness is like rain - it comes, it serves its purpose, and it passes. Right now, can you place your hand on your heart and feel it beating? That steady rhythm is your life force, always with you.",
      "The sadness you're feeling is part of being beautifully human. Like waves in the ocean, emotions rise and fall. Let's sit with this feeling together for a moment, not trying to change it, just allowing it to be. What does this sadness feel like in your body?",
      "I hear the pain in your words, and I want to hold space for that with you. Sometimes we need to feel our feelings fully before they can transform. Take a deep breath with me and imagine breathing compassion into the parts of you that hurt."
    ],
    anger: [
      "I can feel the intensity of your emotions, like a fire burning bright. Fire has power - it can destroy or it can warm and illuminate. Let's take a moment to breathe with this energy. What happens if you imagine breathing into the flame instead of being consumed by it?",
      "The anger you're feeling has something important to tell you. It's often a guardian of our values and boundaries. Let's pause together and listen to what it's trying to say. Can you feel where this anger lives in your body right now?",
      "I sense the storm of emotions within you. Like weather, feelings pass through us if we don't resist them. Let's find the eye of this storm together - that calm center that's always within you. What would it feel like to observe this anger from that peaceful place?"
    ],
    joy: [
      "I can feel the lightness and warmth in your words, like sunshine breaking through clouds. This joy you're experiencing is your natural state shining through. Let's take a moment to really savor this feeling. Where do you feel this happiness in your body?",
      "What a beautiful gift to witness your joy! Like a flower opening to the sun, you're allowing your inner light to shine. Let's breathe into this moment of aliveness. What are you most grateful for right now?",
      "The happiness you're sharing is like a gentle breeze on a warm day - refreshing and life-giving. Let's pause to fully receive this moment. How can you carry this feeling of joy with you as you move through your day?"
    ]
  };

  const defaultResponses = [
    "Thank you for sharing what's alive in you right now. Your awareness of your inner experience is already a step toward peace. Let's take a moment to simply breathe together and notice what's present. What do you observe in this moment without trying to change anything?",
    "I can feel the honesty in your words, and that kind of truthfulness with yourself is sacred. Sometimes the most healing thing we can do is simply witness our experience with kindness. What would it feel like to offer yourself the same compassion you'd give a dear friend?",
    "What you're sharing touches something deep and human in all of us. Right now, can you feel your breath flowing in and out? This breath is always available to anchor you in the present moment. What shifts when you focus on this simple, life-giving rhythm?",
    "I hear the seeking in your words - that beautiful human desire to understand and grow. Like a tree finding its way toward light, you're naturally moving toward what serves you. What wisdom is trying to emerge from your experience right now?"
  ];

  if (emotion && responses[emotion as keyof typeof responses]) {
    const emotionResponses = responses[emotion as keyof typeof responses];
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
  }

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}
