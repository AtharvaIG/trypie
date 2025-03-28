
import React from 'react';
import { Button } from "@/components/ui/button";
import { Group } from "./GroupTypes";

interface GroupValidationProps {
  groups: Group[] | undefined;
  loading: boolean;
  handleRefresh: () => void;
}

export const GroupValidation: React.FC<GroupValidationProps> = ({
  groups,
  loading,
  handleRefresh
}) => {
  // Safety check before rendering
  if (!Array.isArray(groups) && !loading) {
    console.error("Groups is not an array:", groups);
    return (
      <div className="p-8 text-center border-dashed border-2 rounded-lg">
        <div className="flex flex-col items-center">
          <p className="text-destructive mb-4">Error: Groups data is invalid</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }
  
  return null;
};
