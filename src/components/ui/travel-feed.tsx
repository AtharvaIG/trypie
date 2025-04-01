
import React, { memo, useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useInView } from "@/lib/animations";
import { Skeleton } from "@/components/ui/skeleton";

// Use only local images with reduced array (removing the last 3 posts)
const TRAVEL_POSTS = [
  {
    id: 1,
    author: {
      name: "Aarav Kumar",
      avatar: "A",
    },
    location: "Jaipur, Rajasthan",
    image: "/lovable-uploads/f5ceeafb-65d3-4719-8ae7-107629a42cc5.png", // Hawa Mahal
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
    image: "/lovable-uploads/bffe3618-7c2f-4ce5-987b-5b3005e15dd3.png", // Tea Plantation
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
    image: "/lovable-uploads/16d0ed76-87c2-475e-8072-b76f3b5cfd5c.png",
    caption: "Witnessing the Ganga Aarti at dawn - a spiritual experience like no other.",
    likes: 342,
    comments: 56,
    timestamp: "1 day ago",
  },
];

interface TravelFeedProps {
  limit?: number;
  key?: string; // Add key prop to help React identify when to remount component
}

// Lazy-loaded image component with skeleton loading state
const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, isInView } = useInView({ threshold: 0.1 });
  
  return (
    <div ref={ref} className="relative w-full h-full">
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      {isInView && (
        <img 
          src={src} 
          alt={alt} 
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
};

// Memoized TravelPost component to prevent unnecessary re-renders
const TravelPost = memo(({ post }: { post: typeof TRAVEL_POSTS[0]; index?: number }) => {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  
  if (!post) return null; // Guard against null or undefined posts
  
  return (
    <div
      key={post.id}
      ref={ref}
      className={`bg-white rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-md ${
        isInView ? 'animate-fade-in' : 'opacity-0'
      }`}
      style={{ animationDelay: '0.1s' }}
    >
      <div className="p-4 flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {post.author?.avatar || '?'}
          </div>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{post.author?.name || 'Unknown User'}</p>
          <p className="text-xs text-muted-foreground">{post.location || 'Unknown Location'}</p>
        </div>
      </div>
      
      <AspectRatio ratio={4/3} className="bg-muted">
        <LazyImage src={post.image || '/placeholder.svg'} alt={post.caption || 'Travel image'} />
      </AspectRatio>
      
      <div className="p-4">
        <div className="flex gap-4 mb-3">
          <button className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <Heart className="h-4 w-4 mr-1" />
            {post.likes || 0}
          </button>
          <button className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <MessageSquare className="h-4 w-4 mr-1" />
            {post.comments || 0}
          </button>
          <button className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-sm mb-1">{post.caption || ''}</p>
        <p className="text-xs text-muted-foreground">{post.timestamp || ''}</p>
      </div>
    </div>
  );
});

TravelPost.displayName = 'TravelPost';

export function TravelFeed({ limit, key }: TravelFeedProps) {
  // Filter posts based on limit if provided
  const posts = TRAVEL_POSTS || [];
  const displayPosts = limit && posts.length > 0 ? posts.slice(0, limit) : posts;
  
  if (!Array.isArray(displayPosts) || displayPosts.length === 0) {
    return (
      <div className="text-center p-8 bg-secondary/20 rounded-lg border border-border">
        <p className="text-muted-foreground">No travel posts available right now.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" key={key || 'travel-feed'}>
      {displayPosts.map((post) => (
        <TravelPost key={post.id || `post-${Math.random()}`} post={post} />
      ))}
    </div>
  );
}
