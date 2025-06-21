import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Settings, Shield, Bell, Palette, Brain, Heart, Target, Save, Edit3, Moon, Sun, Mic, MicOff, Download, Trash2, Plus, X, Volume2, VolumeX } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/components/theme-provider";

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
  privacySettings: {
    shareAnalytics: boolean;
    dataRetention: string;
    allowDataExport: boolean;
  };
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

export default function EnhancedProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [newGoal, setNewGoal] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  // Fetch user profile
  const { data: profileData, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile/anonymous"],
    retry: false,
  });

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setVoiceEnabled(profileData.preferences?.voiceEnabled || false);
      
      // Sync theme with profile preference
      if (profileData.preferences?.darkMode !== undefined) {
        setTheme(profileData.preferences.darkMode ? "dark" : "light");
      }
    }
  }, [profileData, setTheme]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const response = await apiRequest("/api/profile/anonymous", "PUT", updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile/anonymous"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Unable to save your profile changes.",
        variant: "destructive",
      });
    }
  });

  // Dark mode toggle handler
  const handleDarkModeToggle = (enabled: boolean) => {
    const newTheme = enabled ? "dark" : "light";
    setTheme(newTheme);
    
    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        darkMode: enabled
      }
    };
    
    setProfile(updatedProfile);
    updateProfileMutation.mutate(updatedProfile);
  };

  // Voice interface toggle handler
  const handleVoiceToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setVoiceEnabled(true);
        toast({
          title: "Voice Interface Enabled",
          description: "You can now use speech-to-text and text-to-speech features.",
        });
      } catch (error) {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice features.",
          variant: "destructive",
        });
        return;
      }
    } else {
      setVoiceEnabled(false);
    }

    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        voiceEnabled: enabled
      }
    };
    
    setProfile(updatedProfile);
    updateProfileMutation.mutate(updatedProfile);
  };

  // Text-to-speech functionality
  const speakText = (text: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Add goal handler
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      const updatedGoals = [...(profile.goals || []), newGoal.trim()];
      const updatedProfile = { ...profile, goals: updatedGoals };
      setProfile(updatedProfile);
      updateProfileMutation.mutate(updatedProfile);
      setNewGoal("");
    }
  };

  // Remove goal handler
  const handleRemoveGoal = (index: number) => {
    const updatedGoals = (profile.goals || []).filter((_, i) => i !== index);
    const updatedProfile = { ...profile, goals: updatedGoals };
    setProfile(updatedProfile);
    updateProfileMutation.mutate(updatedProfile);
  };

  // Add interest handler
  const handleAddInterest = () => {
    if (newInterest.trim()) {
      const updatedInterests = [...(profile.interests || []), newInterest.trim()];
      const updatedProfile = { ...profile, interests: updatedInterests };
      setProfile(updatedProfile);
      updateProfileMutation.mutate(updatedProfile);
      setNewInterest("");
    }
  };

  // Remove interest handler
  const handleRemoveInterest = (index: number) => {
    const updatedInterests = (profile.interests || []).filter((_, i) => i !== index);
    const updatedProfile = { ...profile, interests: updatedInterests };
    setProfile(updatedProfile);
    updateProfileMutation.mutate(updatedProfile);
  };

  // Privacy settings handler
  const handlePrivacyUpdate = (key: string, value: any) => {
    const updatedProfile = {
      ...profile,
      privacySettings: {
        ...profile.privacySettings,
        [key]: value
      }
    };
    setProfile(updatedProfile);
    updateProfileMutation.mutate(updatedProfile);
  };

  // Data export handler
  const handleDataExport = async () => {
    try {
      const response = await fetch('/api/profile/anonymous/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'soulsense-data-export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Data Export Complete",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Account deletion handler
  const handleAccountDeletion = async () => {
    try {
      await apiRequest("/api/profile/anonymous/delete-account", "DELETE", {
        confirmDeletion: true
      });
      
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Unable to delete your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20 border-4 border-white/20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="bg-white/20 text-2xl font-bold">
                  {profile.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{profile.name || 'Your Profile'}</h1>
                <p className="text-purple-100">{profile.email}</p>
                <p className="text-sm text-purple-200">
                  Member since {new Date(profile.joinedDate || '').toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {voiceEnabled && (
                <Button
                  variant={isSpeaking ? "destructive" : "secondary"}
                  size="sm"
                  onClick={isSpeaking ? stopSpeaking : () => speakText("Welcome to your SoulSense profile")}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="goals">Goals & Interests</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name || ''}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                </div>
                {isEditing && (
                  <Button
                    onClick={() => updateProfileMutation.mutate(profile)}
                    disabled={updateProfileMutation.isPending}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Profile Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Journey Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile.stats?.totalSessions || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile.stats?.totalMessages || 0}</div>
                    <div className="text-sm text-muted-foreground">Messages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile.stats?.streakDays || 0}</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile.stats?.averageMood || 0}</div>
                    <div className="text-sm text-muted-foreground">Avg Mood</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="space-y-6">
              {/* Theme Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Theme & Display
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Switch between light and dark themes
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sun className="w-4 h-4" />
                      <Switch
                        checked={theme === "dark"}
                        onCheckedChange={handleDarkModeToggle}
                      />
                      <Moon className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Voice Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mic className="w-5 h-5 mr-2" />
                    Voice Interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Voice Features</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable speech-to-text and text-to-speech functionality
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MicOff className="w-4 h-4" />
                      <Switch
                        checked={voiceEnabled}
                        onCheckedChange={handleVoiceToggle}
                      />
                      <Mic className="w-4 h-4" />
                    </div>
                  </div>
                  {voiceEnabled && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        Voice features are now enabled! You can use speech-to-text in chat sessions
                        and hear AI responses spoken aloud.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Check-ins</Label>
                      <p className="text-sm text-muted-foreground">
                        Reminders for mood tracking
                      </p>
                    </div>
                    <Switch
                      checked={profile.preferences?.notifications?.dailyCheckins || false}
                      onCheckedChange={(checked) => {
                        const updatedProfile = {
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            notifications: {
                              ...profile.preferences?.notifications,
                              dailyCheckins: checked
                            }
                          }
                        };
                        setProfile(updatedProfile);
                        updateProfileMutation.mutate(updatedProfile);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Regular therapy session prompts
                      </p>
                    </div>
                    <Switch
                      checked={profile.preferences?.notifications?.sessionReminders || false}
                      onCheckedChange={(checked) => {
                        const updatedProfile = {
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            notifications: {
                              ...profile.preferences?.notifications,
                              sessionReminders: checked
                            }
                          }
                        };
                        setProfile(updatedProfile);
                        updateProfileMutation.mutate(updatedProfile);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Progress Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly progress summaries
                      </p>
                    </div>
                    <Switch
                      checked={profile.preferences?.notifications?.progressUpdates || false}
                      onCheckedChange={(checked) => {
                        const updatedProfile = {
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            notifications: {
                              ...profile.preferences?.notifications,
                              progressUpdates: checked
                            }
                          }
                        };
                        setProfile(updatedProfile);
                        updateProfileMutation.mutate(updatedProfile);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals & Interests Tab */}
          <TabsContent value="goals">
            <div className="space-y-6">
              {/* Personal Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Personal Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Add a new goal..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                    />
                    <Button onClick={handleAddGoal} disabled={!newGoal.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(profile.goals || []).map((goal, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{goal}</span>
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => handleRemoveGoal(index)}
                        />
                      </Badge>
                    ))}
                    {(!profile.goals || profile.goals.length === 0) && (
                      <p className="text-sm text-muted-foreground">No goals added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Interests & Hobbies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Interests & Hobbies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                    />
                    <Button onClick={handleAddInterest} disabled={!newInterest.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(profile.interests || []).map((interest, index) => (
                      <Badge key={index} variant="outline" className="flex items-center space-x-1">
                        <span>{interest}</span>
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => handleRemoveInterest(index)}
                        />
                      </Badge>
                    ))}
                    {(!profile.interests || profile.interests.length === 0) && (
                      <p className="text-sm text-muted-foreground">No interests added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy & Data Tab */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Privacy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve SoulSense by sharing anonymous usage data
                      </p>
                    </div>
                    <Switch
                      checked={profile.privacySettings?.shareAnalytics || false}
                      onCheckedChange={(checked) => handlePrivacyUpdate('shareAnalytics', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Retention Period</Label>
                    <Select
                      value={profile.privacySettings?.dataRetention || "1year"}
                      onValueChange={(value) => handlePrivacyUpdate('dataRetention', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 months</SelectItem>
                        <SelectItem value="6months">6 months</SelectItem>
                        <SelectItem value="1year">1 year</SelectItem>
                        <SelectItem value="2years">2 years</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Download My Data</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Export all your personal data in JSON format for your records or to transfer to another service.
                      </p>
                      <Button onClick={handleDataExport} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Data
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2 text-destructive">Delete Account</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove all your data from our servers, including:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Profile information and settings</li>
                                <li>All conversation history</li>
                                <li>Goals and progress tracking</li>
                                <li>Mood entries and assessments</li>
                                <li>All personal data and preferences</li>
                              </ul>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleAccountDeletion}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, delete my account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}