import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, ParsedTransaction, CategorySummary, FinancialSummary, TrendData } from '@/types';
import { parseTransaction, generateTransactionId } from '@/lib/aiParser';
import { useAuth } from './AuthContext';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  parseInput: (input: string) => Promise<ParsedTransaction>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getFinancialSummary: () => FinancialSummary;
  getCategorySummary: () => CategorySummary[];
  getTrendData: (days: number) => TrendData[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Load transactions from localStorage when user changes
  useEffect(() => {
    if (user) {
      const storedTransactions = localStorage.getItem('finance_transactions');
      if (storedTransactions) {
        try {
          const parsed = JSON.parse(storedTransactions);
          setTransactions(parsed.filter((t: Transaction) => t.userId === user.id));
        } catch (error) {
          console.error('Failed to parse stored transactions:', error);
        }
      }
    } else {
      setTransactions([]);
    }
  }, [user]);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (user && transactions.length >= 0) {
      const allTransactions = JSON.parse(localStorage.getItem('finance_transactions') || '[]');
      const otherUserTransactions = allTransactions.filter((t: Transaction) => t.userId !== user.id);
      const updatedTransactions = [...otherUserTransactions, ...transactions];
      localStorage.setItem('finance_transactions', JSON.stringify(updatedTransactions));
    }
  }, [transactions, user]);

  const parseInput = async (input: string): Promise<ParsedTransaction> => {
    setLoading(true);
    try {
      return await parseTransaction(input);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const newTransaction: Transaction = {
      ...transactionData,
      id: generateTransactionId(),
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id ? { ...transaction, ...updates } : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
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