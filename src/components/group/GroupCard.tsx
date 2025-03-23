
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
  return (
    <Card key={group.id} className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">{group.name}</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 flex items-center"
            onClick={() => onInviteUsers(group)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Invite
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-8 flex items-center"
            onClick={() => onJoinChat(group.id)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {group.previewMembers.map((member, index) => (
            <Avatar key={index} className="h-8 w-8 border-2 border-background">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {member}
              </div>
            </Avatar>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 p-0 text-xs"
            onClick={() => onManageGroup(group)}
          >
            <Users className="h-3 w-3 mr-1" />
            {group.members} members
          </Button>
          <p className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Active {group.lastActivity}
          </p>
        </div>
      </div>
    </Card>
  );
};
