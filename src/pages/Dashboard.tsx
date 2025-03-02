
import React from "react";
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { UserProfile } from "@/components/ui/user-profile";
import { TravelFeed } from "@/components/ui/travel-feed";
import { FeatureCard } from "@/components/ui/feature-card";
import { PlusCircle, Map, Users, CalendarDays } from "lucide-react";

const Dashboard = () => {
  const { user } = useUser();

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-background">
          <Navbar />
          
          <main className="container mx-auto px-4 py-8">
            <section className="mb-10">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <UserProfile />
                
                <div className="w-full space-y-6">
                  <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
                    <h2 className="text-2xl font-bold mb-4">Welcome back, {user?.firstName || "Traveler"}!</h2>
                    <p className="text-muted-foreground">
                      Continue planning your adventures or explore new destinations with Wanderly.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FeatureCard 
                      icon={<PlusCircle className="h-6 w-6 text-primary" />}
                      title="Create Trip"
                      description="Start planning a new adventure"
                      link="/create-trip"
                    />
                    <FeatureCard 
                      icon={<Map className="h-6 w-6 text-primary" />}
                      title="Explore"
                      description="Discover popular destinations"
                      link="/explore"
                    />
                    <FeatureCard 
                      icon={<Users className="h-6 w-6 text-primary" />}
                      title="Travel Groups"
                      description="Plan trips with friends"
                      link="/groups"
                    />
                    <FeatureCard 
                      icon={<CalendarDays className="h-6 w-6 text-primary" />}
                      title="Itineraries"
                      description="View your saved itineraries"
                      link="/itineraries"
                    />
                  </div>
                </div>
              </div>
            </section>
            
            <section className="py-8">
              <h2 className="text-2xl font-bold mb-6">Travel Inspiration</h2>
              <TravelFeed />
            </section>
          </main>
          
          <Footer />
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default Dashboard;
