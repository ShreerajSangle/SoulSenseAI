import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Brain, Heart, Activity, Target } from "lucide-react";

interface MoodData {
  date: string;
  moodRating: number;
  emotions: string[];
  triggers?: string[];
  type: string;
}

interface MoodInsight {
  type: 'trend' | 'pattern' | 'achievement' | 'concern';
  title: string;
  description: string;
  actionable?: string;
}

export function MoodTrackerDashboard({ userId }: { userId: string }) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  const { data: moodData, isLoading } = useQuery({
    queryKey: ['/api/mood-entries', userId, timeRange],
    queryFn: () => fetch(`/api/mood-entries?userId=${userId}&range=${timeRange}`).then(res => res.json()),
  });

  const { data: insights } = useQuery({
    queryKey: ['/api/mood-insights', userId, timeRange],
    queryFn: () => fetch(`/api/mood-insights?userId=${userId}&range=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const moodTrendData = moodData?.map((entry: MoodData) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: entry.moodRating,
    emotions: entry.emotions?.length || 0
  })) || [];

  const emotionFrequency = moodData?.reduce((acc: Record<string, number>, entry: MoodData) => {
    entry.emotions?.forEach(emotion => {
      acc[emotion] = (acc[emotion] || 0) + 1;
    });
    return acc;
  }, {}) || {};

  const emotionChartData = Object.entries(emotionFrequency)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const triggerData = moodData?.reduce((acc: Record<string, number>, entry: MoodData) => {
    entry.triggers?.forEach(trigger => {
      acc[trigger] = (acc[trigger] || 0) + 1;
    });
    return acc;
  }, {}) || {};

  const averageMood = moodData?.length 
    ? moodData.reduce((sum: number, entry: MoodData) => sum + entry.moodRating, 0) / moodData.length
    : 0;

  const moodTrend = moodTrendData.length >= 2 
    ? moodTrendData[moodTrendData.length - 1].mood - moodTrendData[0].mood
    : 0;

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mood Insights</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMood.toFixed(1)}/5</div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              {moodTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              {Math.abs(moodTrend).toFixed(1)} from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moodData?.length || 0}</div>
            <div className="text-xs text-gray-600">
              {timeRange === 'week' ? 'this week' : timeRange === 'month' ? 'this month' : 'this quarter'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Most Common</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">
              {emotionChartData[0]?.emotion || 'N/A'}
            </div>
            <div className="text-xs text-gray-600">
              emotion this {timeRange}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mood Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moodTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Emotion frequency chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Emotion Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={emotionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="emotion" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Common Triggers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(triggerData)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([trigger, count], index) => (
                  <div key={trigger} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{trigger}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              {Object.keys(triggerData).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No trigger data available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI-generated insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Personal Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight: MoodInsight, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-start gap-2">
                    <Badge variant={
                      insight.type === 'achievement' ? 'default' :
                      insight.type === 'concern' ? 'destructive' : 'secondary'
                    }>
                      {insight.type}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      {insight.actionable && (
                        <p className="text-sm text-blue-600 mt-2 font-medium">
                          💡 {insight.actionable}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}