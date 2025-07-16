import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  User, Settings, Shield, Bell, Palette, Brain, Heart, Target, Save, Edit3, 
  Moon, Sun, Mic, MicOff, Download, Trash2, Plus, X, Camera, Sparkles,
  TrendingUp, Calendar, Award, MessageCircle, Zap, Globe, Lock, Eye,
  Volume2, VolumeX, Smartphone, Monitor, Sunset, Sunrise, Home, BookOpen,
  ArrowLeft, BarChart3
} from "lucide-react";
import { Link, useLocation } from "wouter";
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

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  preferences: {
    preferredPersona?: string;
    voiceEnabled?: boolean;
    darkMode?: boolean;
    notifications?: {
      dailyCheckins: boolean;
      sessionReminders: boolean;
      progressUpdates: boolean;
    };
    privacy?: {
      shareAnalytics: boolean;
      dataRetention: string;
    };
  };
  goals?: string[];
  interests?: string[];
  mentalHealthFocus?: string[];
  joinedDate: string;
  lastActive: string;
  stats?: {
    totalSessions: number;
    totalMessages: number;
    streakDays: number;
    favoritePersona: string;
    averageMood: number;
  };
}

const avatarOptions = [
  { id: 'avatar1', src: '/avatars/avatar1.jpg', name: 'Peaceful' },
  { id: 'avatar2', src: '/avatars/avatar2.jpg', name: 'Confident' },
  { id: 'avatar3', src: '/avatars/avatar3.jpg', name: 'Gentle' },
  { id: 'avatar4', src: '/avatars/avatar4.jpg', name: 'Vibrant' },
  { id: 'avatar5', src: '/avatars/avatar5.jpg', name: 'Serene' },
  { id: 'avatar6', src: '/avatars/avatar6.jpg', name: 'Joyful' }
];

const commonInterests = [
  'Mindfulness', 'Meditation', 'Yoga', 'Reading', 'Music', 'Art', 'Nature',
  'Travel', 'Cooking', 'Exercise', 'Photography', 'Writing', 'Gaming',
  'Technology', 'Learning', 'Volunteering', 'Dancing', 'Gardening'
];

const mentalHealthFocusOptions = [
  'Anxiety Management', 'Stress Relief', 'Depression Support', 'Sleep Improvement',
  'Emotional Regulation', 'Mindfulness Practice', 'Confidence Building',
  'Relationship Support', 'Work-Life Balance', 'Self-Care', 'Trauma Recovery',
  'Grief Support', 'Addiction Recovery', 'ADHD Management'
];

