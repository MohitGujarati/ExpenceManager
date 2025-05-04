
'use server';
/**
 * @fileOverview Generates personalized financial tips based on user's budget data.
 *
 * - getFinancialTips - A function that generates financial advice.
 * - GetFinancialTipsInput - The input type for the getFinancialTips function.
 * - GetFinancialTipsOutput - The return type for the getFinancialTips function.
 */

import { ai } from '@/ai/ai-instance'; // Use the configured AI instance
import { z } from 'zod';

// Define simplified Transaction schema for AI input
const SimpleTransactionSchema = z.object({
    type: z.enum(["income", "expense"]),
    description: z.string(),
    amount: z.number(),
    date: z.string().describe("Date in YYYY-MM-DD format"),
    category: z.string().describe("Category name for expenses, 'Income' for income"),
});

// Define BudgetGoal schema for AI input
const SimpleBudgetGoalSchema = z.object({
    category: z.string().describe("Category name"),
    goalAmount: z.number().describe("Monthly budget goal amount for this category"),
});

// Define ExpensesByCategory schema for AI input
const SimpleExpensesByCategorySchema = z.object({
    category: z.string().describe("Category name"),
    spentAmount: z.number().describe("Amount spent in this category this month"),
});


// Input Schema for the financial tips flow
const GetFinancialTipsInputSchema = z.object({
  transactions: z.array(SimpleTransactionSchema).describe("List of recent income and expense transactions."),
  currentBalance: z.number().describe("User's current bank balance (calculated from starting balance and all transactions)."),
  monthlyIncome: z.number().describe("Total income received this month."),
  monthlyExpenses: z.number().describe("Total expenses paid this month."),
  budgetGoals: z.array(SimpleBudgetGoalSchema).optional().describe("User's set monthly budget goals for spending categories."),
  expensesByCategory: z.array(SimpleExpensesByCategorySchema).describe("Breakdown of expenses by category for the current month."),
});
export type GetFinancialTipsInput = z.infer<typeof GetFinancialTipsInputSchema>;

// Output Schema for the financial tips flow
const GetFinancialTipsOutputSchema = z.object({
  tips: z.string().describe("Personalized financial tips and advice in a friendly, conversational chat format. Identify areas of potential overspending based on goals and suggest improvements."),
});
export type GetFinancialTipsOutput = z.infer<typeof GetFinancialTipsOutputSchema>;


// Exported function to call the flow
export async function getFinancialTips(input: GetFinancialTipsInput): Promise<GetFinancialTipsOutput> {
  // Basic validation or logging before calling the flow
  console.log("Calling getFinancialTipsFlow with input:", input);
  if (!input.transactions || !input.expensesByCategory) {
      throw new Error("Missing required input data for financial tips generation.");
  }
   // Ensure GOOGLE_API_KEY is available
   if (!process.env.GOOGLE_API_KEY) {
     console.error("GOOGLE_API_KEY environment variable is not set.");
     throw new Error("AI API key is not configured. Cannot generate tips.");
   }
  return getFinancialTipsFlow(input);
}


// Define the prompt for the AI model
const financialTipsPrompt = ai.definePrompt({
  name: 'financialTipsPrompt',
  input: { schema: GetFinancialTipsInputSchema },
  output: { schema: GetFinancialTipsOutputSchema },
  prompt: `You are a friendly and helpful financial advisor chatbot. Analyze the user's recent financial data and provide personalized tips in a conversational chat format.

Here's the user's financial summary:
- Current Bank Balance: \${{currentBalance}}
- This Month's Income: \${{monthlyIncome}}
- This Month's Expenses: \${{monthlyExpenses}}

Recent Transactions:
{{#each transactions}}
- {{date}}: {{type}} - {{description}} (\${{amount}}) - Category: {{category}}
{{/each}}

Spending vs. Budget Goals (if any):
{{#each budgetGoals}}
- Category: {{category}} | Goal: \${{goalAmount}} | Spent: \${{#each ../expensesByCategory}}{{#if (eq category ../category)}}{{spentAmount}}{{/if}}{{/each}}
{{/each}}

Monthly Spending Breakdown:
{{#each expensesByCategory}}
- Category: {{category}} | Spent: \${{spentAmount}}
{{/each}}

Based on this information:
1.  Start with a friendly greeting.
2.  Provide 2-3 specific, actionable financial tips based on their spending patterns, income, and balance.
3.  **Highlight any categories where spending seems high compared to their income or budget goals (if set).** Be specific about which categories.
4.  Suggest potential areas for saving or budget adjustments.
5.  Keep the tone encouraging and supportive.
6.  Format the response as a chat message from you (the AI advisor) to the user. Use paragraphs for readability.`,
});


// Define the Genkit flow
const getFinancialTipsFlow = ai.defineFlow<
  typeof GetFinancialTipsInputSchema,
  typeof GetFinancialTipsOutputSchema
>(
  {
    name: 'getFinancialTipsFlow',
    inputSchema: GetFinancialTipsInputSchema,
    outputSchema: GetFinancialTipsOutputSchema,
  },
  async (input) => {
    console.log("Generating financial tips...");
    try {
        const { output } = await financialTipsPrompt(input);

        if (!output) {
            console.error("AI response was empty or undefined.");
            throw new Error("Failed to get a valid response from the AI model.");
        }
        console.log("Successfully generated tips:", output.tips);
        return output; // Ensure we return the structured output
    } catch (error) {
         console.error("Error executing financialTipsPrompt:", error);
         // Check if the error is related to API key or configuration
         if (error instanceof Error && (error.message.includes('API key') || error.message.includes('permission denied'))) {
            throw new Error("AI API key might be invalid or missing permissions. Please check your configuration.");
         }
         throw error; // Re-throw other errors
    }

  }
);
