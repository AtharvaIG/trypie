
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

const CreateTrip = () => {
  const { user } = useUser();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Here you would typically redirect to the newly created trip page
      alert("Trip created successfully!");
    }, 1500);
  };

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-background">
          <Navbar />
          
          <main className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Plan a New Trip</h1>
              <p className="text-muted-foreground">
                Fill in the details below to start planning your next adventure.
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input 
                    id="destination"
                    placeholder="Where are you going?"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Travel Dates</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            format(dateRange.from, "PPP")
                          ) : (
                            <span>Start date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) =>
                            setDateRange((prev) => ({ ...prev, from: date }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? (
                            format(dateRange.to, "PPP")
                          ) : (
                            <span>End date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) =>
                            setDateRange((prev) => ({ ...prev, to: date }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trip-type">Trip Type</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a trip type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Trip Types</SelectLabel>
                        <SelectItem value="adventure">Adventure</SelectItem>
                        <SelectItem value="relaxation">Relaxation</SelectItem>
                        <SelectItem value="culture">Cultural</SelectItem>
                        <SelectItem value="food">Food & Culinary</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="solo">Solo</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (USD)</Label>
                  <Input 
                    id="budget"
                    type="number"
                    placeholder="What's your budget for this trip?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Trip Notes</Label>
                  <textarea 
                    id="notes"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    placeholder="Any special requirements or interests for this trip?"
                    rows={4}
                  ></textarea>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Travel Companions</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" className="justify-start">
                      <span className="h-4 w-4 mr-2 rounded-full bg-primary/20 flex items-center justify-center text-primary">+</span>
                      Invite Friends
                    </Button>
                    <Button type="button" variant="outline" className="justify-start">
                      <span className="h-4 w-4 mr-2 rounded-full bg-primary/20 flex items-center justify-center text-primary">+</span>
                      Create Group
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Trip"
                  )}
                </Button>
              </form>
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
