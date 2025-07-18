import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Clock, MessageCircle, Brain, Heart, Target, Leaf } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: number;
  conversationId: number;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  emotionDetected?: string;
}

interface Conversation {
  id: number;
  userId: string;
  personaId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  persona?: {
    id: string;
    name: string;
    role: string;
    emoji: string;
  };
}

const personaIcons = {
  sarah: Heart,
  alex: Brain,
  marcus: Target,
  maya: Leaf,
};

const personaGradients = {
  sarah: "from-[#EC4899] to-[#F472B6]",
  alex: "from-[#B794D1] to-[#9B7CB8]", 
  marcus: "from-[#C8A2E8] to-[#B794D1]",
  maya: "from-[#7A5A95] to-[#5A3F70]",
};

export default function ChatSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, setLocation] = useLocation();

  const { data: conversation, isLoading: conversationLoading } = useQuery<Conversation>({
    queryKey: ["/api/conversations", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${sessionId}`);
      if (!response.ok) {
        throw new Error("Conversation not found");
      }
      return response.json();
    },
    enabled: !!sessionId,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", sessionId, "messages"],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${sessionId}/messages`);
      if (!response.ok) {
        throw new Error("Messages not found");
      }
      return response.json();
    },
    enabled: !!sessionId,
  });

  if (conversationLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Conversation Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The requested conversation could not be found.</p>
          <Button onClick={() => setLocation("/memory")} className="mt-4">
            Back to Memory & Insights
          </Button>
        </div>
      </div>
    );
  }

  const IconComponent = personaIcons[conversation.personaId as keyof typeof personaIcons] || Brain;
  const gradient = personaGradients[conversation.personaId as keyof typeof personaGradients] || "from-slate-500 to-slate-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/memory")}
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Memory
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-white/50">
                  <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-bold`}>
                    {conversation.persona?.emoji || conversation.personaId[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {conversation.title}
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Chat with {conversation.persona?.name || conversation.personaId}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {messages.length} Messages
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 lg:px-6 xl:px-8 py-8">
        {/* Session Info */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 mb-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Started</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {format(new Date(conversation.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {format(new Date(conversation.createdAt), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Persona</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {conversation.persona?.name || conversation.personaId}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <div className="space-y-6 max-w-full">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 max-w-4xl mx-auto">
            Conversation History
          </h3>
          
          {messages.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No messages found in this conversation.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 w-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] xl:max-w-[65%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {message.sender === 'ai' && (
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-xs`}>
                            {conversation.persona?.emoji || conversation.personaId[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {message.sender === 'user' ? 'You' : conversation.persona?.name || conversation.personaId}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(message.timestamp), 'h:mm a')}
                      </span>
                      {message.emotionDetected && (
                        <Badge variant="outline" className="text-xs">
                          {message.emotionDetected}
                        </Badge>
                      )}
                    </div>
                    <Card className={`${
                      message.sender === 'user' 
                        ? 'bg-purple-500 text-white border-purple-500' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}>
                      <CardContent className="p-4">
                        <p className={`text-sm leading-relaxed ${
                          message.sender === 'user' 
                            ? 'text-white' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {message.content}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => setLocation("/")}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-3 rounded-2xl font-medium"
          >
            Continue Conversation
          </Button>
        </div>
      </div>
    </div>
  );
}