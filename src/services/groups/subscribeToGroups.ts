
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";
import { Group } from "@/components/group/GroupTypes";

export const subscribeToUserGroups = (
  currentUserId: string, 
  callback: (groups: Group[]) => void, 
  errorCallback: (error: Error) => void
) => {
  console.log(`Setting up subscription for user: ${currentUserId}`);
  const groupsRef = ref(database, 'groups');
  
  try {
    const listener = onValue(
      groupsRef, 
      (snapshot) => {
        console.log("Groups data received from Firebase");
        const data = snapshot.val();
        const groupsList: Group[] = [];
        
        if (data) {
          console.log("Processing groups data:", Object.keys(data).length, "groups found");
          
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
              const isUserMember = typeof membersList === 'object' && 
                             Object.keys(membersList).includes(currentUserId);
              
              if (isUserMember) {
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
              }
            } catch (error) {
              console.error(`Error processing group with key ${key}:`, error);
            }
          });
        } else {
          console.log("No groups data found in database");
        }
        
        // Ensure we always pass a valid array, even if empty
        console.log(`Found ${groupsList.length} groups for user ${currentUserId}`);
        callback(groupsList);
      }, 
      (error) => {
        console.error("Error fetching groups:", error);
        callback([]);  // Pass empty array on error
        errorCallback(error);
      }
    );
    
    return () => {
      console.log("Unsubscribing from groups data");
      off(groupsRef, 'value', listener);
    };
  } catch (error) {
    console.error("Error setting up groups subscription:", error);
    callback([]);  // Pass empty array on error
    errorCallback(error as Error);
    
    // Return a noop function instead of undefined
    return () => {
      console.log("No subscription to clean up");
    };
  }
};
