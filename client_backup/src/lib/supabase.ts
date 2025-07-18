import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database schema types
export interface User {
  id: string
  email?: string
  name?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  name: string
  email: string
  bio?: string
  avatar_url?: string
  preferences?: any
  created_at: string
  updated_at: string
}

export interface DiaryEntry {
  id: string
  user_id: string
  title: string
  content: string
  mood?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  category: string
  status: 'active' | 'completed' | 'paused'
  target_date?: string
  progress: number
  created_at: string
  updated_at: string
}

export interface Session {
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
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  session_id: string
  user_id: string
  sender: 'user' | 'ai'
  content: string
  emotion_detected?: string
  timestamp: string
  created_at: string
}