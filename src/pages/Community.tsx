
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/ui/footer";
import { TravelFeed } from "@/components/ui/travel-feed";

const Community = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <section className="mb-10">
          <h2 className="text-3xl font-bold mb-6">Community Travel Experiences</h2>
          <p className="text-muted-foreground mb-8">
            Discover and share travel experiences from fellow adventurers around the world.
          </p>
          
          <TravelFeed />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Community;
