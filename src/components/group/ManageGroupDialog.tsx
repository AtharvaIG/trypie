
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupMembersList } from "./GroupMembersList";
import { InviteMembers } from "./InviteMembers";
import { Group } from "./GroupTypes";

interface ManageGroupDialogProps {
  selectedGroup: Group | null;
  onClose: () => void;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const ManageGroupDialog: React.FC<ManageGroupDialogProps> = ({
  selectedGroup,
  onClose,
  activeTab,
  onTabChange
}) => {
  if (!selectedGroup) return null;

  return (
    <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{selectedGroup.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">Group Details</TabsTrigger>
            <TabsTrigger value="invite">Invite Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <GroupMembersList groupId={selectedGroup.id} />
          </TabsContent>
          
          <TabsContent value="invite" className="space-y-4">
            <InviteMembers groupId={selectedGroup.id} groupName={selectedGroup.name} />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
