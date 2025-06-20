import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Heart, 
  Target, 
  Leaf, 
  MessageCircle, 
  TrendingUp, 
  BookOpen, 
  Award,
  Users,
  Lightbulb,
  Shield,
  Zap,
  Clock,
  Eye,
  Star
} from "lucide-react";

interface SoulSenseResponse {
  conversation: any;
  aiMessage: any;
  emotionAnalysis: any;
  followUpQuestions: string[];
  therapeuticTechniques: string[];
  personalityInsight: any;
  memoryReferences: any[];
  relationshipDepth: number;
  emotionalResonance: number;
  engagementLevel: string;
  moodInsights: any;
}

const soulSensePersonas = [
  {
    id: "sarah",
    name: "Dr. Sarah",
    role: "Licensed Clinical Therapist", 
    icon: Heart,
    color: "bg-rose-500",
    corePhilosophy: "Every person has the capacity for healing and growth through understanding and evidence-based practices.",
    specialization: ["CBT", "DBT", "Trauma-informed therapy", "Crisis intervention"],
    emotionalTone: "Calm, professional warmth with gentle authority",
    scenarioPrompt: "I've been having panic attacks at work and feel completely overwhelmed. My heart races and I can't breathe. I'm afraid it's going to happen again.",
    expectedResponse: "Uses therapeutic language, offers grounding techniques, normalizes experience"
  },
  {
    id: "alex", 
    name: "Alex",
    role: "Peer Support Specialist",
    icon: Users,
    color: "bg-blue-500", 
    corePhilosophy: "Recovery is possible because I have lived it. Sharing our stories creates hope and resilience.",
    specialization: ["Lived experience", "Peer mentoring", "Recovery support", "Hope instillation"],
    emotionalTone: "Authentic, warm relatability with genuine understanding",
    scenarioPrompt: "I feel like nobody understands what I'm going through. I've been struggling with depression and I'm starting to lose hope that things will get better.",
    expectedResponse: "Shares lived experience, uses 'me too' energy, focuses on hope and connection"
  },
  {
    id: "marcus",
    name: "Coach Marcus", 
    role: "Executive Life Coach",
    icon: TrendingUp,
    color: "bg-green-500",
    corePhilosophy: "You have everything within you to create the life you want. Let's unlock that potential together.",
    specialization: ["Goal achievement", "Habit formation", "Performance optimization", "Systems thinking"],
    emotionalTone: "High energy, motivational enthusiasm with confident optimism",
    scenarioPrompt: "I keep setting ambitious goals but never follow through. I want to advance my career and build better habits, but I always lose motivation after a few days.",
    expectedResponse: "Action-oriented language, focuses on systems and accountability, breakthrough mindset"
  },
  {
    id: "maya",
    name: "Maya",
    role: "Mindfulness & Somatic Expert", 
    icon: Leaf,
    color: "bg-purple-500",
    corePhilosophy: "Peace and wisdom already exist within you. Through mindful awareness, we can access this inner sanctuary.",
    specialization: ["MBSR", "Meditation", "Breathwork", "Somatic awareness"],
    emotionalTone: "Gentle, serene presence with spacious awareness",
    scenarioPrompt: "I feel disconnected from my body and constantly anxious. My mind races with thoughts and I can't seem to find any peace or calm in my daily life.",
    expectedResponse: "Present-moment focus, body awareness cues, breathing techniques, non-judgmental language"
  }
];

