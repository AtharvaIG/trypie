
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ref, get, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Copy } from "lucide-react";

interface InviteMembersProps {
  groupId: string;
  groupName: string;
}

export const InviteMembers: React.FC<InviteMembersProps> = ({ groupId, groupName }) => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  
  // In a real app, you would implement user search functionality
  // For demo purposes, we'll simulate adding users by email
  const handleInviteMember = async () => {
    if (!email.trim() || !currentUser || !groupId) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      setInviting(true);
      
      // In a real app, you would search for the user by email
      // For demo purposes, we'll create a simulated user ID based on the email
      const simulatedUserId = `simulated-${email.replace(/[^a-zA-Z0-9]/g, "-")}`;
      
      // Check if the group exists
      const groupRef = ref(database, `groups/${groupId}`);
      const snapshot = await get(groupRef);
      
      if (snapshot.exists()) {
        const groupData = snapshot.val();
        
        // Check if the member is already in the group
        if (groupData.membersList && groupData.membersList[simulatedUserId]) {
          toast.error("This user is already a member of the group");
          setInviting(false);
          return;
        }
        
        // Update the members list
        const membersList = groupData.membersList || {};
        membersList[simulatedUserId] = true;
        
        // Update member count and preview
        const previewMembers = groupData.previewMembers || [];
        if (!previewMembers.includes(email.charAt(0).toUpperCase())) {
          previewMembers.push(email.charAt(0).toUpperCase());
        }
        
        // Update the group
        await update(groupRef, {
          membersList: membersList,
          members: Object.keys(membersList).length,
          previewMembers: previewMembers.slice(0, 5) // Only keep up to 5 preview members
        });
        
        toast.success(`Invited ${email} to the group`);
        setEmail("");
        
        // In a real app, you would send an email or notification to the user
      } else {
        toast.error("Group not found");
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  // Generate a shareable invite link
  const getInviteLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join-group/${groupId}`;
  };
  
  const copyInviteLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    toast.success("Invite link copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Invite by Email</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Enter email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleInviteMember}
            disabled={inviting || !email.trim()}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {inviting ? "Inviting..." : "Invite"}
          </Button>
        </div>
      </div>
      
      <div className="border-t pt-4 space-y-4">
        <h3 className="text-sm font-medium">Share Invite Link</h3>
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={getInviteLink()}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="flex-1 bg-muted"
          />
          <Button 
            variant="outline"
            onClick={copyInviteLink}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Anyone with this link can join the group. Be careful who you share it with.
        </p>
      </div>
    </div>
  );
};
