import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Zap
} from "lucide-react";

interface SpecializedResponse {
  conversation: any;
  userMessage: any;
  aiMessage: any;
  emotionAnalysis: any;
  specializedResponse?: {
    domainExpertise: string;
    therapeuticApproach: string[];
    adaptiveLearning: any;
  };
  personaInsights?: any;
  knowledgeBase?: {
    availableInterventions: string[];
    responseTemplates: string[];
    crisisProtocols: string[];
  };
}

const specializedPersonas = [
  {
    id: "sarah",
    name: "Dr. Sarah",
    role: "Licensed Clinical Therapist",
    icon: Heart,
    color: "bg-rose-500",
    expertise: ["CBT", "DBT", "Trauma-informed care", "Crisis intervention"],
    vocabulary: ["therapeutic alliance", "cognitive restructuring", "psychoeducation"],
    methods: ["Socratic questioning", "Behavioral activation", "Exposure therapy"],
    testScenario: "I've been having panic attacks at work and feel completely overwhelmed. My heart races and I can't breathe. I'm afraid it's going to happen again."
  },
  {
    id: "alex", 
    name: "Alex",
    role: "Peer Support Specialist",
    icon: Users,
    color: "bg-blue-500",
    expertise: ["Lived experience", "Peer mentoring", "Recovery support", "Motivational interviewing"],
    vocabulary: ["lived experience", "recovery journey", "peer connection", "empowerment"],
    methods: ["Shared decision making", "Strength-based approach", "Hope instillation"],
    testScenario: "I feel like nobody understands what I'm going through. I've been struggling with depression and I'm starting to lose hope that things will get better."
  },
  {
    id: "marcus",
    name: "Marcus", 
    role: "Executive Life Coach",
    icon: TrendingUp,
    color: "bg-green-500",
    expertise: ["Goal setting", "Habit formation", "Performance optimization", "Leadership development"],
    vocabulary: ["breakthrough", "transformation", "peak performance", "accountability"],
    methods: ["SMART goals", "Habit stacking", "Systems thinking", "Progress tracking"],
    testScenario: "I keep setting ambitious goals but never follow through. I want to advance my career and build better habits, but I always lose motivation after a few days."
  },
  {
    id: "maya",
    name: "Maya",
    role: "Mindfulness & Somatic Expert", 
    icon: Leaf,
    color: "bg-purple-500",
    expertise: ["MBSR", "Meditation", "Breathwork", "Somatic awareness", "Contemplative psychology"],
    vocabulary: ["presence", "awareness", "embodied experience", "conscious breathing"],
    methods: ["Guided meditation", "Body scan", "Loving-kindness", "Breathwork"],
    testScenario: "I feel disconnected from my body and constantly anxious. My mind races with thoughts and I can't seem to find any peace or calm in my daily life."
  }
];

