
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, CreditCard, PlusCircle, Users, PieChart, IndianRupee } from "lucide-react";
import { toast } from "sonner";

type ExpenseType = {
  id: string;
  title: string;
  amount: number;
  category: string;
  paidBy: string;
  day?: number;
  date?: Date;
};

type SplitPersonType = {
  id: number;
  name: string;
  email: string;
  share: boolean;
};

type ExpenseTrackerProps = {
  itinerary: any[];
  budget: number;
};

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ itinerary, budget }) => {
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [newExpense, setNewExpense] = useState<{
    title: string;
    amount: string;
    category: string;
    paidBy: string;
  }>({
    title: "",
    amount: "",
    category: "accommodation",
    paidBy: "you"
  });
  const [splitBetween, setSplitBetween] = useState<SplitPersonType[]>([
    { id: 1, name: "You", email: "you@example.com", share: true },
    { id: 2, name: "Alex Johnson", email: "alex@example.com", share: true }
  ]);
  
  useEffect(() => {
    if (itinerary && itinerary.length > 0) {
      let itineraryExpenses: ExpenseType[] = [];
      itinerary.forEach((day) => {
        day.activities.forEach((activity: any) => {
          if (activity.cost > 0) {
            itineraryExpenses.push({
              id: activity.id,
              title: activity.title,
              amount: activity.cost,
              category: "activities",
              day: day.day,
              paidBy: "you",
              date: day.date
            });
          }
        });
      });
      setExpenses(itineraryExpenses);
    }
  }, [itinerary]);
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const budgetProgress = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const newExpenseItem: ExpenseType = {
      id: `expense-${Date.now()}`,
      ...newExpense,
      amount: Number(newExpense.amount),
      date: new Date()
    };
    
    setExpenses([...expenses, newExpenseItem]);
    setNewExpense({
      title: "",
      amount: "",
      category: "accommodation",
      paidBy: "you"
    });
    
    toast.success("Expense added successfully");
  };
  
  const expensesByCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
    const category = expense.category || "other";
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += Number(expense.amount);
    return acc;
  }, {});
  
  const getBudgetStatusColor = () => {
    if (budgetProgress >= 100) return "text-destructive";
    if (budgetProgress >= 80) return "text-amber-500";
    return "text-emerald-500";
  };
  
  return (
    <div className="space-y-5 pb-24 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1 custom-scrollbar">
      <Card>
        <CardHeader className="px-4 py-4">
          <CardTitle className="flex items-center text-lg">
            <IndianRupee className="mr-2 h-5 w-5" />
            Budget Overview
          </CardTitle>
          <CardDescription>
            Track your trip expenses against your planned budget
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold">₹{budget > 0 ? budget.toFixed(2) : "0.00"}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Used</span>
                <span className={getBudgetStatusColor()}>
                  {budget > 0 ? Math.min(Math.round(budgetProgress), 100) : 0}%
                </span>
              </div>
              <Progress value={Math.min(budgetProgress, 100)} className="h-2" />
              
              <p className="text-sm text-muted-foreground">
                {budget > 0 ? (
                  totalExpenses > budget ? (
                    <span className="text-destructive">
                      Over budget by ₹{(totalExpenses - budget).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-emerald-500">
                      ₹{(budget - totalExpenses).toFixed(2)} remaining
                    </span>
                  )
                ) : (
                  "No budget set"
                )}
              </p>
            </div>
          </div>
          
          <div className="mt-5 space-y-3">
            <h3 className="font-medium text-sm">Expense Breakdown</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                    <span className="capitalize text-sm">{category}</span>
                  </div>
                  <span className="text-sm">₹{amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="expenses" className="mb-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="expenses">Expense List</TabsTrigger>
          <TabsTrigger value="add">Add Expense</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-4 px-4 pb-4">
              {expenses.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No expenses recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-secondary/10 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{expense.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {expense.category}
                          {expense.day && ` • Day ${expense.day}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₹{expense.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          Paid by {expense.paidBy === "you" ? "you" : expense.paidBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-4 px-4 pb-4">
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm">Expense Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Hotel Booking"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                      required
                      className="h-9"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm">Amount (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        className="pl-9 h-9"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm">Category</Label>
                    <select
                      id="category"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="accommodation">Accommodation</option>
                      <option value="transportation">Transportation</option>
                      <option value="food">Food & Dining</option>
                      <option value="activities">Activities & Attractions</option>
                      <option value="shopping">Shopping</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paidBy" className="text-sm">Paid By</Label>
                    <select
                      id="paidBy"
                      value={newExpense.paidBy}
                      onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value})}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="you">You</option>
                      <option value="Alex Johnson">Alex Johnson</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center justify-between text-sm">
                    <span>Split Between</span>
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      All
                    </Button>
                  </Label>
                  
                  <div className="border rounded-md p-3 max-h-[180px] overflow-y-auto custom-scrollbar">
                    {splitBetween.map((person) => (
                      <div key={person.id} className="flex items-center space-x-2 mb-2 last:mb-0 p-2 hover:bg-secondary/10 rounded-md">
                        <input
                          type="checkbox"
                          id={`person-${person.id}`}
                          checked={person.share}
                          onChange={() => {
                            setSplitBetween(splitBetween.map(p => 
                              p.id === person.id ? {...p, share: !p.share} : p
                            ));
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{person.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Label htmlFor={`person-${person.id}`} className="text-sm cursor-pointer">
                          {person.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button type="submit" className="w-full sm:w-auto text-sm">
                  Add Expense
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
