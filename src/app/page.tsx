
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Settings } from "lucide-react";
import { useBudgetData } from "@/hooks/use-budget-data";
import { AddTransactionForm } from "@/components/add-transaction-form";
import { DashboardSummary } from "@/components/dashboard-summary";
import { SpendingChart } from "@/components/spending-chart";
import { SpendingTrendsChart } from "@/components/spending-trends-chart";
import { TransactionList } from "@/components/transaction-list";
import { BudgetGoalSettings } from "@/components/budget-goal-settings";
import { BudgetProgress } from "@/components/budget-progress";

export default function DashboardPage() {
  const {
    transactions,
    budgetGoals,
    startingBalance, // Get starting balance
    updateStartingBalance, // Get function to update starting balance
    addTransaction,
    deleteTransaction,
    updateBudgetGoal,
    getTotalIncome,
    getTotalExpenses,
    getExpensesByCategory,
    getSpendingOverTime,
    getCurrentBankBalance,
    isLoaded,
  } = useBudgetData();

  const [isAddTransactionOpen, setIsAddTransactionOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  // Memoize calculations to avoid re-computation on every render
  const totalIncome = React.useMemo(() => getTotalIncome(), [getTotalIncome]);
  const totalExpenses = React.useMemo(() => getTotalExpenses(), [getTotalExpenses]);
  const currentBankBalance = React.useMemo(() => getCurrentBankBalance(), [getCurrentBankBalance]);
  const expensesByCategory = React.useMemo(() => getExpensesByCategory(), [getExpensesByCategory]);
  const spendingOverTime = React.useMemo(() => getSpendingOverTime('month'), [getSpendingOverTime]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <h1 className="text-xl font-semibold">BudgetView Dashboard</h1>
         <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
               <Button size="icon" variant="outline" className="ml-auto h-8 w-8">
                 <Settings className="h-4 w-4" />
                 <span className="sr-only">Settings</span>
               </Button>
            </DialogTrigger>
             <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                 </DialogHeader>
                 <BudgetGoalSettings
                     budgetGoals={budgetGoals}
                     onUpdateGoal={updateBudgetGoal}
                 />
            </DialogContent>
         </Dialog>
        <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Add Transaction
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <AddTransactionForm
                  onSubmit={addTransaction}
                  onClose={() => setIsAddTransactionOpen(false)}
                />
            </DialogContent>
        </Dialog>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
         {/* Summary Cards */}
        <DashboardSummary
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            currentBankBalance={currentBankBalance}
            startingBalance={startingBalance} // Pass starting balance
            onUpdateStartingBalance={updateStartingBalance} // Pass update function
            isLoading={!isLoaded}
        />

        {/* Tabs for Overview, Transactions, Budget */}
         <Tabs defaultValue="overview">
            {/* Updated grid cols */}
            <TabsList className="grid w-full grid-cols-3"> {/* Adjusted grid cols back to 3 */}
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
            </TabsList>

             {/* Overview Tab */}
             <TabsContent value="overview">
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                     <div className="lg:col-span-4">
                         <SpendingTrendsChart data={spendingOverTime} isLoading={!isLoaded} />
                     </div>
                     <div className="lg:col-span-3">
                         <SpendingChart data={expensesByCategory} isLoading={!isLoaded}/>
                     </div>
                 </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
                 <Card>
                     <CardHeader>
                         <CardTitle>Recent Transactions</CardTitle>
                         <CardDescription>View and manage your income and expenses.</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <TransactionList transactions={transactions} onDelete={deleteTransaction} maxHeight="500px" />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Budget Tab */}
            <TabsContent value="budget">
                 <div className="grid gap-4 md:grid-cols-2">
                    <BudgetProgress
                       budgetGoals={budgetGoals}
                       expensesByCategory={expensesByCategory}
                     />
                      <Card className="flex flex-col items-center justify-center">
                         <CardHeader>
                             <CardTitle>Manage Goals</CardTitle>
                             <CardDescription>Set or update your monthly spending targets.</CardDescription>
                         </CardHeader>
                         <CardContent>
                             <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
                                 <Settings className="mr-2 h-4 w-4" /> Edit Budget Goals
                             </Button>
                         </CardContent>
                     </Card>
                 </div>
            </TabsContent>

         </Tabs>
      </main>
    </div>
  );
}
