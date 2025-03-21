
import React, { memo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/ui/footer";
import { TravelFeed } from "@/components/ui/travel-feed";

// Memoize the main content to prevent unnecessary re-renders
const CommunityContent = memo(() => {
  return (
    <section className="mb-10">
      <h2 className="text-3xl font-bold mb-6">Indian Travel Experiences</h2>
      <p className="text-muted-foreground mb-8">
        Discover and share travel experiences from fellow adventurers across India's diverse landscapes.
      </p>
      
      <TravelFeed />
    </section>
  );
});

CommunityContent.displayName = 'CommunityContent';

const Community = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <CommunityContent />
      </main>
      
      <Footer />
    </div>
  );
};

export default Community;