export default function RedesignedProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await apiRequest("/api/profile", "GET");
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      const response = await apiRequest("/api/profile", "PUT", profileData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      setEditedProfile({});
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "There was an error saving your profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (profile && isEditing) {
      setEditedProfile(profile);
    }
    if (profile?.preferences?.darkMode !== undefined) {
      setIsDarkMode(profile.preferences.darkMode);
    }
  }, [profile, isEditing]);

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editedProfile);
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    const updatedProfile = {
      ...editedProfile,
      preferences: {
        ...editedProfile.preferences,
        darkMode: enabled
      }
    };
    setEditedProfile(updatedProfile);
    updateProfileMutation.mutate(updatedProfile);
  };

  const handleAvatarSelect = (avatar: string) => {
    setEditedProfile(prev => ({ ...prev, avatar }));
    setShowAvatarSelector(false);
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setEditedProfile(prev => ({
        ...prev,
        goals: [...(prev.goals || []), newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setEditedProfile(prev => ({
      ...prev,
      goals: prev.goals?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddInterest = (interest: string) => {
    if (!editedProfile.interests?.includes(interest)) {
      setEditedProfile(prev => ({
        ...prev,
        interests: [...(prev.interests || []), interest]
      }));
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setEditedProfile(prev => ({
      ...prev,
      interests: prev.interests?.filter(i => i !== interest) || []
    }));
  };

  const handleCustomInterestAdd = () => {
    if (newInterest.trim() && !editedProfile.interests?.includes(newInterest.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        interests: [...(prev.interests || []), newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation('/therapeutic-journey')}
              className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-pink-200 dark:border-pink-600 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-xl"
            >
              <BarChart3 className="w-4 h-4" />
              Journey
            </Button>
          </div>
        </div>
        
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
          <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                
                {/* Avatar Section */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <Avatar className="relative w-32 h-32 border-4 border-white dark:border-gray-700 shadow-xl">
                    <AvatarImage src={editedProfile.avatar || profile?.avatar} alt={profile?.name} />
                    <AvatarFallback className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                      {profile?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-white dark:bg-gray-800 shadow-lg border-2"
                      onClick={() => setShowAvatarSelector(true)}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left space-y-4">
                  <div className="space-y-2">
                    {isEditing ? (
                      <Input
                        value={editedProfile.name || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="text-3xl font-bold bg-transparent border-2 border-purple-200 dark:border-purple-600 rounded-xl focus:border-purple-400 dark:focus:border-purple-400"
                        placeholder="Your Name"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {profile?.name || 'Your Name'}
                      </h1>
                    )}
                    
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 dark:text-gray-400">
                      <Globe className="w-4 h-4" />
                      <span>{profile?.email}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    {isEditing ? (
                      <Textarea
                        value={editedProfile.bio || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="bg-white/50 dark:bg-gray-800/50 border-2 border-purple-200 dark:border-purple-600 rounded-xl focus:border-purple-400 dark:focus:border-purple-400"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300 max-w-md">
                        {profile?.bio || "Share something about yourself..."}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={updateProfileMutation.isPending}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg rounded-xl px-6"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setEditedProfile({});
                          }}
                          className="rounded-xl px-6"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg rounded-xl px-6"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {profile?.stats?.streakDays || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {profile?.stats?.totalSessions || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Hub */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Access Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => setLocation('/chat')}
                className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-700 dark:text-purple-300 hover:from-purple-200 hover:to-purple-300 dark:hover:from-purple-800/50 dark:hover:to-purple-700/50 border-0 rounded-2xl"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm font-medium">Chat</span>
              </Button>
              
              <Button
                onClick={() => setLocation('/diary')}
                className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/30 dark:to-rose-800/30 text-pink-700 dark:text-pink-300 hover:from-pink-200 hover:to-rose-300 dark:hover:from-pink-800/50 dark:hover:to-rose-700/50 border-0 rounded-2xl"
              >
                <Heart className="w-6 h-6" />
                <span className="text-sm font-medium">Diary</span>
              </Button>
              
              <Button
                onClick={() => setLocation('/therapeutic-journey')}
                className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-900/30 dark:to-blue-800/30 text-indigo-700 dark:text-indigo-300 hover:from-indigo-200 hover:to-blue-300 dark:hover:from-indigo-800/50 dark:hover:to-blue-700/50 border-0 rounded-2xl"
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm font-medium">Journey</span>
              </Button>
              
              <Button
                onClick={() => setLocation('/clinical-assessment')}
                className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/30 dark:to-teal-800/30 text-emerald-700 dark:text-emerald-300 hover:from-emerald-200 hover:to-teal-300 dark:hover:from-emerald-800/50 dark:hover:to-teal-700/50 border-0 rounded-2xl"
              >
                <Brain className="w-6 h-6" />
                <span className="text-sm font-medium">Assessment</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border-0">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="goals" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Journey Progress */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Your Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Wellness Score</span>
                      <span className="text-sm font-bold text-purple-600">{Math.round((profile?.stats?.averageMood || 5) * 10)}%</span>
                    </div>
                    <Progress value={(profile?.stats?.averageMood || 5) * 10} className="h-3 bg-gray-200 dark:bg-gray-700" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                      <MessageCircle className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                      <div className="text-lg font-bold text-purple-600">{profile?.stats?.totalMessages || 0}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Messages</div>
                    </div>
                    <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/30 rounded-xl">
                      <Calendar className="w-5 h-5 mx-auto text-pink-600 mb-1" />
                      <div className="text-lg font-bold text-pink-600">{profile?.stats?.streakDays || 0}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interests */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Interests
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {(profile?.interests || []).map((interest: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0">
                          {interest}
                        </Badge>
                      ))}
                      {(!profile?.interests || profile.interests.length === 0) && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No interests added yet</p>
                      )}
                    </div>
                    
                    {isEditing && (
                      <div className="space-y-3 mt-4">
                        <div className="flex flex-wrap gap-2">
                          {commonInterests.filter(interest => !editedProfile.interests?.includes(interest)).map((interest) => (
                            <Badge
                              key={interest}
                              variant="outline"
                              className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700"
                              onClick={() => handleAddInterest(interest)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {interest}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            placeholder="Add custom interest..."
                            className="flex-1 rounded-xl"
                            onKeyPress={(e) => e.key === 'Enter' && handleCustomInterestAdd()}
                          />
                          <Button size="sm" onClick={handleCustomInterestAdd} className="rounded-xl">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Mental Health Focus */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Focus Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {(profile?.mentalHealthFocus || []).map((focus: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-0">
                          {focus}
                        </Badge>
                      ))}
                      {(!profile?.mentalHealthFocus || profile.mentalHealthFocus.length === 0) && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No focus areas selected</p>
                      )}
                    </div>
                    
                    {isEditing && (
                      <div className="space-y-3 mt-4">
                        <div className="flex flex-wrap gap-2">
                          {mentalHealthFocusOptions.filter(focus => !editedProfile.mentalHealthFocus?.includes(focus)).map((focus) => (
                            <Badge
                              key={focus}
                              variant="outline"
                              className="cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/30 border-pink-200 dark:border-pink-700 text-xs"
                              onClick={() => setEditedProfile(prev => ({
                                ...prev,
                                mentalHealthFocus: [...(prev.mentalHealthFocus || []), focus]
                              }))}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {focus}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Appearance Settings */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {/* Dark Mode Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      {isDarkMode ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5 text-yellow-600" />}
                      <div>
                        <Label className="text-base font-medium">Dark Mode</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark themes</p>
                      </div>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={handleDarkModeToggle}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-indigo-500"
                    />
                  </div>

                  {/* Voice Settings */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      {editedProfile.preferences?.voiceEnabled ? <Volume2 className="w-5 h-5 text-green-600" /> : <VolumeX className="w-5 h-5 text-gray-600" />}
                      <div>
                        <Label className="text-base font-medium">Voice Interface</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Enable voice interactions</p>
                      </div>
                    </div>
                    <Switch
                      checked={editedProfile.preferences?.voiceEnabled || false}
                      onCheckedChange={(checked) => 
                        setEditedProfile(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            voiceEnabled: checked
                          }
                        }))
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
                    />
                  </div>

                  {/* Preferred Persona */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Preferred Persona</Label>
                    <Select
                      value={editedProfile.preferences?.preferredPersona || profile?.preferences?.preferredPersona || ''}
                      onValueChange={(value) => 
                        setEditedProfile(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            preferredPersona: value
                          }
                        }))
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                        <SelectValue placeholder="Choose your preferred persona" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50">
                        <SelectItem value="sarah" className="hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30">Dr. Sarah - Clinical Psychologist</SelectItem>
                        <SelectItem value="alex" className="hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30">Alex - Peer Support</SelectItem>
                        <SelectItem value="marcus" className="hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30">Marcus - Life Coach</SelectItem>
                        <SelectItem value="maya" className="hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30">Maya - Mindfulness Guide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <div>
                      <Label className="text-base font-medium">Daily Check-ins</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gentle reminders for daily wellness</p>
                    </div>
                    <Switch
                      checked={editedProfile.preferences?.notifications?.dailyCheckins || false}
                      onCheckedChange={(checked) => 
                        setEditedProfile(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences?.notifications,
                              dailyCheckins: checked
                            }
                          }
                        }))
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <div>
                      <Label className="text-base font-medium">Session Reminders</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reminders for scheduled sessions</p>
                    </div>
                    <Switch
                      checked={editedProfile.preferences?.notifications?.sessionReminders || false}
                      onCheckedChange={(checked) => 
                        setEditedProfile(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences?.notifications,
                              sessionReminders: checked
                            }
                          }
                        }))
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <div>
                      <Label className="text-base font-medium">Progress Updates</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Weekly progress summaries</p>
                    </div>
                    <Switch
                      checked={editedProfile.preferences?.notifications?.progressUpdates || false}
                      onCheckedChange={(checked) => 
                        setEditedProfile(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences?.notifications,
                              progressUpdates: checked
                            }
                          }
                        }))
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-rose-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Personal Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {(editedProfile.goals || profile?.goals || []).map((goal, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-800 dark:text-green-300">{goal}</span>
                      </div>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveGoal(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {(!profile?.goals || profile.goals.length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No goals set yet. Add your first goal to get started!</p>
                    </div>
                  )}
                  
                  {isEditing && (
                    <div className="flex gap-2 mt-4">
                      <Input
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Add a new goal..."
                        className="flex-1 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-600 rounded-xl focus:border-green-400 dark:focus:border-green-400"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                      />
                      <Button onClick={handleAddGoal} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl px-6">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Goal
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Privacy Settings */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <div>
                        <Label className="text-base font-medium">Share Analytics</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Help improve SoulSense with anonymous data</p>
                      </div>
                    </div>
                    <Switch
                      checked={editedProfile.preferences?.privacy?.shareAnalytics || false}
                      onCheckedChange={(checked) => 
                        setEditedProfile(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            privacy: {
                              ...prev.preferences?.privacy,
                              shareAnalytics: checked
                            }
                          }
                        }))
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium">Data Retention</Label>
                    <Select
                      value={editedProfile.preferences?.privacy?.dataRetention || profile?.preferences?.privacy?.dataRetention || '1year'}
                      onValueChange={(value) => 
                        setEditedProfile(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            privacy: {
                              ...prev.preferences?.privacy,
                              dataRetention: value
                            }
                          }
                        }))
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50">
                        <SelectItem value="3months" className="hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30">3 Months</SelectItem>
                        <SelectItem value="6months" className="hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30">6 Months</SelectItem>
                        <SelectItem value="1year" className="hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30">1 Year</SelectItem>
                        <SelectItem value="2years" className="hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30">2 Years</SelectItem>
                        <SelectItem value="forever" className="hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30">Keep Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 hover:bg-red-600 rounded-xl">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Choose Your Avatar
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAvatarSelector(false)}
                  className="rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {avatarOptions.map((avatar) => (
                  <div
                    key={avatar.id}
                    className="text-center cursor-pointer group"
                    onClick={() => handleAvatarSelect(avatar.src)}
                  >
                    <div className="relative">
                      <Avatar className="w-16 h-16 mx-auto mb-2 group-hover:scale-110 transition-transform border-2 border-transparent group-hover:border-purple-400">
                        <AvatarImage src={avatar.src} alt={avatar.name} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                          {avatar.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{avatar.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}