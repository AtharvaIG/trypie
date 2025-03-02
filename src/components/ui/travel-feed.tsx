
import React from "react";
import { useInView, generateStaggerDelay } from "@/lib/animations";
import { Avatar } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2 } from "lucide-react";

const TRAVEL_POSTS = [
  {
    id: 1,
    author: {
      name: "Alex Morgan",
      avatar: "A",
    },
    location: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1565967511849-76a60a516170",
    caption: "Sunset views at the rice terraces, such an incredible experience!",
    likes: 234,
    comments: 42,
    timestamp: "3 hours ago",
  },
  {
    id: 2,
    author: {
      name: "Jamie Chen",
      avatar: "J",
    },
    location: "Kyoto, Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
    caption: "Cherry blossoms in full bloom at the temples. Perfect timing for our trip!",
    likes: 187,
    comments: 24,
    timestamp: "12 hours ago",
  },
  {
    id: 3,
    author: {
      name: "Sam Wilson",
      avatar: "S",
    },
    location: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e",
    caption: "White and blue as far as the eye can see. The perfect Mediterranean getaway.",
    likes: 342,
    comments: 56,
    timestamp: "1 day ago",
  },
];

export function TravelFeed() {
  const { ref, isInView } = useInView();
  
  return (
    <div 
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {TRAVEL_POSTS.map((post, index) => (
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
