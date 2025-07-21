// This file has been modified to disable Supabase integration for local-only operation.

class SupabaseSyncService {
  private syncEnabled: boolean = false;

  constructor() {
    console.log('Supabase sync service: Disabled for local-only operation.');
  }

  // All sync methods are no-ops when disabled
  async syncProfile(userId: string, profileData: any) {}
  async syncDiaryEntry(userId: string, entryData: any) {}
  async syncGoal(userId: string, goalData: any) {}
  async syncGoalUpdate(goalId: string, goalData: any) {}
  async syncSession(userId: string, sessionData: any) {}
  async syncMessage(userId: string, sessionId: string, messageData: any) {}
  async syncMoodEntry(userId: string, moodData: any) {}
  async syncSessionRecap(userId: string, recapId: string, recapData: any) {}

  getSyncStatus() {
    return {
      available: false,
      enabled: false
    };
  }
}

export const supabaseSync = new SupabaseSyncService();
