
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ref, onValue, off, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserPlus, Info } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GroupMembersList } from "@/components/group/GroupMembersList";
import { InviteMembers } from "@/components/group/InviteMembers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type GroupData = {
  id: string;
  name: string;
  members: number;
  lastActivity?: string;
  membersList?: {[key: string]: boolean};
};

export const ChatRoom: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("members");

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

    return () => {
      // Clean up listener
      off(groupRef);
    };
  }, [groupId, navigate, currentUser]);

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
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-bold text-lg">{group?.name}</h2>
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              <span>{group?.members} members</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isGroupInfoOpen} onOpenChange={setIsGroupInfoOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
              >
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
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
        <MessageList groupId={groupId || ""} />
      </div>
      
      <div className="border-t p-4">
        <MessageInput groupId={groupId || ""} />
      </div>
    </div>
  );
};

export default ChatRoom;
