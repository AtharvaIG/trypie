
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ref, push, serverTimestamp, update, get } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { database } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Image, 
  File, 
  Smile, 
  AtSign,
  X,
  Reply,
  Edit,
  Paperclip
} from "lucide-react";
import { toast } from "sonner";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface MessageInputProps {
  groupId: string;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
  editMessage?: Message | null;
  onCancelEdit?: () => void;
}

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  replyTo?: string;
  mentions?: string[];
};

// Define emoji sets
const EMOJI_SETS = {
  common: ["😊", "😂", "❤️", "👍", "🎉", "🔥", "😍", "🙏", "😭", "😎"],
  faces: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊"],
  gestures: ["👍", "👎", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✌️", "🤟"],
  symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "✨", "⭐"],
};

export const MessageInput: React.FC<MessageInputProps> = ({ 
  groupId,
  replyToMessage,
  onCancelReply,
  editMessage,
  onCancelEdit
}) => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionUsers, setMentionUsers] = useState<{id: string, name: string}[]>([]);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    type: 'image' | 'file';
    name?: string;
  } | null>(null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Effect to set message when editing
  useEffect(() => {
    if (editMessage) {
      setMessage(editMessage.text || "");
      if (editMessage.imageUrl) {
        setUploadedFile({
          url: editMessage.imageUrl,
          type: 'image'
        });
      } else if (editMessage.fileUrl) {
        setUploadedFile({
          url: editMessage.fileUrl,
          type: 'file',
          name: editMessage.fileName
        });
      }
    }
  }, [editMessage]);
  
  // Focus the input when component mounts or when replying/editing
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyToMessage, editMessage]);
  
  // Function to load group members for @mentions
  const loadGroupMembers = async (query: string) => {
    try {
      // Get the group members
      const groupMembersRef = ref(database, `groups/${groupId}/membersList`);
      const snapshot = await get(groupMembersRef);
      
      if (snapshot.exists()) {
        const memberIds = Object.keys(snapshot.val());
        const usersPromises = memberIds.map(userId => 
          get(ref(database, `users/${userId}`))
        );
        
        const userSnapshots = await Promise.all(usersPromises);
        const users = userSnapshots.map((snapshot, index) => {
          const userData = snapshot.exists() ? snapshot.val() : null;
          return {
            id: memberIds[index],
            name: userData?.displayName || userData?.email?.split('@')[0] || "Anonymous"
          };
        });
        
        const filteredUsers = users.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase()) &&
          user.id !== currentUser?.uid
        );
        
        setMentionUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Error loading group members:", error);
    }
  };
  
  // Handle @mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // Check for @mention
    const lastAtIndex = newValue.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      // Find if we're in the middle of a mention
      const textAfterAt = newValue.substring(lastAtIndex + 1);
      const spaceAfterAt = textAfterAt.indexOf(' ');
      const mentionText = spaceAfterAt === -1 ? textAfterAt : textAfterAt.substring(0, spaceAfterAt);
      
      if (mentionText) {
        setMentionQuery(mentionText);
        loadGroupMembers(mentionText);
        setShowMentionList(true);
      } else {
        setShowMentionList(false);
      }
    } else {
      setShowMentionList(false);
    }
  };
  
  const insertMention = (user: {id: string, name: string}) => {
    const lastAtIndex = message.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const newMessage = 
        message.substring(0, lastAtIndex) + 
        `@${user.name} ` + 
        message.substring(lastAtIndex + mentionQuery.length + 1);
      
      setMessage(newMessage);
    }
    
    setShowMentionList(false);
    inputRef.current?.focus();
  };
  
  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Get reference to storage
      const storage = getStorage();
      const fileRef = storageRef(storage, `group-files/${groupId}/${Date.now()}_${file.name}`);
      
      // Upload file
      const uploadTask = uploadBytes(fileRef, file);
      
      // Handle progress (in a real app, you'd use uploadTask.on('state_changed', ...))
      // Since Firebase's Web v9 modular API doesn't directly expose progress events,
      // this is a simulated progress for the demo
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress > 99) {
            progress = 100;
            clearInterval(interval);
          }
          setUploadProgress(Math.min(progress, 100));
        }, 200);
        
        return interval;
      };
      
      const progressInterval = simulateProgress();
      
      // Wait for upload to complete
      await uploadTask;
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(fileRef);
      
      const isImage = file.type.startsWith('image/');
      
      setUploadedFile({
        url: downloadUrl,
        type: isImage ? 'image' : 'file',
        name: file.name
      });
      
      toast.success(`${isImage ? 'Image' : 'File'} uploaded successfully!`);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const removeUploadedFile = () => {
    setUploadedFile(null);
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !uploadedFile) {
      return;
    }
    
    if (!currentUser) {
      toast.error("You must be logged in to send messages");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Extract mentions
      const mentionRegex = /@([a-zA-Z0-9_]+)/g;
      const mentionsInMessage = [...message.matchAll(mentionRegex)].map(match => match[1]);
      
      // Prepare base message data
      const messageData: any = {
        text: message.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || "Anonymous",
        timestamp: Date.now()
      };
      
      // Add reply info if replying
      if (replyToMessage) {
        messageData.replyTo = replyToMessage.id;
      }
      
      // Add file info if uploaded
      if (uploadedFile) {
        if (uploadedFile.type === 'image') {
          messageData.imageUrl = uploadedFile.url;
        } else {
          messageData.fileUrl = uploadedFile.url;
          messageData.fileName = uploadedFile.name;
        }
      }
      
      // Add mentions if any
      if (mentionsInMessage.length > 0) {
        messageData.mentions = mentionsInMessage;
      }
      
      if (editMessage) {
        // Update existing message
        const messageRef = ref(database, `messages/${groupId}/${editMessage.id}`);
        await update(messageRef, messageData);
        toast.success("Message updated");
        
        if (onCancelEdit) onCancelEdit();
      } else {
        // Create a new message reference
        const messageRef = push(ref(database, `messages/${groupId}`));
        await update(messageRef, messageData);
        
        // Update last activity for the group
        await update(ref(database, `groups/${groupId}`), {
          lastActivity: "Just now"
        });
        
        if (replyToMessage && onCancelReply) {
          onCancelReply();
        }
      }
      
      // Clear the input
      setMessage("");
      setUploadedFile(null);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };
  
  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {/* Reply or Edit indicator */}
      {(replyToMessage || editMessage) && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
          <div className="flex-1 flex items-center gap-2 overflow-hidden">
            {replyToMessage ? (
              <>
                <Reply className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">
                  Replying to {replyToMessage.senderName}
                </span>
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">
                  Editing message
                </span>
              </>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6"
            onClick={replyToMessage ? onCancelReply : onCancelEdit}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* File upload progress */}
      {isUploading && (
        <div className="px-3 py-2 bg-muted rounded-md">
          <div className="flex justify-between mb-1 text-sm">
            <span>Uploading file...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {/* Uploaded file preview */}
      {uploadedFile && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
          {uploadedFile.type === 'image' ? (
            <div className="relative w-16 h-16">
              <img 
                src={uploadedFile.url} 
                alt="Upload preview" 
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <File className="h-5 w-5" />
              <span className="text-sm truncate max-w-[200px]">
                {uploadedFile.name}
              </span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            className="ml-auto h-6 w-6"
            onClick={removeUploadedFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Message input form */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col flex-1 relative">
          <Textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="min-h-[60px] resize-none pr-10"
            rows={2}
          />
          
          {/* Emoji picker button */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                className="h-8 w-8 absolute bottom-1 right-1 rounded-full"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="end">
              <Tabs defaultValue="common">
                <TabsList className="grid grid-cols-4 mb-2">
                  <TabsTrigger value="common">Common</TabsTrigger>
                  <TabsTrigger value="faces">Faces</TabsTrigger>
                  <TabsTrigger value="gestures">Gestures</TabsTrigger>
                  <TabsTrigger value="symbols">Symbols</TabsTrigger>
                </TabsList>
                <TabsContent value="common" className="grid grid-cols-5 gap-2">
                  {EMOJI_SETS.common.map(emoji => (
                    <Button 
                      key={emoji} 
                      variant="ghost" 
                      className="h-8 w-8 p-0" 
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </TabsContent>
                <TabsContent value="faces" className="grid grid-cols-5 gap-2">
                  {EMOJI_SETS.faces.map(emoji => (
                    <Button 
                      key={emoji} 
                      variant="ghost" 
                      className="h-8 w-8 p-0" 
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </TabsContent>
                <TabsContent value="gestures" className="grid grid-cols-5 gap-2">
                  {EMOJI_SETS.gestures.map(emoji => (
                    <Button 
                      key={emoji} 
                      variant="ghost" 
                      className="h-8 w-8 p-0" 
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </TabsContent>
                <TabsContent value="symbols" className="grid grid-cols-5 gap-2">
                  {EMOJI_SETS.symbols.map(emoji => (
                    <Button 
                      key={emoji} 
                      variant="ghost" 
                      className="h-8 w-8 p-0" 
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
          
          {/* Mention suggestions */}
          {showMentionList && mentionUsers.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 w-full bg-background border rounded-md shadow-md z-10">
              <ScrollArea className="max-h-[150px]">
                <div className="p-1">
                  {mentionUsers.map(user => (
                    <button
                      key={user.id}
                      className="flex items-center gap-2 w-full p-2 text-left hover:bg-muted rounded-md"
                      onClick={() => insertMention(user)}
                      type="button"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            onClick={handleAttachment}
            className="h-10 w-10 rounded-full"
            disabled={isSubmitting || isUploading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Button 
            type="submit"
            disabled={isSubmitting || isUploading || (!message.trim() && !uploadedFile)}
            className="rounded-full h-10 w-10 p-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
