
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, DollarSign, Users, Check, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ref, push, serverTimestamp } from "firebase/database";
import { database } from "@/lib/firebase";

const expenseSchema = z.object({
  description: z.string().min(2, { message: "Description is required" }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
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
  settled?: boolean;
};

export const SplitExpenses: React.FC<SplitExpensesProps> = ({ groupId }) => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "sample1",
      description: "Dinner at Olive Garden",
      amount: 86.50,
      paidBy: "user1",
      paidByName: "John Doe",
      timestamp: Date.now() - 86400000,
      settled: false
    },
    {
      id: "sample2",
      description: "Uber to Airport",
      amount: 35.25,
      paidBy: "user2",
      paidByName: "Jane Smith",
      timestamp: Date.now() - 172800000,
      settled: true
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof expenseSchema>) => {
    if (!currentUser) {
      toast.error("You must be logged in to add expenses");
      return;
    }

    try {
      const newExpense = {
        description: values.description,
        amount: parseFloat(values.amount),
        paidBy: currentUser.uid,
        paidByName: currentUser.displayName || currentUser.email || "Anonymous",
        timestamp: Date.now(),
        settled: false
      };

      // Here you would normally save to Firebase
      // For demo purposes, we'll just update the local state
      setExpenses([newExpense as Expense, ...expenses]);
      form.reset();
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

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
    toast.success("Expense removed");
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Split Expenses</h2>
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
      
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">New Expense</CardTitle>
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
                
                <div className="flex justify-end pt-2">
                  <Button type="submit">Add Expense</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="font-medium text-lg mb-1">No expenses yet</h3>
            <p className="text-muted-foreground">
              Add your first expense to start splitting costs.
            </p>
          </div>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className={expense.settled ? "opacity-70" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium flex items-center">
                      {expense.settled && (
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      {expense.description}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Paid by {expense.paidByName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(expense.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      ${expense.amount.toFixed(2)}
                    </span>
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
