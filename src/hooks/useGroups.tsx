
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Group } from "@/components/group/GroupTypes";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  createSampleGroupsIfNeeded, 
  createGroup, 
  subscribeToUserGroups 
} from "@/services/groups";

export const useGroups = () => {
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

  const handleRefresh = useCallback(async () => {
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
  }, [currentUser]);

  const fetchGroups = useCallback(async () => {
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
          console.log("Groups data:", groupsList ? JSON.stringify(groupsList).substring(0, 100) + "..." : "null");
          // Ensure we always set a valid array
          setGroups(Array.isArray(groupsList) ? groupsList : []);
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
        currentUser.email || "",
        currentUser.displayName || "Anonymous User"
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

  // Setup groups listener on mount
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
  }, [fetchGroups]);

  return {
    groups: Array.isArray(groups) ? groups : [],
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
  };
};
