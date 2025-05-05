
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
import { PlusCircle, Settings } from "lucide-react"; // Removed Lightbulb
import { useBudgetData } from "@/hooks/use-budget-data";
import { AddTransactionForm } from "@/components/add-transaction-form";
import { DashboardSummary } from "@/components/dashboard-summary";
import { SpendingChart } from "@/components/spending-chart";
import { SpendingTrendsChart } from "@/components/spending-trends-chart";
import { TransactionList } from "@/components/transaction-list";
import { BudgetGoalSettings } from "@/components/budget-goal-settings";
import { BudgetProgress } from "@/components/budget-progress";
// Removed FinancialTipsDisplay import
// Removed AI flow imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"; // Keep useToast if other parts use it
import { Skeleton } from "@/components/ui/skeleton"; // Keep Skeleton if other parts use it
// import { getCategoryById } from "@/lib/categories"; // Keep if needed, otherwise remove

export default function DashboardPage() {
  const {
    transactions,
    budgetGoals,
    startingBalance,
    updateStartingBalance,
    categories,
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
  const { toast } = useToast(); // Keep toast if needed

  const [isAddTransactionOpen, setIsAddTransactionOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>(undefined); // Add 'undefined' to the type
  // Removed financialTips and isTipsLoading state
  const [activeTab, setActiveTab] = React.useState("overview");

  // Memoize calculations to avoid re-computation on every render
  const totalIncome = React.useMemo(() => getTotalIncome(), [getTotalIncome, transactions]);
  const totalExpenses = React.useMemo(() => getTotalExpenses(), [getTotalExpenses, transactions]);
  const currentBankBalance = React.useMemo(() => getCurrentBankBalance(), [getCurrentBankBalance, transactions, startingBalance]);
  const expensesByCategory = React.useMemo(() => getExpensesByCategory(), [getExpensesByCategory, transactions]);
  const spendingOverTime = React.useMemo(() => getSpendingOverTime('month'), [getSpendingOverTime, transactions]);

  // Removed generateTips function
  // Removed handleTabChange logic related to tips

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Removed tips generation logic
  };

   const filteredTransactions = React.useMemo(() => {
      // Ensure transactions is always an array
     const validTransactions = Array.isArray(transactions) ? transactions : [];
     return selectedCategory
       ? validTransactions.filter((transaction) => transaction.categoryId === selectedCategory)
       : validTransactions;
   }, [transactions, selectedCategory]);


  // Removed useEffect related to tips generation

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
            startingBalance={startingBalance}
            onUpdateStartingBalance={updateStartingBalance}
            isLoading={!isLoaded}
        />

        {/* Tabs for Overview, Transactions, Budget */}
         <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
             <TabsList className="grid w-full grid-cols-3"> {/* Adjusted grid cols to 3 */}
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              {/* Removed AI Tips TabTrigger */}
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
                  <CardHeader className="pb-4 flex flex-row items-start justify-between">
                     <div>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription className="max-w-lg text-balance leading-relaxed pt-2">
                           View and manage your income and expenses. Use the category filter
                           to display only transactions from a specific category and focus
                           on what matters most.
                        </CardDescription>
                      </div>
                      <div className="ml-auto w-full max-w-[180px] flex-shrink-0">
                         <Select
                           onValueChange={(value) => setSelectedCategory(value === 'all' ? undefined : value)}
                           value={selectedCategory || 'all'} // Set value to 'all' when selectedCategory is undefined
                         >
                           <SelectTrigger className="w-full">
                             <SelectValue placeholder="Filter by category" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="all">All Categories</SelectItem>
                             {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    <div className="flex items-center gap-2">
                                      <category.icon className="h-4 w-4" />
                                       {category.name}
                                    </div>
                                </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                      </div>
                   </CardHeader>
                    <CardContent>
                       <TransactionList
                          transactions={filteredTransactions}
                          onDelete={deleteTransaction}
                          maxHeight="500px"
                       />
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

             {/* Removed Tips Tab Content */}

         </Tabs>
      </main>
    </div>
  );
}
