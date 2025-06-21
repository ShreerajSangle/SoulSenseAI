import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, User, Settings, Target, Shield, Plus, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  preferences: {
    preferredPersona: string;
    voiceEnabled: boolean;
    darkMode: boolean;
    notifications: {
      dailyCheckins: boolean;
      sessionReminders: boolean;
      progressUpdates: boolean;
    };
    privacy: {
      shareAnalytics: boolean;
      dataRetention: string;
    };
  };
  goals: string[];
  interests: string[];
  stats: {
    sessions: number;
    dayStreak: number;
    messages: number;
    avgMood: number;
    memberSince: string;
    lastActive: string;
    favoritePersona: string;
  };
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [newGoal, setNewGoal] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/profile'],
    retry: false,
  });

  // Load personas for dropdown
  const { data: personas } = useQuery({
    queryKey: ['/api/personas'],
    retry: false,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: Partial<UserProfile>) => {
      return await apiRequest('/api/profile', {
        method: 'PUT',
        body: updatedProfile,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize profile data
  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
    } else {
      // Default profile structure
      setProfile({
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
      });
    }
  }, [profileData]);

  const handleSave = () => {
    updateProfileMutation.mutate(profile);
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
    
    // Auto-save preferences
    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: value,
      },
    };
    updateProfileMutation.mutate(updatedProfile);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences?.notifications,
          [key]: value,
        },
      },
    }));

    // Auto-save notification preferences
    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        notifications: {
          ...profile.preferences?.notifications,
          [key]: value,
        },
      },
    };
    updateProfileMutation.mutate(updatedProfile);
  };

  const handlePrivacyChange = (key: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        privacy: {
          ...prev.preferences?.privacy,
          [key]: value,
        },
      },
    }));

    // Auto-save privacy preferences
    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        privacy: {
          ...profile.preferences?.privacy,
          [key]: value,
        },
      },
    };
    updateProfileMutation.mutate(updatedProfile);
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setProfile(prev => ({
        ...prev,
        goals: [...(prev.goals || []), newGoal.trim()],
      }));
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals?.filter((_, i) => i !== index) || [],
    }));
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setProfile(prev => ({
        ...prev,
        interests: [...(prev.interests || []), newInterest.trim()],
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleDataDownload = () => {
    toast({
      title: "Data Export Requested",
      description: "Your data export will be sent to your email within 24 hours.",
    });
  };

  const handleAccountDeletion = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account and personalize your SoulSense experience
            </p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Goals & Interests
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy & Data
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {profile.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      {isEditing ? (
                        <Input
                          value={profile.name || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{profile.name || 'User'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      {isEditing ? (
                        <Input
                          value={profile.email || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{profile.email || 'user@example.com'}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                  {isEditing ? (
                    <Textarea
                      value={profile.bio || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{profile.bio || 'Tell us about yourself...'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your SoulSense Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile.stats?.sessions || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profile.stats?.dayStreak || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{profile.stats?.messages || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Messages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{profile.stats?.avgMood || 5}/10</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Mood</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>Member since {profile.stats?.memberSince || '21/06/2025'}</p>
                  <p>Last active {profile.stats?.lastActive || '21/06/2025'}</p>
                  <p>Favorite persona: {profile.stats?.favoritePersona || 'sarah'}</p>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                  Save Changes
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Persona</label>
                  <Select
                    value={profile.preferences?.preferredPersona || 'dr-sarah'}
                    onValueChange={(value) => handlePreferenceChange('preferredPersona', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr-sarah">Dr. Sarah (Therapist)</SelectItem>
                      <SelectItem value="alex">Alex (Peer Support)</SelectItem>
                      <SelectItem value="marcus">Marcus (Life Coach)</SelectItem>
                      <SelectItem value="maya">Maya (Mindfulness Guide)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Voice Interface</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Enable speech-to-text and text-to-speech</div>
                  </div>
                  <Switch
                    checked={profile.preferences?.voiceEnabled || false}
                    onCheckedChange={(checked) => handlePreferenceChange('voiceEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Use dark theme throughout the app</div>
                  </div>
                  <Switch
                    checked={profile.preferences?.darkMode || false}
                    onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Daily Check-ins</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Remind me to log my daily mood</div>
                  </div>
                  <Switch
                    checked={profile.preferences?.notifications?.dailyCheckins || false}
                    onCheckedChange={(checked) => handleNotificationChange('dailyCheckins', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Session Reminders</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Notify me about scheduled therapy sessions</div>
                  </div>
                  <Switch
                    checked={profile.preferences?.notifications?.sessionReminders || false}
                    onCheckedChange={(checked) => handleNotificationChange('sessionReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Progress Updates</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Weekly summaries of my mental health journey</div>
                  </div>
                  <Switch
                    checked={profile.preferences?.notifications?.progressUpdates || false}
                    onCheckedChange={(checked) => handleNotificationChange('progressUpdates', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals & Interests Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Personal Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a personal goal..."
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                    />
                    <Button onClick={addGoal} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.goals?.map((goal, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {goal}
                        <button
                          onClick={() => removeGoal(index)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Interests & Hobbies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an interest..."
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    />
                    <Button onClick={addInterest} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests?.map((interest, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {interest}
                        <button
                          onClick={() => removeInterest(index)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Data Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Data Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Share Analytics</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Help improve SoulSense by sharing anonymous usage data</div>
                  </div>
                  <Switch
                    checked={profile.preferences?.privacy?.shareAnalytics || false}
                    onCheckedChange={(checked) => handlePrivacyChange('shareAnalytics', checked)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Retention</label>
                  <Select
                    value={profile.preferences?.privacy?.dataRetention || '2 Years'}
                    onValueChange={(value) => handlePrivacyChange('dataRetention', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6 Months">6 Months</SelectItem>
                      <SelectItem value="1 Year">1 Year</SelectItem>
                      <SelectItem value="2 Years">2 Years</SelectItem>
                      <SelectItem value="5 Years">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    How long to keep your conversation and mood data
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleDataDownload}>
                    Download My Data
                  </Button>
                  <Button variant="destructive" onClick={handleAccountDeletion}>
                    Delete Account
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can request a copy of your data or permanently delete your account at any time.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}