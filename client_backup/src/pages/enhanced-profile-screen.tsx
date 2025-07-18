import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { format } from "date-fns";
import { 
  User, 
  Settings, 
  Target, 
  Heart, 
  Brain, 
  ArrowLeft,
  Sparkles,
  Edit,
  Save,
  Plus,
  CheckCircle,
  Circle,
  Calendar,
  TrendingUp,
  Award,
  BookOpen,
  BarChart3,
  MessageCircle
} from "lucide-react";

interface UserProfile {
  userId: string;
  name?: string;
  bio: string;
  pronouns?: string;
  moodTagline?: string;
  avatar: string | null;
  preferences: {
    favoritePersona: string;
    sessionFrequency: string;
    reminderTime: string;
    privacyLevel: string;
  };
  goals: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    targetDate: string;
    createdAt: string;
  }>;
  stats: {
    totalSessions: number;
    currentStreak: number;
    longestStreak: number;
    averageMood: number;
    favoriteEmotion: string;
  };
}

const goalCategories = {
  mental: { color: "from-blue-500 to-indigo-500", icon: Brain, accent: "bg-blue-50 text-blue-700 border-blue-200" },
  emotional: { color: "from-rose-500 to-pink-500", icon: Heart, accent: "bg-rose-50 text-rose-700 border-rose-200" },
  personal: { color: "from-green-500 to-emerald-500", icon: Target, accent: "bg-green-50 text-green-700 border-green-200" },
  social: { color: "from-purple-500 to-violet-500", icon: User, accent: "bg-purple-50 text-purple-700 border-purple-200" }
};

