
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/ui/footer";
import ChatRoomWrapper from "@/components/chat/ChatRoom";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const GroupChat = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  
  const handleBackToGroups = () => {
    navigate('/groups');
  };
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 mt-20">
        {groupId ? (
          <>
            <div className="mb-4">
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
            <ChatRoomWrapper />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold mb-4">No Group Selected</h2>
            <p className="text-muted-foreground mb-6">
              Please select a group from the groups page to start chatting.
            </p>
            <Button onClick={handleBackToGroups}>
              Go to Groups
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GroupChat;
