
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TravelFeed } from "@/components/ui/travel-feed";
import { UpcomingTrips } from "@/components/dashboard/upcoming-trips";
import { GroupActivity } from "@/components/dashboard/group-activity";
import { PlusCircle, Navigation, Sparkles } from "lucide-react";

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <section className="mb-10">
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Welcome back, {currentUser?.displayName?.split(' ')[0] || "Traveler"}!</h2>
              <p className="text-muted-foreground">
                Continue planning your adventures or explore new destinations with Wanderly.
              </p>
            </div>
            
            {/* Quick Start Section */}
            <Card className="p-6 bg-gradient-to-r from-primary/20 to-primary/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center">
                    <Sparkles className="h-5 w-5 text-primary mr-2" />
                    Quick Start
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Get AI-powered suggestions for your next adventure
                  </p>
                </div>
                <Button size="lg" className="shrink-0" asChild>
                  <Link to="/create-trip">
                    <Navigation className="h-4 w-4 mr-2" />
                    Plan a Trip
                  </Link>
                </Button>
              </div>
            </Card>
            
            {/* Upcoming Trips Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Upcoming Trips</h3>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/create-trip">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Trip
                  </Link>
                </Button>
              </div>
              <UpcomingTrips />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Community Highlights Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Community Highlights</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/community">View all</Link>
                  </Button>
                </div>
                <TravelFeed limit={2} key="dashboard-feed" />
              </div>
              
              {/* Group Activity Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Group Activity</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/groups">View all</Link>
                  </Button>
                </div>
                <GroupActivity />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
