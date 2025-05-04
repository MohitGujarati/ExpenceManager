
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
import { PlusCircle, Settings, Lightbulb } from "lucide-react"; // Added Lightbulb
import { useBudgetData } from "@/hooks/use-budget-data";
import { AddTransactionForm } from "@/components/add-transaction-form";
import { DashboardSummary } from "@/components/dashboard-summary";
import { SpendingChart } from "@/components/spending-chart";
import { SpendingTrendsChart } from "@/components/spending-trends-chart";
import { TransactionList } from "@/components/transaction-list";
import { BudgetGoalSettings } from "@/components/budget-goal-settings";
import { BudgetProgress } from "@/components/budget-progress";
import { FinancialTipsDisplay } from "@/components/financial-tips-display"; // Import the new component
import { getFinancialTips } from "@/ai/flows/get-financial-tips-flow"; // Import the AI flow
import type { GetFinancialTipsInput, GetFinancialTipsOutput } from "@/ai/flows/get-financial-tips-flow"; // Import types
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryById } from "@/lib/categories";

export default function DashboardPage() {
  const {
    transactions,
    budgetGoals,
    startingBalance,
    updateStartingBalance,
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
  const { toast } = useToast();

  const [isAddTransactionOpen, setIsAddTransactionOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [financialTips, setFinancialTips] = React.useState<string | null>(null); // State for tips
  const [isTipsLoading, setIsTipsLoading] = React.useState(false); // State for loading tips
  const [activeTab, setActiveTab] = React.useState("overview");

  // Memoize calculations to avoid re-computation on every render
  const totalIncome = React.useMemo(() => getTotalIncome(), [getTotalIncome, transactions]); // Add transactions dependency
  const totalExpenses = React.useMemo(() => getTotalExpenses(), [getTotalExpenses, transactions]); // Add transactions dependency
  const currentBankBalance = React.useMemo(() => getCurrentBankBalance(), [getCurrentBankBalance, transactions, startingBalance]); // Add dependencies
  const expensesByCategory = React.useMemo(() => getExpensesByCategory(), [getExpensesByCategory, transactions]); // Add transactions dependency
  const spendingOverTime = React.useMemo(() => getSpendingOverTime('month'), [getSpendingOverTime, transactions]); // Add transactions dependency

  // Function to generate financial tips
  const generateTips = React.useCallback(async () => {
    if (!isLoaded) return; // Don't run if data isn't loaded

    setIsTipsLoading(true);
    setFinancialTips(null); // Clear previous tips

    const inputData: GetFinancialTipsInput = {
      transactions: transactions.slice(0, 50), // Limit transactions sent for performance/token limits
      budgetGoals,
      currentBankBalance,
      startingBalance,
      totalIncome,
      totalExpenses,
    };

    try {
      console.log("Sending data to AI:", inputData); // Log input data
      const result: GetFinancialTipsOutput = await getFinancialTips(inputData);
      console.log("Received AI tips:", result); // Log output data
      setFinancialTips(result.tips);
       toast({
         title: "Financial Tips Generated",
         description: "AI has provided some insights!",
       });
    } catch (error) {
       console.error("Error generating financial tips:", error);
       toast({
         title: "Error Generating Tips",
         description: "Could not generate financial tips. Please try again later.",
         variant: "destructive",
       });
       setFinancialTips("Sorry, I couldn't generate tips right now. Please ensure your API key is correctly configured and try again."); // Provide user feedback on error
    } finally {
      setIsTipsLoading(false);
    }
  }, [
    isLoaded,
    transactions,
    budgetGoals,
    currentBankBalance,
    startingBalance,
    totalIncome,
    totalExpenses,
    toast
  ]);

  // Updated handleTabChange to include tips generation logic
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Generate tips when switching to the tips tab if not already loaded/loading
    if (value === "tips" && !financialTips && !isTipsLoading && isLoaded) {
      generateTips();
    }
  };

   // Generate tips on initial load if the app starts on the tips tab (optional)
   // React.useEffect(() => {
   //   if (activeTab === "tips" && isLoaded && !financialTips && !isTipsLoading) {
   //     generateTips();
   //   }
   // }, [activeTab, isLoaded, financialTips, isTipsLoading, generateTips]);


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

        {/* Tabs for Overview, Transactions, Budget, Tips */}
         <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
             <TabsList className="grid w-full grid-cols-4"> {/* Adjusted grid cols to 4 */}
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="tips">
                  <Lightbulb className="mr-1 h-4 w-4" />
                 AI Tips
              </TabsTrigger>
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

             {/* Tips Tab Content */}
             <TabsContent value="tips">
                <FinancialTipsDisplay
                  tips={financialTips}
                  isLoading={isTipsLoading || !isLoaded} // Show loading if data isn't loaded OR tips are loading
                  onRegenerate={generateTips}
                />
            </TabsContent>

         </Tabs>
      </main>
    </div>
  );
}
