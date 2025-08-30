import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, ParsedTransaction, CategorySummary, FinancialSummary, TrendData } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabaseClient';

// API base URL - use environment variable or default to local backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  parseInput: (input: string) => Promise<ParsedTransaction>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getFinancialSummary: () => FinancialSummary;
  getCategorySummary: () => CategorySummary[];
  getTrendData: (days: number) => TrendData[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch transactions from backend when user changes
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setTransactions([]);
        return;
      }
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session data:', session);
        console.log('Access token:', session?.access_token);

        if (!session?.access_token) {
          throw new Error('No access token available');
        }
        const res = await fetch(`${API_BASE_URL}/api/transactions`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        console.log('Response status:', res.status);
        console.log('Response headers:', res.headers);
        if (!res.ok) {
          if (res.status === 403) {
            // Token expired or invalid, logout user
            await supabase.auth.signOut();
            setTransactions([]);
            return;
          }
          throw new Error('Failed to fetch transactions');
        }
        const data = await res.json();
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const parseInput = async (input: string): Promise<ParsedTransaction> => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No access token available');
      }
      const res = await fetch(`${API_BASE_URL}/api/transactions/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text: input }),
      });
      if (!res.ok) {
        if (res.status === 403) {
          await supabase.auth.signOut();
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to parse transaction');
      }
      const data = await res.json();
      return data.parsed;
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No access token available');
      }
      const res = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(transactionData),
      });
      if (!res.ok) {
        if (res.status === 403) {
          await supabase.auth.signOut();
          return;
        }
        throw new Error('Failed to add transaction');
      }
      const data = await res.json();
      setTransactions(prev => [data.transaction, ...prev]);
    } catch (error) {
      console.error('Add transaction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No access token available');
      }
      const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        if (res.status === 403) {
          await supabase.auth.signOut();
          return;
        }
        throw new Error('Failed to update transaction');
      }
      const data = await res.json();
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id ? data.transaction : transaction
        )
      );
    } catch (error) {
      console.error('Update transaction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No access token available');
      }
      const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 403) {
          await supabase.auth.signOut();
          return;
        }
        throw new Error('Failed to delete transaction');
      }
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (error) {
      console.error('Delete transaction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFinancialSummary = (): FinancialSummary => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses,
      transactionCount: transactions.length
    };
  };

  const getCategorySummary = (): CategorySummary[] => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = { amount: 0, count: 0 };
        }
        acc[category].amount += transaction.amount;
        acc[category].count += 1;
        return acc;
      }, {} as Record<string, { amount: number; count: number }>);

    const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0);

    return Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getTrendData = (days: number): TrendData[] => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    
    const trendData: TrendData[] = [];
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateString = currentDate.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => 
        t.date.startsWith(dateString)
      );
      
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      trendData.push({
        date: dateString,
        income,
        expenses,
        net: income - expenses
      });
    }
    
    return trendData;
  };

  const value = {
    transactions,
    loading,
    parseInput,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFinancialSummary,
    getCategorySummary,
    getTrendData
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
