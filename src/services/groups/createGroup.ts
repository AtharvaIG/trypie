
import { ref, set, push } from "firebase/database";
import { database } from "@/lib/firebase";
import { toast } from "sonner";

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
