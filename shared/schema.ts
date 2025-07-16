import { pgTable, text, integer, serial, timestamp, jsonb, boolean, real, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums for type safety
export const personaTypeEnum = pgEnum('persona_type', ['maya', 'sarah', 'alex', 'marcus']);
export const emotionTypeEnum = pgEnum('emotion_type', [
  'happy', 'sad', 'anxious', 'calm', 'excited', 'frustrated', 'hopeful', 
  'overwhelmed', 'grateful', 'angry', 'peaceful', 'motivated', 'fearful',
  'confused', 'confident', 'lonely', 'loved', 'stressed', 'relaxed'
]);

// Enhanced users table with comprehensive data collection
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email'),
  fullName: text('full_name'),
  profileImage: text('profile_image'),
  totalSessions: integer('total_sessions').default(0),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActiveDate: timestamp('last_active_date'),
  preferences: jsonb('preferences'),
  demographics: jsonb('demographics'), // Age, location, etc. for training
  consentLevel: text('consent_level').default('basic'), // Training data consent
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Comprehensive conversations table for training data
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  personaId: personaTypeEnum('persona_id').notNull(),
  title: text('title'),
  sessionDuration: integer('session_duration'), // in seconds
  messageCount: integer('message_count').default(0),
  emotionalJourney: jsonb('emotional_journey'), // Track emotion changes
  therapeuticTechniques: jsonb('therapeutic_techniques'), // CBT, mindfulness, etc.
  userSatisfaction: real('user_satisfaction'), // 1-5 rating
  outcomes: jsonb('outcomes'), // Goals achieved, breakthroughs
  contextualFactors: jsonb('contextual_factors'), // Time of day, external stressors
  conversationFlow: jsonb('conversation_flow'), // Dialogue structure analysis
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Enhanced messages table for granular training data
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id),
  senderId: text('sender_id').notNull(), // 'user' or persona_id
  content: text('content').notNull(),
  messageType: text('message_type').default('text'), // text, action, reflection
  emotionalContext: jsonb('emotional_context'), // Full emotion analysis
  linguisticFeatures: jsonb('linguistic_features'), // Tone, complexity, etc.
  therapeuticValue: real('therapeutic_value'), // AI-scored effectiveness
  userEngagement: real('user_engagement'), // Response time, length, etc.
  personaFeatures: jsonb('persona_features'), // Features activated
  memoryReferences: jsonb('memory_references'), // What memories were accessed
  responseTime: integer('response_time'), // milliseconds
  contextualCues: jsonb('contextual_cues'), // Environmental factors
  followUpActions: jsonb('follow_up_actions'), // Suggested or taken actions
  createdAt: timestamp('created_at').defaultNow()
});

// Advanced memory system for training data
export const memories = pgTable('memories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  personaId: personaTypeEnum('persona_id').notNull(),
  memoryType: text('memory_type').notNull(), // emotional_pattern, preference, trauma, growth
  content: text('content').notNull(),
  importance: real('importance').default(0.5), // 0-1 significance score
  emotionalWeight: real('emotional_weight'), // Impact on user's wellbeing
  accessCount: integer('access_count').default(0),
  lastAccessed: timestamp('last_accessed'),
  associations: jsonb('associations'), // Connected memories, concepts
  contextualData: jsonb('contextual_data'), // When/how memory was formed
  validationScore: real('validation_score'), // Accuracy over time
  therapeuticRelevance: real('therapeutic_relevance'), // Training importance
  privacyLevel: text('privacy_level').default('standard'), // Data usage permissions
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Comprehensive emotion tracking for training
export const emotionLogs = pgTable('emotion_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  conversationId: integer('conversation_id').references(() => conversations.id),
  messageId: integer('message_id').references(() => messages.id),
  primaryEmotion: emotionTypeEnum('primary_emotion').notNull(),
  secondaryEmotions: jsonb('secondary_emotions'),
  intensity: real('intensity').notNull(), // 0-1
  valence: real('valence').notNull(), // -1 to 1
  arousal: real('arousal').notNull(), // 0-1
  confidence: real('confidence').notNull(), // 0-1
  emotionalTriggers: jsonb('emotional_triggers'),
  supportNeeds: jsonb('support_needs'),
  crisisIndicators: jsonb('crisis_indicators'),
  detectionMethod: text('detection_method'), // API, rule-based, etc.
  rawAnalysis: jsonb('raw_analysis'), // Full AI response for training
  humanValidation: boolean('human_validation'), // Expert review
  createdAt: timestamp('created_at').defaultNow()
});

// Therapeutic outcomes tracking
export const therapeuticOutcomes = pgTable('therapeutic_outcomes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  conversationId: integer('conversation_id').references(() => conversations.id),
  personaId: personaTypeEnum('persona_id').notNull(),
  techniqueUsed: text('technique_used'), // CBT, mindfulness, etc.
  outcomeType: text('outcome_type'), // insight, coping_strategy, mood_improvement
  effectivenessScore: real('effectiveness_score'), // 0-1 measured improvement
  userFeedback: text('user_feedback'),
  longTermImpact: real('long_term_impact'), // Tracked over time
  contextualFactors: jsonb('contextual_factors'),
  measurableChanges: jsonb('measurable_changes'), // Specific improvements
  createdAt: timestamp('created_at').defaultNow()
});

