import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, DollarSign, Users, Check, Trash2, Receipt, Calculator, ArrowRight, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ref, push, serverTimestamp, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const expenseSchema = z.object({
  description: z.string().min(2, { message: "Description is required" }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  paidBy: z.string(),
  splitType: z.enum(["equal", "percentage", "exact"]),
});

type SplitExpensesProps = {
  groupId: string;
};

type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  paidByName: string;
  timestamp: number;
  splitType: "equal" | "percentage" | "exact";
  participants: Participant[];
  settled?: boolean;
};

type Participant = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  share: number;
  sharePercentage?: number;
  settled?: boolean;
};

type GroupMember = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
};

export const SplitExpenses: React.FC<SplitExpensesProps> = ({ groupId }) => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([
    { id: "current", name: currentUser?.displayName || "You", email: currentUser?.email || "" },
    { id: "member1", name: "Alex Johnson", email: "alex@example.com" },
    { id: "member2", name: "Taylor Smith", email: "taylor@example.com" },
  ]);
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
  const [splitType, setSplitType] = useState<"equal" | "percentage" | "exact">("equal");
  const [activeExpense, setActiveExpense] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      paidBy: currentUser?.uid || "current",
      splitType: "equal",
    },
  });

  useEffect(() => {
    // Here you would fetch the real group members from Firebase
    // For demo purposes we'll use the placeholder data
    
    // Create initial participants based on group members
    const initialParticipants = groupMembers.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      avatarUrl: member.avatarUrl,
      share: 0,
      sharePercentage: 0,
      settled: false
    }));
    
    setSelectedParticipants(initialParticipants);
    
    // Here you would fetch the real expenses data from Firebase
    // For demo we'll use sample data
    setExpenses([
      {
        id: "sample1",
        description: "Dinner at Olive Garden",
        amount: 86.50,
        paidBy: "current",
        paidByName: currentUser?.displayName || "You",
        timestamp: Date.now() - 86400000,
        splitType: "equal",
        participants: [
          { id: "current", name: currentUser?.displayName || "You", share: 28.83, sharePercentage: 33.33, settled: false },
          { id: "member1", name: "Alex Johnson", share: 28.84, sharePercentage: 33.33, settled: false },
          { id: "member2", name: "Taylor Smith", share: 28.83, sharePercentage: 33.33, settled: true }
        ],
        settled: false
      },
      {
        id: "sample2",
        description: "Uber to Airport",
        amount: 35.25,
        paidBy: "member1",
        paidByName: "Alex Johnson",
        timestamp: Date.now() - 172800000,
        splitType: "equal",
        participants: [
          { id: "current", name: currentUser?.displayName || "You", share: 17.62, sharePercentage: 50, settled: true },
          { id: "member1", name: "Alex Johnson", share: 17.63, sharePercentage: 50, settled: false }
        ],
        settled: true
      }
    ]);
  }, [currentUser, groupId]);

  const updateShares = (amount: number, type: "equal" | "percentage" | "exact") => {
    if (selectedParticipants.length === 0 || amount <= 0) return;
    
    let updatedParticipants = [...selectedParticipants];
    
    if (type === "equal") {
      const share = amount / selectedParticipants.length;
      updatedParticipants = updatedParticipants.map(p => ({
        ...p,
        share: parseFloat((share).toFixed(2)),
        sharePercentage: parseFloat((100 / selectedParticipants.length).toFixed(2))
      }));
    } else if (type === "percentage") {
      updatedParticipants = updatedParticipants.map(p => ({
        ...p,
        share: parseFloat(((p.sharePercentage || 0) * amount / 100).toFixed(2))
      }));
    }
    
    // Ensure the total matches the amount exactly (handle floating point precision issues)
    const totalShares = updatedParticipants.reduce((sum, p) => sum + p.share, 0);
    if (totalShares !== amount && updatedParticipants.length > 0) {
      const diff = amount - totalShares;
      updatedParticipants[0].share = parseFloat((updatedParticipants[0].share + diff).toFixed(2));
    }
    
    setSelectedParticipants(updatedParticipants);
  };

  const handleSetPercentage = (participantId: string, value: number[]) => {
    const percentage = value[0];
    const updatedParticipants = selectedParticipants.map(p => 
      p.id === participantId 
        ? { ...p, sharePercentage: percentage } 
        : p
    );
    
    setSelectedParticipants(updatedParticipants);
    
    const amount = parseFloat(form.getValues("amount")) || 0;
    if (amount > 0) {
      const newShare = (percentage * amount) / 100;
      const updatedWithShares = updatedParticipants.map(p => 
        p.id === participantId 
          ? { ...p, share: parseFloat(newShare.toFixed(2)) } 
          : p
      );
      setSelectedParticipants(updatedWithShares);
    }
  };

  const handleSetExactAmount = (participantId: string, value: string) => {
    const exactAmount = parseFloat(value) || 0;
    const amount = parseFloat(form.getValues("amount")) || 0;
    
    const updatedParticipants = selectedParticipants.map(p => 
      p.id === participantId 
        ? { 
            ...p, 
            share: exactAmount,
            sharePercentage: amount > 0 ? parseFloat(((exactAmount / amount) * 100).toFixed(2)) : 0
          } 
        : p
    );
    
    setSelectedParticipants(updatedParticipants);
  };

  const toggleParticipant = (id: string) => {
    const isSelected = selectedParticipants.some(p => p.id === id);
    
    if (isSelected) {
      // Remove participant
      setSelectedParticipants(selectedParticipants.filter(p => p.id !== id));
    } else {
      // Add participant
      const memberToAdd = groupMembers.find(m => m.id === id);
      if (memberToAdd) {
        const newParticipant: Participant = {
          id: memberToAdd.id,
          name: memberToAdd.name,
          email: memberToAdd.email,
          avatarUrl: memberToAdd.avatarUrl,
          share: 0,
          sharePercentage: 0,
          settled: false
        };
        
        setSelectedParticipants([...selectedParticipants, newParticipant]);
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof expenseSchema>) => {
    if (!currentUser) {
      toast.error("You must be logged in to add expenses");
      return;
    }

    if (selectedParticipants.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    try {
      const paidByUser = groupMembers.find(m => m.id === values.paidBy);
      
      const newExpense: Omit<Expense, 'id'> = {
        description: values.description,
        amount: parseFloat(values.amount),
        paidBy: values.paidBy,
        paidByName: paidByUser?.name || currentUser.displayName || "Anonymous",
        timestamp: Date.now(),
        splitType: values.splitType as "equal" | "percentage" | "exact",
        participants: selectedParticipants,
        settled: false
      };

      // For demo purposes, we'll just update the local state
      const expenseWithId = { ...newExpense, id: `expense-${Date.now()}` } as Expense;
      setExpenses([expenseWithId, ...expenses]);
      form.reset({
        description: "",
        amount: "",
        paidBy: currentUser?.uid || "current",
        splitType: "equal"
      });
      setShowForm(false);
      toast.success("Expense added successfully");
      
      // Uncomment to actually save to Firebase
      /*
      const expensesRef = ref(database, `expenses/${groupId}`);
      await push(expensesRef, {
        ...newExpense,
        timestamp: serverTimestamp(),
      });
      */
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
    }
  };

  const toggleExpenseStatus = (id: string) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id
          ? { ...expense, settled: !expense.settled }
          : expense
      )
    );
    toast.success("Expense status updated");
  };

  const toggleParticipantSettled = (expenseId: string, participantId: string) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === expenseId
          ? {
              ...expense,
              participants: expense.participants.map(p => 
                p.id === participantId
                  ? { ...p, settled: !p.settled }
                  : p
              )
            }
          : expense
      )
    );
    toast.success("Participant settlement status updated");
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
    toast.success("Expense removed");
  };

  const getTotalOwed = (expenses: Expense[]) => {
    if (!currentUser) return 0;
    
    let totalOwed = 0;
    
    expenses.forEach(expense => {
      if (expense.paidBy === "current") {
        // Money owed to current user
        expense.participants.forEach(p => {
          if (p.id !== "current" && !p.settled) {
            totalOwed += p.share;
          }
        });
      } else {
        // Money current user owes to others
        const currentUserParticipant = expense.participants.find(p => p.id === "current");
        if (currentUserParticipant && !currentUserParticipant.settled) {
          totalOwed -= currentUserParticipant.share;
        }
      }
    });
    
    return totalOwed;
  };

  const isParticipantSelected = (id: string) => {
    return selectedParticipants.some(p => p.id === id);
  };

  const toggleExpenseDetails = (id: string) => {
    setActiveExpense(activeExpense === id ? null : id);
  };

  return (
    <div className="px-4 py-6 md:px-6 pb-20 mb-16 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Split Expenses</h2>
          <p className="text-muted-foreground text-sm">
            Track shared expenses and settle up
          </p>
        </div>
        <Button 
          variant={showForm ? "outline" : "default"}
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </>
          )}
        </Button>
      </div>
      
      <Card className="mb-4 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground">BALANCE</p>
              <p className={`text-xl font-semibold mt-1 ${getTotalOwed(expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {getTotalOwed(expenses) >= 0 ? 
                  `You are owed $${Math.abs(getTotalOwed(expenses)).toFixed(2)}` : 
                  `You owe $${Math.abs(getTotalOwed(expenses)).toFixed(2)}`
                }
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getTotalOwed(expenses) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <DollarSign className={`h-6 w-6 ${getTotalOwed(expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showForm && (
        <Card className="mb-5 shadow-sm animate-fade-in">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">New Expense</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Description</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Dinner, Hotel, Tickets" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input 
                              placeholder="0.00" 
                              className="pl-8 h-9"
                              type="number"
                              step="0.01"
                              min="0.01"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paidBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Paid By</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Who paid" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper" className="dropdown-fix">
                            {groupMembers.map(member => (
                              <SelectItem key={member.id} value={member.id} className="text-sm">
                                <div className="flex items-center">
                                  <Avatar className="h-5 w-5 mr-2">
                                    <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span>{member.id === "current" ? "You" : member.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="splitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Split Type</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSplitType(value as "equal" | "percentage" | "exact");
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="How to split" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper" className="dropdown-fix">
                            <SelectItem value="equal" className="text-sm">Equal Split</SelectItem>
                            <SelectItem value="percentage" className="text-sm">By Percentage</SelectItem>
                            <SelectItem value="exact" className="text-sm">Exact Amounts</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs mb-0">Split Between</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Select
                          <Badge variant="secondary" className="ml-1 text-xs">{selectedParticipants.length}</Badge>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 p-2 dropdown-fix" align="end">
                        <p className="text-xs font-medium mb-2">Select participants</p>
                        <div className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                          {groupMembers.map((member) => (
                            <div 
                              key={member.id} 
                              className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                                isParticipantSelected(member.id) ? 'bg-primary/10' : 'hover:bg-secondary/50'
                              }`}
                              onClick={() => toggleParticipant(member.id)}
                            >
                              <input
                                type="checkbox"
                                id={`person-${member.id}`}
                                checked={isParticipantSelected(member.id)}
                                onChange={() => {}}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <label htmlFor={`person-${member.id}`} className="text-xs flex-grow cursor-pointer">
                                {member.id === "current" ? "You" : member.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {selectedParticipants.length > 0 ? (
                    <div className="border rounded-md p-3 space-y-2 bg-background max-h-40 overflow-y-auto custom-scrollbar">
                      {selectedParticipants.map((participant) => (
                        <div key={participant.id} className="flex items-center text-sm">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="text-xs">{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                            {participant.id === "current" ? "You" : participant.name}
                          </span>
                          
                          {splitType === "equal" && (
                            <span className="text-xs font-medium bg-secondary/50 px-1.5 py-0.5 rounded-md">
                              ${participant.share.toFixed(2)}
                            </span>
                          )}
                          
                          {splitType === "percentage" && (
                            <div className="flex items-center space-x-2 flex-grow max-w-[150px]">
                              <Slider 
                                value={[participant.sharePercentage || 0]} 
                                onValueChange={(value) => handleSetPercentage(participant.id, value)}
                                max={100}
                                step={1}
                                className="w-20"
                              />
                              <span className="text-xs font-medium min-w-[25px]">{participant.sharePercentage}%</span>
                              <span className="text-xs font-medium bg-secondary/50 px-1.5 py-0.5 rounded-md min-w-[50px] text-right">
                                ${participant.share.toFixed(2)}
                              </span>
                            </div>
                          )}
                          
                          {splitType === "exact" && (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs font-medium">$</span>
                              <Input 
                                type="number" 
                                value={participant.share || ""}
                                onChange={(e) => handleSetExactAmount(participant.id, e.target.value)}
                                className="w-16 h-7 text-xs"
                                step="0.01"
                                min="0"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border rounded-md bg-muted/10">
                      <Users className="mx-auto h-8 w-8 text-muted-foreground mb-1 opacity-50" />
                      <p className="text-muted-foreground text-xs mt-1">
                        Select at least one person
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    disabled={selectedParticipants.length === 0}
                    className="w-full sm:w-auto text-sm"
                  >
                    Save Expense
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-background shadow-sm">
            <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-60" />
            <h3 className="font-medium text-base mb-1">No expenses yet</h3>
            <p className="text-muted-foreground text-xs max-w-xs mx-auto">
              Add your first expense to start splitting costs.
            </p>
            <Button 
              variant="outline"
              className="mt-4 text-sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Your First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <Card 
                key={expense.id} 
                className={`overflow-hidden transition-all duration-200 shadow-sm ${expense.settled ? "opacity-75 bg-muted/20" : ""}`}
              >
                <CardContent className="p-0">
                  <div 
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
                    onClick={() => toggleExpenseDetails(expense.id)}
                  >
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center space-x-1.5">
                        {expense.settled && (
                          <Badge variant="outline" className="p-0.5 h-5 bg-green-50 text-green-700 border-green-100">
                            <Check className="h-3 w-3" />
                          </Badge>
                        )}
                        <h3 className="font-medium text-sm truncate">{expense.description}</h3>
                      </div>
                      <div className="flex flex-wrap items-center text-xs text-muted-foreground mt-0.5 gap-x-1.5">
                        <span className="whitespace-nowrap">Paid by {expense.paidBy === "current" ? "you" : expense.paidByName}</span>
                        <span className="hidden xs:inline">•</span>
                        <span className="font-medium whitespace-nowrap">${expense.amount.toFixed(2)}</span>
                        <span className="hidden xs:inline">•</span>
                        <span className="whitespace-nowrap">{new Date(expense.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dropdown-fix">
                          <DropdownMenuItem onClick={() => toggleExpenseStatus(expense.id)} className="text-xs cursor-pointer">
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                            Mark as {expense.settled ? "unsettled" : "settled"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => removeExpense(expense.id)}
                            className="text-destructive focus:text-destructive text-xs cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete expense
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpenseDetails(expense.id);
                        }}
                      >
                        <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${activeExpense === expense.id ? 'rotate-90' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  
                  {activeExpense === expense.id && (
                    <div className="border-t pt-2 px-3 pb-3 animate-fade-in bg-secondary/5">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Details</div>
                      <div className="space-y-1.5">
                        {expense.participants.map(participant => (
                          <div key={participant.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Avatar className="h-5 w-5 mr-1.5">
                                <AvatarFallback className="text-xs">{participant.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs">
                                {participant.id === "current" ? "You" : participant.name}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium">${participant.share.toFixed(2)}</span>
                              
                              {participant.id !== expense.paidBy && (
                                <Button 
                                  variant={participant.settled ? "outline" : "secondary"}
                                  size="sm"
                                  className={`h-6 text-xs px-2 ${participant.settled ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800" : ""}`}
                                  onClick={() => toggleParticipantSettled(expense.id, participant.id)}
                                >
                                  {participant.settled ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      Paid
                                    </>
                                  ) : (
                                    "Settle"
                                  )}
                                </Button>
                              )}
                              
                              {participant.id === expense.paidBy && (
                                <Badge variant="outline" className="text-[10px]">Paid</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
