"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { BudgetGoal, Category } from "@/lib/types";
import { getCategoryById, categories } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface BudgetProgressProps {
  budgetGoals: BudgetGoal[];
  expensesByCategory: { categoryId: string; amount: number; category: Category }[];
}

export function BudgetProgress({ budgetGoals, expensesByCategory }: BudgetProgressProps) {
  const relevantGoals = budgetGoals.filter(goal => goal.amount > 0);

  if (relevantGoals.length === 0) {
     return (
        <Card>
         <CardHeader>
           <CardTitle>Budget Progress</CardTitle>
           <CardDescription>Track spending against your goals</CardDescription>
         </CardHeader>
         <CardContent className="flex min-h-[150px] flex-col items-center justify-center text-center">
             <p className="text-sm text-muted-foreground">No budget goals set.</p>
             <p className="text-xs text-muted-foreground">Set goals in settings to track your progress.</p>
         </CardContent>
       </Card>
     )
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
        <CardDescription>Spending vs. Goals this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {relevantGoals.map((goal) => {
          const category = getCategoryById(goal.categoryId);
          if (!category || category.id === 'other') return null; // Skip if category not found or is 'Other'

          const spentData = expensesByCategory.find(exp => exp.categoryId === goal.categoryId);
          const spentAmount = spentData?.amount || 0;
          const budgetAmount = goal.amount;
          const progress = budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * 100, 100) : 0;
          const overBudget = spentAmount > budgetAmount;
          const remaining = Math.max(0, budgetAmount - spentAmount); // Show 0 if over budget

          const Icon = category.icon;

          return (
            <div key={goal.categoryId} className="space-y-1">
              <div className="flex justify-between items-center text-sm mb-1">
                 <span className="font-medium flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {category.name}
                 </span>
                 <span className={cn("text-xs font-semibold", overBudget ? "text-destructive" : "text-muted-foreground")}>
                    {overBudget
                       ? `Over by $${(spentAmount - budgetAmount).toFixed(2)}`
                       : `$${remaining.toFixed(2)} left`
                    }
                </span>
              </div>
              <Progress
                  value={progress}
                  className={cn("h-2", overBudget && "bg-destructive/20 [&>div]:bg-destructive")}
                  aria-label={`Budget progress for ${category.name}`}
               />
               <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                 <span>${spentAmount.toFixed(2)} spent</span>
                 <span>of ${budgetAmount.toFixed(2)}</span>
               </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
