import type { LucideIcon } from "lucide-react";

export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>; // Allow Lucide or custom SVG
  color: string; // For chart representation primarily
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: Date;
  categoryId: string;
}

export interface BudgetGoal {
  categoryId: string;
  amount: number;
}
