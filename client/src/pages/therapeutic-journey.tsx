import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Calendar, TrendingUp, Award, Brain, Heart, Zap, CheckCircle2, Clock, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  goalId: string;
  title: string;
  description: string;
  goalType: string;
  progress: number;
  status: string;
  milestones: Array<{
    title: string;
    achieved: boolean;
    targetDate: string;
    week: number;
  }>;
  createdAt: string;
  targetDate: string;
}

interface Dashboard {
  overview: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    overallProgress: number;
  };
  activeGoals: Goal[];
  recentAchievements: any[];
  upcomingMilestones: any[];
  progressTrends: any;
  recommendations: string[];
}

export default function TherapeuticJourney() {
  const [selectedGoalType, setSelectedGoalType] = useState<string | null>(null);
  const [showGoalCreation, setShowGoalCreation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading } = useQuery<Dashboard>({
    queryKey: ["/api/goals/dashboard/anonymous"],
    retry: false,
  });

  // Provide safe defaults for dashboard
  const safeDashboard = dashboard || {
    overview: {
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      overallProgress: 0
    },
    activeGoals: [],
    recentAchievements: [],
    upcomingMilestones: [],
    progressTrends: {
      moodTrend: "insufficient_data",
      consistency: 0
    },
    recommendations: ["Consider setting your first therapeutic goal"]
  };

  const createGoal = useMutation({
    mutationFn: async (data: { goalType: string; customizations?: any }) => {
      const response = await apiRequest("/api/goals", "POST", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals/dashboard/anonymous"] });
      setShowGoalCreation(false);
      setSelectedGoalType(null);
      toast({
        title: "Goal Created Successfully",
        description: "Your therapeutic journey has been personalized based on evidence-based practices.",
      });
    },
    onError: () => {
      toast({
        title: "Goal Creation Failed",
        description: "Unable to create goal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const goalTypes = [
    {
      id: "emotional_regulation",
      title: "Emotional Regulation",
      description: "Master the ability to recognize, understand, and effectively manage emotions",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      duration: "8 weeks",
      skills: ["Emotion Recognition", "Regulation Techniques", "Stress Management", "Mindfulness"]
    },
    {
      id: "anxiety_management", 
      title: "Anxiety Management",
      description: "Build effective strategies for managing anxiety and reducing worry",
      icon: Brain,
      color: "from-blue-500 to-indigo-500",
      duration: "6 weeks",
      skills: ["Breathing Techniques", "Cognitive Restructuring", "Exposure Therapy", "Relaxation"]
    },
    {
      id: "depression_recovery",
      title: "Depression Recovery",
      description: "Work towards improved mood, energy, and life satisfaction",
      icon: Zap,
      color: "from-green-500 to-emerald-500", 
      duration: "12 weeks",
      skills: ["Behavioral Activation", "Social Connection", "Purpose Finding", "Mood Lifting"]
    }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "text-green-600";
    if (progress >= 50) return "text-yellow-600";
    if (progress >= 25) return "text-orange-600";
    return "text-red-500";
  };

  if (showGoalCreation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">Create Your Therapeutic Goal</CardTitle>
              <CardDescription>
                Choose a goal type that aligns with your current needs and therapeutic objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {goalTypes.map((goalType) => {
                  const Icon = goalType.icon;
                  return (
                    <Card 
                      key={goalType.id}
                      className={`cursor-pointer transition-all duration-200 border-2 ${
                        selectedGoalType === goalType.id 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-200'
                      }`}
                      onClick={() => setSelectedGoalType(goalType.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${goalType.color}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{goalType.title}</h3>
                            <p className="text-gray-600 mb-4">{goalType.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {goalType.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {goalType.duration}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setShowGoalCreation(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedGoalType && createGoal.mutate({ goalType: selectedGoalType })}
                  disabled={!selectedGoalType || createGoal.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {createGoal.isPending ? "Creating..." : "Create Goal"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your therapeutic journey...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl text-gray-800">Therapeutic Journey</CardTitle>
                <CardDescription className="text-gray-600">
                  Track your progress and achieve meaningful therapeutic goals
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowGoalCreation(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Target className="w-4 h-4 mr-2" />
                Create New Goal
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Overview Stats */}
        {safeDashboard && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Goals</p>
                      <p className="text-3xl font-bold text-gray-800">{safeDashboard.overview.totalGoals}</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Goals</p>
                      <p className="text-3xl font-bold text-blue-600">{safeDashboard.overview.activeGoals}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-green-600">{safeDashboard.overview.completedGoals}</p>
                    </div>
                    <Award className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Overall Progress</p>
                      <p className={`text-3xl font-bold ${getProgressColor(safeDashboard.overview.overallProgress)}`}>
                        {Math.round(safeDashboard.overview.overallProgress)}%
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="goals" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="goals">Active Goals</TabsTrigger>
                <TabsTrigger value="progress">Progress & Insights</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="goals" className="space-y-6">
                {safeDashboard.activeGoals.length === 0 ? (
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Goals</h3>
                      <p className="text-gray-600 mb-6">
                        Start your therapeutic journey by creating your first goal. Choose from evidence-based goal templates designed by mental health professionals.
                      </p>
                      <Button 
                        onClick={() => setShowGoalCreation(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Create Your First Goal
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {safeDashboard.activeGoals.map((goal) => (
                      <Card key={goal.goalId} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl text-gray-800">{goal.title}</CardTitle>
                              <CardDescription className="mt-2">{goal.description}</CardDescription>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {goal.goalType.replace('_', ' ')}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className={`text-sm font-semibold ${getProgressColor(goal.progress)}`}>
                                {Math.round(goal.progress)}%
                              </span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Milestones</h4>
                              <div className="space-y-2">
                                {goal.milestones.slice(0, 3).map((milestone, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    {milestone.achieved ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                    )}
                                    <span className={`text-sm ${milestone.achieved ? 'text-green-700' : 'text-gray-600'}`}>
                                      {milestone.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Timeline</h4>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Started: {new Date(goal.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Target className="w-4 h-4 mr-2" />
                                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button variant="outline" size="sm" className="flex-1">
                              View Details
                            </Button>
                            <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                              Update Progress
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="progress" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-800">Progress Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {safeDashboard.progressTrends ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Mood Trend</span>
                            <Badge variant={
                              safeDashboard.progressTrends.moodTrend === "improving" ? "default" :
                              safeDashboard.progressTrends.moodTrend === "stable" ? "secondary" : "destructive"
                            }>
                              {safeDashboard.progressTrends.moodTrend}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Consistency</span>
                            <span className="text-gray-800 font-semibold">
                              {Math.round(safeDashboard.progressTrends.consistency * 100)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">Track your progress by completing goals and updating milestones.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-800">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {safeDashboard.recommendations && safeDashboard.recommendations.length > 0 ? (
                        <ul className="space-y-2">
                          {safeDashboard.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">Create goals to receive personalized recommendations.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-800">Recent Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {safeDashboard.recentAchievements.length > 0 ? (
                      <div className="space-y-4">
                        {safeDashboard.recentAchievements.map((achievement, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <Award className="w-6 h-6 text-green-500" />
                            <div>
                              <p className="font-medium text-green-800">{achievement.title}</p>
                              <p className="text-sm text-green-600">Milestone achieved</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Your achievements will appear here as you progress through your goals.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-800">Upcoming Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {safeDashboard.upcomingMilestones.length > 0 ? (
                      <div className="space-y-3">
                        {safeDashboard.upcomingMilestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-purple-200 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800">{milestone.title}</p>
                              <p className="text-sm text-gray-600">Week {milestone.week}</p>
                            </div>
                            <Target className="w-5 h-5 text-purple-500" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No upcoming milestones. Create goals to see your journey ahead.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}