import { useQuery } from "@tanstack/react-query";

export function usePersonas() {
  return useQuery({
    queryKey: ["/api/personas"],
    retry: false,
  });
}

export function useConversations(userId: string) {
  return useQuery({
    queryKey: ["/api/conversations", userId],
    enabled: !!userId,
    retry: false,
  });
}

export function useConversationMessages(conversationId: number) {
  return useQuery({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
    retry: false,
  });
}