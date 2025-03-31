
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ref, onValue, off, get, remove, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserMinus, Crown } from "lucide-react";

type GroupMember = {
  id: string;
  displayName: string;
  email: string;
  isAdmin?: boolean;
};

interface GroupMembersListProps {
  groupId: string;
}

export const GroupMembersList: React.FC<GroupMembersListProps> = ({ groupId }) => {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupOwner, setGroupOwner] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId || !currentUser) return;

    const userGroupRef = ref(database, `users/${currentUser.uid}/groups/${groupId}`);
    const fetchGroupMembers = async () => {
      try {
        // First, get the group details to know who created it
        const groupSnapshot = await get(userGroupRef);
        if (groupSnapshot.exists()) {
          const groupData = groupSnapshot.val();
          setGroupOwner(groupData.createdBy);
          
          // Get the member list
          const membersList = groupData.membersList || {};
          const memberPromises = Object.keys(membersList).map(async (userId) => {
            if (userId === 'system') {
              return {
                id: 'system',
                displayName: 'System',
                email: 'system@example.com',
                isAdmin: true
              };
            }
            
            // Try to get the user data from the users collection
            try {
              const userRef = ref(database, `users/${userId}`);
              const userSnapshot = await get(userRef);
              
              if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                return {
                  id: userId,
                  displayName: userData.displayName || `User ${userId.substring(0, 4)}`,
                  email: userData.email || `user-${userId.substring(0, 4)}@example.com`,
                  isAdmin: userId === groupData.createdBy
                };
              }
            } catch (error) {
              console.error("Error fetching user:", error);
            }
            
            // If user is the current user or user data retrieval failed
            if (userId === currentUser.uid) {
              return {
                id: currentUser.uid,
                displayName: currentUser.displayName || 'Anonymous',
                email: currentUser.email || '',
                isAdmin: userId === groupData.createdBy
              };
            }
            
            // Fallback for other users
            return {
              id: userId,
              displayName: `User ${userId.substring(0, 4)}`,
              email: `user-${userId.substring(0, 4)}@example.com`,
              isAdmin: userId === groupData.createdBy
            };
          });
          
          const membersData = await Promise.all(memberPromises);
          setMembers(membersData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching group members:", error);
        toast.error("Failed to load group members");
        setLoading(false);
      }
    };

    fetchGroupMembers();
    
    return () => {
      // Clean up
      off(userGroupRef);
    };
  }, [groupId, currentUser]);

  const handleRemoveMember = async (memberId: string) => {
    if (!currentUser || !groupId) return;
    
    // Don't allow removing if not group owner (except system user)
    if (memberId !== currentUser.uid && groupOwner !== currentUser.uid && memberId !== 'system') {
      toast.error("Only the group owner can remove other members");
      return;
    }
    
    // Don't allow group owner to leave their own group
    if (memberId === groupOwner) {
      toast.error("As the group owner, you cannot leave your own group");
      return;
    }
    
    try {
      // Remove member from the group's member list in user-specific path
      await remove(ref(database, `users/${currentUser.uid}/groups/${groupId}/membersList/${memberId}`));
      
      // Update the member count
      const groupRef = ref(database, `users/${currentUser.uid}/groups/${groupId}`);
      const snapshot = await get(groupRef);
      if (snapshot.exists()) {
        const groupData = snapshot.val();
        const newMemberCount = Math.max(0, (groupData.members || 1) - 1);
        await update(groupRef, { members: newMemberCount });
      }
      
      toast.success(memberId === currentUser.uid ? "You left the group" : "Member removed from group");
      
      // If current user left, they should be redirected (this will happen automatically due to listener)
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Group Members ({members.length})</h3>
      
      <ul className="space-y-3">
        {members.map((member) => (
          <li key={member.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {member.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium flex items-center">
                  {member.displayName}
                  {member.isAdmin && (
                    <Crown className="h-3 w-3 ml-1 text-amber-500" />
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
            </div>
            
            {/* Only show remove button for self or if current user is owner */}
            {(member.id === currentUser?.uid || (currentUser?.uid === groupOwner && member.id !== 'system')) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMember(member.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <UserMinus className="h-4 w-4" />
                <span className="sr-only">Remove {member.id === currentUser?.uid ? 'yourself' : 'member'}</span>
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
