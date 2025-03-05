
import React from "react";
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/ui/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Settings, Grid3X3, Bookmark } from "lucide-react";
import { TravelFeed } from "@/components/ui/travel-feed";

const Profile = () => {
  const { user } = useUser();

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-background">
          <Navbar />
          
          <main className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden mb-6">
              <div className="h-48 bg-gradient-to-r from-primary/30 to-primary/10"></div>
              
              <div className="px-6 pb-6 relative">
                <Avatar className="h-24 w-24 border-4 border-white absolute -top-12">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                    {user?.firstName?.[0] || user?.username?.[0] || "U"}
                  </div>
                </Avatar>
                
                <div className="pt-14 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    
                    {user?.username && (
                      <p className="text-muted-foreground">@{user.username}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {user?.publicMetadata?.location && (
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{user.publicMetadata.location as string}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Joined {new Date(user?.createdAt || "").toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>0 followers</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm">
                    {user?.publicMetadata?.bio as string || 
                      "No bio yet. Add a description about yourself and your travel preferences."}
                  </p>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="posts" className="flex items-center">
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Posts
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Saved
                </TabsTrigger>
                <TabsTrigger value="trips" className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Trips
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts">
                <TravelFeed />
              </TabsContent>
              
              <TabsContent value="saved">
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No saved posts yet</h3>
                  <p className="text-muted-foreground">
                    When you save posts from the travel feed, they'll appear here.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="trips">
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No trips planned yet</h3>
                  <p className="text-muted-foreground">
                    Start planning your adventures and they'll show up here.
                  </p>
                  <Button className="mt-4">
                    Plan a Trip
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
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

export default Profile;
