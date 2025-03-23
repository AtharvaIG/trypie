
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  
  const handleRefresh = () => {
    setLoading(true);
    setLoadError(null);
    createSampleGroupsIfNeeded(currentUser?.uid || "")
      .then(() => {
        // Data will be refreshed via the listener
      })
      .catch(error => {
        console.error("Error refreshing groups:", error);
        setLoading(false);
        setLoadError("Failed to refresh groups");
      });
  };
  
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    console.log("Setting up groups listener for user:", currentUser.uid);
    
    createSampleGroupsIfNeeded(currentUser.uid)
      .catch(error => {
        console.error("Failed to create sample groups:", error);
      });
    
    const unsubscribe = subscribeToUserGroups(
      currentUser.uid,
      (groupsList) => {
        setGroups(groupsList);
        setLoading(false);
      },
      (error) => {
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

        <ManageGroupDialog
          selectedGroup={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Groups;
