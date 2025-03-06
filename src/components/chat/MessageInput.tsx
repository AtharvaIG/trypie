
import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ref, push, serverTimestamp, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image, Smile } from "lucide-react";
import { toast } from "sonner";

interface MessageInputProps {
  groupId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ groupId }) => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !fileInputRef.current?.files?.length) {
      return;
    }
    
    if (!currentUser) {
      toast.error("You must be logged in to send messages");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create a new message reference
      const messageRef = push(ref(database, `messages/${groupId}`));
      
      // Prepare message data
      const messageData = {
        text: message.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || "Anonymous",
        timestamp: Date.now()
      };
      
      // Upload file logic would go here in a real app
      // For now, we'll just simulate a file upload with a placeholder URL
      if (fileInputRef.current?.files?.length) {
        messageData.imageUrl = "https://via.placeholder.com/300x200";
      }
      
      // Save the message
      await update(messageRef, messageData);
      
      // Update last activity for the group
      await update(ref(database, `groups/${groupId}`), {
        lastActivity: "Just now"
      });
      
      // Clear the input
      setMessage("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={() => toast.info("Image selected (Upload functionality would be implemented in a real app)")}
      />
      
      <Button 
        type="button"
        variant="ghost" 
        size="icon"
        onClick={handleFileUpload}
        className="h-10 w-10 rounded-full"
      >
        <Image className="h-5 w-5" />
      </Button>
      
      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1"
      />
      
      <Button 
        type="submit"
        disabled={isSubmitting || (!message.trim() && !fileInputRef.current?.files?.length)}
        className="rounded-full h-10 w-10 p-0"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};
