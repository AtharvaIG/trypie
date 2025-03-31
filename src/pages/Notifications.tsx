
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Heart, Users, Calendar, MessageSquare } from "lucide-react";

// Placeholder data for notifications
const NOTIFICATIONS = [
  {
    id: 1,
    type: "like",
    user: {
      name: "Alex Morgan",
      avatar: "A",
      photoURL: null,
    },
    content: "liked your photo from Santorini.",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "follow",
    user: {
      name: "Jamie Chen",
      avatar: "J",
      photoURL: null,
    },
    content: "started following you.",
    timestamp: "Yesterday",
    read: true,
  },
  {
    id: 3,
    type: "trip",
    user: {
      name: "Taylor Swift",
      avatar: "T",
      photoURL: null,
    },
    content: "invited you to join 'Japan Spring 2024' trip.",
    timestamp: "2 days ago",
    read: true,
  },
  {
    id: 4,
    type: "comment",
    user: {
      name: "Sam Wilson",
      avatar: "S",
      photoURL: null,
    },
    content: "commented on your Paris photo: 'Looks amazing! Which district was this?'",
    timestamp: "3 days ago",
    read: true,
  },
];

const Notifications = () => {
  const { currentUser } = useAuth();
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "follow":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "trip":
        return <Calendar className="h-4 w-4 text-green-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 mt-20 max-w-3xl">
        <section className="mb-10">
          <h2 className="text-3xl font-bold mb-6">Notifications</h2>
          
          {NOTIFICATIONS.length > 0 ? (
            <div className="space-y-3">
              {NOTIFICATIONS.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 flex items-start gap-3 ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={notification.user.photoURL || undefined} alt={notification.user.name} />
                        <AvatarFallback className="text-xs">{notification.user.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">
                        {notification.user.name}{' '}
                        <span className="font-normal">{notification.content}</span>
                      </span>
                      
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 ml-auto"></span>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timestamp}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h4 className="text-lg font-medium mb-2">No notifications</h4>
                <p className="text-muted-foreground">
                  You're all caught up! Check back later for updates.
                </p>
              </div>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
};

export default Notifications;
