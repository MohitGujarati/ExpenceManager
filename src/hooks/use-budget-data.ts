
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, setDoc, Timestamp, orderBy, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Import Firestore instance
import type { Transaction, BudgetGoal, Category } from '@/lib/types';
import { categories, getCategoryById } from '@/lib/categories';

// Helper to safely convert Firestore Timestamp to Date
const timestampToDate = (timestamp: Timestamp | Date): Date => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    return timestamp; // Already a Date object
};


export function useBudgetData(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [startingBalance, setStartingBalanceState] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false); // Track initial Firestore load


  // Ref to store unsubscribe functions
  const unsubscribeRefs = useRef<{ [key: string]: () => void }>({});

   // Function to unsubscribe from all listeners
   const unsubscribeAll = useCallback(() => {
    Object.values(unsubscribeRefs.current).forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = {};
   }, []);


  // Effect to fetch and subscribe to data when userId is available
  useEffect(() => {
     if (!userId) {
        // Clear data and unsubscribe if user logs out
        setTransactions([]);
        setBudgetGoals([]);
        setStartingBalanceState(0);
        setIsLoaded(false);
        setIsInitialLoadComplete(false);
        unsubscribeAll();
        return;
     }

     setIsLoaded(false); // Set loading state when user changes
     setIsInitialLoadComplete(false);

     const userDocRef = doc(db, 'users', userId);
     const transactionsColRef = collection(userDocRef, 'transactions');
     const settingsDocRef = doc(userDocRef, 'settings', 'appSettings'); // Single doc for settings

     let initialTransactionsLoaded = false;
     let initialSettingsLoaded = false;

     const checkInitialLoad = () => {
        if (initialTransactionsLoaded && initialSettingsLoaded) {
           setIsLoaded(true);
           setIsInitialLoadComplete(true);
        }
     };

     // Subscribe to Transactions
      const transactionsQuery = query(transactionsColRef, orderBy('date', 'desc'));
      const unsubscribeTransactions = onSnapshot(transactionsQuery, (querySnapshot) => {
        const fetchedTransactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedTransactions.push({
            ...data,
            id: doc.id,
            date: timestampToDate(data.date), // Convert Timestamp to Date
          } as Transaction);
        });
        setTransactions(fetchedTransactions);
         if (!initialTransactionsLoaded) {
            initialTransactionsLoaded = true;
            checkInitialLoad();
         }
      }, (error) => {
         console.error("Error fetching transactions:", error);
         // Handle error appropriately, maybe set an error state
          if (!initialTransactionsLoaded) {
             initialTransactionsLoaded = true; // Mark as loaded even on error to unblock UI
             checkInitialLoad();
         }
      });
      unsubscribeRefs.current['transactions'] = unsubscribeTransactions;


     // Subscribe to Settings (Starting Balance and Budget Goals)
      const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnapshot) => {
         if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setStartingBalanceState(data.startingBalance ?? 0);

            // Initialize budget goals if they don't exist in Firestore
            const firestoreGoals = data.budgetGoals ?? [];
            const allCategoryIds = categories.map(c => c.id);
            const updatedGoals = allCategoryIds.map(id => {
                const existingGoal = firestoreGoals.find((g: BudgetGoal) => g.categoryId === id);
                return existingGoal || { categoryId: id, amount: 0 };
            });
            setBudgetGoals(updatedGoals);

         } else {
            // Document doesn't exist, initialize with defaults
            setStartingBalanceState(0);
             const defaultGoals = categories.map(c => ({ categoryId: c.id, amount: 0 }));
             setBudgetGoals(defaultGoals);
             // Optionally create the settings document with defaults here
             setDoc(settingsDocRef, { startingBalance: 0, budgetGoals: defaultGoals }, { merge: true })
                 .catch(error => console.error("Error creating default settings:", error));
         }
          if (!initialSettingsLoaded) {
             initialSettingsLoaded = true;
             checkInitialLoad();
         }
      }, (error) => {
         console.error("Error fetching settings:", error);
         // Handle error, maybe set defaults
         setStartingBalanceState(0);
         setBudgetGoals(categories.map(c => ({ categoryId: c.id, amount: 0 })));
          if (!initialSettingsLoaded) {
             initialSettingsLoaded = true; // Mark as loaded even on error
             checkInitialLoad();
         }
      });
      unsubscribeRefs.current['settings'] = unsubscribeSettings;


    // Cleanup function
    return () => {
      unsubscribeAll();
    };
  }, [userId, unsubscribeAll]); // Rerun when userId changes


  // --- Firestore Update Functions ---

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    if (!userId) return;
    try {
      const userDocRef = doc(db, 'users', userId);
      const transactionsColRef = collection(userDocRef, 'transactions');
       // Convert Date back to Timestamp for Firestore
      await addDoc(transactionsColRef, { ...transaction, date: Timestamp.fromDate(transaction.date) });
    } catch (error) {
      console.error("Error adding transaction:", error);
      // Handle error (e.g., show toast)
    }
  }, [userId]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!userId) return;
    try {
        const userDocRef = doc(db, 'users', userId);
        const transactionDocRef = doc(userDocRef, 'transactions', id);
        await deleteDoc(transactionDocRef);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      // Handle error
    }
  }, [userId]);

  const updateStartingBalance = useCallback(async (newStartingBalance: number) => {
    if (!userId) return;
    try {
        const userDocRef = doc(db, 'users', userId);
        const settingsDocRef = doc(userDocRef, 'settings', 'appSettings');
        await setDoc(settingsDocRef, { startingBalance: newStartingBalance }, { merge: true }); // Use merge to only update this field
    } catch (error) {
        console.error("Error updating starting balance:", error);
        // Handle error
    }
  }, [userId]);

  const updateBudgetGoal = useCallback(async (categoryId: string, amount: number) => {
    if (!userId) return;
     // Optimistic UI update
     const previousGoals = budgetGoals;
     setBudgetGoals((prev) =>
         prev.map((goal) =>
             goal.categoryId === categoryId ? { ...goal, amount: Math.max(0, amount) } : goal
         )
     );

    try {
        const userDocRef = doc(db, 'users', userId);
        const settingsDocRef = doc(userDocRef, 'settings', 'appSettings');

        // Fetch current goals, update the specific one, then save
        const updatedGoalsArray = previousGoals.map((goal) =>
            goal.categoryId === categoryId ? { ...goal, amount: Math.max(0, amount) } : goal
         );
         // Ensure all categories have a goal entry before saving
         const allCategoryIds = categories.map(c => c.id);
         const finalGoals = allCategoryIds.map(id => {
             const existingGoal = updatedGoalsArray.find(g => g.categoryId === id);
             return existingGoal || { categoryId: id, amount: 0 };
         });


        await setDoc(settingsDocRef, { budgetGoals: finalGoals }, { merge: true });
    } catch (error) {
        console.error("Error updating budget goal:", error);
        setBudgetGoals(previousGoals); // Revert optimistic update on error
        // Handle error
    }
  }, [userId, budgetGoals]); // Include budgetGoals in dependencies


  // --- Calculation Functions (remain largely the same logic) ---

   const getTotalIncome = useCallback((month?: Date) => {
    const targetMonth = month ? month.getMonth() : new Date().getMonth();
    const targetYear = month ? month.getFullYear() : new Date().getFullYear();
    return transactions
      .filter(t => t.type === 'income' && timestampToDate(t.date).getMonth() === targetMonth && timestampToDate(t.date).getFullYear() === targetYear)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTotalExpenses = useCallback((month?: Date) => {
     const targetMonth = month ? month.getMonth() : new Date().getMonth();
     const targetYear = month ? month.getFullYear() : new Date().getFullYear();
    return transactions
      .filter(t => t.type === 'expense' && timestampToDate(t.date).getMonth() === targetMonth && timestampToDate(t.date).getFullYear() === targetYear)
      .reduce((sum, t) => sum + t.amount, 0);
   }, [transactions]);

   const getExpensesByCategory = useCallback((month?: Date) => {
     const targetMonth = month ? month.getMonth() : new Date().getMonth();
     const targetYear = month ? month.getFullYear() : new Date().getFullYear();
     const expenses = transactions.filter(t => t.type === 'expense' && timestampToDate(t.date).getMonth() === targetMonth && timestampToDate(t.date).getFullYear() === targetYear);
     const categoryMap = new Map<string, number>();

     expenses.forEach(expense => {
       const currentAmount = categoryMap.get(expense.categoryId) || 0;
       categoryMap.set(expense.categoryId, currentAmount + expense.amount);
     });

     return Array.from(categoryMap.entries()).map(([categoryId, amount]) => ({
       categoryId,
       amount,
       category: getCategoryById(categoryId) || categories.find(c => c.id === 'other')!,
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
                .filter(t => t.type === 'expense' && timestampToDate(t.date).getDate() === day && timestampToDate(t.date).getMonth() === now.getMonth() && timestampToDate(t.date).getFullYear() === now.getFullYear())
                .reduce((sum, t) => sum + t.amount, 0);
           const dailyIncome = transactions
                .filter(t => t.type === 'income' && timestampToDate(t.date).getDate() === day && timestampToDate(t.date).getMonth() === now.getMonth() && timestampToDate(t.date).getFullYear() === now.getFullYear())
                .reduce((sum, t) => sum + t.amount, 0);
          data.push({ name: dateStr, expenses: dailyExpenses, income: dailyIncome });
        }
      } else { // period === 'year'
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
             const monthlyExpenses = transactions
                .filter(t => t.type === 'expense' && timestampToDate(t.date).getMonth() === monthIndex && timestampToDate(t.date).getFullYear() === now.getFullYear())
                .reduce((sum, t) => sum + t.amount, 0);
             const monthlyIncome = transactions
                .filter(t => t.type === 'income' && timestampToDate(t.date).getMonth() === monthIndex && timestampToDate(t.date).getFullYear() === now.getFullYear())
                .reduce((sum, t) => sum + t.amount, 0);
             data.push({ name: months[monthIndex], expenses: monthlyExpenses, income: monthlyIncome });
         }
      }
      return data;
  }, [transactions]);

  const getCurrentBankBalance = useCallback(() => {
    // Calculate based *only* on the transactions stored in Firestore for this user
    // This assumes the starting balance is the anchor point.
    const totalIncomeAllTime = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpensesAllTime = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return startingBalance + totalIncomeAllTime - totalExpensesAllTime;
  }, [transactions, startingBalance]);


  return {
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
    categories,
    getCategoryById,
    isLoaded: isLoaded && isInitialLoadComplete, // Ensure both localStorage (if any) and Firestore initial loads are done
  };
}
