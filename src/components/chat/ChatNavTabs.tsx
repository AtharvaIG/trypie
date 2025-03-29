
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Image, Receipt } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type ChatNavTabsProps = {
  activeTab: string;
  onTabChange: (value: string) => void;
};

export const ChatNavTabs: React.FC<ChatNavTabsProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-4 border-b pb-2">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-muted">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {!isMobile && <span>Chat</span>}
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            {!isMobile && <span>Media</span>}
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            {!isMobile && <span>Expenses</span>}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
