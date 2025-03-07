
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/ui/footer";
import { ChatRoom } from "@/components/chat/ChatRoom";

const GroupChat = () => {
  return (
    <div className="min-h-screen bg-background">
      <SignedIn>
        <Navbar />
        <main className="container mx-auto p-4 mt-16">
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
