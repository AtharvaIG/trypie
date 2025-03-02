
import React from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MapPin, Edit2 } from "lucide-react";

export function UserProfile() {
  const { user } = useUser();
  
  if (!user) return null;
  
  return (
    <div className="w-full md:w-72 bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 mb-4">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
            {user.firstName?.[0] || user.username?.[0] || "U"}
          </div>
        </Avatar>
        
        <h3 className="font-semibold text-xl">
          {user.firstName} {user.lastName}
        </h3>
        
        {user.username && (
          <p className="text-muted-foreground text-sm">@{user.username}</p>
        )}
        
        {user.publicMetadata?.location && (
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{user.publicMetadata.location as string}</span>
          </div>
        )}
      </div>
      
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-4">
          {user.publicMetadata?.bio as string || "No bio yet. Add a short description about yourself and your travel preferences."}
        </p>
        
        <Button variant="outline" className="w-full" size="sm">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
