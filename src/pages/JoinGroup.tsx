
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ref, get, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Footer } from "@/components/ui/footer";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const JoinGroup = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    const checkGroup = async () => {
      if (!groupId || !currentUser) return;

      try {
        const groupRef = ref(database, `groups/${groupId}`);
        const snapshot = await get(groupRef);

        if (snapshot.exists()) {
          const groupData = snapshot.val();
          setGroupName(groupData.name);
          
          // Check if user is already a member
          if (groupData.membersList && groupData.membersList[currentUser.uid]) {
            setAlreadyMember(true);
          }
        } else {
          toast.error("Group not found");
          navigate("/groups");
        }
      } catch (error) {
        console.error("Error checking group:", error);
        toast.error("Error loading group information");
      } finally {
        setLoading(false);
      }
    };

    checkGroup();
  }, [groupId, currentUser, navigate]);

  const handleJoinGroup = async () => {
    if (!groupId || !currentUser) return;
    
    try {
      setJoining(true);
      
      // Get current group data
      const groupRef = ref(database, `groups/${groupId}`);
      const snapshot = await get(groupRef);
      
      if (snapshot.exists()) {
        const groupData = snapshot.val();
        
        // Create updated members list with current user
        const membersList = groupData.membersList || {};
        membersList[currentUser.uid] = true;
        
        // Update member preview initials
        const userInitial = currentUser.displayName 
          ? currentUser.displayName.charAt(0).toUpperCase()
          : currentUser.email
            ? currentUser.email.charAt(0).toUpperCase()
            : "U";
            
        const previewMembers = groupData.previewMembers || [];
        if (!previewMembers.includes(userInitial)) {
          previewMembers.push(userInitial);
        }
        
        // Update the group
        await update(groupRef, {
          membersList: membersList,
          members: Object.keys(membersList).length,
          previewMembers: previewMembers.slice(0, 5), // Only keep up to 5 preview members
          lastActivity: "Just now"
        });
        
        toast.success(`You've joined "${groupData.name}"`);
        
        // Navigate to the group chat
        setTimeout(() => {
          navigate(`/group-chat/${groupId}`);
        }, 1500);
      } else {
        toast.error("Group not found");
        navigate("/groups");
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error("Failed to join group");
    } finally {
      setJoining(false);
    }
  };

  const goToGroupChat = () => {
    navigate(`/group-chat/${groupId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 mt-16">
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <div className="text-center">
              <div className="mb-6">
                {alreadyMember ? (
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <h2 className="text-xl font-bold text-primary">
                      {groupName.charAt(0).toUpperCase()}
                    </h2>
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">{groupName}</h2>
              
              {alreadyMember ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    You're already a member of this group.
                  </p>
                  <Button onClick={goToGroupChat} className="w-full">
                    Go to Group Chat
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    You've been invited to join this travel group.
                  </p>
                  <Button 
                    onClick={handleJoinGroup} 
                    disabled={joining}
                    className="w-full"
                  >
                    {joining ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join Group"
                    )}
                  </Button>
                </div>
              )}
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/groups")}
                  className="w-full"
                >
                  Back to Groups
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JoinGroup;
