"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Banknote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  isLoading?: boolean;
}

export function DashboardSummary({ totalIncome, totalExpenses, isLoading = false }: DashboardSummaryProps) {
  const balance = totalIncome - totalExpenses;

  const summaryCards = [
    { title: "Total Income", value: totalIncome, icon: TrendingUp, color: "text-green-600" },
    { title: "Total Expenses", value: totalExpenses, icon: TrendingDown, color: "text-red-600" },
    { title: "Balance", value: balance, icon: Banknote, color: balance >= 0 ? "text-primary" : "text-destructive" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
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
                 {(card.title === 'Total Expenses' && card.value > 0) ? '-' : ''}
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
