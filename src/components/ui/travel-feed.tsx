
import React, { memo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  {
    id: 4,
    author: {
      name: "Meera Patel",
      avatar: "M",
    },
    location: "Valley of Flowers, Uttarakhand",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    caption: "The incredible Valley of Flowers in full bloom - a paradise for nature lovers!",
    likes: 276,
    comments: 38,
    timestamp: "2 days ago",
  },
  {
    id: 5,
    author: {
      name: "Raj Malhotra",
      avatar: "R",
    },
    location: "Leh, Ladakh",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    caption: "The stunning landscapes of Ladakh - feels like you're on another planet!",
    likes: 412,
    comments: 67,
    timestamp: "3 days ago",
  },
  {
    id: 6,
    author: {
      name: "Ananya Reddy",
      avatar: "A",
    },
    location: "Coorg, Karnataka",
    image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb",
    caption: "Misty mornings in the coffee plantations of Coorg - truly a slice of heaven!",
    likes: 198,
    comments: 29,
    timestamp: "4 days ago",
  },
];

interface TravelFeedProps {
  limit?: number;
}

// Memoized TravelPost component to prevent unnecessary re-renders
const TravelPost = memo(({ post }: { post: typeof TRAVEL_POSTS[0]; index?: number }) => {
  return (
    <div
      key={post.id}
      className="bg-white rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-md"
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
      
      <AspectRatio ratio={4/3} className="bg-muted">
        <img 
          src={post.image} 
          alt={post.caption} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </AspectRatio>
      
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
  );
});

TravelPost.displayName = 'TravelPost';

export function TravelFeed({ limit }: TravelFeedProps) {
  // Filter posts based on limit if provided
  const displayPosts = limit ? TRAVEL_POSTS.slice(0, limit) : TRAVEL_POSTS;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayPosts.map((post, index) => (
        <TravelPost key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
