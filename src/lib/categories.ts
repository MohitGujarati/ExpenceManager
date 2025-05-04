import type { Category } from "@/lib/types";
import { Utensils, Car, Home, ShoppingCart, HeartPulse, MoreHorizontal } from "lucide-react";

// Define category colors matching the chart colors in globals.css if possible
const categoryColors = {
  food: "hsl(var(--chart-1))",      // Teal
  transport: "hsl(var(--chart-2))", // Coral
  housing: "hsl(var(--chart-3))",   // Muted Blue
  shopping: "hsl(var(--chart-4))",  // Muted Yellow
  health: "hsl(var(--chart-5))",    // Muted Orange
  other: "hsl(var(--muted-foreground))", // Medium Gray
};

export const categories: Category[] = [
  { id: "food", name: "Food & Dining", icon: Utensils, color: categoryColors.food },
  { id: "transport", name: "Transportation", icon: Car, color: categoryColors.transport },
  { id: "housing", name: "Housing & Utilities", icon: Home, color: categoryColors.housing },
  { id: "shopping", name: "Shopping", icon: ShoppingCart, color: categoryColors.shopping },
  { id: "health", name: "Health & Wellness", icon: HeartPulse, color: categoryColors.health },
  { id: "other", name: "Other", icon: MoreHorizontal, color: categoryColors.other },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};
