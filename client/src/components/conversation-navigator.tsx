import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, MessageSquare, Clock, User, Bot, Eye, Edit3 } from "lucide-react";
import { format } from 'date-fns';

interface ConversationNavigatorProps {
  conversationHistory: any[];
  onMessageSelect?: (messageId: string) => void;
  onSessionSummary?: () => void;
  className?: string;
}

interface MessageEditProps {
  message: any;
  onEdit: (newContent: string) => void;
  onCancel: () => void;
}

function MessageEditForm({ message, onEdit, onCancel }: MessageEditProps) {
  const [editedContent, setEditedContent] = useState(message.content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedContent.trim() !== message.content) {
      onEdit(editedContent.trim());
    } else {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="w-full p-3 border rounded-md resize-none min-h-[80px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
          Update
        </Button>
      </div>
    </form>
  );
}

export default function ConversationNavigator({ 
  conversationHistory, 
  onMessageSelect, 
  onSessionSummary,
  className = '' 
}: ConversationNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const handleEditMessage = (messageId: string, newContent: string) => {
    // Here you would implement the actual message editing logic
    console.log(`Editing message ${messageId} to: ${newContent}`);
    setEditingMessageId(null);
    // TODO: Call API to update message
  };

  const groupMessagesByDate = (messages: any[]) => {
    const grouped: Record<string, any[]> = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt || message.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });
    
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(conversationHistory);
  const messageCount = conversationHistory.length;
  const sessionDuration = conversationHistory.length > 0 ? 
    Math.ceil((new Date().getTime() - new Date(conversationHistory[0].createdAt || conversationHistory[0].timestamp).getTime()) / (1000 * 60)) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${className}`}
        >
          <History className="h-4 w-4" />
          View Session ({messageCount})
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation History
            <Badge variant="secondary" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              {sessionDuration}min
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          {onSessionSummary && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSessionSummary}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Session Summary
            </Button>
          )}
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([dateKey, messages]) => (
              <div key={dateKey}>
                <div className="sticky top-0 bg-white dark:bg-gray-900 py-2 mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 border-b pb-1">
                    {format(new Date(dateKey), 'MMMM d, yyyy')}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className="group border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {message.sender === 'user' ? (
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {message.sender === 'user' ? 'You' : (message.persona || 'Assistant')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.createdAt || message.timestamp), 'h:mm a')}
                            </span>
                            
                            {/* Edit button for user messages */}
                            {message.sender === 'user' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 ml-auto"
                                onClick={() => setEditingMessageId(message.id)}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          
                          {editingMessageId === message.id ? (
                            <MessageEditForm
                              message={message}
                              onEdit={(content) => handleEditMessage(message.id, content)}
                              onCancel={() => setEditingMessageId(null)}
                            />
                          ) : (
                            <div 
                              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
                              onClick={() => onMessageSelect?.(message.id)}
                            >
                              {message.content}
                            </div>
                          )}
                          
                          {/* Show emotion tags for user messages */}
                          {message.sender === 'user' && message.emotions && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {message.emotions.map((emotion: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {emotion}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}