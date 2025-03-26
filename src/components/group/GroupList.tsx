
import React from "react";
import { Group } from "./GroupTypes";
import { GroupCard } from "./GroupCard";
import { NoGroupsMessage } from "./NoGroupsMessage";

interface GroupListProps {
  groups?: Group[]; // Make it optional with a fallback
  loading: boolean;
  loadError: string | null;
  onJoinChat: (groupId: string) => void;
  onManageGroup: (group: Group) => void;
  onInviteUsers: (group: Group) => void;
  onCreateGroup: () => void;
  onRefresh: () => void;
}

export const GroupList: React.FC<GroupListProps> = ({
  groups = [], // Provide default empty array
  loading,
  loadError,
  onJoinChat,
  onManageGroup,
  onInviteUsers,
  onCreateGroup,
  onRefresh
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p>Loading groups...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 text-center border-dashed border-2 rounded-lg">
        <div className="flex flex-col items-center">
          <p className="text-destructive mb-4">{loadError}</p>
          <button 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-2" 
            onClick={onRefresh}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Ensure groups is always an array with a simple check
  const safeGroups = Array.isArray(groups) ? groups : [];
  
  if (safeGroups.length === 0) {
    console.log("No groups found, showing NoGroupsMessage");
    return <NoGroupsMessage onCreateGroup={onCreateGroup} />;
  }

  console.log(`Rendering ${safeGroups.length} group cards`);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {safeGroups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onJoinChat={onJoinChat}
          onManageGroup={onManageGroup}
          onInviteUsers={onInviteUsers}
        />
      ))}
    </div>
  );
};
