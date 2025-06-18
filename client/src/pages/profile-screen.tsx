import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Settings, Shield, Bell, Palette, Brain, Heart, Target, Save, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
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
  mentalHealthFocus: string[];
  joinedDate: string;
  lastActive: string;
  stats: {
    totalSessions: number;
    totalMessages: number;
    streakDays: number;
    favoritePersona: string;
    averageMood: number;
  };
}

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = "anonymous"; // TODO: Replace with actual user ID from auth

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile", userId],
    queryFn: async () => {
      const response = await apiRequest(`/api/profile/${userId}`, "GET");
      return await response.json();
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      const response = await apiRequest(`/api/profile/${userId}`, "PUT", profileData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      setEditedProfile({});
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    }
  });

  useEffect(() => {
    if (profile && isEditing) {
      setEditedProfile(profile);
    }
  }, [profile, isEditing]);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editedProfile);
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences?.notifications,
          [key]: value
        }
      }
    }));
  };

  const handlePrivacyChange = (key: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        privacy: {
          ...prev.preferences?.privacy,
          [key]: value
        }
      }
    }));
  };

  const addGoal = (goal: string) => {
    if (goal && !editedProfile.goals?.includes(goal)) {
      setEditedProfile(prev => ({
        ...prev,
        goals: [...(prev.goals || []), goal]
      }));
    }
  };

  const removeGoal = (goalToRemove: string) => {
    setEditedProfile(prev => ({
      ...prev,
      goals: prev.goals?.filter(goal => goal !== goalToRemove) || []
    }));
  };

  const addInterest = (interest: string) => {
    if (interest && !editedProfile.interests?.includes(interest)) {
      setEditedProfile(prev => ({
        ...prev,
        interests: [...(prev.interests || []), interest]
      }));
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setEditedProfile(prev => ({
      ...prev,
      interests: prev.interests?.filter(interest => interest !== interestToRemove) || []
    }));
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">My Profile</h1>
              <p className="text-slate-600">Manage your account and personalize your SoulSense experience</p>
            </div>
            <Button
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              disabled={updateProfileMutation.isPending}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="goals">Goals & Interests</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-lg">
                      {profile.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={isEditing ? editedProfile.name || '' : profile.name}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={isEditing ? editedProfile.email || '' : profile.email}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={isEditing ? editedProfile.bio || '' : profile.bio || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your SoulSense Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile.stats?.totalSessions || 0}</div>
                    <div className="text-sm text-slate-600">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profile.stats?.streakDays || 0}</div>
                    <div className="text-sm text-slate-600">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{profile.stats?.totalMessages || 0}</div>
                    <div className="text-sm text-slate-600">Messages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{profile.stats?.averageMood || 0}/10</div>
                    <div className="text-sm text-slate-600">Avg Mood</div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="text-sm text-slate-600">
                  <p>Member since {new Date(profile.joinedDate).toLocaleDateString()}</p>
                  <p>Last active {new Date(profile.lastActive).toLocaleDateString()}</p>
                  {profile.stats?.favoritePersona && (
                    <p>Favorite persona: {profile.stats.favoritePersona}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Preferred Persona</Label>
                    <Select
                      value={isEditing ? editedProfile.preferences?.preferredPersona : profile.preferences?.preferredPersona}
                      onValueChange={(value) => handlePreferenceChange('preferredPersona', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your preferred persona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarah">Dr. Sarah (Therapist)</SelectItem>
                        <SelectItem value="alex">Alex (Peer Counselor)</SelectItem>
                        <SelectItem value="marcus">Marcus (Life Coach)</SelectItem>
                        <SelectItem value="maya">Maya (Mindfulness Expert)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Voice Interface</Label>
                      <p className="text-sm text-slate-600">Enable speech-to-text and text-to-speech</p>
                    </div>
                    <Switch
                      checked={isEditing ? editedProfile.preferences?.voiceEnabled : profile.preferences?.voiceEnabled}
                      onCheckedChange={(checked) => handlePreferenceChange('voiceEnabled', checked)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-slate-600">Use dark theme throughout the app</p>
                    </div>
                    <Switch
                      checked={isEditing ? editedProfile.preferences?.darkMode : profile.preferences?.darkMode}
                      onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Check-ins</Label>
                    <p className="text-sm text-slate-600">Remind me to log my daily mood</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedProfile.preferences?.notifications?.dailyCheckins : profile.preferences?.notifications?.dailyCheckins}
                    onCheckedChange={(checked) => handleNotificationChange('dailyCheckins', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Reminders</Label>
                    <p className="text-sm text-slate-600">Notify me about scheduled therapy sessions</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedProfile.preferences?.notifications?.sessionReminders : profile.preferences?.notifications?.sessionReminders}
                    onCheckedChange={(checked) => handleNotificationChange('sessionReminders', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Progress Updates</Label>
                    <p className="text-sm text-slate-600">Weekly summaries of my mental health journey</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedProfile.preferences?.notifications?.progressUpdates : profile.preferences?.notifications?.progressUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('progressUpdates', checked)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Personal Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(isEditing ? editedProfile.goals : profile.goals)?.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {goal}
                      {isEditing && (
                        <button
                          onClick={() => removeGoal(goal)}
                          className="ml-1 text-slate-500 hover:text-slate-700"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new goal..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addGoal(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addGoal(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Interests & Hobbies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(isEditing ? editedProfile.interests : profile.interests)?.map((interest, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => removeInterest(interest)}
                          className="ml-1 text-slate-500 hover:text-slate-700"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an interest..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addInterest(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addInterest(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
                    <Label>Share Analytics</Label>
                    <p className="text-sm text-slate-600">Help improve SoulSense by sharing anonymous usage data</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedProfile.preferences?.privacy?.shareAnalytics : profile.preferences?.privacy?.shareAnalytics}
                    onCheckedChange={(checked) => handlePrivacyChange('shareAnalytics', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>Data Retention</Label>
                  <Select
                    value={isEditing ? editedProfile.preferences?.privacy?.dataRetention : profile.preferences?.privacy?.dataRetention}
                    onValueChange={(value) => handlePrivacyChange('dataRetention', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose data retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-year">1 Year</SelectItem>
                      <SelectItem value="2-years">2 Years</SelectItem>
                      <SelectItem value="5-years">5 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-600 mt-1">How long to keep your conversation and mood data</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Data Management</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Download My Data
                    </Button>
                    <Button variant="outline" size="sm">
                      Delete Account
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    You can request a copy of your data or permanently delete your account at any time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isEditing && (
          <div className="flex gap-2 mt-6">
            <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Saving..." : "Save All Changes"}
            </Button>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setEditedProfile({});
            }}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}