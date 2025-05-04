"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Transaction, BudgetGoal, Category } from '@/lib/types';
import { categories, getCategoryById } from '@/lib/categories';

// Helper function to load data from localStorage
const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    // Ensure date strings are converted back to Date objects for transactions
    if (key === 'transactions' && item) {
      const parsed = JSON.parse(item) as Transaction[];
      return parsed.map(tx => ({ ...tx, date: new Date(tx.date) })) as T;
    }
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

// Helper function to save data to localStorage
const saveToLocalStorage = <T>(key: string, value: T): void => {
   if (typeof window === 'undefined') {
    return;
  }
  try {
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
  } catch (error) {
    console.warn(`Error setting localStorage key “${key}”:`, error);
  }
};

export function useBudgetData() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
   const [isLoaded, setIsLoaded] = useState(false); // Track initial load

  // Load initial data from localStorage on mount
  useEffect(() => {
    setTransactions(loadFromLocalStorage<Transaction[]>('transactions', []));
    // Ensure budget goals are initialized for all categories if not present
    const loadedGoals = loadFromLocalStorage<BudgetGoal[]>('budgetGoals', []);
    const allCategoryIds = categories.map(c => c.id);
    const updatedGoals = allCategoryIds.map(id => {
        const existingGoal = loadedGoals.find(g => g.categoryId === id);
        return existingGoal || { categoryId: id, amount: 0 };
    });
    setBudgetGoals(updatedGoals);

    setIsLoaded(true); // Mark as loaded after initial fetch
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) { // Only save after initial load to avoid overwriting with defaults
        saveToLocalStorage('transactions', transactions);
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
     if (isLoaded) {
        saveToLocalStorage('budgetGoals', budgetGoals);
     }
  }, [budgetGoals, isLoaded]);


  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions((prev) => [...prev, newTransaction].sort((a, b) => b.date.getTime() - a.date.getTime()));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateBudgetGoal = useCallback((categoryId: string, amount: number) => {
    setBudgetGoals((prev) =>
        prev.map((goal) =>
            goal.categoryId === categoryId ? { ...goal, amount: Math.max(0, amount) } : goal // Ensure amount is not negative
        )
    );
  }, []);

   const getTotalIncome = useCallback((month?: Date) => {
    const targetMonth = month ? month.getMonth() : new Date().getMonth();
    const targetYear = month ? month.getFullYear() : new Date().getFullYear();
    return transactions
      .filter(t => t.type === 'income' && t.date.getMonth() === targetMonth && t.date.getFullYear() === targetYear)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTotalExpenses = useCallback((month?: Date) => {
     const targetMonth = month ? month.getMonth() : new Date().getMonth();
     const targetYear = month ? month.getFullYear() : new Date().getFullYear();
    return transactions
      .filter(t => t.type === 'expense' && t.date.getMonth() === targetMonth && t.date.getFullYear() === targetYear)
      .reduce((sum, t) => sum + t.amount, 0);
   }, [transactions]);

   const getExpensesByCategory = useCallback((month?: Date) => {
     const targetMonth = month ? month.getMonth() : new Date().getMonth();
     const targetYear = month ? month.getFullYear() : new Date().getFullYear();
     const expenses = transactions.filter(t => t.type === 'expense' && t.date.getMonth() === targetMonth && t.date.getFullYear() === targetYear);
     const categoryMap = new Map<string, number>();

     expenses.forEach(expense => {
       const currentAmount = categoryMap.get(expense.categoryId) || 0;
       categoryMap.set(expense.categoryId, currentAmount + expense.amount);
     });

     return Array.from(categoryMap.entries()).map(([categoryId, amount]) => ({
       categoryId,
       amount,
       category: getCategoryById(categoryId) || categories.find(c => c.id === 'other')!, // Fallback to 'Other'
     }));
  }, [transactions]);

  const getSpendingOverTime = useCallback((period: 'month' | 'year' = 'month') => {
      const now = new Date();
      const data: { name: string; expenses: number; income: number }[] = [];

      if (period === 'month') {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${now.getMonth() + 1}/${day}`;
          const dailyExpenses = transactions
            .filter(t => t.type === 'expense' && t.date.getDate() === day && t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear())
            .reduce((sum, t) => sum + t.amount, 0);
          const dailyIncome = transactions
             .filter(t => t.type === 'income' && t.date.getDate() === day && t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear())
            .reduce((sum, t) => sum + t.amount, 0);
          data.push({ name: dateStr, expenses: dailyExpenses, income: dailyIncome });
        }
      } else { // period === 'year'
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
             const monthlyExpenses = transactions
                .filter(t => t.type === 'expense' && t.date.getMonth() === monthIndex && t.date.getFullYear() === now.getFullYear())
                .reduce((sum, t) => sum + t.amount, 0);
             const monthlyIncome = transactions
                .filter(t => t.type === 'income' && t.date.getMonth() === monthIndex && t.date.getFullYear() === now.getFullYear())
                .reduce((sum, t) => sum + t.amount, 0);
             data.push({ name: months[monthIndex], expenses: monthlyExpenses, income: monthlyIncome });
         }
      }
      return data;
  }, [transactions]);

  // Calculate current bank balance based on *all* transactions
  const getCurrentBankBalance = useCallback(() => {
    const totalIncomeAllTime = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpensesAllTime = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return totalIncomeAllTime - totalExpensesAllTime;
  }, [transactions]);


  return {
    transactions,
    budgetGoals,
    addTransaction,
    deleteTransaction,
    updateBudgetGoal,
    getTotalIncome,
    getTotalExpenses,
    getExpensesByCategory,
    getSpendingOverTime,
    getCurrentBankBalance, // Expose the new function
    categories,
    getCategoryById,
    isLoaded, // Expose loading state
  };
}
