
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SimpleFooter } from "@/components/ui/simple-footer";
import ChatRoomWrapper from "@/components/chat/ChatRoom";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { toast } from "sonner";

const GroupChat = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isUserInGroup, setIsUserInGroup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkUserInGroup = async () => {
      if (!groupId || !currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        const groupRef = ref(database, `groups/${groupId}/membersList/${currentUser.uid}`);
        const snapshot = await get(groupRef);
        
        setIsUserInGroup(snapshot.exists() && snapshot.val() === true);
        setIsLoading(false);
        
        if (!snapshot.exists()) {
          toast.error("You are not a member of this group");
        }
      } catch (error) {
        console.error("Error checking user in group:", error);
        setIsLoading(false);
      }
    };
    
    checkUserInGroup();
  }, [groupId, currentUser]);
  
  const handleBackToGroups = () => {
    navigate('/groups');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-16 pb-16">
          {groupId ? (
            <>
              <div className="mb-4 mt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToGroups}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Groups
                </Button>
              </div>
              
              {isUserInGroup || !currentUser ? (
                <div className="bg-card rounded-lg border shadow-sm mb-8">
                  <ChatRoomWrapper groupId={groupId} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[50vh]">
                  <h2 className="text-xl font-bold mb-4">You're not a member of this group</h2>
                  <p className="text-muted-foreground mb-6">
                    You need to join this group before you can participate in the chat.
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={() => navigate(`/join-group/${groupId}`)}>
                      Join Group
                    </Button>
                    <Button variant="outline" onClick={handleBackToGroups}>
                      Back to Groups
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <h2 className="text-xl font-bold mb-4">No Group Selected</h2>
              <p className="text-muted-foreground mb-6">
                Please select a group from the groups page to start chatting.
              </p>
              <Button onClick={handleBackToGroups}>
                Go to Groups
              </Button>
            </div>
          )}
        </div>
      </main>
      <SimpleFooter />
    </div>
  );
};

export default GroupChat;
