
import { ref, set, push, onValue, off, get, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { Group, sampleGroups, sampleMessages } from "@/components/group/GroupTypes";
import { toast } from "sonner";

export const createSampleGroupsIfNeeded = async (currentUserId: string): Promise<void> => {
  try {
    console.log("Checking for existing groups...");
    const groupsRef = ref(database, 'groups');
    const snapshot = await get(groupsRef);
    
    if (!snapshot.exists()) {
      console.log("No groups found, creating sample groups...");
      
      for (const group of sampleGroups) {
        const newGroupRef = push(groupsRef);
        const groupId = newGroupRef.key;
        
        if (!groupId) {
          console.error("Failed to generate group ID");
          continue;
        }
        
        const membersList: {[key: string]: boolean} = {};
        membersList[currentUserId] = true;
        if (group.membersList) {
          Object.assign(membersList, group.membersList);
        }
        
        const updatedGroup = {
          ...group,
          membersList
        };
        
        await set(newGroupRef, updatedGroup);
        console.log(`Created sample group: ${group.name} with ID: ${groupId}`);
        
        const groupName = group.name;
        if (sampleMessages[groupName]) {
          const messagesRef = ref(database, `messages/${groupId}`);
          
          for (const message of sampleMessages[groupName]) {
            const newMessageRef = push(messagesRef);
            await set(newMessageRef, message);
          }
          
          console.log(`Added sample messages for group: ${groupName}`);
        }
      }
      
      toast.success("Sample groups created for demonstration");
    } else {
      console.log("Existing groups found:", Object.keys(snapshot.val() || {}).length);
      
      let isMemberOfAnyGroup = false;
      const groupsData = snapshot.val();
      
      if (groupsData) {
        Object.values(groupsData).forEach((group: any) => {
          if (group.membersList && group.membersList[currentUserId]) {
            isMemberOfAnyGroup = true;
          }
        });
        
        if (!isMemberOfAnyGroup) {
          console.log("Adding current user to existing groups");
          const updates: {[path: string]: any} = {};
          
          Object.entries(groupsData).forEach(([groupId, groupData]: [string, any]) => {
            if (!groupData.membersList) {
              groupData.membersList = {};
            }
            groupData.membersList[currentUserId] = true;
            updates[`groups/${groupId}/membersList/${currentUserId}`] = true;
          });
          
          if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
            console.log("Added current user to existing groups");
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking for sample groups:", error);
    throw new Error("Error initializing sample groups");
  }
};

export const createGroup = async (
  groupName: string, 
  currentUserId: string,
  currentUserEmail?: string | null,
  currentUserDisplayName?: string | null
): Promise<string> => {
  const groupRef = push(ref(database, 'groups'));
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
  
  console.log("Creating group with data:", groupData);
  
  await set(groupRef, groupData);
  
  toast.success("Group created successfully!");
  
  return groupId;
};

export const subscribeToUserGroups = (
  currentUserId: string, 
  callback: (groups: Group[]) => void, 
  errorCallback: (error: Error) => void
) => {
  console.log(`Setting up subscription for user: ${currentUserId}`);
  const groupsRef = ref(database, 'groups');
  
  const listener = onValue(
    groupsRef, 
    (snapshot) => {
      console.log("Groups data received from Firebase");
      const data = snapshot.val();
      const groupsList: Group[] = [];
      
      if (data) {
        console.log("Processing groups data:", Object.keys(data).length, "groups found");
        Object.keys(data).forEach((key) => {
          const group = data[key];
          const isUserMember = group.membersList && 
                             Object.keys(group.membersList).includes(currentUserId);
          
          if (isUserMember) {
            groupsList.push({
              id: key,
              name: group.name,
              members: group.members || Object.keys(group.membersList || {}).length,
              lastActivity: group.lastActivity || 'Never',
              previewMembers: group.previewMembers || ['A', 'B'].slice(0, group.members),
              createdBy: group.createdBy,
              membersList: group.membersList || {},
              createdAt: group.createdAt || 0
            });
          }
        });
      } else {
        console.log("No groups data found in database");
      }
      
      groupsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      console.log(`Found ${groupsList.length} groups for user ${currentUserId}`);
      callback(groupsList);
    }, 
    (error) => {
      console.error("Error fetching groups:", error);
      errorCallback(error);
    }
  );
  
  return () => {
    console.log("Unsubscribing from groups data");
    off(groupsRef, 'value', listener);
  };
};
