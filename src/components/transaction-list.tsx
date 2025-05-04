"use client";

import * as React from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Transaction } from "@/lib/types";
import { getCategoryById } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  maxHeight?: string; // Optional max height for scroll area
}

export function TransactionList({ transactions, onDelete, maxHeight = "400px" }: TransactionListProps) {
  const { toast } = useToast();

  const handleDeleteClick = (id: string, description: string, amount: number) => {
     onDelete(id);
     toast({
        title: "Transaction Deleted",
        description: `Transaction "${description}" ($${amount.toFixed(2)}) deleted.`,
     });
  };

  return (
    <ScrollArea className={cn("rounded-md border", maxHeight ? `h-[${maxHeight}]` : "")}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No transactions yet. Add one to get started!
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => {
              const category = getCategoryById(transaction.categoryId);
              const Icon = category?.icon; // Get icon component

              return (
                <TableRow key={transaction.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(transaction.date, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    {transaction.type === 'expense' && category ? (
                      <Badge variant="secondary" className="flex w-fit items-center gap-1 py-1">
                        {Icon && <Icon className="h-3 w-3" />}
                        {category.name}
                      </Badge>
                    ) : transaction.type === 'income' ? (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 py-1">
                         Income
                        </Badge>
                    ): (
                      <Badge variant="outline">N/A</Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete Transaction</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                           <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the transaction:
                                <br />
                                <span className="font-medium">{transaction.description}</span> -
                                <span className={cn(
                                      "font-medium",
                                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                                    )}>
                                     ${transaction.amount.toFixed(2)}
                                </span>
                              </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                 onClick={() => handleDeleteClick(transaction.id, transaction.description, transaction.amount)}
                                 className={buttonVariants({ variant: "destructive" })} // Ensure correct import
                                >
                                 Delete
                             </AlertDialogAction>
                           </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

// Need to import buttonVariants if used within the component like above
import { buttonVariants } from "@/components/ui/button";
