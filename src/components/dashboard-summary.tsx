
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Banknote, Wallet, Edit, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface EditableBalanceCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
  onSave: (newValue: number) => void;
}

function EditableBalanceCard({ title, value, icon: Icon, color, isLoading = false, onSave }: EditableBalanceCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value.toString());
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
      setEditValue(value.toFixed(2)); // Update editValue if external value changes
  }, [value]);

  React.useEffect(() => {
      if (isEditing && inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select(); // Select the text for easy replacement
      }
  }, [isEditing]);


  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setEditValue(value.toFixed(2)); // Reset to original value
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    const numericValue = parseFloat(editValue);
    if (!isNaN(numericValue)) {
      onSave(numericValue);
      setIsEditing(false);
      toast({
          title: "Starting Balance Updated",
          description: `Your starting balance has been set to $${numericValue.toFixed(2)}.`,
      })
    } else {
      toast({
          title: "Invalid Input",
          description: "Please enter a valid number for the balance.",
          variant: "destructive",
      })
      // Optionally reset or keep the invalid input for correction
      setEditValue(value.toFixed(2)); // Reset to last valid value on invalid save
    }
  };

   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       // Allow only numbers and a single decimal point
       const validInput = /^-?\d*\.?\d*$/;
       if (validInput.test(event.target.value)) {
           setEditValue(event.target.value);
       }
   };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSaveClick();
        } else if (event.key === 'Escape') {
            handleCancelClick();
        }
    };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-1">
            {!isEditing && (
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleEditClick}>
                    <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    <span className="sr-only">Edit Balance</span>
                 </Button>
            )}
            <Icon className={cn("h-5 w-5 text-muted-foreground", color)} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : isEditing ? (
          <div className="flex items-center gap-2">
             <div className="relative flex-grow">
               <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
               <Input
                  ref={inputRef}
                  type="text" // Use text for better control over input
                  inputMode="decimal"
                  value={editValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onBlur={handleCancelClick} // Cancel if blurring without saving
                  className="h-8 pl-7 text-xl font-bold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
               />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-100" onClick={handleSaveClick}>
              <Check className="h-4 w-4" />
               <span className="sr-only">Save Balance</span>
            </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-100" onClick={handleCancelClick}>
               <X className="h-4 w-4" />
                <span className="sr-only">Cancel Edit</span>
            </Button>
          </div>
        ) : (
          <div className="text-2xl font-bold">
            {value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


interface DashboardSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  currentBankBalance: number;
  startingBalance: number; // Add starting balance prop
  onUpdateStartingBalance: (newBalance: number) => void; // Callback to update starting balance
  isLoading?: boolean;
}

export function DashboardSummary({
  totalIncome,
  totalExpenses,
  currentBankBalance,
  startingBalance,
  onUpdateStartingBalance,
  isLoading = false
}: DashboardSummaryProps) {
  const monthlyBalance = totalIncome - totalExpenses;

  const summaryCards = [
    // Use EditableBalanceCard for the "Current Bank Balance" - now reflects starting balance
    { component: EditableBalanceCard, props: { title: "Starting Balance", value: startingBalance, icon: Wallet, color: startingBalance >= 0 ? "text-primary" : "text-destructive", onSave: onUpdateStartingBalance, isLoading } },
    { title: "Monthly Income", value: totalIncome, icon: TrendingUp, color: "text-green-600" },
    { title: "Monthly Expenses", value: totalExpenses, icon: TrendingDown, color: "text-red-600" },
    { title: "Actual Current Balance", value: currentBankBalance, icon: Banknote, color: currentBankBalance >= 0 ? "text-primary" : "text-destructive" }, // Keep a card for the calculated current balance
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map((card, index) => {
        if (card.component) {
            const CardComponent = card.component;
            return <CardComponent key={index} {...card.props} />
        }
        // Regular Card
        return (
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
                        {card.title === 'Monthly Expenses' && card.value > 0 ? '-' : ''}
                        {card.title === 'Actual Current Balance' && card.value < 0 ? '-' : ''}
                        ${Math.abs(card.value).toFixed(2)}
                        </div>
                    )}
                 </CardContent>
             </Card>
        );
      })}
    </div>
  );
}
