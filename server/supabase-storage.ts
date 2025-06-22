import { createClient } from '@supabase/supabase-js'
import type { IStorage } from './storage'

// Types based on existing schema
interface User {
  id: string
  email?: string
  name?: string
  created_at?: string
  updated_at?: string
}

interface Profile {
  id: string
  user_id: string
  name: string
  email: string
  bio?: string
  avatar_url?: string
  preferences?: any
  created_at?: string
  updated_at?: string
}

interface DiaryEntry {
  id: string
  user_id: string
  title: string
  content: string
  mood?: string
  tags?: string[]
  created_at?: string
  updated_at?: string
}

interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  category: string
  status: 'active' | 'completed' | 'paused'
  target_date?: string
  progress: number
  created_at?: string
  updated_at?: string
}

interface Session {
  id: string
  user_id: string
  persona_id: string
  persona_name: string
  start_time: string
  end_time?: string
  duration?: number
  summary?: string
  emotional_tone?: string
  topics?: string[]
  status: 'active' | 'completed'
  created_at?: string
  updated_at?: string
}

interface Message {
  id: string
  session_id: string
  user_id: string
  sender: 'user' | 'ai'
  content: string
  emotion_detected?: string
  timestamp: string
  created_at?: string
}

interface MoodEntry {
  id: string
  user_id: string
  mood: string
  energy_level?: number
  notes?: string
  created_at?: string
}

export class SupabaseStorage implements IStorage {
  private supabase: any
  private fallbackToMemory: boolean = true

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
      this.fallbackToMemory = false
    } else {
      console.warn('Supabase credentials not found, using memory storage as fallback')
      this.fallbackToMemory = true
    }
  }

  // Helper method to check if Supabase is available
  private async isSupabaseAvailable(): Promise<boolean> {
    if (this.fallbackToMemory) return false
    
    try {
      const { data, error } = await this.supabase.from('users').select('id').limit(1)
      return !error
    } catch (error) {
      return false
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase getUser error:', error)
      }
    }

    // Fallback to existing memory storage behavior
    return undefined
  }

  async createUser(userData: Partial<User>): Promise<User> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('users')
          .insert(userData)
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase createUser error:', error)
      }
    }

    // Fallback response
    return {
      id: userData.id || 'user-' + Date.now(),
      email: userData.email,
      name: userData.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        return data
      } catch (error) {
        console.error('Supabase getProfile error:', error)
      }
    }

    // Fallback response
    return {
      id: 'profile-1',
      user_id: userId,
      name: 'User',
      email: 'user@example.com',
      bio: 'Welcome to SoulSense AI',
      preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  async updateProfile(userId: string, profileData: Partial<Profile>): Promise<Profile> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('profiles')
          .upsert({ 
            user_id: userId, 
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase updateProfile error:', error)
      }
    }

    // Fallback response
    return {
      id: profileData.id || 'profile-1',
      user_id: userId,
      name: profileData.name || 'User',
      email: profileData.email || 'user@example.com',
      bio: profileData.bio,
      avatar_url: profileData.avatar_url,
      preferences: profileData.preferences || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // Diary operations
  async getDiaryEntries(userId: string): Promise<DiaryEntry[]> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('diary_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase getDiaryEntries error:', error)
      }
    }

    // Fallback response
    return [{
      id: '1',
      user_id: userId,
      title: 'My First Journal Entry',
      content: 'Today I started my journey with SoulSense AI. I\'m excited to explore my thoughts and feelings in a safe space.',
      mood: 'hopeful',
      tags: ['first-entry', 'reflection'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]
  }

  async createDiaryEntry(userId: string, entryData: Partial<DiaryEntry>): Promise<DiaryEntry> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('diary_entries')
          .insert({
            user_id: userId,
            ...entryData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase createDiaryEntry error:', error)
      }
    }

    // Fallback response
    return {
      id: 'entry-' + Date.now(),
      user_id: userId,
      title: entryData.title || 'Untitled Entry',
      content: entryData.content || '',
      mood: entryData.mood,
      tags: entryData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // Goal operations
  async getGoals(userId: string): Promise<Goal[]> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase getGoals error:', error)
      }
    }

    // Fallback response
    return [{
      id: '1',
      user_id: userId,
      title: 'Practice Daily Mindfulness',
      description: 'Spend 10 minutes each day in mindful meditation',
      category: 'wellness',
      status: 'active',
      progress: 65,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]
  }

  async createGoal(userId: string, goalData: Partial<Goal>): Promise<Goal> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('goals')
          .insert({
            user_id: userId,
            ...goalData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase createGoal error:', error)
      }
    }

    // Fallback response
    return {
      id: 'goal-' + Date.now(),
      user_id: userId,
      title: goalData.title || 'New Goal',
      description: goalData.description,
      category: goalData.category || 'personal',
      status: goalData.status || 'active',
      progress: goalData.progress || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // Session operations
  async getSessions(userId: string): Promise<Session[]> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase getSessions error:', error)
      }
    }

    // Fallback response
    return []
  }

  async createSession(userId: string, sessionData: Partial<Session>): Promise<Session> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('sessions')
          .insert({
            user_id: userId,
            ...sessionData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase createSession error:', error)
      }
    }

    // Fallback response
    return {
      id: 'session-' + Date.now(),
      user_id: userId,
      persona_id: sessionData.persona_id || 'sarah',
      persona_name: sessionData.persona_name || 'Dr. Sarah',
      start_time: new Date().toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // Message operations
  async getMessages(sessionId: string): Promise<Message[]> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('timestamp', { ascending: true })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase getMessages error:', error)
      }
    }

    // Fallback response
    return []
  }

  async createMessage(sessionId: string, userId: string, messageData: Partial<Message>): Promise<Message> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('messages')
          .insert({
            session_id: sessionId,
            user_id: userId,
            ...messageData,
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase createMessage error:', error)
      }
    }

    // Fallback response
    return {
      id: 'msg-' + Date.now(),
      session_id: sessionId,
      user_id: userId,
      sender: messageData.sender || 'user',
      content: messageData.content || '',
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  }

  // Mood operations
  async getMoodEntries(userId: string): Promise<MoodEntry[]> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase getMoodEntries error:', error)
      }
    }

    // Fallback response
    return []
  }

  async createMoodEntry(userId: string, moodData: Partial<MoodEntry>): Promise<MoodEntry> {
    if (await this.isSupabaseAvailable()) {
      try {
        const { data, error } = await this.supabase
          .from('mood_entries')
          .insert({
            user_id: userId,
            ...moodData,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase createMoodEntry error:', error)
      }
    }

    // Fallback response
    return {
      id: 'mood-' + Date.now(),
      user_id: userId,
      mood: moodData.mood || 'neutral',
      energy_level: moodData.energy_level,
      notes: moodData.notes,
      created_at: new Date().toISOString()
    }
  }
}