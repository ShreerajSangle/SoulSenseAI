import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Target, TrendingUp, Brain, Heart, MessageCircle, Flame } from "lucide-react";

interface AnalyticsDashboardProps {
  userId: string;
}

interface DashboardData {
  totalSessions: number;
  currentStreak: number;
  averageMood: number;
  favoritePersona: string;
  sessionHistory: Array<{
    date: string;
    personaId: string;
    duration: number;
    mood: number;
    sessionType: string;
  }>;
  moodTrends: Array<{
    date: string;
    mood: number;
    emotions: string[];
  }>;
  goals: {
    total: number;
    completed: number;
    inProgress: number;
  };
}

const personaNames: Record<string, string> = {
  sarah: "Dr. Sarah",
  alex: "Alex",
  marcus: "Marcus", 
  maya: "Maya"
};

const personaColors: Record<string, string> = {
  sarah: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  alex: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", 
  marcus: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  maya: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
};

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/analytics/dashboard', userId],
    enabled: !!userId && userId !== 'anonymous'
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Brain className="mx-auto mb-4 h-12 w-12" />
        <h3 className="text-lg font-medium mb-2">No Analytics Yet</h3>
        <p className="text-sm">Start a conversation to see your insights!</p>
      </div>
    );
  }

  const completionRate = dashboardData.goals.total > 0 
    ? (dashboardData.goals.completed / dashboardData.goals.total) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-lavender-50 to-lavender-100 dark:from-lavender-900 dark:to-lavender-800 border-lavender-200 dark:border-lavender-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-lavender-600 dark:text-lavender-300 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lavender-900 dark:text-lavender-100">
              {dashboardData.totalSessions}
            </div>
            <p className="text-xs text-lavender-600 dark:text-lavender-400">
              Conversations completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-300 flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {dashboardData.currentStreak}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Days in a row
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900 dark:to-rose-800 border-rose-200 dark:border-rose-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-300 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Average Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">
              {dashboardData.averageMood ? `${dashboardData.averageMood}/5` : 'N/A'}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Overall wellbeing
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 border-emerald-200 dark:border-emerald-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {Math.round(completionRate)}%
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {dashboardData.goals.completed} of {dashboardData.goals.total} goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="moods">Moods</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Favorite Persona
                </CardTitle>
                <CardDescription>
                  Who you connect with most
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-lavender-200 to-rose-200 flex items-center justify-center">
                    <span className="text-lg font-semibold text-lavender-800">
                      {personaNames[dashboardData.favoritePersona]?.[0] || 'S'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {personaNames[dashboardData.favoritePersona] || 'Dr. Sarah'}
                    </div>
                    <Badge className={personaColors[dashboardData.favoritePersona] || personaColors.sarah}>
                      Most active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goal Statistics
                </CardTitle>
                <CardDescription>
                  Your achievement progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span>{dashboardData.goals.completed}</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">In Progress</span>
                    <div className="font-medium">{dashboardData.goals.inProgress}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total</span>
                    <div className="font-medium">{dashboardData.goals.total}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Sessions
              </CardTitle>
              <CardDescription>
                Your last 10 conversation sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.sessionHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="mx-auto mb-2 h-8 w-8" />
                  <p>No sessions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.sessionHistory.slice(0, 10).map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Badge className={personaColors[session.personaId] || personaColors.sarah}>
                          {personaNames[session.personaId] || 'Dr. Sarah'}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {session.duration && <span>{session.duration}min</span>}
                        {session.mood && (
                          <Badge variant="outline">
                            Mood: {session.mood}/5
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mood Trends
              </CardTitle>
              <CardDescription>
                Your emotional patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.moodTrends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="mx-auto mb-2 h-8 w-8" />
                  <p>No mood data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.moodTrends.slice(0, 7).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < entry.mood ? 'bg-rose-400' : 'bg-gray-200 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {entry.emotions?.slice(0, 3).map((emotion, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Progress Details
              </CardTitle>
              <CardDescription>
                Track your personal growth objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                      {dashboardData.goals.completed}
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">Completed</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                      {dashboardData.goals.inProgress}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">In Progress</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                      {dashboardData.goals.total}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                  </div>
                </div>
                {dashboardData.goals.total > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Completion</span>
                      <span>{Math.round(completionRate)}%</span>
                    </div>
                    <Progress value={completionRate} className="h-3" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}