
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/ui/footer";
import { ChatRoom } from "@/components/chat/ChatRoom";

const GroupChat = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <SignedIn>
        <Navbar />
        <main className="container mx-auto mt-16">
          <ChatRoom />
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
