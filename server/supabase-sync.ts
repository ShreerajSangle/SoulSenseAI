import { createClient } from '@supabase/supabase-js'

// Background Supabase sync service that works alongside existing storage
class SupabaseSyncService {
  private supabase: any
  private isAvailable: boolean = false
  private syncEnabled: boolean = false

  constructor() {
    this.initialize()
  }

  private async initialize() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
      this.isAvailable = await this.testConnection()
      
      if (this.isAvailable) {
        this.syncEnabled = true
        console.log('Supabase sync service: Connected and ready')
      } else {
        console.log('Supabase sync service: Connection failed, sync disabled')
      }
    } else {
      console.log('Supabase sync service: Credentials not found, sync disabled')
    }
  }

  private async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('profiles').select('id').limit(1)
      return !error
    } catch (error) {
      return false
    }
  }

  // Background sync methods that don't interfere with main app
  async syncProfile(userId: string, profileData: any) {
    if (!this.syncEnabled) return

    try {
      await this.supabase.from('profiles').upsert({
        user_id: userId,
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        avatar_url: profileData.avatarUrl,
        preferences: profileData.preferences || {},
        updated_at: new Date().toISOString()
      })
    } catch (error) {
      console.warn('Background profile sync failed:', error)
    }
  }

  async syncDiaryEntry(userId: string, entryData: any) {
    if (!this.syncEnabled) return

    try {
      await this.supabase.from('diary_entries').insert({
        user_id: userId,
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
        tags: entryData.tags || [],
        created_at: entryData.createdAt?.toISOString() || new Date().toISOString()
      })
    } catch (error) {
      console.warn('Background diary sync failed:', error)
    }
  }

  async syncGoal(userId: string, goalData: any) {
    if (!this.syncEnabled) return

    try {
      await this.supabase.from('goals').insert({
        user_id: userId,
        title: goalData.title,
        description: goalData.description,
        category: goalData.category,
        status: goalData.status || 'active',
        progress: goalData.progress || 0,
        target_date: goalData.targetDate?.toISOString()?.split('T')[0],
        created_at: goalData.createdAt?.toISOString() || new Date().toISOString()
      })
    } catch (error) {
      console.warn('Background goal sync failed:', error)
    }
  }

  async syncGoalUpdate(goalId: string, goalData: any) {
    if (!this.syncEnabled) return

    try {
      await this.supabase.from('goals').update({
        title: goalData.title,
        description: goalData.description,
        status: goalData.status,
        progress: goalData.progress,
        target_date: goalData.targetDate?.toISOString()?.split('T')[0],
        updated_at: new Date().toISOString()
      }).eq('user_id', 'anonymous').eq('title', goalData.title)
    } catch (error) {
      console.warn('Background goal update sync failed:', error)
    }
  }

  async syncSession(userId: string, sessionData: any) {
    if (!this.syncEnabled) return

    try {
      await this.supabase.from('sessions').insert({
        user_id: userId,
        persona_id: sessionData.personaId || 'sarah',
        persona_name: sessionData.personaName || 'Dr. Sarah',
        start_time: new Date().toISOString(),
        status: 'active',
        summary: sessionData.summary,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.warn('Background session sync failed:', error)
    }
  }

  async syncMessage(userId: string, sessionId: string, messageData: any) {
    if (!this.syncEnabled) return

    try {
      await this.supabase.from('messages').insert({
        session_id: sessionId,
        user_id: userId,
        sender: messageData.sender,
        content: messageData.content,
        emotion_detected: messageData.emotionDetected,
        timestamp: messageData.timestamp?.toISOString() || new Date().toISOString(),
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.warn('Background message sync failed:', error)
    }
  }

  async syncMoodEntry(userId: string, moodData: any) {
    if (!this.syncEnabled) return

    try {
      await this.supabase.from('mood_entries').insert({
        user_id: userId,
        mood: moodData.mood,
        energy_level: moodData.energyLevel,
        notes: moodData.notes,
        created_at: moodData.createdAt?.toISOString() || new Date().toISOString()
      })
    } catch (error) {
      console.warn('Background mood sync failed:', error)
    }
  }

  // Get sync status for debugging
  getSyncStatus() {
    return {
      available: this.isAvailable,
      enabled: this.syncEnabled
    }
  }
}

// Export singleton instance
export const supabaseSync = new SupabaseSyncService()