export default function SoulSenseAIDemo() {
  const [selectedPersona, setSelectedPersona] = useState("sarah");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<Record<string, SoulSenseResponse>>({});
  const [conversationHistories, setConversationHistories] = useState<Record<string, any[]>>({});
  const [runningDemo, setRunningDemo] = useState(false);

  const currentPersona = soulSensePersonas.find(p => p.id === selectedPersona)!;

  const sendMessage = async (messageText: string, personaId: string) => {
    if (!messageText.trim()) return null;

    try {
      const response = await fetch('/api/chat/enhanced-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          personaId: personaId,
          userId: `soulsense-demo-${personaId}`,
          isFirstMessage: !conversationHistories[personaId]?.length
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SoulSenseResponse = await response.json();
      
      // Update responses
      setResponses(prev => ({
        ...prev,
        [personaId]: data
      }));

      // Update conversation history
      setConversationHistories(prev => ({
        ...prev,
        [personaId]: [
          ...(prev[personaId] || []),
          { sender: 'user', content: messageText, timestamp: new Date() },
          { sender: 'ai', content: data.aiMessage.content, timestamp: new Date() }
        ]
      }));

      return data;

    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  const sendPersonalMessage = async () => {
    if (!message.trim() || loading) return;

    setLoading(true);
    await sendMessage(message, selectedPersona);
    setMessage("");
    setLoading(false);
  };

  const runAutomatedDemo = async () => {
    setRunningDemo(true);
    
    // Clear existing responses
    setResponses({});
    setConversationHistories({});

    // Test each persona with their specialized scenario
    for (const persona of soulSensePersonas) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between calls
      await sendMessage(persona.scenarioPrompt, persona.id);
    }

    setRunningDemo(false);
  };

  const analyzePersonalityDifferences = () => {
    const personas = Object.keys(responses);
    if (personas.length < 2) return null;

    const differences = personas.map(personaId => {
      const response = responses[personaId];
      const persona = soulSensePersonas.find(p => p.id === personaId)!;
      
      return {
        persona: persona.name,
        responseLength: response.aiMessage.content.length,
        emotionalTone: response.aiMessage.emotionDetected,
        therapeuticApproach: response.therapeuticTechniques.slice(0, 2),
        relationshipDepth: Math.round(response.relationshipDepth * 100),
        keyPhrases: extractKeyPhrases(response.aiMessage.content),
        personalityMarkers: analyzePersonalityMarkers(response.aiMessage.content, persona)
      };
    });

    return differences;
  };

  const extractKeyPhrases = (content: string) => {
    const therapeuticPhrases = [
      'I understand', 'I hear you', 'That takes courage', 'Let\'s explore',
      'What feels', 'How has this', 'I want you to know', 'You\'re not alone',
      'Let\'s focus', 'What would success', 'I can sense', 'breakthrough',
      'I notice', 'Can you feel', 'breath', 'present moment'
    ];
    
    return therapeuticPhrases.filter(phrase => 
      content.toLowerCase().includes(phrase.toLowerCase())
    ).slice(0, 3);
  };

  const analyzePersonalityMarkers = (content: string, persona: any) => {
    const markers = [];
    
    if (persona.id === 'sarah' && (content.includes('understand') || content.includes('explore'))) {
      markers.push('Therapeutic language');
    }
    if (persona.id === 'alex' && (content.includes('I\'ve been') || content.includes('connect'))) {
      markers.push('Peer connection');
    }
    if (persona.id === 'marcus' && (content.includes('focus') || content.includes('step'))) {
      markers.push('Action orientation');
    }
    if (persona.id === 'maya' && (content.includes('notice') || content.includes('breath'))) {
      markers.push('Mindfulness focus');
    }

    return markers;
  };

  const personalityDifferences = analyzePersonalityDifferences();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            SoulSense AI: Authentic Emotional Intelligence
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Each persona maintains distinct personalities, specialized knowledge, and evolving memory
          </p>
          
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={runAutomatedDemo}
              disabled={runningDemo}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              {runningDemo ? 'Running Demo...' : 'Run Automated Demo'}
            </Button>
            <Button variant="outline" onClick={() => { setResponses({}); setConversationHistories({}); }}>
              Clear Results
            </Button>
          </div>

          {runningDemo && (
            <Alert className="max-w-md mx-auto">
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Testing each persona with specialized scenarios to demonstrate distinct personalities...
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Persona Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {soulSensePersonas.map((persona) => {
            const Icon = persona.icon;
            const isSelected = selectedPersona === persona.id;
            const hasResponse = responses[persona.id];
            
            return (
              <Card 
                key={persona.id} 
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900' : 'hover:shadow-lg'
                } ${hasResponse ? 'border-green-500' : ''}`}
                onClick={() => setSelectedPersona(persona.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full ${persona.color} text-white relative`}>
                      <Icon className="w-5 h-5" />
                      {hasResponse && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{persona.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{persona.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Core Philosophy</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                        {persona.corePhilosophy}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Emotional Tone</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {persona.emotionalTone}
                      </p>
                    </div>

                    {hasResponse && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-green-600">
                          <Star className="w-4 h-4" />
                          <span className="text-sm font-medium">Response Analyzed</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Personal Conversation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat with {currentPersona.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ScrollArea className="h-64 border rounded-lg p-4">
                  {conversationHistories[selectedPersona]?.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation with {currentPersona.name}</p>
                    </div>
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                        <p className="text-sm">Thinking...</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                <div className="space-y-3">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Share your thoughts with ${currentPersona.name}...`}
                    className="resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={sendPersonalMessage}
                      disabled={loading || !message.trim()}
                      className="flex-1"
                    >
                      {loading ? 'Processing...' : `Send to ${currentPersona.name}`}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setMessage(currentPersona.scenarioPrompt)}
                    >
                      Use Example
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Live Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {responses[selectedPersona] ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Emotional Intelligence</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm">Relationship Depth</p>
                        <Progress value={responses[selectedPersona].relationshipDepth * 100} className="mt-1" />
                        <p className="text-xs text-gray-600 mt-1">
                          {Math.round(responses[selectedPersona].relationshipDepth * 100)}% connection strength
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">Emotional Resonance</p>
                        <Progress value={responses[selectedPersona].emotionalResonance * 100} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Therapeutic Approach</h4>
                    <div className="flex flex-wrap gap-1">
                      {responses[selectedPersona].therapeuticTechniques.map((technique, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {technique}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Memory Integration</h4>
                    <p className="text-sm text-gray-600">
                      {responses[selectedPersona].memoryReferences.length} references stored
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Engagement: {responses[selectedPersona].engagementLevel}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Send a message to see analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Personality Comparison */}
        {personalityDifferences && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Personality Differences Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {personalityDifferences.map((analysis, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="font-semibold">{analysis.persona}</h3>
                    
                    <div>
                      <p className="text-sm font-medium">Response Style</p>
                      <p className="text-xs text-gray-600">
                        {analysis.responseLength} chars, {analysis.emotionalTone} tone
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Key Phrases</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.keyPhrases.map((phrase, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            "{phrase}"
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Personality Markers</p>
                      <div className="space-y-1">
                        {analysis.personalityMarkers.map((marker, i) => (
                          <Badge key={i} variant="secondary" className="text-xs block">
                            {marker}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Connection Strength</p>
                      <Progress value={analysis.relationshipDepth} className="mt-1" />
                      <p className="text-xs text-gray-600">{analysis.relationshipDepth}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}