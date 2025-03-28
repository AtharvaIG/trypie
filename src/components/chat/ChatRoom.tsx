import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { database } from "@/lib/firebase";
import { ref, push, onValue, off } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ChatNavTabs } from './ChatNavTabs';
import { SplitExpenses } from './SplitExpenses';
import { MediaGallery } from './MediaGallery';

type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
};

const ChatRoom = ({ groupId }: { groupId: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { currentUser } = useAuth();
  const messagesRef = useRef(ref(database, `chats/${groupId}`));
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!groupId) return;
    
    messagesRef.current = ref(database, `chats/${groupId}`);
    
    const unsubscribe = onValue(messagesRef.current, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList: ChatMessage[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          text: value.text,
          senderId: value.senderId,
          senderName: value.senderName,
          timestamp: value.timestamp,
        }));
        setMessages(messageList);
      } else {
        setMessages([]);
      }
      scrollToBottom();
    });
    
    return () => {
      off(messagesRef.current);
      unsubscribe();
    };
  }, [groupId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    
    if (!currentUser) {
      toast.error("You must be logged in to send messages.");
      return;
    }
    
    const message: ChatMessage = {
      id: uuidv4(),
      text: newMessage,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || "Anonymous",
      timestamp: Date.now(),
    };
    
    try {
      await push(messagesRef.current, message);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 p-2 rounded-lg ${
              message.senderId === currentUser?.uid
                ? "bg-primary/10 ml-auto text-right"
                : "bg-secondary/10 mr-auto text-left"
            }`}
          >
            <div className="text-xs text-muted-foreground">
              {message.senderId === currentUser?.uid ? "You" : message.senderName}
            </div>
            <div>{message.text}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            className="flex-grow mr-2"
          />
          <Button onClick={handleSendMessage}><Send className="h-4 w-4"/></Button>
        </div>
      </div>
    </div>
  );
};

const ChatRoomWrapper = ({ groupId }: { groupId: string }) => {
  const [activeTab, setActiveTab] = useState("chat");
  
  return (
    <div className="h-[70vh] md:h-[80vh] flex flex-col">
      <ChatNavTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === "chat" && <ChatRoom groupId={groupId} />}
      {activeTab === "media" && <MediaGallery groupId={groupId} />}
      {activeTab === "expenses" && <SplitExpenses groupId={groupId} />}
    </div>
  );
};

export default ChatRoomWrapper;
