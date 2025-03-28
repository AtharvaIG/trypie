
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { database } from "@/lib/firebase";
import { ref, get, onValue, off } from "firebase/database";

// Import refactored components
import { Group } from "@/components/group/GroupTypes";
import { GroupList } from "@/components/group/GroupList";
import { CreateGroupDialog } from "@/components/group/CreateGroupDialog";
import { ManageGroupDialog } from "@/components/group/ManageGroupDialog";
import { createSampleGroupsIfNeeded, createGroup, subscribeToUserGroups } from "@/services/GroupsService";

const Groups = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]); // Always start as an empty array
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  
  // Debug log for state changes
  useEffect(() => {
    console.log("Groups state updated:", groups?.length || 0, "groups");
  }, [groups]);
  
  // Verify Firebase connection on component mount
  useEffect(() => {
    console.log("Checking Firebase connection...");
    const connectedRef = ref(database, '.info/connected');
    
    const connectionListener = onValue(connectedRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log('Database connection status:', snapshot.val());
      } else {
        console.log('No connection status available');
      }
    }, (error) => {
      console.error('Database connection error:', error);
      setLoadError('Failed to connect to database. Please check your connection.');
      toast.error('Connection error. Please try again.');
    });

    return () => {
      console.log("Cleaning up connection listener");
      off(connectedRef);
    };
  }, []);
  
  const handleRefresh = async () => {
    if (!currentUser) {
      toast.error("Please login to view groups");
      return;
    }

    setLoading(true);
    setLoadError(null);
    
    try {
      console.log("Refreshing groups for user:", currentUser.uid);
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
  
  const fetchGroups = async () => {
    if (!currentUser) {
      console.log("No user logged in, skipping groups fetch");
      setLoading(false);
      return () => {}; // Return empty function if no user
    }

    console.log("Setting up groups listener for user:", currentUser.uid);
    setLoading(true);
    
    try {
      // Create sample groups if needed
      await createSampleGroupsIfNeeded(currentUser.uid);
      console.log("Sample groups created/verified successfully");
      
      // Subscribe to user groups
      const unsubscribe = subscribeToUserGroups(
        currentUser.uid,
        (groupsList) => {
          console.log("Groups loaded successfully:", groupsList?.length || 0);
          console.log("Groups data:", groupsList);
          // Ensure we always set a valid array
          setGroups(groupsList || []);
          setLoading(false);
          setLoadError(null);
        },
        (error) => {
          console.error("Failed to load groups:", error);
          setLoading(false);
          setLoadError("Failed to load groups");
          // Ensure we have an empty array if there was an error
          setGroups([]);
          toast.error("Failed to load groups");
        }
      );
      
      // Return the unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error("Error in fetchGroups:", error);
      setLoading(false);
      setLoadError("Failed to set up groups");
      setGroups([]);
      return () => {}; // Return empty function if setup failed
    }
  };
  
  useEffect(() => {
    console.log("Groups component mounted, current groups state:", Array.isArray(groups) ? groups.length : "not an array");
    
    let unsubscribeFunction: (() => void) | undefined;
    
    const setupGroups = async () => {
      try {
        const unsubscribe = await fetchGroups();
        if (typeof unsubscribe === 'function') {
          unsubscribeFunction = unsubscribe;
        }
      } catch (error) {
        console.error("Error setting up groups:", error);
      }
    };
    
    setupGroups();
    
    // Clean up subscription when component unmounts
    return () => {
      console.log("Cleaning up groups subscription");
      if (typeof unsubscribeFunction === 'function') {
        unsubscribeFunction();
      }
    };
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
  
  // Safety check before rendering
  if (!Array.isArray(groups) && !loading) {
    console.error("Groups is not an array:", groups);
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 mt-20">
          <div className="p-8 text-center border-dashed border-2 rounded-lg">
            <p className="text-destructive mb-4">Error: Groups data is invalid</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
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
