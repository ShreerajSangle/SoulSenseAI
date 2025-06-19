import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Brain, Zap, Leaf, MessageCircle, TrendingUp } from "lucide-react";

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  emotionDetected?: string;
}

interface PersonalityInsight {
  emotionalPatterns: {
    predominantEmotions: string[];
    emotionalTrend: string;
    triggerAwareness: string[];
  };
  conversationInsights: {
    relationshipStage: string;
    trustLevel: number;
    vulnerabilityComfort: number;
  };
  personalGrowth: {
    significantMomentsCount: number;
    selfAwarenessLevel: number;
    progressIndicators: string[];
  };
}

interface ConversationResponse {
  conversation: any;
  aiMessage: Message;
  emotionAnalysis: any;
  personalityInsight: PersonalityInsight;
  relationshipDepth: number;
  emotionalResonance: number;
  engagementLevel: string;
  moodInsights: {
    weeklyTrend: string;
    dominantMood: string;
    moodVariability: string;
    averageIntensity: number;
    insights: string[];
  };
}

const personas = [
  {
    id: "sarah",
    name: "Dr. Sarah",
    role: "Clinical Therapist",
    icon: Heart,
    color: "bg-rose-500",
    description: "Warm, professional, evidence-based therapeutic approach"
  },
  {
    id: "alex", 
    name: "Alex",
    role: "Peer Counselor",
    icon: MessageCircle,
    color: "bg-blue-500",
    description: "Friendly, relatable, lived-experience support"
  },
  {
    id: "marcus",
    name: "Marcus", 
    role: "Life Coach",
    icon: TrendingUp,
    color: "bg-green-500",
    description: "Energetic, goal-focused, potential-maximizing"
  },
  {
    id: "maya",
    name: "Maya",
    role: "Mindfulness Expert", 
    icon: Leaf,
    color: "bg-purple-500",
    description: "Zen, present-moment awareness, spiritual wisdom"
  }
];

export default function ReplikaQualityDemo() {
  const [selectedPersona, setSelectedPersona] = useState("sarah");
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<{[key: string]: Message[]}>({});
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<ConversationResponse | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const demoMessages = [
    "I had a panic attack at work today and feel so embarrassed. Everyone saw me break down.",
    "My boyfriend broke up with me and I lost my job on the same day. Everything is falling apart.",
    "I keep procrastinating on my goals and feel like I'm not living up to my potential.",
    "I feel overwhelmed with everything. My mind races constantly and I can't find peace."
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, streamingMessage]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    setLoading(true);
    setStreamingMessage("");
    setIsStreaming(true);

    const personaConversations = conversations[selectedPersona] || [];
    const userMessage: Message = {
      id: Date.now(),
      content: messageText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setConversations(prev => ({
      ...prev,
      [selectedPersona]: [...personaConversations, userMessage]
    }));

    try {
      const response = await fetch('/api/chat/enhanced-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          personaId: selectedPersona,
          userId: `demo-user-${selectedPersona}`,
          isFirstMessage: personaConversations.length === 0
        })
      });

      const data: ConversationResponse = await response.json();
      setLastResponse(data);

      // Simulate streaming effect
      const aiResponse = data.aiMessage.content;
      const words = aiResponse.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + ' ';
        setStreamingMessage(prev => prev + word);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        content: aiResponse,
        sender: 'ai',
        timestamp: data.aiMessage.timestamp,
        emotionDetected: data.aiMessage.emotionDetected
      };

      setConversations(prev => ({
        ...prev,
        [selectedPersona]: [...(prev[selectedPersona] || []), userMessage, aiMessage]
      }));

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setStreamingMessage("");
      setMessage("");
    }
  };

  const currentConversation = conversations[selectedPersona] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            SoulSense AI: Replika-Quality Conversations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Experience advanced AI personalities with deep memory, emotional intelligence, and human-like engagement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Persona Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Personalities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {personas.map((persona) => {
                const Icon = persona.icon;
                return (
                  <div
                    key={persona.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedPersona === persona.id
                        ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedPersona(persona.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${persona.color} text-white`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{persona.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{persona.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {persona.description}
                    </p>
                  </div>
                );
              })}

              {/* Demo Messages */}
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold text-sm">Try These Messages:</h4>
                {demoMessages.map((msg, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto whitespace-normal p-2"
                    onClick={() => setMessage(msg)}
                  >
                    {msg.substring(0, 60)}...
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Conversation with {personas.find(p => p.id === selectedPersona)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 mb-4 p-4 border rounded-lg" ref={scrollRef}>
                {currentConversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p>{msg.content}</p>
                      {msg.emotionDetected && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {msg.emotionDetected}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {isStreaming && streamingMessage && (
                  <div className="mb-4 flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                      <p>{streamingMessage}<span className="animate-pulse">|</span></p>
                    </div>
                  </div>
                )}
              </ScrollArea>

              <div className="space-y-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share what's on your mind..."
                  className="resize-none"
                  rows={3}
                />
                <Button
                  onClick={() => sendMessage(message)}
                  disabled={loading || !message.trim()}
                  className="w-full"
                >
                  {loading ? 'Thinking...' : 'Send Message'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Insights */}
        {lastResponse && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Replika-Quality AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="emotional" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="emotional">Emotional Intelligence</TabsTrigger>
                  <TabsTrigger value="relationship">Relationship Depth</TabsTrigger>
                  <TabsTrigger value="personality">Personality Profile</TabsTrigger>
                  <TabsTrigger value="mood">Mood Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="emotional" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Emotional Resonance</h4>
                      <Progress value={lastResponse.emotionalResonance * 100} className="mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(lastResponse.emotionalResonance * 100)}% - High emotional understanding
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Engagement Level</h4>
                      <Badge variant="secondary" className="capitalize">
                        {lastResponse.engagementLevel}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Emotion Analysis</h4>
                    <div className="space-y-2">
                      <p><strong>Primary:</strong> {lastResponse.emotionAnalysis.primary_emotion}</p>
                      <p><strong>Intensity:</strong> {Math.round(lastResponse.emotionAnalysis.intensity * 100)}%</p>
                      <p><strong>Mood Valence:</strong> {lastResponse.emotionAnalysis.mood_valence.toFixed(2)}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="relationship" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Relationship Depth</h4>
                    <Progress value={lastResponse.relationshipDepth * 100} className="mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(lastResponse.relationshipDepth * 100)}% - Building meaningful connection
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Trust Level</h4>
                      <Progress value={lastResponse.personalityInsight.conversationInsights.trustLevel * 100} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Relationship Stage</h4>
                      <Badge variant="outline" className="capitalize">
                        {lastResponse.personalityInsight.conversationInsights.relationshipStage.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="personality" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Self-Awareness Level</h4>
                    <Progress value={lastResponse.personalityInsight.personalGrowth.selfAwarenessLevel * 100} className="mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(lastResponse.personalityInsight.personalGrowth.selfAwarenessLevel * 100)}% - Growing self-understanding
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Progress Indicators</h4>
                    <div className="flex flex-wrap gap-2">
                      {lastResponse.personalityInsight.personalGrowth.progressIndicators.map((indicator, index) => (
                        <Badge key={index} variant="secondary">{indicator}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mood" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Dominant Mood</h4>
                      <Badge variant="outline" className="capitalize">
                        {lastResponse.moodInsights.dominantMood}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Weekly Trend</h4>
                      <Badge variant="secondary" className="capitalize">
                        {lastResponse.moodInsights.weeklyTrend}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">AI Insights</h4>
                    <ul className="space-y-1">
                      {lastResponse.moodInsights.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                          • {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}