// Advanced session analytics for training
export const sessionAnalytics = pgTable('session_analytics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  conversationId: integer('conversation_id').references(() => conversations.id),
  personaId: personaTypeEnum('persona_id').notNull(),
  sessionDuration: integer('session_duration'), // seconds
  messageCount: integer('message_count'),
  avgResponseTime: real('avg_response_time'),
  emotionalProgression: jsonb('emotional_progression'), // Mood changes
  therapeuticPhases: jsonb('therapeutic_phases'), // Conversation flow
  userEngagementMetrics: jsonb('user_engagement_metrics'),
  personaEffectiveness: real('persona_effectiveness'), // 0-1 rating
  topicCoverage: jsonb('topic_coverage'), // What was discussed
  breakthroughMoments: jsonb('breakthrough_moments'), // Significant insights
  challengesEncountered: jsonb('challenges_encountered'),
  interventionSuccess: jsonb('intervention_success'), // What worked
  trainingValue: real('training_value'), // How valuable for ML training
  createdAt: timestamp('created_at').defaultNow()
});

// Comprehensive goals tracking
export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  personaId: personaTypeEnum('persona_id'), // Which persona helped create goal
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'), // mental_health, lifestyle, relationships, etc.
  targetDate: timestamp('target_date'),
  progress: real('progress').default(0), // 0-1 completion
  milestones: jsonb('milestones'),
  actionSteps: jsonb('action_steps'),
  obstacles: jsonb('obstacles'),
  successMetrics: jsonb('success_metrics'),
  emotionalMotivation: jsonb('emotional_motivation'), // Why this goal matters
  supportNeeded: jsonb('support_needed'),
  achievementStrategy: jsonb('achievement_strategy'),
  isCompleted: boolean('is_completed').default(false),
  completionDate: timestamp('completion_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Enhanced journal entries for training
export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  personaId: personaTypeEnum('persona_id'), // Which persona inspired entry
  title: text('title'),
  content: text('content').notNull(),
  mood: emotionTypeEnum('mood'),
  moodIntensity: real('mood_intensity'), // 0-1
  emotionalTags: jsonb('emotional_tags'),
  insights: jsonb('insights'), // AI-generated insights
  patterns: jsonb('patterns'), // Recurring themes
  gratitude: jsonb('gratitude'), // Gratitude entries
  challenges: jsonb('challenges'), // Difficulties faced
  growthAreas: jsonb('growth_areas'), // Areas for improvement
  copingStrategies: jsonb('coping_strategies'), // What helped
  triggers: jsonb('triggers'), // What caused emotions
  support: jsonb('support'), // Support received/needed
  privacy: text('privacy').default('private'), // Sharing permissions
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// User behavioral patterns for training
export const userBehaviorPatterns = pgTable('user_behavior_patterns', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  patternType: text('pattern_type'), // communication, emotional, temporal
  pattern: jsonb('pattern'), // The actual pattern data
  frequency: real('frequency'), // How often it occurs
  confidence: real('confidence'), // How certain we are
  impact: real('impact'), // Effect on wellbeing
  triggers: jsonb('triggers'), // What causes this pattern
  outcomes: jsonb('outcomes'), // What results from this pattern
  interventions: jsonb('interventions'), // What helps modify pattern
  timeframe: text('timeframe'), // daily, weekly, monthly
  seasonality: jsonb('seasonality'), // Seasonal variations
  contextualFactors: jsonb('contextual_factors'),
  therapeuticRelevance: real('therapeutic_relevance'), // Training importance
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Training data optimization table
export const trainingDatasets = pgTable('training_datasets', {
  id: serial('id').primaryKey(),
  datasetType: text('dataset_type'), // conversation, emotion, outcome
  dataPoints: jsonb('data_points'), // Preprocessed training data
  qualityScore: real('quality_score'), // 0-1 data quality
  diversity: real('diversity'), // Demographic/linguistic diversity
  balance: real('balance'), // Class balance for ML
  privacyCompliance: boolean('privacy_compliance').default(true),
  consent: jsonb('consent'), // User consent levels
  processingNotes: text('processing_notes'),
  version: text('version'),
  modelPerformance: jsonb('model_performance'), // How well models trained on this
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Create insert schemas for all tables
export const insertUserSchema = createInsertSchema(users);
export const insertConversationSchema = createInsertSchema(conversations);
export const insertMessageSchema = createInsertSchema(messages);
export const insertMemorySchema = createInsertSchema(memories);
export const insertEmotionLogSchema = createInsertSchema(emotionLogs);
export const insertTherapeuticOutcomeSchema = createInsertSchema(therapeuticOutcomes);
export const insertSessionAnalyticsSchema = createInsertSchema(sessionAnalytics);
export const insertGoalSchema = createInsertSchema(goals);
export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const insertUserBehaviorPatternSchema = createInsertSchema(userBehaviorPatterns);
export const insertTrainingDatasetSchema = createInsertSchema(trainingDatasets);

// Infer types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Memory = typeof memories.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type EmotionLog = typeof emotionLogs.$inferSelect;
export type InsertEmotionLog = z.infer<typeof insertEmotionLogSchema>;
export type TherapeuticOutcome = typeof therapeuticOutcomes.$inferSelect;
export type InsertTherapeuticOutcome = z.infer<typeof insertTherapeuticOutcomeSchema>;
export type SessionAnalytics = typeof sessionAnalytics.$inferSelect;
export type InsertSessionAnalytics = z.infer<typeof insertSessionAnalyticsSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type UserBehaviorPattern = typeof userBehaviorPatterns.$inferSelect;
export type InsertUserBehaviorPattern = z.infer<typeof insertUserBehaviorPatternSchema>;
export type TrainingDataset = typeof trainingDatasets.$inferSelect;
export type InsertTrainingDataset = z.infer<typeof insertTrainingDatasetSchema>;