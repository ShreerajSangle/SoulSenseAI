import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { StreamingChatInterface } from "@/components/streaming-chat-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Brain, 
  Heart, 
  TrendingUp, 
  Shield, 
  Sparkles,
  BarChart3,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EmotionalInsights {
  dominantEmotions: Array<{ emotion: string; frequency: number }>;
  averageIntensity: number;
  emotionalStability: number;
  riskFactors: string[];
  strengths: string[];
  recommendations: string[];
}

interface MemoryStats {
  shortTermMemoryCount: number;
  longTermMemoryCount: number;
  trustLevel: number;
  intimacyDepth: number;
  dominantEmotions: string[];
}

interface EmotionalContext {
  primary: string;
  intensity: number;
  urgency: 'low' | 'medium' | 'high' | 'crisis';
  supportNeeds: string[];
}

export default function AdvancedChat() {
  const { persona: personaId } = useParams();
  const [location, setLocation] = useLocation();
  const [currentEmotion, setCurrentEmotion] = useState<EmotionalContext | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);

  const userId = "user-1"; // In production, get from auth context

  // Fetch persona data
  const { data: persona, isLoading: personaLoading } = useQuery({
    queryKey: [`/api/personas/${personaId}`],
    enabled: !!personaId
  });

  // Fetch emotional insights
  const { data: emotionalInsights, refetch: refetchInsights } = useQuery<{
    success: boolean;
    insights: EmotionalInsights;
  }>({
    queryKey: [`/api/emotion/insights/${userId}`],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch memory stats
  const { data: memoryStats, refetch: refetchMemory } = useQuery<{
    success: boolean;
    stats: MemoryStats;
  }>({
    queryKey: [`/api/memory/stats/${userId}/${personaId}`],
    enabled: !!personaId,
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  const handleEmotionDetected = (emotion: EmotionalContext) => {
    setCurrentEmotion(emotion);
    
    // Refresh insights when new emotion is detected
    refetchInsights();
    refetchMemory();
  };

  const handleCrisisDetected = () => {
    setCrisisDetected(true);
    // Auto-hide crisis alert after 10 seconds
    setTimeout(() => setCrisisDetected(false), 10000);
  };

  if (personaLoading || !persona) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Brain className="w-12 h-12 animate-pulse mx-auto text-blue-500" />
          <p className="text-gray-600">Loading your AI companion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{persona.emoji}</span>
                <div>
                  <h1 className="font-semibold text-gray-900">{persona.name}</h1>
                  <p className="text-sm text-gray-500">{persona.role}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInsights(!showInsights)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Insights
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Current Emotion Display */}
          {currentEmotion && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Current Emotion:</span>
                <Badge variant={currentEmotion.urgency === 'crisis' ? 'destructive' : 'secondary'}>
                  {currentEmotion.primary} ({currentEmotion.intensity}/10)
                </Badge>
              </div>
              {memoryStats?.success && (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600">
                    Trust: {Math.round(memoryStats.stats.trustLevel * 100)}%
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Crisis Alert */}
        <AnimatePresence>
          {crisisDetected && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-red-50 border-b border-red-200 px-4 py-3"
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-800">Crisis Support Available</h3>
                  <p className="text-sm text-red-700">
                    If you're experiencing thoughts of self-harm, please contact: 988 (Crisis Lifeline)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCrisisDetected(false)}
                >
                  Dismiss
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Interface */}
        <div className="flex-1">
          <StreamingChatInterface
            personaId={personaId!}
            personaName={persona.name}
            personaEmoji={persona.emoji}
            userId={userId}
            onEmotionDetected={handleEmotionDetected}
            onCrisisDetected={handleCrisisDetected}
          />
        </div>
      </div>

      {/* Insights Sidebar */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-l border-gray-200 overflow-hidden"
          >
            <div className="p-4 h-full overflow-y-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Emotional Insights</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInsights(false)}
                >
                  ×
                </Button>
              </div>

              {/* Memory Stats */}
              {memoryStats?.success && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-blue-500" />
                      Relationship Memory
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Trust Level</span>
                        <span>{Math.round(memoryStats.stats.trustLevel * 100)}%</span>
                      </div>
                      <Progress value={memoryStats.stats.trustLevel * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Intimacy Depth</span>
                        <span>{Math.round(memoryStats.stats.intimacyDepth * 100)}%</span>
                      </div>
                      <Progress value={memoryStats.stats.intimacyDepth * 100} className="h-2" />
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>Memories: {memoryStats.stats.longTermMemoryCount} long-term, {memoryStats.stats.shortTermMemoryCount} recent</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Emotional Analysis */}
              {emotionalInsights?.success && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-red-500" />
                      Emotional Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Emotional Stability</span>
                        <span>{Math.round(emotionalInsights.insights.emotionalStability * 100)}%</span>
                      </div>
                      <Progress value={emotionalInsights.insights.emotionalStability * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Dominant Emotions</h4>
                      <div className="space-y-1">
                        {emotionalInsights.insights.dominantEmotions.slice(0, 3).map((emotion, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="capitalize">{emotion.emotion}</span>
                            <span>{Math.round(emotion.frequency * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {emotionalInsights.insights.strengths.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-green-700">Strengths</h4>
                        <div className="space-y-1">
                          {emotionalInsights.insights.strengths.slice(0, 2).map((strength, index) => (
                            <Badge key={index} variant="secondary" className="text-xs block">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {emotionalInsights.insights.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                        <div className="space-y-1">
                          {emotionalInsights.insights.recommendations.slice(0, 2).map((rec, index) => (
                            <p key={index} className="text-xs text-gray-600 leading-relaxed">
                              {rec}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Current Session */}
              {currentEmotion && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                      Current Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Primary Emotion</span>
                      <Badge variant="outline">{currentEmotion.primary}</Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Intensity</span>
                        <span>{currentEmotion.intensity}/10</span>
                      </div>
                      <Progress value={currentEmotion.intensity * 10} className="h-2" />
                    </div>
                    {currentEmotion.supportNeeds.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Support Needs</h4>
                        <div className="space-y-1">
                          {currentEmotion.supportNeeds.map((need, index) => (
                            <Badge key={index} variant="outline" className="text-xs block">
                              {need.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}