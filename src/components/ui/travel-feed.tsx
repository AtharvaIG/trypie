
import React from "react";
import { useInView, generateStaggerDelay } from "@/lib/animations";
import { Avatar } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2 } from "lucide-react";

const TRAVEL_POSTS = [
  {
    id: 1,
    author: {
      name: "Aarav Kumar",
      avatar: "A",
    },
    location: "Jaipur, Rajasthan",
    image: "https://images.unsplash.com/photo-1599661046289-e31897843bba",
    caption: "The Pink City's Hawa Mahal at sunset - truly breathtaking architecture!",
    likes: 234,
    comments: 42,
    timestamp: "3 hours ago",
  },
  {
    id: 2,
    author: {
      name: "Priya Sharma",
      avatar: "P",
    },
    location: "Munnar, Kerala",
    image: "https://images.unsplash.com/photo-1602308942233-c367543c8e9f",
    caption: "Tea plantations stretching as far as the eye can see. God's own country indeed!",
    likes: 187,
    comments: 24,
    timestamp: "12 hours ago",
  },
  {
    id: 3,
    author: {
      name: "Vikram Singh",
      avatar: "V",
    },
    location: "Varanasi, Uttar Pradesh",
    image: "https://images.unsplash.com/photo-1561361058-c24cecae35ca",
    caption: "Witnessing the Ganga Aarti at dawn - a spiritual experience like no other.",
    likes: 342,
    comments: 56,
    timestamp: "1 day ago",
  },
];

interface TravelFeedProps {
  limit?: number;
}

export function TravelFeed({ limit }: TravelFeedProps) {
  const { ref, isInView } = useInView();
  
  // Filter posts based on limit if provided
  const displayPosts = limit ? TRAVEL_POSTS.slice(0, limit) : TRAVEL_POSTS;
  
  return (
    <div 
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {displayPosts.map((post, index) => (
        <div
          key={post.id}
          className="bg-white rounded-xl border border-border overflow-hidden"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            transitionDelay: generateStaggerDelay(index),
          }}
        >
          <div className="p-4 flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {post.author.avatar}
              </div>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">{post.location}</p>
            </div>
          </div>
          
          <div className="aspect-w-4 aspect-h-3 relative">
            <img 
              src={post.image} 
              alt={post.caption} 
              className="w-full h-56 object-cover"
            />
          </div>
          
          <div className="p-4">
            <div className="flex gap-4 mb-3">
              <button className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <Heart className="h-4 w-4 mr-1" />
                {post.likes}
              </button>
              <button className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.comments}
              </button>
              <button className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-sm mb-1">{post.caption}</p>
            <p className="text-xs text-muted-foreground">{post.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
