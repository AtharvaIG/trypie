
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/ui/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Users, Plus, MessageSquare, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ref, set, push, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Group = {
  id: string;
  name: string;
  members: number;
  lastActivity: string;
  previewMembers: string[];
};

const Groups = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    if (!currentUser) return;
    
    const groupsRef = ref(database, 'groups');
    
    // Listen for groups data
    onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      const groupsList: Group[] = [];
      
      if (data) {
        Object.keys(data).forEach((key) => {
          const group = data[key];
          
          groupsList.push({
            id: key,
            name: group.name,
            members: group.members || 0,
            lastActivity: group.lastActivity || 'Never',
            previewMembers: ['A', 'B'].slice(0, group.members)
          });
        });
      }
      
      setGroups(groupsList);
      setLoading(false);
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
      
      // Group data
      const groupData = {
        name: newGroupName.trim(),
        createdBy: currentUser.uid,
        createdAt: Date.now(),
        members: 1,
        lastActivity: 'Just now'
      };
      
      // Save the group
      await set(groupRef, groupData);
      
      // Close the dialog and reset
      setIsDialogOpen(false);
      setNewGroupName("");
      toast.success("Group created successfully!");
      
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
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
                      <label htmlFor="group-name" className="text-sm font-medium">
                        Group Name
                      </label>
                      <Input
                        id="group-name"
                        placeholder="Enter group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
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
                      <p className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {group.members} members
                      </p>
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
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Groups;
