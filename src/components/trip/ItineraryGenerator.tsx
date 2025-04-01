
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Sparkles, Clock, MapPin, DollarSign, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

// Define types for better type safety
interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
}

interface ItineraryDay {
  id: string;
  day: number;
  date: Date;
  activities: Activity[];
}

interface ItineraryGeneratorProps {
  itinerary?: ItineraryDay[];
  setItinerary: (itinerary: ItineraryDay[]) => void;
  destination?: string;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const ItineraryGenerator = ({ 
  itinerary = [], // Provide default empty array
  setItinerary, 
  destination = "", // Provide default empty string
  isGenerating,
  onGenerate
}: ItineraryGeneratorProps) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState<Omit<Activity, 'id'>>({
    time: "12:00 PM",
    title: "",
    description: "",
    location: "",
    cost: 0
  });
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Safety check for itinerary to ensure it's always an array
  const safeItinerary = Array.isArray(itinerary) ? itinerary : [];

  const handleDragEnd = (result) => {
    const { destination: dragDestination, source, draggableId } = result;
    
    if (!dragDestination) {
      return;
    }
    
    if (
      dragDestination.droppableId === source.droppableId &&
      dragDestination.index === source.index
    ) {
      return;
    }
    
    // Find the source day and destination day
    const sourceDay = safeItinerary.find(day => `day-${day.id}` === source.droppableId);
    const destinationDay = safeItinerary.find(day => `day-${day.id}` === dragDestination.droppableId);
    
    if (!sourceDay || !destinationDay) {
      console.error("Source or destination day not found", {source, destination: dragDestination});
      return;
    }
    
    // Ensure activities arrays exist
    const sourceActivities = Array.isArray(sourceDay.activities) ? [...sourceDay.activities] : [];
    const destinationActivities = Array.isArray(destinationDay.activities) ? [...destinationDay.activities] : [];
    
    if (sourceDay === destinationDay) {
      // Moving within the same day
      const [removed] = sourceActivities.splice(source.index, 1);
      sourceActivities.splice(dragDestination.index, 0, removed);
      
      const newItinerary = safeItinerary.map(day => {
        if (day.id === sourceDay.id) {
          return {
            ...day,
            activities: sourceActivities
          };
        }
        return day;
      });
      
      setItinerary(newItinerary);
    } else {
      // Moving between days
      const [removed] = sourceActivities.splice(source.index, 1);
      destinationActivities.splice(dragDestination.index, 0, removed);
      
      const newItinerary = safeItinerary.map(day => {
        if (day.id === sourceDay.id) {
          return {
            ...day,
            activities: sourceActivities
          };
        }
        if (day.id === destinationDay.id) {
          return {
            ...day,
            activities: destinationActivities
          };
        }
        return day;
      });
      
      setItinerary(newItinerary);
    }
  };

  const handleAddActivity = (dayId: string) => {
    setSelectedDay(dayId);
    setEditingActivity(null);
    setNewActivity({
      time: "12:00 PM",
      title: "",
      description: "",
      location: "",
      cost: 0
    });
    setIsDialogOpen(true);
  };

  const handleEditActivity = (dayId: string, activity: Activity) => {
    setSelectedDay(dayId);
    setEditingActivity(activity.id);
    setNewActivity({
      time: activity.time,
      title: activity.title,
      description: activity.description,
      location: activity.location,
      cost: activity.cost
    });
    setIsDialogOpen(true);
  };

  const handleDeleteActivity = (dayId: string, activityId: string) => {
    const updatedItinerary = safeItinerary.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          activities: Array.isArray(day.activities) 
            ? day.activities.filter(activity => activity.id !== activityId)
            : []
        };
      }
      return day;
    });
    
    setItinerary(updatedItinerary);
    toast.success("Activity removed from itinerary");
  };

  const handleSaveActivity = () => {
    if (!newActivity.title) {
      toast.error("Activity title is required");
      return;
    }
    
    const updatedItinerary = safeItinerary.map(day => {
      if (day.id === selectedDay) {
        const activities = Array.isArray(day.activities) ? [...day.activities] : [];
        
        if (editingActivity) {
          // Editing existing activity
          return {
            ...day,
            activities: activities.map(activity => {
              if (activity.id === editingActivity) {
                return {
                  ...activity,
                  ...newActivity
                };
              }
              return activity;
            })
          };
        } else {
          // Adding new activity
          const newActivityItem = {
            id: `activity-${day.id}-${Date.now()}`,
            ...newActivity
          };
          return {
            ...day,
            activities: [...activities, newActivityItem]
          };
        }
      }
      return day;
    });
    
    setItinerary(updatedItinerary);
    setIsDialogOpen(false);
    toast.success(editingActivity ? "Activity updated" : "Activity added to itinerary");
  };

  if (!safeItinerary.length) {
    return (
      <Card className="bg-white rounded-xl border border-border shadow-sm p-6 text-center">
        <div className="py-12 flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Itinerary Generated Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Fill in your trip details and generate an AI-powered itinerary to see your day-by-day plan here.
          </p>
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Itinerary
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your {destination} Itinerary</h2>
        <Button 
          variant="outline" 
          onClick={onGenerate} 
          disabled={isGenerating}
          size="sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Regenerate
            </>
          )}
        </Button>
      </div>
      
      <p className="text-muted-foreground text-sm">
        Drag and drop activities to customize your itinerary. Click the "+" button to add new activities.
      </p>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6">
          {safeItinerary.map((day) => (
            <Card key={day.id} className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Day {day.day}: {format(day.date, "EEEE, MMMM d")}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleAddActivity(day.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={`day-${day.id}`}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {Array.isArray(day.activities) && day.activities.map((activity, index) => (
                        <Draggable
                          key={activity.id}
                          draggableId={activity.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-3 bg-secondary/20 rounded-lg border border-border hover:border-primary/30 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                  <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded mr-3">
                                    {activity.time}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{activity.title}</h4>
                                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                                    <div className="flex mt-1 flex-wrap gap-2">
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {activity.location}
                                      </div>
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        ${activity.cost}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleEditActivity(day.id, activity)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => handleDeleteActivity(day.id, activity.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {(!day.activities || day.activities.length === 0) && (
                        <div className="p-4 text-center border border-dashed border-border rounded-lg">
                          <p className="text-sm text-muted-foreground">No activities for this day. Click "+" to add one.</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingActivity ? "Edit Activity" : "Add New Activity"}</DialogTitle>
            <DialogDescription>
              {editingActivity 
                ? "Update the details of this activity." 
                : "Add a new activity to your itinerary."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="activity-time">Time</Label>
              <Input
                id="activity-time"
                value={newActivity.time}
                onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                placeholder="e.g. 09:00 AM"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="activity-title">Activity Title</Label>
              <Input
                id="activity-title"
                value={newActivity.title}
                onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                placeholder="e.g. Museum Visit"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="activity-description">Description</Label>
              <Input
                id="activity-description"
                value={newActivity.description}
                onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                placeholder="Brief description of the activity"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="activity-location">Location</Label>
              <Input
                id="activity-location"
                value={newActivity.location}
                onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                placeholder="Where this activity takes place"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="activity-cost">Estimated Cost ($)</Label>
              <Input
                id="activity-cost"
                type="number"
                value={newActivity.cost}
                onChange={(e) => setNewActivity({...newActivity, cost: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveActivity}>
              {editingActivity ? "Update Activity" : "Add Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
