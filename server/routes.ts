import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { spawn } from "child_process";
import path from "path";

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
import { emotionDetector } from "./emotion_detection";
import { conversationalAI } from "./conversational_ai";
import { registerClinicalRoutes } from "./clinical_routes";
import { z } from "zod";
import { insertConversationSchema, insertMessageSchema, insertSessionSchema } from "@shared/schema";
import fs from "fs";
import yaml from "js-yaml";

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
  app.get('/api/auth/user', async (req: any, res) => {
    // Return anonymous user for now
    res.json({ id: 'anonymous', email: null });
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
      
      // Generate AI response based on persona
      const persona = await storage.getPersona(personaId);
      const userMemories = await storage.getUserMemories(userId);
      const aiResponse = await generatePersonaResponse(message, persona!, personaId, userMemories, userMood, isFirstMessage);
      
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
        emotionDetected: aiResponse.emotionDetected,
      });

      res.json({
        conversationId: currentConversationId,
        message: aiMessage,
        aiResponse: aiResponse.content,
        emotionDetected: aiResponse.emotionDetected,
        crisisDetected: crisisDetected,
        suggestSessionEnd: aiResponse.suggestSessionEnd || false,
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

  // Enhanced chat endpoint with advanced conversational AI
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

      // Analyze emotion from user message
      const emotionAnalysis = emotionDetector.analyzeEmotion(message);
      
      // Create user message
      const userMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: message,
        sender: 'user',
        emotionDetected: emotionAnalysis.primary_emotion
      });

      // Get conversation history for context
      const messageHistory = await storage.getConversationMessages(conversation.id);
      
      // Build context for conversational AI
      const context = {
        userId,
        personaId,
        conversationId: conversation.id,
        messageHistory: messageHistory.map(msg => ({
          content: msg.content,
          sender: msg.sender as 'user' | 'ai',
          timestamp: msg.timestamp,
          emotionAnalysis: msg.emotionDetected
        })),
        userProfile: {
          preferences: {},
          emotionalPatterns: {},
          conversationStyle: 'balanced',
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
      const aiResponse = await conversationalAI.generatePersonalizedResponse(message, context);
      
      // Create AI message
      const aiMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: aiResponse.content,
        sender: 'ai',
        emotionDetected: aiResponse.emotionalTone
      });

      // Determine suggested micro-tools based on emotion and strategy
      const suggestedMicroTools = [];
      if (aiResponse.responseStrategy === 'anxiety_exploration' || emotionAnalysis.primary_emotion === 'anxiety') {
        suggestedMicroTools.push('breathing', 'grounding');
      } else if (aiResponse.responseStrategy === 'depression_support' || emotionAnalysis.primary_emotion === 'depression') {
        suggestedMicroTools.push('cbt', 'grounding');
      } else if (emotionAnalysis.arousal_level > 0.7) {
        suggestedMicroTools.push('breathing');
      }

      // Check for crisis indicators
      const crisisDetected = aiResponse.responseStrategy === 'crisis_support' || 
                            emotionAnalysis.crisis_indicators.level !== 'none';

      res.json({
        conversation,
        aiMessage,
        emotionAnalysis,
        suggestedMicroTools,
        crisisDetected,
        followUpQuestions: aiResponse.followUpQuestions,
        therapeuticTechniques: aiResponse.therapeuticTechniques
      });

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

  // Register advanced clinical and personalization routes
  registerClinicalRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
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
