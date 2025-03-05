
import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Receipt, Users } from "lucide-react";

// Placeholder data for group activities
const GROUP_ACTIVITIES = [
  {
    id: 1,
    groupName: "Italy Summer Trip",
    type: "message",
    user: {
      name: "Alex Morgan",
      avatar: "A",
      photoURL: null,
    },
    content: "Just booked our hotel in Florence! Check it out.",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    groupName: "Hiking Buddies",
    type: "expense",
    user: {
      name: "Jamie Chen",
      avatar: "J",
      photoURL: null,
    },
    content: "Added a $120 expense for gear rental.",
    timestamp: "Yesterday",
  },
  {
    id: 3,
    groupName: "Italy Summer Trip",
    type: "join",
    user: {
      name: "Taylor Swift",
      avatar: "T",
      photoURL: null,
    },
    content: "joined the group.",
    timestamp: "2 days ago",
  },
];

export function GroupActivity() {
  // Icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "expense":
        return <Receipt className="h-4 w-4 text-green-500" />;
      case "join":
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };
  
  return (
    <div className="space-y-3">
      {GROUP_ACTIVITIES.length > 0 ? (
        GROUP_ACTIVITIES.map((activity) => (
          <Card key={activity.id} className="p-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={activity.user.photoURL || undefined} alt={activity.user.name} />
                  <AvatarFallback className="text-xs">{activity.user.avatar}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm truncate">{activity.user.name}</span>
              </div>
              
              <p className="text-sm mt-1">
                <span className="text-muted-foreground">in</span>{" "}
                <span className="font-medium">{activity.groupName}</span>:{" "}
                {activity.content}
              </p>
              
              <p className="text-xs text-muted-foreground mt-1">
                {activity.timestamp}
              </p>
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h4 className="text-lg font-medium mb-2">No recent activity</h4>
            <p className="text-muted-foreground">
              Join or create a travel group to see activity here.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
