
'use server';
/**
 * @fileOverview Generates financial tips based on user's income, expenses, budget, and balance.
 *
 * - generateFinancialTips - A function that triggers the AI flow to get financial advice.
 * - GenerateFinancialTipsInput - The input type for the generateFinancialTips function.
 * - GenerateFinancialTipsOutput - The return type for the generateFinancialTips function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

// Define the input schema using Zod
const GenerateFinancialTipsInputSchema = z.object({
  totalIncome: z.number().describe('Total income for the current period (e.g., monthly).'),
  totalExpenses: z.number().describe('Total expenses for the current period.'),
  expensesByCategory: z.array(z.object({
    categoryName: z.string().describe('Name of the expense category.'),
    amountSpent: z.number().describe('Amount spent in this category.'),
  })).describe('Breakdown of expenses by category.'),
  budgetGoals: z.array(z.object({
    categoryName: z.string().describe('Name of the category for the budget goal.'),
    budgetAmount: z.number().describe('Budgeted amount for this category.'),
  })).optional().describe('User-defined budget goals for expense categories (optional).'),
  currentBalance: z.number().describe('Current bank account balance.'),
});
export type GenerateFinancialTipsInput = z.infer<typeof GenerateFinancialTipsInputSchema>;

// Define the output schema using Zod
const GenerateFinancialTipsOutputSchema = z.object({
  unnecessarySpendingAreas: z.array(z.string()).describe('List of categories or specific areas where spending seems high or potentially unnecessary based on income and goals.'),
  savingsSuggestions: z.array(z.string()).describe('Actionable suggestions on how to save money or cut costs.'),
  generalAdvice: z.string().describe('Overall financial advice or observations based on the provided data.'),
});
export type GenerateFinancialTipsOutput = z.infer<typeof GenerateFinancialTipsOutputSchema>;

// Exported function to be called from the frontend
export async function generateFinancialTips(input: GenerateFinancialTipsInput): Promise<GenerateFinancialTipsOutput> {
  console.log('Generating financial tips with input:', JSON.stringify(input, null, 2));
  return generateFinancialTipsFlow(input);
}

// Define the Genkit prompt
const financialTipsPrompt = ai.definePrompt({
  name: 'financialTipsPrompt',
  input: {
    schema: GenerateFinancialTipsInputSchema,
  },
  output: {
    schema: GenerateFinancialTipsOutputSchema,
  },
  prompt: `
You are a friendly and helpful financial advisor AI. Analyze the following financial data for a user and provide personalized tips.

**Financial Data:**
*   **Total Income:** \${{{totalIncome}}}
*   **Total Expenses:** \${{{totalExpenses}}}
*   **Current Balance:** \${{{currentBalance}}}

**Expenses Breakdown:**
{{#each expensesByCategory}}
*   **{{categoryName}}:** \${{{amountSpent}}}
{{/each}}

{{#if budgetGoals}}
**Budget Goals:**
{{#each budgetGoals}}
*   **{{categoryName}}:** Budget \${{{budgetAmount}}}
{{/each}}
{{/if}}

**Task:**

Based ONLY on the data provided above, generate financial tips covering the following:

1.  **Identify Potential Unnecessary Spending:**
    *   Analyze the 'Expenses Breakdown'.
    *   Compare spending in categories against the total income.
    *   If 'Budget Goals' are provided, highlight categories where spending significantly exceeds the budget (e.g., more than 10-20% over).
    *   Point out categories that often contain discretionary spending (like "Food & Dining" or "Shopping") if they constitute a large portion of total expenses relative to income.
    *   List these areas clearly in the \`unnecessarySpendingAreas\` output field. If no specific areas stand out significantly, state that spending seems generally balanced based on the data.

2.  **Suggest Savings Opportunities:**
    *   Provide specific, actionable advice on how the user could potentially reduce costs in the identified high-spending or over-budget categories.
    *   Suggest general saving strategies relevant to the user's situation (e.g., if income is much higher than expenses, suggest saving/investing; if expenses are close to or exceed income, focus on cost-cutting).
    *   List these suggestions in the \`savingsSuggestions\` output field.

3.  **Offer General Advice:**
    *   Provide a brief overall comment on the user's financial health based on the income vs. expense ratio and current balance.
    *   Mention the importance of tracking expenses and sticking to a budget (if applicable).
    *   Keep the advice encouraging and supportive.
    *   Provide this in the \`generalAdvice\` output field.

**Important:**
*   Base your analysis *strictly* on the numbers provided. Do not make assumptions about external factors.
*   If budget goals are not provided, analyze spending relative to income and typical spending patterns.
*   Be concise and clear in your output.
*   Ensure the output strictly follows the format defined by the output schema.
*   If income and expenses are both zero or very low, indicate that more data is needed for meaningful tips.

Generate the tips now.
  `,
});

// Define the Genkit flow
const generateFinancialTipsFlow = ai.defineFlow<
  typeof GenerateFinancialTipsInputSchema,
  typeof GenerateFinancialTipsOutputSchema
>(
  {
    name: 'generateFinancialTipsFlow',
    inputSchema: GenerateFinancialTipsInputSchema,
    outputSchema: GenerateFinancialTipsOutputSchema,
  },
  async (input) => {
    // Basic check for minimal data
    if (input.totalIncome === 0 && input.totalExpenses === 0 && input.currentBalance === 0) {
        return {
            unnecessarySpendingAreas: ["Not enough data provided."],
            savingsSuggestions: ["Add income, expenses, or balance details for tips."],
            generalAdvice: "Please add some financial data (income, expenses, current balance) so I can provide personalized tips."
        };
    }

    const { output } = await financialTipsPrompt(input);

    if (!output) {
        throw new Error("AI failed to generate a response.");
    }

    // Ensure arrays are always returned, even if empty
    return {
        unnecessarySpendingAreas: output.unnecessarySpendingAreas || [],
        savingsSuggestions: output.savingsSuggestions || [],
        generalAdvice: output.generalAdvice || "No specific advice generated based on the current data.",
    };
  }
);
