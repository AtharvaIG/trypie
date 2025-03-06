
import React, { useState } from "react";
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Navbar } from "@/components/navbar";
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
import { ExpenseTracker } from "@/components/trip/ExpenseTracker";
import { toast } from "sonner";

const CreateTrip = () => {
  const { user } = useUser();
  const [currentTab, setCurrentTab] = useState("details");
  const [tripDetails, setTripDetails] = useState({
    destination: "",
    startDate: undefined,
    endDate: undefined,
    budget: 0,
    tripType: "",
    notes: ""
  });
  const [itinerary, setItinerary] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTripDetailsChange = (details) => {
    setTripDetails(details);
  };

  const handleGenerateItinerary = () => {
    if (!tripDetails.destination || !tripDetails.startDate || !tripDetails.endDate) {
      toast.error("Please fill in destination and date range first");
      return;
    }
    
    setIsGenerating(true);
    
    // Mock API call to generate AI itinerary
    setTimeout(() => {
      const days = Math.ceil(
        (tripDetails.endDate.getTime() - tripDetails.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      
      const generatedItinerary = Array.from({ length: days }, (_, index) => {
        const date = new Date(tripDetails.startDate);
        date.setDate(date.getDate() + index);
        
        return {
          id: `day-${index + 1}`,
          day: index + 1,
          date: new Date(date),
          activities: [
            {
              id: `activity-${index}-1`,
              time: "09:00 AM",
              title: index === 0 ? "Arrival & Hotel Check-in" : `Explore ${tripDetails.destination} - Area ${index}`,
              description: "Start your day with a delicious breakfast",
              location: "Hotel / Downtown",
              cost: Math.floor(Math.random() * 50) + 10
            },
            {
              id: `activity-${index}-2`,
              time: "12:00 PM",
              title: "Lunch at local restaurant",
              description: "Try the local cuisine",
              location: "City Center",
              cost: Math.floor(Math.random() * 30) + 20
            },
            {
              id: `activity-${index}-3`,
              time: "02:00 PM",
              title: index === days - 1 ? "Shopping & Souvenirs" : "Visit Popular Attraction",
              description: index === days - 1 ? "Get souvenirs for friends and family" : "Explore the most popular sight",
              location: tripDetails.destination,
              cost: Math.floor(Math.random() * 40) + 15
            },
            {
              id: `activity-${index}-4`,
              time: "07:00 PM",
              title: "Dinner",
              description: "Enjoy a nice dinner",
              location: "Recommended Restaurant",
              cost: Math.floor(Math.random() * 60) + 30
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Trip created successfully!");
    }, 1500);
  };

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-background">
          <Navbar />
          
          <main className="container mx-auto px-4 py-12 max-w-6xl">
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
              <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
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
                <TabsTrigger value="expenses" className="flex gap-2 items-center">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Expenses</span>
                  <span className="sm:hidden">Budget</span>
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
              
              <TabsContent value="expenses" className="space-y-6">
                <ExpenseTracker itinerary={itinerary} budget={tripDetails.budget} />
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
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default CreateTrip;