export default function EnhancedProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    pronouns: "",
    moodTagline: ""
  });
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "personal"
  });
  const [, setLocation] = useLocation();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const userId = "anonymous"; // In production, this would come from auth context

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile", userId],
    queryFn: async () => {
      const response = await fetch(`/api/profile?userId=${userId}`);
      if (!response.ok) {
        return {
          userId,
          name: "",
          bio: "",
          pronouns: "",
          moodTagline: "",
          avatar: null,
          preferences: {
            favoritePersona: "sarah",
            sessionFrequency: "daily",
            reminderTime: "9:00",
            privacyLevel: "private"
          },
        };
      }
      return response.json();
    }
  });

  const { data: goals = [] } = useQuery<any[]>({
    queryKey: ["/api/goals", userId],
    queryFn: async () => {
      const response = await fetch(`/api/goals?userId=${userId}`);
      if (!response.ok) return [];
      return response.json();
    }
  });

  // Fetch real dashboard analytics data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard", userId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/dashboard/${userId}`);
      if (!response.ok) {
        return {
          totalSessions: 0,
          currentStreak: 0,
          averageMood: 0,
          favoritePersona: "sarah",
          sessionHistory: [],
          moodTrends: [],
          goals: { total: 0, completed: 0, inProgress: 0 }
        };
      }
      return response.json();
    }
  });

  // Fetch recent session data
  const { data: recentSessions = [] } = useQuery({
    queryKey: ["/api/analytics/sessions", userId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/sessions/${userId}`);
      if (!response.ok) return [];
      return response.json();
    }
  });

  // Fetch mood entries
  const { data: moodEntries = [] } = useQuery({
    queryKey: ["/api/mood-entries", userId],
    queryFn: async () => {
      const response = await fetch(`/api/mood-entries?userId=${userId}`);
      if (!response.ok) return [];
      return response.json();
    }
  });

  // Fetch user conversations for activity tracking
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations", userId],
    queryFn: async () => {
      const response = await fetch(`/api/conversations?userId=${userId}`);
      if (!response.ok) return [];
      return response.json();
    }
  });



  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "anonymous",
          ...data
        })
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.setQueryData(["/api/profile"], data);
      setIsEditing(false);
      toast({
        title: "Profile updated! 🌸",
        description: "Your personal information has been saved successfully.",
      });
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/goals", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsGoalDialogOpen(false);
      toast({ title: "Goal created successfully!" });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/goals/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal updated successfully!" });
    },
  });

  // Initialize edit form when profile loads - MUST be before any early returns
  React.useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        bio: profile.bio || "",
        pronouns: profile.pronouns || "",
        moodTagline: profile.moodTagline || ""
      });
    }
  }, [profile]);

  // Early return for loading state - AFTER all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCreateGoal = () => {
    if (!newGoal.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a goal title.",
        variant: "destructive"
      });
      return;
    }
    createGoalMutation.mutate(newGoal);
  };

  // Handle form inputs
  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const completedGoals = goals.filter((goal: any) => goal.status === "completed").length;
  const activeGoals = goals.filter((goal: any) => goal.status === "active").length;

  // Calculate real statistics from fetched data
  const totalSessions = dashboardData?.totalSessions || 0;
  const currentStreak = dashboardData?.currentStreak || 0;
  const averageMood = dashboardData?.averageMood || 0;
  const favoritePersona = dashboardData?.favoritePersona || "sarah";

  // Early return for loading state - AFTER all hooks
  if (isLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-heading text-2xl font-normal bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Your Profile
                  </h1>
                  <p className="font-body text-xs text-gray-600 dark:text-gray-400 font-light">Manage your wellness journey and goals</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {goals.length} Goals
              </Badge>
              {!isEditing ? (
                <Button
                  onClick={startEditing}
                  variant="outline"
                  size="sm"
                  className="hover:bg-purple-50 hover:border-purple-300"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <Avatar className="w-32 h-32 ring-4 ring-white/50 shadow-xl">
              <AvatarImage src={profile?.avatar} alt="Profile" />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-4xl font-bold">
                {profile?.userId?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <h2 className="font-heading text-3xl font-normal text-gray-900 dark:text-gray-100 mb-2">
            Welcome Back{profile?.name ? `, ${profile.name}` : ''}!
          </h2>
          <p className="font-body text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto font-light">
            {profile?.bio || "Your wellness journey continues here. Track your progress and achieve your goals."}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 bg-white dark:bg-gray-800 rounded-2xl">
            <TabsTrigger value="overview" className="rounded-2xl">Overview</TabsTrigger>
            <TabsTrigger value="sessions" className="rounded-2xl">Sessions</TabsTrigger>
            <TabsTrigger value="goals" className="rounded-2xl">Goals</TabsTrigger>
            <TabsTrigger value="mood" className="rounded-2xl">Mood Trends</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-2xl">Settings</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <AnalyticsDashboard userId={profile?.userId || "anonymous"} />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-body text-2xl font-bold text-gray-900 dark:text-gray-100">{totalSessions}</h3>
                  <p className="font-body text-sm text-gray-600 dark:text-gray-400 font-medium">Total Sessions</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentStreak}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Current Streak</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Award className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedGoals}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Goals Achieved</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {averageMood ? averageMood.toFixed(1) : "—"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg Mood</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversations.length > 0 ? (
                  <div className="space-y-4">
                    {conversations.slice(0, 5).map((conversation: any) => (
                      <div key={conversation.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-sm font-medium text-gray-900 dark:text-gray-100">
                            Chat with {conversation.persona?.name || conversation.personaId}
                          </p>
                          <p className="font-body text-xs text-gray-600 dark:text-gray-400">
                            {format(new Date(conversation.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {goals.filter((goal: any) => goal.status === 'completed').slice(0, 3).map((goal: any) => (
                      <div key={goal.id} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-sm font-medium text-gray-900 dark:text-gray-100">
                            Completed: {goal.title}
                          </p>
                          <p className="font-body text-xs text-gray-600 dark:text-gray-400">
                            {goal.completedDate ? format(new Date(goal.completedDate), 'MMM d, yyyy') : 'Recently'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {moodEntries.slice(0, 2).map((entry: any) => (
                      <div key={entry.id} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <Heart className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-sm font-medium text-gray-900 dark:text-gray-100">
                            Mood logged: {entry.moodRating}/5
                          </p>
                          <p className="font-body text-xs text-gray-600 dark:text-gray-400">
                            {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    Your recent wellness activities will appear here as you engage with SoulSense.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Session Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                      <span className="font-bold text-lg">{totalSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Conversations</span>
                      <span className="font-bold text-lg">{conversations.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Favorite Persona</span>
                      <span className="font-bold text-lg capitalize">{favoritePersona}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Session Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['sarah', 'alex', 'marcus', 'maya'].map((personaId) => {
                      const personaSessions = conversations.filter((c: any) => c.personaId === personaId);
                      const personaName = personaId === 'sarah' ? 'Dr. Sarah' : personaId === 'alex' ? 'Alex' : personaId === 'marcus' ? 'Marcus' : 'Maya';
                      return (
                        <div key={personaId} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{personaName}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 transition-all duration-300"
                                style={{ 
                                  width: `${conversations.length ? (personaSessions.length / conversations.length) * 100 : 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">{personaSessions.length}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                {conversations.length > 0 ? (
                  <div className="space-y-3">
                    {conversations.slice(0, 8).map((conversation: any) => (
                      <div key={conversation.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-sm font-medium text-gray-900 dark:text-gray-100">
                            {conversation.title || `Chat with ${conversation.persona?.name || conversation.personaId}`}
                          </p>
                          <p className="font-body text-xs text-gray-600 dark:text-gray-400">
                            {format(new Date(conversation.createdAt), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {conversation.persona?.name || conversation.personaId}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No conversations yet. Start chatting with a persona to see your session history.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mood Trends Tab */}
          <TabsContent value="mood" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Mood Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Mood</span>
                      <span className="font-bold text-lg">{averageMood ? averageMood.toFixed(1) : "—"}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Mood Entries</span>
                      <span className="font-bold text-lg">{moodEntries.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                      <span className="font-bold text-lg">{currentStreak} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {moodEntries.length > 0 ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((rating) => {
                        const count = moodEntries.filter((entry: any) => entry.moodRating === rating).length;
                        const percentage = (count / moodEntries.length) * 100;
                        const emoji = ['😢', '😔', '😐', '😊', '😄'][rating - 1];
                        return (
                          <div key={rating} className="flex items-center gap-3">
                            <span className="text-lg">{emoji}</span>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{rating}/5</span>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      No mood entries yet. Start tracking your mood to see patterns.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle>Recent Mood Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {moodEntries.length > 0 ? (
                  <div className="space-y-3">
                    {moodEntries.slice(0, 6).map((entry: any) => (
                      <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-sm font-medium text-gray-900 dark:text-gray-100">
                            Mood: {entry.moodRating}/5
                          </p>
                          <p className="font-body text-xs text-gray-600 dark:text-gray-400">
                            {format(new Date(entry.createdAt), 'MMM d, yyyy • h:mm a')}
                          </p>
                          {entry.notes && (
                            <p className="font-body text-xs text-gray-500 mt-1">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {entry.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No mood entries yet. Start tracking your mood to see your emotional journey.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Your Wellness Goals
              </h3>
              <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl">
                    <Plus className="h-4 w-4 mr-2" />
                    New Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-body text-xl">Create New Goal</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="goalTitle" className="font-body font-medium">Goal Title</Label>
                      <Input
                        id="goalTitle"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Journal 3x this week, Sleep 8 hours"
                        className="mt-1 font-body rounded-xl"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="goalDescription" className="font-body font-medium">Description</Label>
                      <Textarea
                        id="goalDescription"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your goal in more detail..."
                        className="mt-1 font-body rounded-xl"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="goalCategory" className="font-body font-medium">Category</Label>
                      <Select 
                        value={newGoal.category} 
                        onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="mt-1 font-body rounded-xl">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mental" className="font-body">Mental Health</SelectItem>
                          <SelectItem value="emotional" className="font-body">Emotional Wellbeing</SelectItem>
                          <SelectItem value="personal" className="font-body">Personal Growth</SelectItem>
                          <SelectItem value="social" className="font-body">Social Connection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsGoalDialogOpen(false)}
                        className="flex-1 font-body rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateGoal}
                        disabled={createGoalMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-body rounded-xl"
                      >
                        {createGoalMutation.isPending ? "Creating..." : "Save Goal"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {goals.length === 0 ? (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Target className="h-10 w-10 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Set Your First Goal
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Create meaningful goals to guide your wellness journey and track your personal growth.
                  </p>
                  <Button
                    onClick={() => setIsGoalDialogOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {goals.map((goal: any) => {
                  const category = goalCategories[goal.category as keyof typeof goalCategories] || goalCategories.personal;
                  const IconComponent = category.icon;
                  const isCompleted = goal.status === "completed";
                  
                  return (
                    <Card
                      key={goal.id}
                      className="group border-0 shadow-lg bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex-1 truncate">
                                {goal.title}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateGoalMutation.mutate({
                                  id: goal.id,
                                  status: isCompleted ? "active" : "completed"
                                })}
                                className="p-1 h-auto"
                              >
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400" />
                                )}
                              </Button>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {goal.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <Badge variant="outline" className={category.accent}>
                                {goal.category}
                              </Badge>
                              {goal.targetDate && (
                                <span>Due: {format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-body text-gray-900">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="font-body font-medium text-gray-700">Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => handleEditFormChange("name", e.target.value)}
                          placeholder="Your name (optional)"
                          className="mt-1 font-body rounded-xl"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="pronouns" className="font-body font-medium text-gray-700">Pronouns</Label>
                        <Input
                          id="pronouns"
                          value={editForm.pronouns}
                          onChange={(e) => handleEditFormChange("pronouns", e.target.value)}
                          placeholder="they/them, she/her, he/him, etc."
                          className="mt-1 font-body rounded-xl"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="moodTagline" className="font-body font-medium text-gray-700">Mood Tagline</Label>
                        <Input
                          id="moodTagline"
                          value={editForm.moodTagline}
                          onChange={(e) => handleEditFormChange("moodTagline", e.target.value)}
                          placeholder="How you're feeling today..."
                          className="mt-1 font-body rounded-xl"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bio" className="font-body font-medium text-gray-700">About Me</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) => handleEditFormChange("bio", e.target.value)}
                          placeholder="Tell us about yourself, your wellness journey, or what brings you peace..."
                          className="mt-1 font-body rounded-xl"
                          rows={3}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-body font-medium text-gray-700">Name</Label>
                      <p className="text-gray-900 mt-1 font-body">
                        {profile?.name || "Not specified"}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-body font-medium text-gray-700">Pronouns</Label>
                      <p className="text-gray-900 mt-1 font-body">
                        {profile?.pronouns || "Not specified"}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-body font-medium text-gray-700">Current Mood</Label>
                      <p className="text-gray-900 mt-1 font-body">
                        {profile?.moodTagline || "Not set"}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-body font-medium text-gray-700">About Me</Label>
                      <p className="text-gray-900 mt-1 font-body leading-relaxed">
                        {profile?.bio || "Share a bit about yourself to help your SoulSense personas understand you better."}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="favoritePersona">Favorite Persona</Label>
                      <Select
                        value={profile?.preferences?.favoritePersona || "sarah"}
                        onValueChange={(value) => {
                          console.log("Persona preference changed:", value);
                        }}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sarah">Dr. Sarah</SelectItem>
                          <SelectItem value="alex">Alex</SelectItem>
                          <SelectItem value="marcus">Marcus</SelectItem>
                          <SelectItem value="maya">Maya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="sessionFrequency">Session Frequency</Label>
                      <Select
                        value={profile?.preferences?.sessionFrequency || "daily"}
                        onValueChange={(value) => {
                          console.log("Session frequency changed:", value);
                        }}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Favorite Persona</Label>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 capitalize">
                        {profile?.preferences?.favoritePersona || "None selected"}
                      </p>
                    </div>
                    <div>
                      <Label>Session Frequency</Label>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 capitalize">
                        {profile?.preferences?.sessionFrequency || "Not set"}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Goal Dialog Component
function GoalDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "personal",
    targetDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: "", description: "", category: "personal", targetDate: "" });
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Create New Goal</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Goal Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Practice daily meditation"
            required
            className="rounded-2xl"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your goal..."
            rows={3}
            className="rounded-2xl"
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mental">Mental Health</SelectItem>
              <SelectItem value="emotional">Emotional Wellbeing</SelectItem>
              <SelectItem value="personal">Personal Growth</SelectItem>
              <SelectItem value="social">Social Connection</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="targetDate">Target Date (Optional)</Label>
          <Input
            id="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            className="rounded-2xl"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl"
          >
            {isLoading ? "Creating..." : "Create Goal"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="rounded-2xl">
            Cancel
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}