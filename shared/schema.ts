import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  json,
  varchar,
  jsonb,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessionStorage = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User authentication table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("idx_users_email").on(table.email),
]);

// User memories and context table
export const userMemories = pgTable("user_memories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // 'mood_check', 'insight', 'goal', etc.
  content: text("content"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  personaId: text("persona_id"),
  conversationId: integer("conversation_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_user_memories_user_id").on(table.userId),
  index("idx_user_memories_type").on(table.type),
]);

export const personas = pgTable("personas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  specialty: text("specialty").notNull(),
  description: text("description").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  color: text("color").notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  personaId: text("persona_id").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_conversations_user_id").on(table.userId),
  index("idx_conversations_persona_id").on(table.personaId),
]);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  content: text("content").notNull(),
  sender: text("sender").notNull(), // 'user' or 'ai'
  emotionDetected: text("emotion_detected"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("idx_messages_conversation_id").on(table.conversationId),
  index("idx_messages_timestamp").on(table.timestamp),
]);

export const sessions = pgTable("therapy_sessions", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  summary: text("summary"),
  keyTopics: json("key_topics").$type<string[]>(),
  techniquesUsed: json("techniques_used").$type<string[]>(),
  homework: json("homework").$type<string[]>(),
  moodBefore: integer("mood_before"), // 1-5 scale
  moodAfter: integer("mood_after"), // 1-5 scale
  emotionAnalysis: jsonb("emotion_analysis").$type<{
    primary_emotion: string;
    intensity: number;
    secondary_emotions: string[];
    mood_valence: number;
    arousal_level: number;
  }>(),
  crisisIndicators: jsonb("crisis_indicators").$type<{
    level: string;
    keywords: string[];
    requires_intervention: boolean;
  }>(),
  duration: integer("duration"), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_sessions_conversation_id").on(table.conversationId),
]);

// Mood tracking table
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  sessionId: integer("session_id"),
  moodRating: integer("mood_rating").notNull(), // 1-5 scale
  emotions: json("emotions").$type<string[]>(),
  notes: text("notes"),
  triggers: json("triggers").$type<string[]>(),
  type: varchar("type").notNull(), // 'check_in', 'check_out', 'daily'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_mood_entries_user_id").on(table.userId),
  index("idx_mood_entries_created_at").on(table.createdAt),
]);

// Micro-tools usage tracking
export const microToolUsage = pgTable("micro_tool_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  sessionId: integer("session_id"),
  toolType: varchar("tool_type").notNull(), // 'breathing', 'grounding', 'cbt_journal'
  toolName: varchar("tool_name").notNull(),
  duration: integer("duration"), // in seconds
  completed: boolean("completed").default(false),
  effectiveness: integer("effectiveness"), // 1-5 rating
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_micro_tool_user_id").on(table.userId),
  index("idx_micro_tool_type").on(table.toolType),
]);

// Feedback and learning
export const messageFeedback = pgTable("message_feedback", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: varchar("rating").notNull(), // 'thumbs_up', 'thumbs_down'
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_message_feedback_message_id").on(table.messageId),
  index("idx_message_feedback_user_id").on(table.userId),
]);

// Crisis interventions log
export const crisisInterventions = pgTable("crisis_interventions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  sessionId: integer("session_id"),
  severityLevel: varchar("severity_level").notNull(),
  triggerKeywords: json("trigger_keywords").$type<string[]>(),
  interventionType: varchar("intervention_type").notNull(),
  resourcesProvided: json("resources_provided").$type<string[]>(),
  followUpRequired: boolean("follow_up_required").default(false),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_crisis_user_id").on(table.userId),
  index("idx_crisis_severity").on(table.severityLevel),
]);

// Daily check-ins and notifications
export const dailyCheckIns = pgTable("daily_check_ins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  personaId: text("persona_id").notNull(),
  checkInType: varchar("check_in_type").notNull(), // 'morning', 'evening', 'custom'
  moodRating: integer("mood_rating").notNull(),
  gratitude: text("gratitude"),
  goals: json("goals").$type<string[]>(),
  challenges: text("challenges"),
  aiInsight: text("ai_insight"),
  responded: boolean("responded").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_daily_checkins_user_id").on(table.userId),
  index("idx_daily_checkins_date").on(table.createdAt),
]);

// Database relations
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  memories: many(userMemories),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  persona: one(personas, {
    fields: [conversations.personaId],
    references: [personas.id],
  }),
  messages: many(messages),
  session: one(sessions),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  conversation: one(conversations, {
    fields: [sessions.conversationId],
    references: [conversations.id],
  }),
}));

export const userMemoriesRelations = relations(userMemories, ({ one }) => ({
  user: one(users, {
    fields: [userMemories.userId],
    references: [users.id],
  }),
  persona: one(personas, {
    fields: [userMemories.personaId],
    references: [personas.id],
  }),
  conversation: one(conversations, {
    fields: [userMemories.conversationId],
    references: [conversations.id],
  }),
}));

// Schema validation
export const insertPersonaSchema = createInsertSchema(personas);
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});
export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

// User authentication types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Core application types
export type Persona = typeof personas.$inferSelect;
export type InsertPersona = z.infer<typeof insertPersonaSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// Diary entries for journaling and reflection
export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  moodRating: integer("mood_rating").notNull(),
  emotions: json("emotions").$type<string[]>(),
  gratitude: text("gratitude"),
  goals: text("goals"),
  reflections: text("reflections"),
  tags: json("tags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_diary_entries_user_id").on(table.userId),
  index("idx_diary_entries_created_at").on(table.createdAt),
]);

// User profiles for personalization
export const userProfiles = pgTable("user_profiles", {
  userId: varchar("user_id").primaryKey(),
  bio: text("bio"),
  avatar: varchar("avatar"),
  preferences: json("preferences").$type<Record<string, any>>().default({}),
  goals: json("goals").$type<string[]>(),
  interests: json("interests").$type<string[]>(),
  mentalHealthFocus: json("mental_health_focus").$type<string[]>(),
  stats: json("stats").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type InsertDiaryEntry = typeof diaryEntries.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
