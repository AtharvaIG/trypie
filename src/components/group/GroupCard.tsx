
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MessageSquare, Clock, Users, UserPlus } from "lucide-react";
import { Group } from "./GroupTypes";

interface GroupCardProps {
  group: Group;
  onJoinChat: (groupId: string) => void;
  onManageGroup: (group: Group) => void;
  onInviteUsers: (group: Group) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ 
  group, 
  onJoinChat, 
  onManageGroup, 
  onInviteUsers 
}) => {
  // Safety check for incomplete group data
  if (!group || !group.id) {
    console.error("Invalid group data:", group);
    return null;
  }

  // Ensure all properties exist with fallbacks
  const safeGroup = {
    id: group.id,
    name: group.name || "Unnamed Group",
    members: typeof group.members === 'number' ? group.members : 
      (group.membersList ? Object.keys(group.membersList).length : 0),
    lastActivity: group.lastActivity || "Never",
    previewMembers: Array.isArray(group.previewMembers) ? group.previewMembers : ['?'],
    membersList: group.membersList ? (typeof group.membersList === 'object' ? group.membersList : {}) : {},
    createdBy: group.createdBy || "",
    createdAt: group.createdAt || 0
  };

  // Ensure previewMembers exists and is an array
  const previewMembers = safeGroup.previewMembers;
  const memberCount = typeof safeGroup.members === 'number' ? safeGroup.members : 
    (safeGroup.membersList ? Object.keys(safeGroup.membersList).length : 0);
  const lastActivity = safeGroup.lastActivity;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">{safeGroup.name}</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 flex items-center"
            onClick={() => onInviteUsers(safeGroup)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Invite
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-8 flex items-center"
            onClick={() => onJoinChat(safeGroup.id)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {previewMembers.length > 0 ? (
            previewMembers.map((member, index) => (
              <Avatar 
                key={`${safeGroup.id}-member-${index}`} 
                className="h-8 w-8 border-2 border-background"
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {typeof member === 'string' ? member.charAt(0).toUpperCase() : '?'}
                </div>
              </Avatar>
            ))
          ) : (
            <Avatar className="h-8 w-8 border-2 border-background">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                ?
              </div>
            </Avatar>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 p-0 text-xs"
            onClick={() => onManageGroup(safeGroup)}
          >
            <Users className="h-3 w-3 mr-1" />
            {memberCount} members
          </Button>
          <p className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Active {lastActivity}
          </p>
        </div>
      </div>
    </Card>
  );
};
