
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, MapPin } from "lucide-react";

// Placeholder data for upcoming trips
const UPCOMING_TRIPS = [
  {
    id: 1,
    destination: "Paris, France",
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 days from now
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1420&q=80",
  },
  {
    id: 2,
    destination: "Bali, Indonesia",
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    endDate: new Date(Date.now() + 59 * 24 * 60 * 60 * 1000), // 59 days from now
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
  },
];

export function UpcomingTrips() {
  // Calculate days remaining until trip
  const getDaysRemaining = (startDate: Date) => {
    const today = new Date();
    const diffTime = startDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Calculate countdown progress percentage
  const getCountdownProgress = (startDate: Date) => {
    const daysRemaining = getDaysRemaining(startDate);
    // Using 90 days as the max countdown period
    return Math.max(0, Math.min(100, 100 - (daysRemaining / 90) * 100));
  };
  
  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {UPCOMING_TRIPS.length > 0 ? (
        UPCOMING_TRIPS.map((trip) => (
          <Card key={trip.id} className="overflow-hidden h-full transition-all hover:shadow-md">
            <div 
              className="h-32 w-full bg-cover bg-center" 
              style={{ backgroundImage: `url(${trip.image})` }}
            />
            <CardContent className="p-4">
              <h4 className="font-semibold text-lg flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-primary" />
                {trip.destination}
              </h4>
              
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <CalendarDays className="h-4 w-4 mr-1" />
                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">
                    {getDaysRemaining(trip.startDate)} days left
                  </span>
                  <span className="text-muted-foreground">Departure</span>
                </div>
                <Progress value={getCountdownProgress(trip.startDate)} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="col-span-full p-8 text-center">
          <div className="flex flex-col items-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h4 className="text-lg font-medium mb-2">No upcoming trips</h4>
            <p className="text-muted-foreground mb-4">
              Plan your next adventure to see it appear here.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
