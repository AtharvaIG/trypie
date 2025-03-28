
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { CreateGroupDialog } from "./CreateGroupDialog";

interface GroupHeaderProps {
  loading: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  handleRefresh: () => void;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  loading,
  isDialogOpen,
  setIsDialogOpen,
  handleRefresh
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-3xl font-bold">Travel Groups</h2>
        <p className="text-muted-foreground">
          Plan, chat, and share expenses with your travel companions.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <CreateGroupDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onCreateGroup={() => {}} // This will be passed from parent
        />
      </div>
    </div>
  );
};
