
import { ref, push, set, onValue, off, get, update, remove } from "firebase/database";
import { database } from "@/lib/firebase";
import { Group } from "@/components/group/GroupTypes";
import { toast } from "sonner";

// Create a new group under the user's specific database path
export const createGroup = async (
  groupName: string, 
  currentUserId: string,
  currentUserEmail?: string | null,
  currentUserDisplayName?: string | null
): Promise<string> => {
  // Create group reference under the user's path
  const groupRef = push(ref(database, `users/${currentUserId}/groups`));
  const groupId = groupRef.key;
  
  if (!groupId) {
    throw new Error("Failed to generate group ID");
  }
  
  const membersList: {[key: string]: boolean} = {};
  membersList[currentUserId] = true;
  
  const userInitial = currentUserEmail 
    ? currentUserEmail.charAt(0).toUpperCase() 
    : (currentUserDisplayName 
      ? currentUserDisplayName.charAt(0).toUpperCase() 
      : 'U');
  
  const groupData = {
    name: groupName.trim(),
    createdBy: currentUserId,
    createdAt: Date.now(),
    members: 1,
    lastActivity: 'Just now',
    membersList: membersList,
    previewMembers: [userInitial]
  };
  
  console.log("Creating group under user path:", `users/${currentUserId}/groups/${groupId}`);
  
  await set(groupRef, groupData);
  
  toast.success("Group created successfully!");
  
  return groupId;
};

// Subscribe to groups under the user's specific database path
export const subscribeToUserGroups = (
  currentUserId: string, 
  callback: (groups: Group[]) => void, 
  errorCallback: (error: Error) => void
) => {
  console.log(`Setting up subscription for user-specific groups: ${currentUserId}`);
  const groupsRef = ref(database, `users/${currentUserId}/groups`);
  
  try {
    const listener = onValue(
      groupsRef, 
      (snapshot) => {
        console.log("User-specific groups data received from Firebase");
        const data = snapshot.val();
        const groupsList: Group[] = [];
        
        if (data) {
          console.log("Processing user groups data:", Object.keys(data).length, "groups found");
          
          // Make sure we're iterating over an array of keys
          Object.keys(data).forEach((key) => {
            try {
              const group = data[key];
              // Safety check for valid group data
              if (!group) {
                console.warn(`Group with key ${key} is undefined or null`);
                return;
              }
              
              // Ensure membersList is an object 
              const membersList = group.membersList || {};
              
              // Ensure previewMembers is always an array
              let previewMembers: string[] = [];
              
              if (Array.isArray(group.previewMembers)) {
                previewMembers = group.previewMembers.map(member => 
                  typeof member === 'string' ? member : member?.toString()?.charAt(0)?.toUpperCase() || 'U'
                );
              } else if (group.previewMembers) {
                previewMembers = [group.previewMembers.toString().charAt(0).toUpperCase()];
              } else {
                previewMembers = ['U'];
              }
              
              // Ensure all fields are present with fallbacks
              groupsList.push({
                id: key,
                name: group.name || 'Unnamed Group',
                members: typeof group.members === 'number' ? group.members : 
                  (typeof membersList === 'object' ? Object.keys(membersList).length : 0),
                lastActivity: group.lastActivity || 'Never',
                previewMembers: previewMembers,
                createdBy: group.createdBy || '',
                membersList: typeof membersList === 'object' ? membersList : {},
                createdAt: group.createdAt || 0
              });
            } catch (error) {
              console.error(`Error processing group with key ${key}:`, error);
            }
          });
        } else {
          console.log("No groups data found for this user");
        }
        
        // Ensure we always pass a valid array, even if empty
        console.log(`Found ${groupsList.length} groups for user ${currentUserId}`);
        callback(groupsList);
      }, 
      (error) => {
        console.error("Error fetching user groups:", error);
        callback([]);  // Pass empty array on error
        errorCallback(error);
      }
    );
    
    return () => {
      console.log("Unsubscribing from user-specific groups data");
      off(groupsRef);
    };
  } catch (error) {
    console.error("Error setting up user groups subscription:", error);
    callback([]);  // Pass empty array on error
    errorCallback(error as Error);
    
    // Return a noop function instead of undefined
    return () => {
      console.log("No subscription to clean up");
    };
  }
};

// Create sample groups for the user if needed
export const createSampleGroupsIfNeeded = async (userId: string): Promise<void> => {
  try {
    const userGroupsRef = ref(database, `users/${userId}/groups`);
    const snapshot = await get(userGroupsRef);
    
    // If user has no groups, create sample ones
    if (!snapshot.exists()) {
      console.log("No groups found for user, creating sample groups");
      
      // Create Family group
      const familyGroupRef = push(userGroupsRef);
      await set(familyGroupRef, {
        name: "Family Trip",
        createdBy: userId,
        createdAt: Date.now(),
        members: 1,
        lastActivity: "Just now",
        membersList: { [userId]: true },
        previewMembers: ["F"]
      });
      
      // Create Friends group
      const friendsGroupRef = push(userGroupsRef);
      await set(friendsGroupRef, {
        name: "Weekend with Friends",
        createdBy: userId,
        createdAt: Date.now() - 86400000, // 1 day ago
        members: 1,
        lastActivity: "Yesterday",
        membersList: { [userId]: true },
        previewMembers: ["W"]
      });
      
      console.log("Sample groups created for new user");
    } else {
      console.log("User already has groups, skipping sample creation");
    }
  } catch (error) {
    console.error("Error creating sample groups:", error);
    throw error;
  }
};

// Handle joining a group
export const joinGroup = async (groupId: string, userId: string, userEmail?: string, userDisplayName?: string): Promise<void> => {
  try {
    // Get the user's initial for preview
    const userInitial = userEmail 
      ? userEmail.charAt(0).toUpperCase() 
      : (userDisplayName 
        ? userDisplayName.charAt(0).toUpperCase() 
        : 'U');
    
    // Add the group to the user's groups
    const userGroupRef = ref(database, `users/${userId}/groups/${groupId}`);
    const snapshot = await get(userGroupRef);
    
    if (!snapshot.exists()) {
      // User doesn't have this group yet, get info from original creator
      // In a real app with proper security rules, you'd need to request access
      // For demo purposes, we'll just create a basic group entry
      await set(userGroupRef, {
        name: "Joined Group", // This would be fetched from the original group
        createdBy: "original-creator", // This would be the actual creator ID
        createdAt: Date.now(),
        members: 1,
        lastActivity: "Just now",
        membersList: { [userId]: true },
        previewMembers: [userInitial]
      });
      
      toast.success("Successfully joined the group");
    } else {
      toast.info("You're already a member of this group");
    }
  } catch (error) {
    console.error("Error joining group:", error);
    toast.error("Failed to join group");
    throw error;
  }
};
