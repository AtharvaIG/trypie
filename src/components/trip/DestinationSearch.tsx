
import React, { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const popularDestinations = [
  "San Francisco, USA",
  "New York City, USA",
  "Tokyo, Japan",
  "Paris, France",
  "London, UK",
  "Rome, Italy",
  "Sydney, Australia",
  "Dubai, UAE",
  "Singapore",
  "Barcelona, Spain",
  "Amsterdam, Netherlands",
  "Hong Kong",
  "Istanbul, Turkey",
  "Bangkok, Thailand",
  "Seoul, South Korea"
];

interface DestinationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const DestinationSearch = ({ value, onChange }: DestinationSearchProps) => {
  const [open, setOpen] = useState(false);
  const [destinations, setDestinations] = useState<string[]>(popularDestinations);

  const filterDestinations = (searchTerm: string) => {
    if (!searchTerm) return popularDestinations;
    
    const filtered = popularDestinations.filter(dest =>
      dest.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered;
  };

  const handleSearch = (value: string) => {
    setDestinations(filterDestinations(value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{value}</span>
            </div>
          ) : (
            "Select destination..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search destinations..." 
            onValueChange={handleSearch}
          />
          <CommandEmpty>No destination found.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {destinations.map((dest) => (
              <CommandItem
                key={dest}
                value={dest}
                onSelect={() => {
                  onChange(dest);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === dest ? "opacity-100" : "opacity-0"
                  )}
                />
                {dest}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
