import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Message, Persona } from "@shared/schema";

export function useChat(personaId?: string, conversationId?: number) {
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>(conversationId);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [greeting, setGreeting] = useState<string | undefined>();
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [suggestSessionEnd, setSuggestSessionEnd] = useState(false);
  const queryClient = useQueryClient();

  // Get conversation messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    queryFn: () => currentConversationId ? api.getConversationMessages(currentConversationId) : Promise.resolve([]),
    enabled: !!currentConversationId,
  });

  // Get persona info
  const { data: persona } = useQuery({
    queryKey: ["/api/personas", personaId],
    queryFn: () => personaId ? api.getPersona(personaId) : Promise.resolve(null),
    enabled: !!personaId,
  });

  // Get greeting when persona changes
  useEffect(() => {
    if (personaId && !currentConversationId) {
      api.getGreeting({ personaId, userId: "anonymous" })
        .then((response) => {
          setGreeting(response.greeting);
          if (response.requiresMoodCheck) {
            setShowMoodSelector(true);
          }
        })
        .catch(console.error);
    }
  }, [personaId, currentConversationId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => {
      if (!personaId) throw new Error("No persona selected");
      const isFirstMessage = messages.length === 0;
      return api.sendMessage({
        message,
        personaId,
        conversationId: currentConversationId,
        userId: "anonymous",
        isFirstMessage,
        userMood: selectedMood
      });
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      // Update conversation ID if it's a new conversation
      if (!currentConversationId && data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }
      
      // Handle crisis detection
      if (data.crisisDetected) {
        setCrisisDetected(true);
      }
      
      // Handle session end suggestion
      if (data.suggestSessionEnd) {
        setSuggestSessionEnd(true);
      }
      
      // Invalidate and refetch messages
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", data.conversationId || currentConversationId, "messages"]
      });
      
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  }, [sendMessageMutation]);

  const handleMoodSelect = useCallback((mood: string) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);
  }, []);

  const skipMoodCheck = useCallback(() => {
    setShowMoodSelector(false);
  }, []);

  const dismissCrisisAlert = useCallback(() => {
    setCrisisDetected(false);
  }, []);

  const dismissSessionEndSuggestion = useCallback(() => {
    setSuggestSessionEnd(false);
  }, []);

  return {
    messages,
    persona,
    isTyping,
    messagesLoading,
    sendMessage,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
    conversationId: currentConversationId,
    showMoodSelector,
    handleMoodSelect,
    skipMoodCheck,
    greeting,
    selectedMood,
    crisisDetected,
    dismissCrisisAlert,
    suggestSessionEnd,
    dismissSessionEndSuggestion,
  };
}

export function usePersonas() {
  return useQuery({
    queryKey: ["/api/personas"],
    queryFn: api.getPersonas,
  });
}

export function useConversations(userId: string = "anonymous") {
  return useQuery({
    queryKey: ["/api/conversations", userId],
    queryFn: () => api.getConversations(userId),
  });
}
