
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ref, onValue, off, query, orderByChild, limitToLast } from "firebase/database";
import { database } from "@/lib/firebase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  imageUrl?: string;
};

interface MessageListProps {
  groupId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ groupId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!groupId) return;

    const messagesRef = query(
      ref(database, `messages/${groupId}`),
      orderByChild('timestamp'),
      limitToLast(50)
    );
    
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const messagesList: Message[] = [];
      
      if (data) {
        Object.keys(data).forEach((key) => {
          messagesList.push({
            id: key,
            ...data[key]
          });
        });
      }
      
      setMessages(messagesList);
      setLoading(false);
    });

    return () => {
      off(messagesRef);
    };
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>No messages yet</p>
        <p className="text-sm">Be the first to say hello!</p>
      </div>
    );
  }

  const formatMessageTime = (timestamp: number) => {
    return format(new Date(timestamp), "h:mm a");
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.senderId === currentUser?.uid;
        
        return (
          <div 
            key={message.id}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
              {!isCurrentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {message.senderName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`
                flex flex-col
                ${isCurrentUser 
                  ? 'items-end bg-primary text-primary-foreground' 
                  : 'items-start bg-muted'
                }
                px-3 py-2 rounded-lg
              `}>
                {!isCurrentUser && (
                  <span className="text-xs font-medium mb-1">{message.senderName}</span>
                )}
                
                {message.imageUrl && (
                  <img 
                    src={message.imageUrl} 
                    alt="Shared media" 
                    className="rounded mb-2 max-w-[300px] max-h-[200px] object-contain"
                  />
                )}
                
                <p className="break-words">{message.text}</p>
                <span className="text-xs opacity-70 mt-1">
                  {formatMessageTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
