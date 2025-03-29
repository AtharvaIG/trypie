
import React from "react";
import { Footer } from "@/components/ui/footer";
import { useGroups } from "@/hooks/useGroups";
import { GroupList } from "@/components/group/GroupList";
import { GroupHeader } from "@/components/group/GroupHeader";
import { GroupValidation } from "@/components/group/GroupValidation";
import { ManageGroupDialog } from "@/components/group/ManageGroupDialog";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";
import { useEffect } from "react";

const Groups = () => {
  const {
    groups,
    loading,
    loadError,
    isDialogOpen,
    setIsDialogOpen,
    isCreating,
    selectedGroup,
    setSelectedGroup,
    activeTab,
    setActiveTab,
    handleRefresh,
    handleCreateGroup,
    handleJoinChat,
    handleManageGroup,
    handleInviteUsers
  } = useGroups();
  
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
    });

    return () => {
      console.log("Cleaning up connection listener");
      off(connectedRef);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 mt-20">
        <section className="mb-10">
          {/* Validation check for groups data */}
          <GroupValidation 
            groups={groups} 
            loading={loading} 
            handleRefresh={handleRefresh} 
          />
          
          {/* Group header with title and actions */}
          <GroupHeader 
            loading={loading}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            handleRefresh={handleRefresh}
            handleCreateGroup={handleCreateGroup}
            isCreating={isCreating}
          />
          
          {/* Group list */}
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

        {/* Manage group dialog */}
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
