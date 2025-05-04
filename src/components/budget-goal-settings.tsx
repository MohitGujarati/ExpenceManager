"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import type { BudgetGoal } from "@/lib/types";
import { categories } from "@/lib/categories";
import { useToast } from "@/hooks/use-toast";

interface BudgetGoalSettingsProps {
  budgetGoals: BudgetGoal[];
  onUpdateGoal: (categoryId: string, amount: number) => void;
}

export function BudgetGoalSettings({ budgetGoals, onUpdateGoal }: BudgetGoalSettingsProps) {
  const { toast } = useToast();

  // Use local state to manage input values for debouncing or delayed updates
  const [localGoals, setLocalGoals] = React.useState<Record<string, string>>({});

  // Initialize local state when budgetGoals prop changes
  React.useEffect(() => {
    const initialLocalGoals = budgetGoals.reduce((acc, goal) => {
      acc[goal.categoryId] = goal.amount > 0 ? goal.amount.toString() : ""; // Show empty string for 0
      return acc;
    }, {} as Record<string, string>);
    setLocalGoals(initialLocalGoals);
  }, [budgetGoals]);

  const handleInputChange = (categoryId: string, value: string) => {
    // Update local state immediately for responsiveness
    setLocalGoals(prev => ({ ...prev, [categoryId]: value }));

    // Basic validation: Allow empty string or positive numbers (including decimals)
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
       // Debounced update or update on blur could be implemented here
       // For simplicity, updating directly on valid change:
       const numericValue = value === "" ? 0 : parseFloat(value);
       if (!isNaN(numericValue) && numericValue >= 0) {
         onUpdateGoal(categoryId, numericValue);
       }
    }
  };

   const handleBlur = (categoryId: string) => {
        const value = localGoals[categoryId];
        const numericValue = value === "" ? 0 : parseFloat(value);

        if (!isNaN(numericValue) && numericValue >= 0) {
            if (budgetGoals.find(g => g.categoryId === categoryId)?.amount !== numericValue) {
                 onUpdateGoal(categoryId, numericValue);
                 toast({
                     title: "Budget Goal Updated",
                     description: `Budget for ${categories.find(c=>c.id === categoryId)?.name} set to $${numericValue.toFixed(2)}.`,
                 });
            }
        } else {
            // Revert to the last valid value if input is invalid on blur
             const lastValidAmount = budgetGoals.find(g => g.categoryId === categoryId)?.amount || 0;
             setLocalGoals(prev => ({ ...prev, [categoryId]: lastValidAmount > 0 ? lastValidAmount.toString() : "" }));
             toast({
                 title: "Invalid Input",
                 description: `Please enter a valid positive number for the budget goal.`,
                 variant: "destructive",
            });
        }
   };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => {
          // Skip setting budget for "Other" or have a different mechanism if needed
          if (category.id === 'other') return null;

          const goal = budgetGoals.find((g) => g.categoryId === category.id);
          const Icon = category.icon; // Get the icon component

          return (
            <div key={category.id} className="flex items-center justify-between gap-4">
              <Label htmlFor={`budget-${category.id}`} className="flex items-center gap-2 text-sm font-medium flex-shrink-0">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {category.name}
              </Label>
              <div className="relative flex-grow max-w-[150px]">
                 <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 <Input
                    id={`budget-${category.id}`}
                    type="text" // Use text to allow empty string and better control formatting
                    inputMode="decimal" // Hint for mobile keyboards
                    placeholder="0.00"
                    value={localGoals[category.id] || ""}
                    onChange={(e) => handleInputChange(category.id, e.target.value)}
                    onBlur={() => handleBlur(category.id)} // Update on blur
                    className="pl-8 text-right"
                    aria-label={`Budget goal for ${category.name}`}
                 />
               </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
