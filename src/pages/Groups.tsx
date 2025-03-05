
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Users, Plus, MessageSquare } from "lucide-react";

// Placeholder data for groups
const GROUPS = [
  {
    id: 1,
    name: "Italy Summer Trip",
    members: 4,
    lastActivity: "2 hours ago",
    previewMembers: ["A", "J", "T", "M"],
  },
  {
    id: 2,
    name: "Hiking Buddies",
    members: 3,
    lastActivity: "Yesterday",
    previewMembers: ["J", "S", "D"],
  },
];

const Groups = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <section className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold">Travel Groups</h2>
              <p className="text-muted-foreground">
                Plan, chat, and share expenses with your travel companions.
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Group
            </Button>
          </div>
          
          {GROUPS.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GROUPS.map((group) => (
                <Card key={group.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">{group.name}</h3>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {group.previewMembers.map((member, index) => (
                        <Avatar key={index} className="h-8 w-8 border-2 border-background">
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {member}
                          </div>
                        </Avatar>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{group.members} members</p>
                      <p>Last active {group.lastActivity}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h4 className="text-lg font-medium mb-2">No groups yet</h4>
                <p className="text-muted-foreground mb-4">
                  Create a group to plan trips with friends and family.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Group
                </Button>
              </div>
            </Card>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Groups;
