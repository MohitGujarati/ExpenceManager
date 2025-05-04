
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Sparkles, Terminal } from "lucide-react";
import { generateFinancialTips, type GenerateFinancialTipsInput, type GenerateFinancialTipsOutput } from "@/ai/flows/generate-financial-tips-flow"; // Assuming the flow exists
import type { Category, BudgetGoal } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface FinancialTipsProps {
    totalIncome: number;
    totalExpenses: number;
    expensesByCategory: { categoryId: string; amount: number; category: Category }[];
    budgetGoals: BudgetGoal[];
    currentBalance: number;
    isLoading: boolean; // Prop to indicate initial data loading
}

export function FinancialTips({
    totalIncome,
    totalExpenses,
    expensesByCategory,
    budgetGoals,
    currentBalance,
    isLoading: isDataLoading, // Rename prop
}: FinancialTipsProps) {
    const [tipsResult, setTipsResult] = React.useState<GenerateFinancialTipsOutput | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { toast } = useToast();

    const handleGenerateTips = async () => {
        setIsGenerating(true);
        setError(null);
        setTipsResult(null); // Clear previous results

        // Prepare input for the AI flow
        const inputData: GenerateFinancialTipsInput = {
            totalIncome,
            totalExpenses,
            // Simplify expensesByCategory for the AI
            expensesByCategory: expensesByCategory.map(e => ({
                categoryName: e.category.name,
                amountSpent: e.amount,
            })),
            // Simplify budgetGoals for the AI
            budgetGoals: budgetGoals
                .filter(g => g.amount > 0) // Only send goals that are set
                .map(g => ({
                    categoryName: expensesByCategory.find(e => e.categoryId === g.categoryId)?.category.name || g.categoryId,
                    budgetAmount: g.amount,
                })),
            currentBalance,
        };

        try {
            const result = await generateFinancialTips(inputData);
            setTipsResult(result);
            toast({
                title: "Tips Generated!",
                description: "AI has analyzed your finances and provided suggestions.",
            });
        } catch (err) {
            console.error("Error generating financial tips:", err);
            setError("Failed to generate financial tips. Please try again later.");
             toast({
                title: "Error Generating Tips",
                description: "Could not fetch financial advice from the AI.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // Determine if there's enough data to generate meaningful tips
    const hasSufficientData = totalIncome > 0 || totalExpenses > 0 || currentBalance !== 0;

    if (isDataLoading) {
        return (
            <Card>
                 <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        AI Financial Tips
                    </CardTitle>
                    <CardDescription>Personalized advice based on your spending.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <Skeleton className="h-10 w-1/2" />
                     <Skeleton className="h-20 w-full" />
                     <Skeleton className="h-20 w-full" />
                 </CardContent>
             </Card>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    AI Financial Tips
                </CardTitle>
                <CardDescription>Get personalized advice based on your current financial picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Button
                    onClick={handleGenerateTips}
                    disabled={isGenerating || !hasSufficientData}
                    className="w-full sm:w-auto"
                >
                    {isGenerating ? (
                        <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            Generating Tips...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                             Generate My Tips
                        </>
                    )}
                 </Button>

                 {!hasSufficientData && !isGenerating && (
                     <Alert variant="default" className="mt-4">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Not Enough Data</AlertTitle>
                        <AlertDescription>
                          Add some income, expenses, or set a starting balance to get personalized financial tips.
                        </AlertDescription>
                      </Alert>
                 )}


                {isGenerating && (
                     <div className="space-y-3 pt-4">
                         <Skeleton className="h-6 w-3/4" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-6 w-1/2 mt-4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                     </div>
                 )}

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {tipsResult && (
                    <div className="mt-6 space-y-6">
                         {tipsResult.unnecessarySpendingAreas && tipsResult.unnecessarySpendingAreas.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                    Potential Unnecessary Spending
                                </h3>
                                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                    {tipsResult.unnecessarySpendingAreas.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                         {tipsResult.savingsSuggestions && tipsResult.savingsSuggestions.length > 0 && (
                             <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    Savings Suggestions
                                </h3>
                                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                    {tipsResult.savingsSuggestions.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                             </div>
                         )}

                         {tipsResult.generalAdvice && (
                             <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-1.5">
                                    <Lightbulb className="h-4 w-4 text-primary" />
                                    General Advice
                                </h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tipsResult.generalAdvice}</p>
                             </div>
                         )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
