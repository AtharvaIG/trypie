
import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/ui/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Users, Settings, Grid3X3, Bookmark, Upload, X, Save, Camera } from "lucide-react";
import { TravelFeed } from "@/components/ui/travel-feed";
import { Navigate } from "react-router-dom";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { currentUser, loading, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(currentUser?.photoURL || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: currentUser?.displayName || "",
      bio: "",
      location: "Delhi, India",
    },
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const getUserInitials = () => {
    if (!currentUser.displayName) return currentUser.email?.[0]?.toUpperCase() || "U";
    const names = currentUser.displayName.split(" ");
    if (names.length === 1) return names[0][0];
    return `${names[0][0]}${names[names.length - 1][0]}`;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;
    
    try {
      setUploadingPhoto(true);
      
      // Create a reference to the storage location
      const storageRef = ref(storage, `profile_photos/${currentUser.uid}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update the user profile with the new photoURL
      await updateUserProfile(currentUser.displayName || "", downloadURL);
      
      // Update the local state
      setPhotoURL(downloadURL);
      
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Error",
        description: "Failed to update profile photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateUserProfile(data.displayName, photoURL || "");
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden mb-6">
          <div className="h-48 bg-gradient-to-r from-primary/30 to-primary/10"></div>
          
          <div className="px-6 pb-6 relative">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white absolute -top-12">
                {photoURL ? (
                  <AvatarImage src={photoURL} alt={currentUser.displayName || "Profile"} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                    {getUserInitials()}
                  </div>
                )}
              </Avatar>
              
              {isEditing && (
                <button 
                  className="absolute -top-6 left-14 bg-primary text-white p-1 rounded-full shadow-md"
                  onClick={triggerFileInput}
                  type="button"
                >
                  <Camera className="h-4 w-4" />
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </button>
              )}
            </div>
            
            {!isEditing ? (
              <div className="pt-14 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {currentUser.displayName || currentUser.email}
                  </h1>
                  
                  {currentUser.email && (
                    <p className="text-muted-foreground">{currentUser.email}</p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>Joined {currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Recently'}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      <span>0 followers</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>Delhi, India</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="pt-14 space-y-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself and your travel preferences" 
                            className="resize-none h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Your location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploadingPhoto}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            )}
            
            {!isEditing && (
              <div className="mt-4">
                <p className="text-sm">
                  {form.getValues().bio || "No bio yet. Add a description about yourself and your travel preferences."}
                </p>
              </div>
            )}
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
            <TravelFeed key="posts-feed" />
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
  );
};

export default Profile;
