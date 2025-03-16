
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ref, onValue, off, query, orderByChild, limitToLast, remove, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  MoreHorizontal, 
  Trash, 
  Edit, 
  Copy, 
  Reply, 
  Pin, 
  Heart, 
  ThumbsUp, 
  Smile,
  Download,
  Image as ImageIcon,
  File,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  reactions?: { [key: string]: { [key: string]: string } };
  isPinned?: boolean;
  edited?: boolean;
};

interface MessageListProps {
  groupId: string;
}

const REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

export const MessageList: React.FC<MessageListProps> = ({ groupId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyMap, setReplyMap] = useState<Map<string, Message>>(new Map());
  const [loading, setLoading] = useState(true);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadMessages, setUnreadMessages] = useState<Set<string>>(new Set());
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(0);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build a map of reply messages for quick lookup
  useEffect(() => {
    const newReplyMap = new Map<string, Message>();
    messages.forEach(message => {
      newReplyMap.set(message.id, message);
    });
    setReplyMap(newReplyMap);
  }, [messages]);

  // Track pinned messages
  useEffect(() => {
    const pinnedMsgs = new Set<string>();
    messages.forEach(message => {
      if (message.isPinned) {
        pinnedMsgs.add(message.id);
      }
    });
    setPinnedMessageIds(pinnedMsgs);
  }, [messages]);

  // Load unread status
  useEffect(() => {
    if (!currentUser || !groupId) return;

    const userReadRef = ref(database, `userStatus/${currentUser.uid}/lastRead/${groupId}`);
    onValue(userReadRef, (snapshot) => {
      const lastRead = snapshot.val() || 0;
      setLastReadTimestamp(lastRead);
      
      // Mark messages as unread if they're newer than last read timestamp
      const unread = new Set<string>();
      messages.forEach(msg => {
        if (msg.timestamp > lastRead && msg.senderId !== currentUser.uid) {
          unread.add(msg.id);
        }
      });
      setUnreadMessages(unread);
    });

    return () => {
      off(userReadRef);
    };
  }, [currentUser, groupId, messages]);

  // Mark messages as read when component mounts or when new messages come in
  useEffect(() => {
    if (!currentUser || !groupId || messages.length === 0) return;

    // Find the timestamp of the latest message
    const latestTimestamp = Math.max(...messages.map(msg => msg.timestamp));
    
    // Update user's last read timestamp
    const userReadRef = ref(database, `userStatus/${currentUser.uid}/lastRead/${groupId}`);
    update(userReadRef, latestTimestamp);

    // Clear unread messages
    setUnreadMessages(new Set());
    
  }, [currentUser, groupId, messages]);

  // Load messages
  useEffect(() => {
    if (!groupId) return;

    const messagesRef = query(
      ref(database, `messages/${groupId}`),
      orderByChild('timestamp'),
      limitToLast(100)
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
        
        // Sort messages by timestamp
        messagesList.sort((a, b) => a.timestamp - b.timestamp);
      }
      
      setMessages(messagesList);
      setLoading(false);
    });

    return () => {
      off(messagesRef);
    };
  }, [groupId]);

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Delete the message
      const messageRef = ref(database, `messages/${groupId}/${messageId}`);
      await remove(messageRef);
      toast.success("Message deleted");
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handlePinMessage = async (messageId: string, isPinned: boolean) => {
    try {
      const messageRef = ref(database, `messages/${groupId}/${messageId}`);
      await update(messageRef, { isPinned: !isPinned });
      toast.success(isPinned ? "Message unpinned" : "Message pinned");
    } catch (error) {
      console.error("Error pinning message:", error);
      toast.error("Failed to pin message");
    }
  };

  const handleReaction = async (messageId: string, reaction: string) => {
    if (!currentUser) return;
    
    try {
      const message = messages.find(msg => msg.id === messageId);
      if (!message) return;
      
      // Check if user already reacted with this emoji
      const userReactions = message.reactions?.[currentUser.uid] || {};
      const alreadyReacted = Object.values(userReactions).includes(reaction);
      
      // Prepare reactions object
      const messageReactions = message.reactions || {};
      const userReactionsObj = messageReactions[currentUser.uid] || {};
      
      // Toggle reaction
      if (alreadyReacted) {
        // Remove the reaction
        const reactionKey = Object.keys(userReactionsObj).find(
          key => userReactionsObj[key] === reaction
        );
        if (reactionKey) {
          delete userReactionsObj[reactionKey];
        }
      } else {
        // Add the reaction with a unique key
        userReactionsObj[Date.now().toString()] = reaction;
      }
      
      // Update message with new reactions
      const messageRef = ref(database, `messages/${groupId}/${messageId}`);
      await update(messageRef, {
        reactions: {
          ...messageReactions,
          [currentUser.uid]: userReactionsObj
        }
      });
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast.error("Failed to add reaction");
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard");
  };

  const formatMessageTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const countReactions = (reactions?: { [key: string]: { [key: string]: string } }) => {
    if (!reactions) return {};
    
    const counts: { [key: string]: number } = {};
    
    // Count reactions by emoji
    Object.values(reactions).forEach(userReactions => {
      Object.values(userReactions).forEach(reaction => {
        counts[reaction] = (counts[reaction] || 0) + 1;
      });
    });
    
    return counts;
  };

  const hasUserReacted = (
    reactions?: { [key: string]: { [key: string]: string } },
    emoji?: string
  ) => {
    if (!reactions || !currentUser || !emoji) return false;
    
    const userReactions = reactions[currentUser.uid];
    if (!userReactions) return false;
    
    return Object.values(userReactions).includes(emoji);
  };

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

  // Filter for pinned messages
  const pinnedMessages = messages.filter(m => m.isPinned);

  return (
    <div className="space-y-4">
      {/* Pinned messages section */}
      {pinnedMessages.length > 0 && (
        <div className="sticky top-0 z-10 bg-background border rounded-md mb-4 shadow-sm">
          <div className="p-3 border-b">
            <h3 className="text-sm font-medium flex items-center">
              <Pin className="h-3 w-3 mr-1" />
              Pinned Messages
            </h3>
          </div>
          <div className="max-h-24 overflow-y-auto p-3">
            {pinnedMessages.map(message => (
              <div key={`pinned-${message.id}`} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="font-medium text-foreground">{message.senderName}:</span>
                <span className="line-clamp-1">{message.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Message list */}
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUser?.uid;
          const isUnread = unreadMessages.has(message.id);
          const replyToMessage = message.replyTo ? replyMap.get(message.replyTo) : undefined;
          
          return (
            <div 
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`
                flex 
                ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} 
                items-end gap-2 
                max-w-[80%]
                relative
              `}>
                {/* Unread indicator */}
                {isUnread && (
                  <div className="absolute -right-2 -top-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
                )}
                
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
                    ? 'items-end' 
                    : 'items-start'
                  }
                `}>
                  {/* Reply to message preview */}
                  {replyToMessage && (
                    <div className={`
                      text-xs px-3 py-1.5 mb-1 max-w-[300px] line-clamp-1
                      ${isCurrentUser 
                        ? 'bg-primary/20 text-primary-foreground/80 rounded-t-lg rounded-l-lg' 
                        : 'bg-muted/50 text-muted-foreground rounded-t-lg rounded-r-lg'
                      }
                    `}>
                      <span className="font-medium">↩️ {replyToMessage.senderName}: </span>
                      {replyToMessage.text}
                    </div>
                  )}
                  
                  <div className={`
                    flex flex-col
                    ${isCurrentUser 
                      ? 'items-end bg-primary text-primary-foreground' 
                      : 'items-start bg-muted'
                    }
                    px-3 py-2 rounded-lg
                    ${message.isPinned ? 'border-l-2 border-yellow-500' : ''}
                  `}>
                    <div className="flex items-center justify-between w-full">
                      {!isCurrentUser && (
                        <span className="text-xs font-medium mb-1">{message.senderName}</span>
                      )}
                      
                      {/* Message options dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`
                              h-5 w-5 
                              ${isCurrentUser ? 'mr-auto' : 'ml-auto'} 
                              rounded-full 
                              p-0 
                              opacity-0 
                              group-hover:opacity-100
                              transition-opacity
                              ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}
                            `}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isCurrentUser ? "end" : "start"} className="w-40">
                          <DropdownMenuItem onClick={() => setReplyToMessage(message)}>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyMessage(message.text)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy text
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => handlePinMessage(message.id, !!message.isPinned)}>
                            <Pin className="h-4 w-4 mr-2" />
                            {message.isPinned ? 'Unpin' : 'Pin'}
                          </DropdownMenuItem>
                          
                          {/* Only show edit for own messages */}
                          {isCurrentUser && (
                            <>
                              <DropdownMenuItem onClick={() => setEditMessage(message)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteConfirm(message.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Media content */}
                    {message.imageUrl && (
                      <a 
                        href={message.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mb-2 group/image relative"
                      >
                        <div className="overflow-hidden rounded-md mb-2">
                          <img 
                            src={message.imageUrl} 
                            alt="Shared media" 
                            className="max-w-[300px] max-h-[200px] object-contain rounded transition-transform group-hover/image:scale-[0.98]"
                          />
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover/image:opacity-100 transition-opacity">
                          <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full backdrop-blur-sm bg-background/50" asChild>
                            <a href={message.imageUrl} download target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </a>
                    )}
                    
                    {message.fileUrl && (
                      <a 
                        href={message.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 mb-2 p-2 rounded-md bg-background/20 hover:bg-background/30 transition-colors"
                      >
                        <File className="h-5 w-5 shrink-0" />
                        <span className="text-sm truncate max-w-[200px]">
                          {message.fileName || "Attached file"}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-auto" />
                      </a>
                    )}
                    
                    {/* Message text with mention highlighting */}
                    <p className="break-words whitespace-pre-wrap">
                      {message.text.split(/@([a-zA-Z0-9_]+)/).map((part, index) => {
                        // Even indices are normal text, odd indices are mentions
                        if (index % 2 === 0) return part;
                        return (
                          <span key={index} className="bg-primary-foreground/20 text-primary-foreground font-medium rounded px-1 py-0.5">
                            @{part}
                          </span>
                        );
                      })}
                    </p>
                    
                    {/* Message metadata */}
                    <div className="text-xs opacity-70 mt-1 flex items-center">
                      <span>{formatMessageTime(message.timestamp)}</span>
                      {message.edited && (
                        <span className="ml-1">(edited)</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Reactions */}
                  {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className={`
                      flex flex-wrap gap-1 mt-1 
                      ${isCurrentUser ? 'justify-end' : 'justify-start'}
                    `}>
                      {Object.entries(countReactions(message.reactions)).map(([emoji, count]) => (
                        <Button
                          key={emoji}
                          variant="outline"
                          size="sm"
                          className={`
                            h-6 px-1.5 py-0 text-xs rounded-full
                            ${hasUserReacted(message.reactions, emoji) ? 'bg-muted border-primary' : ''}
                          `}
                          onClick={() => handleReaction(message.id, emoji)}
                        >
                          {emoji} {count}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Quick reactions bar */}
                  <div className={`
                    opacity-0 group-hover:opacity-100 transition-opacity
                    mt-1 flex gap-1 p-1 bg-background border rounded-full shadow-sm
                    ${isCurrentUser ? 'justify-end' : 'justify-start'}
                  `}>
                    {REACTIONS.map(emoji => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full p-0 hover:bg-muted"
                        onClick={() => handleReaction(message.id, emoji)}
                      >
                        <span className="text-xs">{emoji}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the message. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirm && handleDeleteMessage(deleteConfirm)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
