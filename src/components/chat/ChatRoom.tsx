
import React, { useState, useEffect } from 'react';
import { ref, onValue, off, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { toast } from 'sonner';
import { MessageListWrapper } from './MessageList';
import { MessageInput } from './MessageInput';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { ChatNavTabs } from './ChatNavTabs';
import { MediaGallery } from './MediaGallery';
import { SplitExpenses } from './SplitExpenses';
import { Tabs, TabsContent } from '@/components/ui/tabs';

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
  groupId?: string;
};

type ChatRoomProps = {
  groupId: string;
};

export function ChatRoomWrapper({ groupId }: ChatRoomProps) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("Chat Room");
  const [membersCount, setMembersCount] = useState(0);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState('chat');

  // Fetch group details
  useEffect(() => {
    if (!groupId) return;

    const groupRef = ref(database, `groups/${groupId}`);
    onValue(groupRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setGroupName(data.name || "Chat Room");
        setMembersCount(data.members || 0);
      }
    });

    return () => {
      off(groupRef);
    };
  }, [groupId]);

  // Fetch messages
  useEffect(() => {
    if (!groupId) return;

    setLoading(true);
    const messagesRef = ref(database, `messages/${groupId}`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
          groupId: groupId, // Add groupId to each message
          isCurrentUser: value.senderId === currentUser?.uid
        }));
        
        // Sort messages by timestamp
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList);
      } else {
        setMessages([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
      setLoading(false);
    });

    return () => {
      off(messagesRef);
    };
  }, [groupId, currentUser]);

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
    setEditMessage(null);
  };

  const handleEditMessage = (message: Message) => {
    setEditMessage(message);
    setReplyToMessage(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{groupName}</h2>
        {membersCount > 0 && (
          <p className="text-sm text-muted-foreground">{membersCount} members</p>
        )}
      </div>
      
      <ChatNavTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <Tabs value={activeTab} className="flex-1 flex flex-col">
        <TabsContent value="chat" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <MessageListWrapper 
              messages={messages}
              onReplyToMessage={handleReplyToMessage}
              onEditMessage={handleEditMessage}
              groupId={groupId}
            />
          )}
          
          <div className="p-4 border-t">
            <MessageInput 
              groupId={groupId}
              replyToMessage={replyToMessage}
              onCancelReply={() => setReplyToMessage(null)}
              editMessage={editMessage}
              onCancelEdit={() => setEditMessage(null)}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="media" className="flex-1 overflow-auto m-0 data-[state=inactive]:hidden">
          <MediaGallery groupId={groupId} />
        </TabsContent>
        
        <TabsContent value="expenses" className="flex-1 overflow-auto m-0 data-[state=inactive]:hidden">
          <SplitExpenses groupId={groupId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export the wrapper as the default export
export default ChatRoomWrapper;
