
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";

export const TripDetailsForm = ({ 
  tripDetails, 
  onChange, 
  onGenerateItinerary, 
  isGenerating 
}) => {
  const [dateRange, setDateRange] = useState({
    from: tripDetails.startDate,
    to: tripDetails.endDate,
  });

  const handleDestinationChange = (e) => {
    onChange({ ...tripDetails, destination: e.target.value });
  };

  const handleTripTypeChange = (value) => {
    onChange({ ...tripDetails, tripType: value });
  };

  const handleBudgetChange = (e) => {
    onChange({ ...tripDetails, budget: Number(e.target.value) });
  };

  const handleNotesChange = (e) => {
    onChange({ ...tripDetails, notes: e.target.value });
  };

  const handleDateChange = (range) => {
    setDateRange(range);
    onChange({ 
      ...tripDetails, 
      startDate: range.from, 
      endDate: range.to 
    });
  };

  return (
    <Card className="bg-white rounded-xl border border-border shadow-sm p-6">
      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input 
            id="destination"
            placeholder="Where are you going?"
            value={tripDetails.destination}
            onChange={handleDestinationChange}
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
                    handleDateChange({ ...dateRange, from: date })
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
                    handleDateChange({ ...dateRange, to: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="trip-type">Trip Type</Label>
          <Select onValueChange={handleTripTypeChange} value={tripDetails.tripType}>
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
            value={tripDetails.budget || ''}
            onChange={handleBudgetChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Trip Notes & Preferences</Label>
          <textarea 
            id="notes"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            placeholder="Any special requirements or interests for this trip?"
            value={tripDetails.notes}
            onChange={handleNotesChange}
            rows={4}
          ></textarea>
        </div>
        
        <Button 
          type="button" 
          onClick={onGenerateItinerary}
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Itinerary
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
