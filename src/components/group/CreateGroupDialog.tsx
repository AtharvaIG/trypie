
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface CreateGroupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (groupName: string) => Promise<void>;
  isCreating: boolean;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  isOpen,
  onOpenChange,
  onCreateGroup,
  isCreating
}) => {
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreateGroup = async () => {
    await onCreateGroup(newGroupName);
    setNewGroupName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name" id="group-name-label">
                Group Name
              </Label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newGroupName.trim()) {
                    handleCreateGroup();
                  }
                }}
                aria-labelledby="group-name-label"
                aria-describedby="group-name-description"
              />
              <p id="group-name-description" className="text-sm text-muted-foreground">
                Enter a name for your travel group.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              onOpenChange(false);
              setNewGroupName("");
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateGroup}
            disabled={isCreating || !newGroupName.trim()}
          >
            {isCreating ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
