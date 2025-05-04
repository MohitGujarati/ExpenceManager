"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Banknote, Wallet } from "lucide-react"; // Added Wallet icon
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  currentBankBalance: number; // Added prop for current bank balance
  isLoading?: boolean;
}

export function DashboardSummary({ totalIncome, totalExpenses, currentBankBalance, isLoading = false }: DashboardSummaryProps) {
  const monthlyBalance = totalIncome - totalExpenses;

  const summaryCards = [
    { title: "Current Bank Balance", value: currentBankBalance, icon: Wallet, color: currentBankBalance >= 0 ? "text-primary" : "text-destructive" },
    { title: "Monthly Income", value: totalIncome, icon: TrendingUp, color: "text-green-600" },
    { title: "Monthly Expenses", value: totalExpenses, icon: TrendingDown, color: "text-red-600" },
    { title: "Monthly Balance", value: monthlyBalance, icon: Banknote, color: monthlyBalance >= 0 ? "text-primary" : "text-destructive" },
  ];

  return (
    // Updated grid to accommodate 4 cards
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={cn("h-5 w-5 text-muted-foreground", card.color)} />
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <Skeleton className="h-8 w-3/4" />
             ) : (
                <div className="text-2xl font-bold">
                 {/* Show negative sign only for expenses and negative balances */}
                 {(card.title.includes('Expenses') && card.value > 0) || (card.title.includes('Balance') && card.value < 0) ? '-' : ''}
                 ${Math.abs(card.value).toFixed(2)}
                </div>
             )}
             {/* Optional: Add percentage change or comparison */}
             {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
