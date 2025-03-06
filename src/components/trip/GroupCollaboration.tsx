
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Users, UserPlus, Mail, Link as LinkIcon, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";

export const GroupCollaboration = () => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: "Alex Johnson", email: "alex@example.com", avatar: "", role: "editor" },
  ]);
  
  const shareLink = `https://wanderly.app/trip/share/${crypto.randomUUID().slice(0, 8)}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    // In a real app, this would send an invitation email
    toast.success(`Invitation sent to ${inviteEmail}`);
    
    // Add the new collaborator (simulated)
    const newCollaborator = {
      id: collaborators.length + 1,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      avatar: "",
      role: "viewer"
    };
    
    setCollaborators([...collaborators, newCollaborator]);
    setInviteEmail("");
  };
  
  const handleRemoveCollaborator = (id) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
    toast.success("Collaborator removed");
  };
  
  const handleChangeRole = (id, newRole) => {
    setCollaborators(collaborators.map(c => {
      if (c.id === id) {
        return { ...c, role: newRole };
      }
      return c;
    }));
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Invite Collaborators
          </CardTitle>
          <CardDescription>
            Invite friends and family to view or edit your trip plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                placeholder="Enter email address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit">Invite</Button>
          </form>
          
          <div className="mt-6">
            <Label className="text-sm text-muted-foreground mb-2 block">Or share link</Label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 flex items-center border rounded-md pl-3 bg-muted/50">
                <LinkIcon className="h-4 w-4 text-muted-foreground mr-2" />
                <Input 
                  value={shareLink} 
                  readOnly 
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                />
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="flex gap-1"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Collaborators ({collaborators.length})
          </CardTitle>
          <CardDescription>
            Manage who can view or edit your trip details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {collaborators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No collaborators added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collaborators.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveCollaborator(user.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start space-y-2 border-t p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Switch id="real-time" defaultChecked />
              <Label htmlFor="real-time">Real-time collaboration</Label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, collaborators can see changes in real-time
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
