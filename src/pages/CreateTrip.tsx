
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Loader2, Plus, UserPlus, DollarSign, Map, MapPin, Clock, Activity } from "lucide-react";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { TripDetailsForm } from "@/components/trip/TripDetailsForm";
import { ItineraryGenerator } from "@/components/trip/ItineraryGenerator";
import { GroupCollaboration } from "@/components/trip/GroupCollaboration";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

const CreateTrip = () => {
  const { currentUser, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState("details");
  const [tripDetails, setTripDetails] = useState({
    destination: "",
    startDate: undefined,
    endDate: undefined,
    budget: 0,
    tripType: "",
    notes: ""
  });
  const [itinerary, setItinerary] = useState<any[]>([]); // Explicitly initialize as empty array with type
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const handleTripDetailsChange = (details: any) => {
    setTripDetails(details);
  };

  const handleGenerateItinerary = () => {
    if (!tripDetails.destination || !tripDetails.startDate || !tripDetails.endDate) {
      toast.error("Please fill in destination and date range first");
      return;
    }
    
    setIsGenerating(true);
    
    // Enhanced mock API call with destination-specific recommendations
    setTimeout(() => {
      // Make sure we have valid dates before calculating
      if (!tripDetails.startDate || !tripDetails.endDate) {
        setIsGenerating(false);
        toast.error("Please select valid dates");
        return;
      }
      
      const days = Math.ceil(
        (tripDetails.endDate.getTime() - tripDetails.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      
      // Destination-specific activities based on the selected city
      const citySpecificActivities: Record<string, any[]> = {
        "San Francisco, USA": [
          {
            morning: {
              title: "Golden Gate Bridge & Presidio",
              description: "Start with a walk across the iconic Golden Gate Bridge, followed by exploring the Presidio's hiking trails",
              location: "Golden Gate Bridge",
              cost: 0
            },
            afternoon: {
              title: "Fisherman's Wharf & Pier 39",
              description: "Visit the famous sea lions, enjoy fresh seafood, and take a bay cruise",
              location: "Pier 39",
              cost: 45
            },
            evening: {
              title: "Chinatown Dining Experience",
              description: "Authentic dim sum and tea tasting in the largest Chinatown outside of Asia",
              location: "Grant Avenue",
              cost: 35
            }
          },
          {
            morning: {
              title: "Alcatraz Island Tour",
              description: "Take the early ferry to Alcatraz for a fascinating audio tour of the infamous prison",
              location: "Alcatraz Island",
              cost: 41
            },
            afternoon: {
              title: "Mission District Art Walk",
              description: "Explore colorful murals, visit Mission Dolores, and try local taquerias",
              location: "Mission District",
              cost: 25
            },
            evening: {
              title: "North Beach Italian Dinner",
              description: "Enjoy authentic Italian cuisine in San Francisco's Little Italy",
              location: "Columbus Avenue",
              cost: 50
            }
          }
        ]
      };
      
      const defaultActivities = [
        {
          morning: {
            title: "Local Sightseeing",
            description: "Explore the city's main attractions and landmarks",
            location: "City Center",
            cost: 30
          },
          afternoon: {
            title: "Cultural Experience",
            description: "Visit museums and cultural sites",
            location: "Cultural District",
            cost: 25
          },
          evening: {
            title: "Local Dining",
            description: "Experience local cuisine at recommended restaurants",
            location: "Restaurant District",
            cost: 40
          }
        }
      ];
      
      // Check if we have activities for the selected destination
      const activityTemplates = tripDetails.destination && citySpecificActivities[tripDetails.destination] 
        ? citySpecificActivities[tripDetails.destination] 
        : defaultActivities;
      
      const generatedItinerary = Array.from({ length: days }, (_, index) => {
        const date = new Date(tripDetails.startDate);
        date.setDate(date.getDate() + index);
        
        const dayTemplate = activityTemplates[index % activityTemplates.length];
        
        return {
          id: `day-${index + 1}`,
          day: index + 1,
          date: new Date(date),
          activities: [
            {
              id: `activity-${index}-1`,
              time: "09:00 AM",
              title: dayTemplate.morning.title,
              description: dayTemplate.morning.description,
              location: dayTemplate.morning.location,
              cost: dayTemplate.morning.cost
            },
            {
              id: `activity-${index}-2`,
              time: "02:00 PM",
              title: dayTemplate.afternoon.title,
              description: dayTemplate.afternoon.description,
              location: dayTemplate.afternoon.location,
              cost: dayTemplate.afternoon.cost
            },
            {
              id: `activity-${index}-3`,
              time: "07:00 PM",
              title: dayTemplate.evening.title,
              description: dayTemplate.evening.description,
              location: dayTemplate.evening.location,
              cost: dayTemplate.evening.cost
            }
          ]
        };
      });
      
      setItinerary(generatedItinerary);
      setIsGenerating(false);
      setCurrentTab("itinerary");
      toast.success("Itinerary generated successfully!");
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Trip created successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 mt-20 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Plan a New Trip</h1>
          <p className="text-muted-foreground">
            Fill in the details below and get AI-powered suggestions for your next adventure.
          </p>
        </div>
        
        <Tabs 
          value={currentTab} 
          onValueChange={setCurrentTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto">
            <TabsTrigger value="details" className="flex gap-2 items-center">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Trip Details</span>
              <span className="sm:hidden">Details</span>
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="flex gap-2 items-center">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Itinerary</span>
              <span className="sm:hidden">Plan</span>
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex gap-2 items-center">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Group</span>
              <span className="sm:hidden">Group</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <TripDetailsForm 
              tripDetails={tripDetails}
              onChange={handleTripDetailsChange}
              onGenerateItinerary={handleGenerateItinerary}
              isGenerating={isGenerating}
            />
          </TabsContent>
          
          <TabsContent value="itinerary" className="space-y-6">
            <ItineraryGenerator 
              itinerary={itinerary}
              setItinerary={setItinerary}
              destination={tripDetails.destination}
              isGenerating={isGenerating}
              onGenerate={handleGenerateItinerary}
            />
          </TabsContent>
          
          <TabsContent value="collaboration" className="space-y-6">
            <GroupCollaboration />
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Trip...
              </>
            ) : (
              "Save Trip"
            )}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateTrip;
