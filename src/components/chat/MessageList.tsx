
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, Reply, FileText, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ref, remove } from 'firebase/database';
import { database } from '@/lib/firebase';

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  isCurrentUser?: boolean;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  replyTo?: string;
  groupId?: string; // Add groupId to the Message type
};

interface MessageListProps {
  messages: Message[];
  onReplyToMessage?: (message: Message) => void;
  onEditMessage?: (message: Message) => void;
  groupId: string; // Add groupId as a required prop
}

export function MessageListWrapper({ 
  messages = [],
  onReplyToMessage,
  onEditMessage,
  groupId // Add groupId parameter
}: MessageListProps) {
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleDeleteMessage = async (messageId: string, groupId: string) => {
    if (!currentUser) return;
    
    try {
      await remove(ref(database, `messages/${groupId}/${messageId}`));
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <p className="text-center text-muted-foreground my-4">
          No messages yet. Start the conversation!
        </p>
      ) : (
        <>
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex items-start gap-2 ${message.isCurrentUser ? 'justify-end' : ''}`}
            >
              {!message.isCurrentUser && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  {message.senderName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              
              <div 
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.isCurrentUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                {/* Sender name (for others' messages) */}
                {!message.isCurrentUser && (
                  <p className="text-sm font-medium">{message.senderName || 'User'}</p>
                )}
                
                {/* Message text */}
                <p>{message.text}</p>
                
                {/* Image if present */}
                {message.imageUrl && (
                  <a href={message.imageUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
                    <img 
                      src={message.imageUrl} 
                      alt="Attached" 
                      className="max-w-full rounded-md max-h-[200px] object-cover"
                    />
                  </a>
                )}
                
                {/* File if present */}
                {message.fileUrl && (
                  <a 
                    href={message.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1 mt-2 ${
                      message.isCurrentUser ? 'text-primary-foreground/90' : 'text-blue-600'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm underline">
                      {message.fileName || 'Attached file'}
                    </span>
                  </a>
                )}
                
                {/* Timestamp */}
                <span 
                  className={`text-xs ${
                    message.isCurrentUser ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </span>
                
                {/* Message actions */}
                {currentUser && (
                  <div 
                    className={`flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      message.isCurrentUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Reply button */}
                    {onReplyToMessage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onReplyToMessage(message)}
                      >
                        <Reply className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {/* Edit button (only for own messages) */}
                    {message.isCurrentUser && onEditMessage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onEditMessage(message)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {/* Delete button (only for own messages) */}
                    {message.isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => handleDeleteMessage(message.id, groupId)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}

// Export the wrapper as the default export
export default MessageListWrapper;
