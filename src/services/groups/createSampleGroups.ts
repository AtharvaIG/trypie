
import { ref, set, push, get, update } from "firebase/database";
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
