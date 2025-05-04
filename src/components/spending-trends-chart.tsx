"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";

interface SpendingTrendsChartProps {
  data: { name: string; expenses: number; income: number }[];
  isLoading?: boolean;
}

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "hsl(var(--accent))", // Coral for expenses
    icon: TrendingDown,
  },
  income: {
    label: "Income",
    color: "hsl(var(--primary))", // Teal for income
    icon: TrendingUp,
  },
} satisfies ChartConfig

export function SpendingTrendsChart({ data, isLoading = false }: SpendingTrendsChartProps) {

  if (isLoading) {
      return (
           <Card>
              <CardHeader>
                 <CardTitle>Spending Trends</CardTitle>
                 <CardDescription>Income vs. Expenses over the period</CardDescription>
               </CardHeader>
               <CardContent>
                 <Skeleton className="h-[250px] w-full" />
               </CardContent>
            </Card>
      )
  }

   if (!data || data.length === 0) {
     return (
       <Card>
         <CardHeader>
           <CardTitle>Spending Trends</CardTitle>
           <CardDescription>Income vs. Expenses over the period</CardDescription>
         </CardHeader>
         <CardContent className="flex min-h-[250px] flex-col items-center justify-center gap-2 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
           <p className="text-sm text-muted-foreground">
             No transaction data available.
           </p>
            <p className="text-xs text-muted-foreground">
             Add income and expenses to see trends over time.
            </p>
         </CardContent>
       </Card>
     );
   }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trends</CardTitle>
        <CardDescription>Income vs. Expenses over the period</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* Using BarChart for clearer distinction between income/expense per period */}
             <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                 <CartesianGrid vertical={false} strokeDasharray="3 3" />
                 <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    // tickFormatter={(value) => value.slice(0, 3)} // Abbreviate if needed
                 />
                 <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `$${value}`}
                 />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
            </BarChart>

            {/* Alternative: Line Chart
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10, // Adjusted margin
                left: -25, // Adjusted margin to show Y-axis labels
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // tickFormatter={(value) => value.slice(0, 3)} // Abbreviate month names
              />
              <YAxis
                 tickLine={false}
                 axisLine={false}
                 tickMargin={8}
                 tickFormatter={(value) => `$${value}`} // Format Y-axis ticks as currency
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Line
                dataKey="income"
                type="monotone"
                stroke="var(--color-income)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="expenses"
                type="monotone"
                stroke="var(--color-expenses)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart> */}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
