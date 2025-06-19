import { enhancedConversationSystem } from "./enhanced_conversation_system";
import { storage } from "./storage";

// Streaming conversation engine with token-by-token responses
export class StreamingConversation {
  
  async handleStreamingConversation(
    message: string,
    personaId: string,
    userId: string,
    conversationId?: number,
    res?: any
  ) {
    try {
      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
      } else {
        conversation = await storage.createConversation({
          userId,
          personaId,
          title: `Session with ${personaId}`
        });
      }

      // Create user message
      await storage.createMessage({
        conversationId: conversation.id,
        content: message,
        sender: 'user'
      });

      // Get conversation history
      const messageHistory = await storage.getConversationMessages(conversation.id);

      // Generate advanced response
      const enhancedResponse = await enhancedConversationSystem.generateAdvancedResponse(
        message,
        personaId,
        userId,
        messageHistory
      );

      if (res) {
        // Send conversation metadata
        res.write(`data: ${JSON.stringify({
          type: 'conversation',
          data: conversation
        })}\n\n`);

        // Send response insights
        res.write(`data: ${JSON.stringify({
          type: 'insights',
          data: {
            personalizedInsights: enhancedResponse.personalizedInsights,
            emotionalResonance: enhancedResponse.emotionalResonance,
            engagementLevel: enhancedResponse.engagementLevel,
            moodInsights: enhancedResponse.moodInsights
          }
        })}\n\n`);

        // Stream response token by token for realistic typing effect
        const words = enhancedResponse.response.split(' ');
        let streamedResponse = '';

        for (let i = 0; i < words.length; i++) {
          const word = words[i] + ' ';
          streamedResponse += word;
          
          res.write(`data: ${JSON.stringify({
            type: 'token',
            content: word
          })}\n\n`);

          // Add natural typing delay
          await this.delay(Math.random() * 100 + 50);
        }

        // Send completion
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          fullResponse: enhancedResponse.response,
          memoryUpdates: enhancedResponse.memoryUpdates
        })}\n\n`);

        // Store AI message
        await storage.createMessage({
          conversationId: conversation.id,
          content: enhancedResponse.response,
          sender: 'ai'
        });

        res.end();
      }

      return enhancedResponse;

    } catch (error) {
      console.error("Streaming conversation error:", error);
      if (res) {
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: 'Failed to generate response'
        })}\n\n`);
        res.end();
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const streamingConversation = new StreamingConversation();