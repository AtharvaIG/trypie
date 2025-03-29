import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, DollarSign, Users, Check, Trash2, Receipt, Calculator, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ref, push, serverTimestamp, get } from "firebase/database";
import { database } from "@/lib/firebase";

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

  // Update shares when amount or split type changes
  useEffect(() => {
    if (selectedParticipants.length === 0) return;
    
    const amount = parseFloat(form.getValues("amount")) || 0;
    updateShares(amount, splitType);
  }, [splitType, form.watch("amount"), selectedParticipants.length]);

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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
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
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </>
          )}
        </Button>
      </div>
      
      {/* Balance summary */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">TOTAL BALANCE</p>
              <p className={`text-xl font-semibold ${getTotalOwed(expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {getTotalOwed(expenses) >= 0 ? 
                  `You are owed $${Math.abs(getTotalOwed(expenses)).toFixed(2)}` : 
                  `You owe $${Math.abs(getTotalOwed(expenses)).toFixed(2)}`
                }
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              New Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Dinner, Hotel, Tickets" {...field} />
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
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="0.00" 
                            className="pl-9"
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
                
                <FormField
                  control={form.control}
                  name="paidBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid By</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select who paid" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groupMembers.map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback>{member.name[0]}</AvatarFallback>
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
                      <FormLabel>Split Type</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSplitType(value as "equal" | "percentage" | "exact");
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How to split" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="equal">Split Equally</SelectItem>
                          <SelectItem value="percentage">Split by Percentage</SelectItem>
                          <SelectItem value="exact">Split by Exact Amounts</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormLabel className="flex items-center justify-between">
                    <span>Split Between</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Select People
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="space-y-2">
                          {groupMembers.map((member) => (
                            <div key={member.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`person-${member.id}`}
                                checked={isParticipantSelected(member.id)}
                                onChange={() => toggleParticipant(member.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <label htmlFor={`person-${member.id}`} className="text-sm">
                                {member.id === "current" ? "You" : member.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </FormLabel>
                  
                  {selectedParticipants.length > 0 ? (
                    <div className="border rounded-md p-3 space-y-3">
                      {selectedParticipants.map((participant) => (
                        <div key={participant.id} className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm flex-grow mr-2">
                            {participant.id === "current" ? "You" : participant.name}
                          </span>
                          
                          {splitType === "equal" && (
                            <span className="font-medium text-sm">
                              ${participant.share.toFixed(2)} ({participant.sharePercentage}%)
                            </span>
                          )}
                          
                          {splitType === "percentage" && (
                            <div className="flex items-center space-x-2 flex-grow">
                              <Slider 
                                value={[participant.sharePercentage || 0]} 
                                onValueChange={(value) => handleSetPercentage(participant.id, value)}
                                max={100}
                                step={1}
                                className="w-36"
                              />
                              <span className="text-sm font-medium w-16">{participant.sharePercentage}%</span>
                              <span className="text-sm font-medium">${participant.share.toFixed(2)}</span>
                            </div>
                          )}
                          
                          {splitType === "exact" && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm mr-1">$</span>
                              <Input 
                                type="number" 
                                value={participant.share || ""}
                                onChange={(e) => handleSetExactAmount(participant.id, e.target.value)}
                                className="w-20 h-8 text-sm"
                                step="0.01"
                                min="0"
                              />
                              <span className="text-sm text-muted-foreground">
                                ({participant.sharePercentage}%)
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border rounded-md text-muted-foreground">
                      No participants selected
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={selectedParticipants.length === 0}>
                    Save Expense
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {expenses.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="font-medium text-lg mb-1">No expenses yet</h3>
            <p className="text-muted-foreground">
              Add your first expense to start splitting costs.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <Card key={expense.id} className={expense.settled ? "opacity-70" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <h3 className="font-medium flex items-center">
                        {expense.settled && (
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        {expense.description}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Paid by {expense.paidBy === "current" ? "you" : expense.paidByName} • ${expense.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(expense.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleExpenseStatus(expense.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t pt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Person</TableHead>
                          <TableHead>Share</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expense.participants.map(participant => (
                          <TableRow key={participant.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {participant.id === "current" ? "You" : participant.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>${participant.share.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              {participant.id !== expense.paidBy && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className={participant.settled ? "text-green-600" : "text-amber-600"}
                                  onClick={() => toggleParticipantSettled(expense.id, participant.id)}
                                >
                                  {participant.settled ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      Settled
                                    </>
                                  ) : (
                                    "Unsettled"
                                  )}
                                </Button>
                              )}
                              {participant.id === expense.paidBy && (
                                <span className="text-sm text-muted-foreground">Paid</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
