import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/ui/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Users, Plus, MessageSquare, Clock, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ref, set, push, onValue, off, get, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GroupMembersList } from "@/components/group/GroupMembersList";
import { InviteMembers } from "@/components/group/InviteMembers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

type Group = {
  id: string;
  name: string;
  members: number;
  lastActivity: string;
  previewMembers: string[];
  createdBy: string;
  membersList?: {[key: string]: boolean};
};

// Sample group data for initial setup
const sampleGroups = [
  {
    name: "European Adventure 2023",
    members: 4,
    createdBy: "system",
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    lastActivity: '2 days ago',
    previewMembers: ['A', 'B', 'C', 'D'],
    membersList: { system: true }
  },
  {
    name: "Beach Weekend Getaway",
    members: 3,
    createdBy: "system",
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
    lastActivity: '12 hours ago',
    previewMembers: ['E', 'F', 'G'],
    membersList: { system: true }
  },
  {
    name: "Hiking Trip Planning",
    members: 2,
    createdBy: "system",
    createdAt: Date.now() - 86400000, // 1 day ago
    lastActivity: 'Just now',
    previewMembers: ['H', 'I'],
    membersList: { system: true }
  }
];

const Groups = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  
  // Function to create sample groups if none exist
  const createSampleGroupsIfNeeded = async () => {
    if (!currentUser) return;
    
    try {
      const groupsRef = ref(database, 'groups');
      const snapshot = await get(groupsRef);
      
      if (!snapshot.exists()) {
        // No groups exist, create sample groups
        for (const group of sampleGroups) {
          const newGroupRef = push(groupsRef);
          await set(newGroupRef, group);
        }
        toast.success("Sample groups created for demonstration");
      }
    } catch (error) {
      console.error("Error checking for sample groups:", error);
    }
  };
  
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    const groupsRef = ref(database, 'groups');
    
    // Create sample groups if needed
    createSampleGroupsIfNeeded();
    
    // Listen for groups data
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      const groupsList: Group[] = [];
      
      if (data) {
        Object.keys(data).forEach((key) => {
          const group = data[key];
          // Check if current user is a member of this group
          const isUserMember = group.membersList && 
                               Object.keys(group.membersList).includes(currentUser.uid);
          
          if (isUserMember) {
            groupsList.push({
              id: key,
              name: group.name,
              members: group.members || 0,
              lastActivity: group.lastActivity || 'Never',
              previewMembers: group.previewMembers || ['A', 'B'].slice(0, group.members),
              createdBy: group.createdBy,
              membersList: group.membersList || {}
            });
          }
        });
      }
      
      setGroups(groupsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching groups:", error);
      setLoading(false);
      toast.error("Failed to load groups");
    });
    
    return () => {
      // Clean up listener
      off(groupsRef);
    };
  }, [currentUser]);
  
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    if (!currentUser) {
      toast.error("You must be logged in to create a group");
      return;
    }
    
    try {
      setIsCreating(true);
      
      // Generate a new group reference
      const groupRef = push(ref(database, 'groups'));
      const groupId = groupRef.key;
      
      if (!groupId) {
        throw new Error("Failed to generate group ID");
      }
      
      // Initial members list with the creator
      const membersList: {[key: string]: boolean} = {};
      membersList[currentUser.uid] = true;
      
      // Get first letter of user's email or use 'U' as fallback
      const userInitial = currentUser.email 
        ? currentUser.email.charAt(0).toUpperCase() 
        : (currentUser.displayName 
          ? currentUser.displayName.charAt(0).toUpperCase() 
          : 'U');
      
      // Group data
      const groupData = {
        name: newGroupName.trim(),
        createdBy: currentUser.uid,
        createdAt: Date.now(),
        members: 1,
        lastActivity: 'Just now',
        membersList: membersList,
        previewMembers: [userInitial]
      };
      
      console.log("Creating group with data:", groupData);
      
      // Save the group
      await set(groupRef, groupData);
      
      // Close the dialog and reset
      setIsDialogOpen(false);
      setNewGroupName("");
      
      // Show success message and direct user to the chat for the new group
      toast.success("Group created successfully!");
      
      // Slight delay to ensure the database has updated
      setTimeout(() => {
        navigate(`/group-chat/${groupId}`);
      }, 500);
      
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleJoinChat = (groupId: string) => {
    navigate(`/group-chat/${groupId}`);
  };

  const handleManageGroup = (group: Group) => {
    setSelectedGroup(group);
    setActiveTab("details");
  };

  const handleInviteUsers = (group: Group) => {
    setSelectedGroup(group);
    setActiveTab("invite");
  };

  // Component to show when there are no groups
  const NoGroupsMessage = () => (
    <Card className="p-8 text-center border-dashed border-2">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h4 className="text-xl font-medium mb-2">Make Your First Group</h4>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create a group to plan trips, chat with friends, and share expenses with your travel companions.
        </p>
        <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create New Group
        </Button>
      </div>
    </Card>
  );
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 mt-20">
        <section className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold">Travel Groups</h2>
              <p className="text-muted-foreground">
                Plan, chat, and share expenses with your travel companions.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Group</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="group-name">
                        Group Name
                      </Label>
                      <Input
                        id="group-name"
                        placeholder="Enter group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newGroupName.trim()) {
                            handleCreateGroup();
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setIsCreating(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateGroup}
                    disabled={isCreating || !newGroupName.trim()}
                  >
                    {isCreating ? 'Creating...' : 'Create Group'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Card key={group.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">{group.name}</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 flex items-center"
                        onClick={() => handleInviteUsers(group)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Invite
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-8 flex items-center"
                        onClick={() => handleJoinChat(group.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {group.previewMembers.map((member, index) => (
                        <Avatar key={index} className="h-8 w-8 border-2 border-background">
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {member}
                          </div>
                        </Avatar>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 p-0 text-xs"
                        onClick={() => handleManageGroup(group)}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {group.members} members
                      </Button>
                      <p className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Active {group.lastActivity}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <NoGroupsMessage />
          )}
        </section>

        {/* Group management dialog */}
        {selectedGroup && (
          <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedGroup.name}</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="details">Group Details</TabsTrigger>
                  <TabsTrigger value="invite">Invite Members</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <GroupMembersList groupId={selectedGroup.id} />
                </TabsContent>
                
                <TabsContent value="invite" className="space-y-4">
                  <InviteMembers groupId={selectedGroup.id} groupName={selectedGroup.name} />
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedGroup(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Groups;
