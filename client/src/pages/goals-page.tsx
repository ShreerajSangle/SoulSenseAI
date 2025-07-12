import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Target, Plus, Calendar, CheckCircle, Circle, ArrowLeft, Brain, Heart, User, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  status: string;
  priority: string;
  progress: number;
  targetDate: string;
  createdAt: string;
  milestones?: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedDate?: string;
  }>;
}

const goalCategories = {
  mental: { 
    color: "from-blue-500 to-indigo-500", 
    icon: Brain, 
    accent: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Mental Health"
  },
  emotional: { 
    color: "from-rose-500 to-pink-500", 
    icon: Heart, 
    accent: "bg-rose-50 text-rose-700 border-rose-200",
    label: "Emotional Wellbeing"
  },
  personal: { 
    color: "from-green-500 to-emerald-500", 
    icon: Target, 
    accent: "bg-green-50 text-green-700 border-green-200",
    label: "Personal Growth"
  },
  social: { 
    color: "from-purple-500 to-violet-500", 
    icon: User, 
    accent: "bg-purple-50 text-purple-700 border-purple-200",
    label: "Social Connection"
  }
};

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-yellow-100 text-yellow-700", 
  high: "bg-red-100 text-red-700"
};

const statusColors = {
  active: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  paused: "bg-gray-100 text-gray-700"
};

export default function GoalsPage() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium"
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals?userId=anonymous");
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json();
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "anonymous",
          ...goalData
        })
      });
      if (!response.ok) throw new Error("Failed to create goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsCreateDialogOpen(false);
      setNewGoal({ title: "", description: "", category: "", priority: "medium" });
      toast({
        title: "Goal Created",
        description: "Your new goal has been added successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error("Failed to update goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal Updated",
        description: "Your goal has been updated successfully!"
      });
    }
  });

  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and category.",
        variant: "destructive"
      });
      return;
    }
    
    createGoalMutation.mutate(newGoal);
  };

  const toggleGoalStatus = (goal: Goal) => {
    const newStatus = goal.status === "completed" ? "active" : "completed";
    const updates = {
      status: newStatus,
      progress: newStatus === "completed" ? 100 : goal.progress,
      completedDate: newStatus === "completed" ? new Date().toISOString() : null
    };
    
    updateGoalMutation.mutate({ id: goal.id, updates });
  };

  const activeGoals = goals.filter((goal: Goal) => goal.status !== "completed");
  const completedGoals = goals.filter((goal: Goal) => goal.status === "completed");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-purple-200 rounded w-48"></div>
          <div className="h-4 bg-purple-100 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-purple-600 hover:bg-purple-100 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-normal text-gray-800">Your Wellness Goals</h1>
              <p className="text-gray-600 font-body">Set intentions and track your personal growth journey</p>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl font-body font-medium">
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">Create New Goal</DialogTitle>
                <DialogDescription className="font-body">
                  Set a meaningful intention for your wellness journey
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="font-body font-medium">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="What do you want to achieve?"
                    className="mt-1 font-body"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="font-body font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your goal in more detail..."
                    className="mt-1 font-body"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="font-body font-medium">Category</Label>
                  <Select 
                    value={newGoal.category} 
                    onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1 font-body">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(goalCategories).map(([key, cat]) => (
                        <SelectItem key={key} value={key} className="font-body">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority" className="font-body font-medium">Priority</Label>
                  <Select 
                    value={newGoal.priority} 
                    onValueChange={(value) => setNewGoal(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="mt-1 font-body">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" className="font-body">Low</SelectItem>
                      <SelectItem value="medium" className="font-body">Medium</SelectItem>
                      <SelectItem value="high" className="font-body">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1 font-body"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateGoal}
                    disabled={createGoalMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-body"
                  >
                    {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-body font-bold text-gray-900">{activeGoals.length}</div>
              <div className="text-sm font-body text-gray-600">Active Goals</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-body font-bold text-gray-900">{completedGoals.length}</div>
              <div className="text-sm font-body text-gray-600">Completed Goals</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-body font-bold text-gray-900">
                {Math.round(goals.reduce((acc: number, goal: Goal) => acc + goal.progress, 0) / Math.max(goals.length, 1))}%
              </div>
              <div className="text-sm font-body text-gray-600">Average Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div>
            <h2 className="text-2xl font-heading font-normal text-gray-800 mb-4">Active Goals</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeGoals.map((goal: Goal) => {
                const category = goalCategories[goal.category as keyof typeof goalCategories];
                const Icon = category?.icon || Target;
                
                return (
                  <Card key={goal.id} className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${category?.color || 'from-gray-400 to-gray-500'} rounded-xl flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-body font-medium text-gray-900">{goal.title}</CardTitle>
                            <div className="flex gap-2 mt-1">
                              <Badge className={`text-xs ${category?.accent || 'bg-gray-100 text-gray-700'} border`}>
                                {category?.label || goal.category}
                              </Badge>
                              <Badge className={`text-xs ${priorityColors[goal.priority as keyof typeof priorityColors]} border`}>
                                {goal.priority} priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleGoalStatus(goal)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Circle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {goal.description && (
                        <p className="text-sm font-body text-gray-600 mb-3">{goal.description}</p>
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-body">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900 font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                      {goal.targetDate && (
                        <div className="flex items-center gap-2 mt-3 text-sm font-body text-gray-500">
                          <Calendar className="w-4 h-4" />
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-2xl font-heading font-normal text-gray-800 mb-4">Completed Goals</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedGoals.map((goal: Goal) => {
                const category = goalCategories[goal.category as keyof typeof goalCategories];
                const Icon = category?.icon || Target;
                
                return (
                  <Card key={goal.id} className="border-0 bg-white/40 backdrop-blur-sm opacity-75">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${category?.color || 'from-gray-400 to-gray-500'} rounded-xl flex items-center justify-center`}>
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-body font-medium text-gray-700 line-through">{goal.title}</CardTitle>
                          <Badge className="text-xs bg-green-100 text-green-700 border border-green-200 mt-1">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {goal.description && (
                        <p className="text-sm font-body text-gray-500 mb-3">{goal.description}</p>
                      )}
                      <div className="text-sm font-body text-gray-500">
                        Completed on {new Date(goal.completedDate || goal.updatedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <Card className="border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-heading font-normal text-gray-900 mb-2">
                Set Your First Wellness Goal
              </h3>
              <p className="text-gray-600 font-body mb-6 max-w-md mx-auto">
                Create meaningful goals to guide your wellness journey and track your personal growth over time.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-body font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}