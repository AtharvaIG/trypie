
import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, FileImage, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

type MediaItem = {
  id: string;
  imageUrl: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  fileType?: string;
};

type MediaGalleryProps = {
  groupId: string;
};

export const MediaGallery: React.FC<MediaGalleryProps> = ({ groupId }) => {
  const { currentUser } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaItems = async () => {
      if (!currentUser) {
        setError("You must be logged in to view media");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log(`Fetching media from groups/${groupId}/media`);
        
        // Use the group media path
        const mediaRef = ref(database, `groups/${groupId}/media`);
        const snapshot = await get(mediaRef);
        
        const items: MediaItem[] = [];
        if (snapshot.exists()) {
          const mediaData = snapshot.val();
          
          Object.entries(mediaData).forEach(([key, value]: [string, any]) => {
            // Only add items that have an imageUrl
            if (value && value.imageUrl) {
              items.push({
                id: key,
                imageUrl: value.imageUrl,
                senderId: value.senderId || '',
                senderName: value.senderName || 'Unknown',
                timestamp: value.timestamp || 0,
                fileType: value.fileType || 'image'
              });
            }
          });
          
          // Sort by timestamp (newest first)
          items.sort((a, b) => b.timestamp - a.timestamp);
        }
        
        console.log(`Found ${items.length} media items`);
        setMediaItems(items);
        setError(null);
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('Failed to load media items');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMediaItems();
  }, [groupId, currentUser]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center p-4">
        <FileImage className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Media Shared</h3>
        <p className="text-muted-foreground">
          Images and videos shared in this group will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {mediaItems.map((item) => (
        <Card key={item.id} className="overflow-hidden relative group h-40">
          <a 
            href={item.imageUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block h-full"
          >
            <img 
              src={item.imageUrl} 
              alt={`Shared by ${item.senderName}`}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="font-medium truncate">{item.senderName}</p>
              <p className="text-xs opacity-80">
                {new Date(item.timestamp).toLocaleDateString()}
              </p>
            </div>
          </a>
        </Card>
      ))}
    </div>
  );
};
