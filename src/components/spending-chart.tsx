"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from "recharts"
import type { PieLabelRenderProps} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent, // Using the ShadCN Tooltip Content for consistency
} from "@/components/ui/chart"
import type { Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface SpendingChartProps {
  data: {
    categoryId: string;
    amount: number;
    category: Category; // Include full category info
  }[];
  isLoading?: boolean;
}

const chartConfig = {}; // Config can be populated dynamically if needed

// Custom label renderer
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }: PieLabelRenderProps & { payload: any }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const Icon = payload.category.icon; // Access icon from payload

  // Only show label if percent is significant enough
  if (percent < 0.05) return null;

  return (
    <foreignObject x={x - 10} y={y - 10} width={20} height={20}>
        <Icon className="w-full h-full text-white" />
    </foreignObject>
    // <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
    //   {`${(percent * 100).toFixed(0)}%`}
    // </text>
  );
};


export function SpendingChart({ data, isLoading = false }: SpendingChartProps) {
  const chartData = React.useMemo(() => {
    return data.map(item => ({
        name: item.category.name,
        value: item.amount,
        fill: item.category.color,
        category: item.category // Pass category data for tooltip/label
    }));
  }, [data]);

  const totalExpenses = React.useMemo(() => {
      return data.reduce((sum, item) => sum + item.amount, 0);
  }, [data]);

  if (isLoading) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Categories</CardTitle>
          <CardDescription>Distribution of expenses this month</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center pb-8">
           <Skeleton className="h-[250px] w-[250px] rounded-full" />
        </CardContent>
      </Card>
     )
  }

   if (!data || data.length === 0 || totalExpenses === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Categories</CardTitle>
          <CardDescription>Distribution of expenses this month</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[250px] flex-col items-center justify-center gap-2 text-center">
           <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
              aria-hidden="true"
            >
             <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
             <path d="M22 12A10 10 0 0 0 12 2v10z" />
           </svg>
          <p className="text-sm text-muted-foreground">
            No expense data available for this month.
          </p>
          <p className="text-xs text-muted-foreground">
            Add expenses to see your spending distribution.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Spending Categories</CardTitle>
        <CardDescription>Distribution of expenses this month</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <RechartsTooltip
                 cursor={false}
                 content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60} // Make it a donut chart
                labelLine={false}
                // label={renderCustomizedLabel} // Use custom label for icons if desired
                label={({ payload, percent }) => {
                   if (!payload || percent < 0.05) return null; // Hide small labels
                   return `${(percent * 100).toFixed(0)}%`;
                 }} // Simple percentage label
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
       {/* Optional: Add legend below chart */}
       {/* <CardFooter className="flex-col gap-2 text-sm">
         <div className="flex items-center gap-2 font-medium leading-none">
            Total Expenses: ${totalExpenses.toFixed(2)}
         </div>
         <div className="leading-none text-muted-foreground">
            Breakdown by category
         </div>
       </CardFooter> */}
    </Card>
  )
}
