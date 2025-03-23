
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

interface NoGroupsMessageProps {
  onCreateGroup: () => void;
}

export const NoGroupsMessage: React.FC<NoGroupsMessageProps> = ({ onCreateGroup }) => {
  return (
    <Card className="p-8 text-center border-dashed border-2">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h4 className="text-xl font-medium mb-2">Make Your First Group</h4>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create a group to plan trips, chat with friends, and share expenses with your travel companions.
        </p>
        <Button onClick={onCreateGroup} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create New Group
        </Button>
      </div>
    </Card>
  );
};
