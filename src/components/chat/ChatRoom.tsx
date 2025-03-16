
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ref, onValue, off, get, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Info, 
  Bell, 
  BellOff,
  Search,
  Pin
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GroupMembersList } from "@/components/group/GroupMembersList";
import { InviteMembers } from "@/components/group/InviteMembers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type GroupData = {
  id: string;
  name: string;
  members: number;
  lastActivity?: string;
  membersList?: {[key: string]: boolean};
};

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

export const ChatRoom: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const [pinnedMessagesOpen, setPinnedMessagesOpen] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    const groupRef = ref(database, `groups/${groupId}`);
    
    // Listen for group data
    onValue(groupRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setGroup({
          id: groupId,
          name: data.name,
          members: data.members || 0,
          lastActivity: data.lastActivity,
          membersList: data.membersList
        });
        
        // Check if current user is a member
        if (currentUser && data.membersList && !data.membersList[currentUser.uid]) {
          toast.error("You are not a member of this group");
          navigate("/groups");
        }
      } else {
        // Group doesn't exist
        toast.error("Group not found");
        navigate("/groups");
      }
      setLoading(false);
    });

    // Check user notification settings
    if (currentUser) {
      const muteRef = ref(database, `userSettings/${currentUser.uid}/mutedGroups/${groupId}`);
      onValue(muteRef, (snapshot) => {
        setIsMuted(snapshot.exists() && snapshot.val() === true);
      });
    }

    // Track online members
    const onlineRef = ref(database, 'userStatus');
    onValue(onlineRef, (snapshot) => {
      if (snapshot.exists() && group?.membersList) {
        const statuses = snapshot.val();
        const online: string[] = [];
        
        Object.keys(statuses).forEach(userId => {
          if (
            group.membersList?.[userId] && 
            statuses[userId].status === 'online' &&
            statuses[userId].lastActivity > Date.now() - 5 * 60 * 1000 // 5 minutes
          ) {
            online.push(userId);
          }
        });
        
        setOnlineMembers(online);
      }
    });

    return () => {
      // Clean up listeners
      off(groupRef);
      if (currentUser) {
        off(ref(database, `userSettings/${currentUser.uid}/mutedGroups/${groupId}`));
      }
      off(ref(database, 'userStatus'));
    };
  }, [groupId, navigate, currentUser, group?.membersList]);

  // Update user online status
  useEffect(() => {
    if (!currentUser) return;
    
    const userStatusRef = ref(database, `userStatus/${currentUser.uid}`);
    
    // Set user as online
    const setOnline = () => {
      update(userStatusRef, {
        status: 'online',
        lastActivity: Date.now()
      });
    };
    
    // Set user as offline
    const setOffline = () => {
      update(userStatusRef, {
        status: 'offline',
        lastActivity: Date.now()
      });
    };
    
    // Set initial status
    setOnline();
    
    // Update status periodically
    const interval = setInterval(setOnline, 60000); // Every minute
    
    // Set up event listeners for tab visibility
    window.addEventListener('focus', setOnline);
    window.addEventListener('blur', () => {
      update(userStatusRef, {
        status: 'away',
        lastActivity: Date.now()
      });
    });
    
    // Set offline when component unmounts
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', setOnline);
      window.removeEventListener('blur', () => {});
      setOffline();
    };
  }, [currentUser]);

  const toggleMuteNotifications = async () => {
    if (!currentUser || !groupId) return;
    
    try {
      const muteRef = ref(database, `userSettings/${currentUser.uid}/mutedGroups/${groupId}`);
      
      if (isMuted) {
        // Unmute
        await update(muteRef, null);
        toast.success("Notifications enabled for this group");
      } else {
        // Mute
        await update(muteRef, true);
        toast.success("Notifications muted for this group");
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.error("Failed to update notification settings");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, you would implement search functionality here
    // For now, we'll just show a toast
    if (query.trim()) {
      toast.info(`Searching for: ${query}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/groups")}
            className="h-8 w-8 md:mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-bold text-lg flex items-center">
              {group?.name}
              {isMuted && <BellOff className="h-3 w-3 ml-2 text-muted-foreground" />}
            </h2>
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              <span>{group?.members} members</span>
              {onlineMembers.length > 0 && (
                <span className="ml-2">
                  • {onlineMembers.length} online
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-1">
          {/* Search messages */}
          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
              >
                <Search className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Search Messages</SheetTitle>
                <SheetDescription>
                  Search for messages in this group chat
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Search messages..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch(searchQuery);
                      }
                    }}
                  />
                  <Button onClick={() => handleSearch(searchQuery)}>Search</Button>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Search Results</p>
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 
                      "No matching messages found" : 
                      "Enter a search term to find messages"
                    }
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Pinned messages sheet */}
          <Sheet open={pinnedMessagesOpen} onOpenChange={setPinnedMessagesOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
              >
                <Pin className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Pinned Messages</SheetTitle>
                <SheetDescription>
                  Important messages pinned by group members
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                {/* In a real app, you would fetch and display pinned messages here */}
                <div className="text-center py-8 text-muted-foreground">
                  No pinned messages yet
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Group menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
              >
                <Info className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => {
                setIsGroupInfoOpen(true);
                setActiveTab("members");
              }}>
                <Users className="h-4 w-4 mr-2" />
                View Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setIsGroupInfoOpen(true);
                setActiveTab("invite");
              }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Members
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={toggleMuteNotifications}>
                {isMuted ? (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Unmute Notifications
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Mute Notifications
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Group info dialog */}
          <Dialog open={isGroupInfoOpen} onOpenChange={setIsGroupInfoOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{group?.name}</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="invite">Invite</TabsTrigger>
                </TabsList>
                
                <TabsContent value="members">
                  {group && <GroupMembersList groupId={group.id} />}
                </TabsContent>
                
                <TabsContent value="invite">
                  {group && <InviteMembers groupId={group.id} groupName={group.name} />}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList 
          groupId={groupId || ""} 
        />
      </div>
      
      <div className="border-t p-4">
        <MessageInput 
          groupId={groupId || ""} 
          replyToMessage={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
          editMessage={editMessage}
          onCancelEdit={() => setEditMessage(null)}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
