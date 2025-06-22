import { DatabaseStorage } from "./storage";
import { createClient } from '@supabase/supabase-js';

// Hybrid storage that gracefully falls back to existing DatabaseStorage when Supabase is unavailable
export class HybridStorage extends DatabaseStorage {
  private supabase: any;
  private supabaseAvailable: boolean = false;

  constructor() {
    super();
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.supabaseAvailable = await this.testConnection();
      
      if (this.supabaseAvailable) {
        console.log('Supabase connected successfully - using cloud database');
        await this.syncExistingData();
      } else {
        console.log('Supabase connection failed - using local database');
      }
    } else {
      console.log('Supabase credentials not found - using local database');
    }
  }

  private async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('profiles').select('id').limit(1);
      return !error;
    } catch (error) {
      return false;
    }
  }

  // Sync existing local data to Supabase when first connecting
  private async syncExistingData() {
    try {
      // Sync profiles
      const localProfile = await super.getUserProfile('anonymous');
      if (localProfile && this.supabaseAvailable) {
        await this.supabase.from('profiles').upsert({
          user_id: 'anonymous',
          name: localProfile.name,
          email: localProfile.email,
          bio: localProfile.bio,
          preferences: localProfile.preferences || {}
        });
      }

      // Sync diary entries
      const localDiaryEntries = await super.getDiaryEntries('anonymous');
      if (localDiaryEntries.length > 0 && this.supabaseAvailable) {
        const supabaseEntries = localDiaryEntries.map((entry: any) => ({
          user_id: 'anonymous',
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags || [],
          created_at: entry.createdAt?.toISOString() || new Date().toISOString()
        }));
        await this.supabase.from('diary_entries').upsert(supabaseEntries);
      }

      // Sync goals
      const localGoals = await super.getUserGoals('anonymous');
      if (localGoals.length > 0 && this.supabaseAvailable) {
        const supabaseGoals = localGoals.map(goal => ({
          user_id: 'anonymous',
          title: goal.title,
          description: goal.description,
          category: goal.category,
          status: goal.status,
          progress: goal.progress,
          target_date: goal.targetDate?.toISOString()?.split('T')[0],
          created_at: goal.createdAt?.toISOString() || new Date().toISOString()
        }));
        await this.supabase.from('goals').upsert(supabaseGoals);
      }

      console.log('Local data synced to Supabase successfully');
    } catch (error) {
      console.warn('Data sync to Supabase failed:', error);
    }
  }

  // Profile operations with Supabase integration
  async getUserProfile(userId: string) {
    if (this.supabaseAvailable) {
      try {
        const { data, error } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (data && !error) {
          return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            email: data.email,
            bio: data.bio,
            avatarUrl: data.avatar_url,
            preferences: data.preferences || {},
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
          };
        }
      } catch (error) {
        console.warn('Supabase profile fetch failed, using local storage');
      }
    }

    return super.getUserProfile(userId);
  }

  async updateUserProfile(userId: string, profileData: any) {
    // Update local storage first (immediate response)
    const localResult = await super.updateUserProfile(userId, profileData);

    // Then update Supabase in background
    if (this.supabaseAvailable) {
      try {
        await this.supabase.from('profiles').upsert({
          user_id: userId,
          name: profileData.name,
          email: profileData.email,
          bio: profileData.bio,
          avatar_url: profileData.avatarUrl,
          preferences: profileData.preferences || {},
          updated_at: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Supabase profile update failed');
      }
    }

    return localResult;
  }

  // Diary operations with Supabase integration
  async createDiaryEntry(entryData: any) {
    // Create in local storage first (immediate response)
    const localResult = await super.createDiaryEntry(entryData);

    // Then sync to Supabase in background
    if (this.supabaseAvailable) {
      try {
        await this.supabase.from('diary_entries').insert({
          user_id: entryData.userId,
          title: entryData.title,
          content: entryData.content,
          mood: entryData.mood,
          tags: entryData.tags || [],
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Supabase diary entry creation failed');
      }
    }

    return localResult;
  }

  async getUserDiaryEntries(userId: string) {
    if (this.supabaseAvailable) {
      try {
        const { data, error } = await this.supabase
          .from('diary_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (data && !error) {
          return data.map((entry: any) => ({
            id: parseInt(entry.id) || Date.now(),
            userId: entry.user_id,
            title: entry.title,
            content: entry.content,
            mood: entry.mood,
            tags: entry.tags || [],
            createdAt: new Date(entry.created_at),
            updatedAt: new Date(entry.updated_at || entry.created_at)
          }));
        }
      } catch (error) {
        console.warn('Supabase diary entries fetch failed, using local storage');
      }
    }

    return super.getUserDiaryEntries(userId);
  }

  // Goal operations with Supabase integration
  async createGoal(goalData: any) {
    // Create in local storage first (immediate response)
    const localResult = await super.createGoal(goalData);

    // Then sync to Supabase in background
    if (this.supabaseAvailable) {
      try {
        await this.supabase.from('goals').insert({
          user_id: goalData.userId,
          title: goalData.title,
          description: goalData.description,
          category: goalData.category,
          status: goalData.status || 'active',
          progress: goalData.progress || 0,
          target_date: goalData.targetDate?.toISOString()?.split('T')[0],
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Supabase goal creation failed');
      }
    }

    return localResult;
  }

  async getUserGoals(userId: string) {
    if (this.supabaseAvailable) {
      try {
        const { data, error } = await this.supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (data && !error) {
          return data.map((goal: any) => ({
            id: parseInt(goal.id) || Date.now(),
            userId: goal.user_id,
            title: goal.title,
            description: goal.description,
            category: goal.category,
            type: 'personal',
            status: goal.status,
            progress: goal.progress,
            targetDate: goal.target_date ? new Date(goal.target_date) : null,
            createdAt: new Date(goal.created_at),
            updatedAt: new Date(goal.updated_at || goal.created_at)
          }));
        }
      } catch (error) {
        console.warn('Supabase goals fetch failed, using local storage');
      }
    }

    return super.getUserGoals(userId);
  }

  async updateGoal(goalId: number, goalData: any) {
    // Update local storage first (immediate response)
    const localResult = await super.updateGoal(goalId, goalData);

    // Then sync to Supabase in background
    if (this.supabaseAvailable) {
      try {
        await this.supabase.from('goals').update({
          title: goalData.title,
          description: goalData.description,
          status: goalData.status,
          progress: goalData.progress,
          target_date: goalData.targetDate?.toISOString()?.split('T')[0],
          updated_at: new Date().toISOString()
        }).eq('id', goalId);
      } catch (error) {
        console.warn('Supabase goal update failed');
      }
    }

    return localResult;
  }

  // Session and message operations
  async createSession(insertSession: any) {
    const localResult = await super.createSession(insertSession);

    // Sync to Supabase in background
    if (this.supabaseAvailable) {
      try {
        await this.supabase.from('sessions').insert({
          user_id: 'anonymous',
          persona_id: insertSession.personaId || 'sarah',
          persona_name: insertSession.personaName || 'Dr. Sarah',
          start_time: new Date().toISOString(),
          status: 'active',
          summary: insertSession.summary,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Supabase session creation failed');
      }
    }

    return localResult;
  }

  async createMessage(insertMessage: any) {
    const localResult = await super.createMessage(insertMessage);

    // Sync to Supabase in background
    if (this.supabaseAvailable) {
      try {
        await this.supabase.from('messages').insert({
          session_id: insertMessage.conversationId?.toString() || 'default',
          user_id: 'anonymous',
          sender: insertMessage.sender,
          content: insertMessage.content,
          emotion_detected: insertMessage.emotionDetected,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Supabase message creation failed');
      }
    }

    return localResult;
  }

  // Mood tracking with Supabase integration
  async createMoodEntry(entryData: any) {
    const localResult = await super.createMoodEntry(entryData);

    // Sync to Supabase in background
    if (this.supabaseAvailable) {
      try {
        await this.supabase.from('mood_entries').insert({
          user_id: entryData.userId || 'anonymous',
          mood: entryData.mood,
          energy_level: entryData.energyLevel,
          notes: entryData.notes,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Supabase mood entry creation failed');
      }
    }

    return localResult;
  }

  async getUserMoodEntries(userId: string) {
    if (this.supabaseAvailable) {
      try {
        const { data, error } = await this.supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (data && !error) {
          return data.map((entry: any) => ({
            id: parseInt(entry.id) || Date.now(),
            userId: entry.user_id,
            mood: entry.mood,
            energyLevel: entry.energy_level,
            notes: entry.notes,
            createdAt: new Date(entry.created_at)
          }));
        }
      } catch (error) {
        console.warn('Supabase mood entries fetch failed, using local storage');
      }
    }

    return super.getUserMoodEntries(userId);
  }
}