
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/ui/footer";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { useParams } from "react-router-dom";

const GroupChat = () => {
  const { groupId } = useParams<{ groupId: string }>();
  
  return (
    <div className="min-h-screen bg-background">
      <SignedIn>
        <Navbar />
        <main className="container mx-auto p-4 mt-16">
          {groupId ? (
            <ChatRoom />
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <h2 className="text-2xl font-bold mb-4">No Group Selected</h2>
              <p className="text-muted-foreground">
                Please select a group from the groups page to start chatting.
              </p>
            </div>
          )}
        </main>
        <Footer />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
};

export default GroupChat;
