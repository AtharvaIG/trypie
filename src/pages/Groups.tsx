import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { database } from "@/lib/firebase";
import { ref, get, onValue } from "firebase/database";

// Import refactored components
import { Group } from "@/components/group/GroupTypes";
import { GroupList } from "@/components/group/GroupList";
import { CreateGroupDialog } from "@/components/group/CreateGroupDialog";
import { ManageGroupDialog } from "@/components/group/ManageGroupDialog";
import { createSampleGroupsIfNeeded, createGroup, subscribeToUserGroups } from "@/services/GroupsService";

const Groups = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  
  // Verify Firebase connection on component mount
  useEffect(() => {
    const connectedRef = ref(database, '.info/connected');
    
    const connectionListener = onValue(connectedRef, (snapshot) => {
      console.log('Database connection status:', snapshot.val());
    }, (error) => {
      console.error('Database connection error:', error);
      setLoadError('Failed to connect to database. Please check your connection.');
      toast.error('Connection error. Please try again.');
    });

    return () => connectionListener();
  }, []);
  
  const handleRefresh = async () => {
    if (!currentUser) {
      toast.error("Please login to view groups");
      return;
    }

    setLoading(true);
    setLoadError(null);
    
    try {
      await createSampleGroupsIfNeeded(currentUser.uid);
      console.log("Groups refreshed successfully");
    } catch (error) {
      console.error("Error refreshing groups:", error);
      setLoadError("Failed to refresh groups");
      toast.error("Failed to refresh groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    console.log("Setting up groups listener for user:", currentUser.uid);
    setLoading(true);
    
    // Create sample groups if needed
    createSampleGroupsIfNeeded(currentUser.uid)
      .catch(error => {
        console.error("Failed to create sample groups:", error);
        setLoadError("Failed to initialize sample groups");
      });
    
    // Subscribe to user groups
    const unsubscribe = subscribeToUserGroups(
      currentUser.uid,
      (groupsList) => {
        console.log("Groups loaded successfully:", groupsList.length);
        setGroups(groupsList);
        setLoading(false);
        setLoadError(null);
      },
      (error) => {
        console.error("Failed to load groups:", error);
        setLoading(false);
        setLoadError("Failed to load groups");
        toast.error("Failed to load groups");
      }
    );
    
    return unsubscribe;
  }, [currentUser]);
  
  const handleCreateGroup = async (groupName: string) => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    if (!currentUser) {
      toast.error("You must be logged in to create a group");
      return;
    }
    
    try {
      setIsCreating(true);
      
      const groupId = await createGroup(
        groupName,
        currentUser.uid,
        currentUser.email,
        currentUser.displayName
      );
      
      setIsDialogOpen(false);
      
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
    if (!groupId) {
      console.error("Invalid group ID for chat");
      toast.error("Invalid group selected");
      return;
    }
    navigate(`/group-chat/${groupId}`);
  };

  const handleManageGroup = (group: Group) => {
    if (!group?.id) {
      console.error("Cannot manage invalid group:", group);
      toast.error("Invalid group selected");
      return;
    }
    setSelectedGroup(group);
    setActiveTab("details");
  };

  const handleInviteUsers = (group: Group) => {
    if (!group?.id) {
      console.error("Cannot invite to invalid group:", group);
      toast.error("Invalid group selected");
      return;
    }
    setSelectedGroup(group);
    setActiveTab("invite");
  };
  
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <CreateGroupDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onCreateGroup={handleCreateGroup}
                isCreating={isCreating}
              />
            </div>
          </div>
          
          <GroupList
            groups={groups}
            loading={loading}
            loadError={loadError}
            onJoinChat={handleJoinChat}
            onManageGroup={handleManageGroup}
            onInviteUsers={handleInviteUsers}
            onCreateGroup={() => setIsDialogOpen(true)}
            onRefresh={handleRefresh}
          />
        </section>

        {selectedGroup && (
          <ManageGroupDialog
            selectedGroup={selectedGroup}
            onClose={() => setSelectedGroup(null)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Groups;
