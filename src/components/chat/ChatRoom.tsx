
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { database } from "@/lib/firebase";
import { ref, push, onValue, off, set } from "firebase/database";
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
  imageUrl?: string;
  fileType?: string;
};

const ChatRoom = ({ groupId }: { groupId: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { currentUser } = useAuth();
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  
  useEffect(() => {
    if (!groupId || !currentUser) return;
    
    console.log(`Connecting to messages at groups/${groupId}/messages`);
    
    // Reference to group messages
    const groupMessagesRef = ref(database, `groups/${groupId}/messages`);
    
    const unsubscribe = onValue(groupMessagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList: ChatMessage[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          text: value.text,
          senderId: value.senderId,
          senderName: value.senderName,
          timestamp: value.timestamp,
          imageUrl: value.imageUrl,
          fileType: value.fileType
        }));
        
        // Sort messages by timestamp
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messageList);
      } else {
        setMessages([]);
      }
      scrollToBottom();
    });
    
    return () => {
      off(groupMessagesRef);
      console.log("Disconnected from messages");
    };
  }, [groupId, currentUser]);
  
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || isSending) return;
    
    if (!currentUser) {
      toast.error("You must be logged in to send messages.");
      return;
    }
    
    if (!groupId) {
      toast.error("Invalid group selected.");
      return;
    }
    
    setIsSending(true);
    
    try {
      const messageId = uuidv4();
      console.log("Creating message with ID:", messageId);
      
      const message = {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "Anonymous",
        timestamp: Date.now(),
      };
      
      console.log(`Sending message to groups/${groupId}/messages/${messageId}`, message);
      
      // Write directly to the specific message path
      const messageRef = ref(database, `groups/${groupId}/messages/${messageId}`);
      await set(messageRef, message);
      
      console.log("Message sent successfully");
      setNewMessage("");
      scrollToBottom();
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(`Failed to send message: ${error.message || "Unknown error"}`);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-2 p-2 rounded-lg ${
                message.senderId === currentUser?.uid
                  ? "bg-primary/10 ml-auto text-right"
                  : "bg-secondary/10 mr-auto text-left"
              } max-w-[75%]`}
            >
              <div className="text-xs text-muted-foreground">
                {message.senderId === currentUser?.uid ? "You" : message.senderName}
              </div>
              <div className="break-words">{message.text}</div>
              {message.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={message.imageUrl} 
                    alt="Shared media" 
                    className="max-w-full h-auto rounded" 
                  />
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
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
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-grow mr-2"
            disabled={isSending}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isSending || newMessage.trim() === ""}
          >
            {isSending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
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