export default function SpecializedPersonaDemo() {
  const [selectedPersona, setSelectedPersona] = useState("sarah");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<SpecializedResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  const currentPersona = specializedPersonas.find(p => p.id === selectedPersona)!;

  const sendSpecializedMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    setLoading(true);

    try {
      const response = await fetch('/api/chat/specialized-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          personaId: selectedPersona,
          userId: `specialized-demo-${selectedPersona}`,
          isFirstMessage: conversationHistory.length === 0
        })
      });

      if (!response.ok) {
        // Fallback to enhanced message endpoint
        const fallbackResponse = await fetch('/api/chat/enhanced-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            personaId: selectedPersona,
            userId: `specialized-demo-${selectedPersona}`,
            isFirstMessage: conversationHistory.length === 0
          })
        });
        
        const data = await fallbackResponse.json();
        setLastResponse({
          ...data,
          specializedResponse: {
            domainExpertise: selectedPersona,
            therapeuticApproach: currentPersona.methods,
            adaptiveLearning: { fallbackUsed: true }
          },
          knowledgeBase: {
            availableInterventions: currentPersona.expertise,
            responseTemplates: [`Specialized ${currentPersona.role} response`],
            crisisProtocols: ['Assessment', 'Intervention', 'Follow-up']
          }
        });
      } else {
        const data: SpecializedResponse = await response.json();
        setLastResponse(data);
      }

      setConversationHistory(prev => [
        ...prev,
        { sender: 'user', content: messageText, timestamp: new Date() },
        { sender: 'ai', content: lastResponse?.aiMessage?.content || 'Processing...', timestamp: new Date() }
      ]);

    } catch (error) {
      console.error('Error sending specialized message:', error);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Specialized AI Personas with Domain Expertise
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Each persona has distinct knowledge, vocabulary, and therapeutic approaches based on their specialization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {specializedPersonas.map((persona) => {
            const Icon = persona.icon;
            const isSelected = selectedPersona === persona.id;
            
            return (
              <Card 
                key={persona.id} 
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900' : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedPersona(persona.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full ${persona.color} text-white`}>
                      <Icon className="w-5 h-5" />
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
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Domain Expertise
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {persona.expertise.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Specialized Methods
                      </h4>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {persona.methods.slice(0, 2).join(', ')}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMessage(persona.testScenario);
                        setSelectedPersona(persona.id);
                      }}
                    >
                      Try Scenario
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversation Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Specialized Conversation with {currentPersona.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ScrollArea className="h-64 border rounded-lg p-4">
                  {conversationHistory.map((msg, index) => (
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
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                        <p className="text-sm">Generating specialized response...</p>
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
                  <Button
                    onClick={() => sendSpecializedMessage(message)}
                    disabled={loading || !message.trim()}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : `Send to ${currentPersona.name}`}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialized Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Domain Expertise Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lastResponse ? (
                <Tabs defaultValue="expertise" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="expertise">Expertise</TabsTrigger>
                    <TabsTrigger value="approach">Approach</TabsTrigger>
                    <TabsTrigger value="learning">Learning</TabsTrigger>
                  </TabsList>

                  <TabsContent value="expertise" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Specialized Knowledge Applied
                      </h4>
                      {lastResponse.knowledgeBase ? (
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Available Interventions:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {lastResponse.knowledgeBase.availableInterventions.map((intervention, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {intervention}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Crisis Protocols:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {lastResponse.knowledgeBase.crisisProtocols.map((protocol, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {protocol}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Domain expertise: {currentPersona.expertise.join(', ')}</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="approach" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Therapeutic Approach
                      </h4>
                      {lastResponse.specializedResponse ? (
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Domain:</strong> {lastResponse.specializedResponse.domainExpertise}</p>
                          <div>
                            <p className="text-sm font-medium">Methods Used:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(lastResponse.specializedResponse.therapeuticApproach || currentPersona.methods).map((method: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {method}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Using {currentPersona.role} methodology</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="learning" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Adaptive Learning
                      </h4>
                      {lastResponse.personaInsights ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium">Bond Strength</p>
                            <Progress value={(lastResponse.personaInsights.bondStrength || 0.5) * 100} className="mt-1" />
                            <p className="text-xs text-gray-600 mt-1">
                              {Math.round((lastResponse.personaInsights.bondStrength || 0.5) * 100)}% - Building therapeutic relationship
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Sessions Completed</p>
                            <p className="text-lg font-bold">{lastResponse.personaInsights.totalSessions || 1}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Effective Techniques</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(lastResponse.personaInsights.preferredTechniques || currentPersona.methods.slice(0, 2)).map((technique: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {technique}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Learning from each interaction to improve responses</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Send a message to see specialized analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vocabulary & Methods Showcase */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Specialized Vocabulary & Methods Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {specializedPersonas.map((persona) => {
                const Icon = persona.icon;
                return (
                  <div key={persona.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${persona.color} text-white`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold">{persona.name}</h3>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Specialized Vocabulary</h4>
                      <div className="flex flex-wrap gap-1">
                        {persona.vocabulary.map((word, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Primary Methods</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {persona.methods.slice(0, 3).map((method, index) => (
                          <li key={index}>• {method}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}