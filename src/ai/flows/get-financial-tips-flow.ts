
'use server';
/**
 * @fileOverview A Genkit flow to generate personalized financial tips.
 *
 * - getFinancialTips - A function that generates tips based on financial data.
 * - GetFinancialTipsInput - The input type for the getFinancialTips function.
 * - GetFinancialTipsOutput - The return type for the getFinancialTips function.
 */

import { ai } from '@/ai/ai-instance';
import type { Transaction, BudgetGoal } from '@/lib/types';
import { categories } from '@/lib/categories';
import { z } from 'genkit';

// Define input schema using Zod
const GetFinancialTipsInputSchema = z.object({
  transactions: z.array(z.object({
    id: z.string(),
    type: z.enum(["income", "expense"]),
    description: z.string(),
    amount: z.number(),
    date: z.date(),
    categoryId: z.string(),
  })).describe('List of financial transactions for the current period.'),
  budgetGoals: z.array(z.object({
    categoryId: z.string(),
    amount: z.number(),
  })).describe('User-defined budget goals for different categories.'),
  currentBankBalance: z.number().describe('The current actual bank balance.'),
  startingBalance: z.number().describe('The starting balance for the period.'),
  totalIncome: z.number().describe('Total income for the current period.'),
  totalExpenses: z.number().describe('Total expenses for the current period.'),
});
export type GetFinancialTipsInput = z.infer<typeof GetFinancialTipsInputSchema>;

// Define output schema using Zod
const GetFinancialTipsOutputSchema = z.object({
  tips: z.string().describe('Personalized financial tips formatted in Markdown for chat-like display. Include insights on spending patterns, budget adherence, and potential savings.'),
});
export type GetFinancialTipsOutput = z.infer<typeof GetFinancialTipsOutputSchema>;

// Define the prompt for the AI model
const financialTipsPrompt = ai.definePrompt({
  name: 'financialTipsPrompt',
  input: { schema: GetFinancialTipsInputSchema },
  output: { schema: GetFinancialTipsOutputSchema },
  prompt: `
    You are a friendly and helpful financial advisor AI. Analyze the following financial data for the user's current period (e.g., month):

    **Summary:**
    - Starting Balance: $ {{startingBalance}}
    - Total Income: $ {{totalIncome}}
    - Total Expenses: $ {{totalExpenses}}
    - Current Bank Balance: $ {{currentBankBalance}}

    **Budget Goals:**
    {{#each budgetGoals}}
    - {{lookup ../categoriesData @key}}: Goal $ {{this.amount}}
    {{/each}}

    **Recent Transactions:**
    {{#each transactions}}
    - {{this.date}} | {{this.type}} | {{this.description}} | $ {{this.amount}} | Category: {{lookup ../categoriesData this.categoryId}}
    {{/each}}

    Based *only* on the provided data, generate personalized financial tips for the user. Structure your response in a helpful, chat-like format using Markdown.

    **Focus on:**
    1.  **Spending Analysis:** Identify categories where spending is high compared to income or budget goals (if set and greater than 0). Point out potential areas of unnecessary spending.
    2.  **Budget Adherence:** Compare actual spending (derived from transactions) against budget goals. Offer encouragement or suggestions for improvement.
    3.  **Savings Potential:** Suggest ways to save money based on spending patterns.
    4.  **Overall Financial Health:** Comment briefly on the income vs. expense trend and the change in bank balance.

    **Formatting Guidelines:**
    - Use Markdown (bolding, bullet points) for readability.
    - Keep the tone encouraging and actionable.
    - Start with a friendly greeting.
    - Provide 2-4 specific, actionable tips.
    - Conclude with a positive remark.

    **Example Snippet:**
    "Hey there! Let's look at your finances. I noticed spending on 'Food & Dining' is a bit high this month. Maybe try packing lunch a couple of times a week? Keep up the great work on saving in 'Transportation'!"

    **Do not:**
    - Provide generic advice not based on the data.
    - Make assumptions beyond the transactions and goals listed.
    - Ask for more information.

    Generate the tips now based *only* on the data above.
  `,
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
    // Prepare category data for the prompt context
    const categoriesData = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);
    // Add income category manually if needed by prompt logic
     categoriesData['income'] = 'Income';


    // Call the prompt with the input data and category mapping
    const response = await financialTipsPrompt({...input, categoriesData}); // Pass categoriesData directly if prompt supports it
    // If prompt doesn't directly support passing extra context, structure input like:
    // const response = await financialTipsPrompt({ ...input, context: { categoriesData } });
    // And adjust Handlebars template: {{lookup context.categoriesData this.categoryId}}

    const output = response.output;
    if (!output) {
      throw new Error("Failed to generate financial tips.");
    }
    return output;
  }
);

// Exported wrapper function to be called from the application
export async function getFinancialTips(input: GetFinancialTipsInput): Promise<GetFinancialTipsOutput> {
  return getFinancialTipsFlow(input);
}
