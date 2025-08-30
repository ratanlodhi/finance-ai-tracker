import { ParsedTransaction, CATEGORIES } from '@/types';

// Mock AI parser - in production this would call OpenAI/Gemini API
export const parseTransaction = async (input: string): Promise<ParsedTransaction> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const text = input.toLowerCase().trim();
  
  // Extract amount using regex
  const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
  
  // Determine transaction type
  const incomeKeywords = ['salary', 'paid', 'income', 'bonus', 'refund'];
  const isIncome = incomeKeywords.some(keyword => text.includes(keyword));
  
  // Category mapping based on keywords
  const categoryMap: Record<string, string> = {
    'coffee': 'Food & Dining',
    'starbucks': 'Food & Dining',
    'restaurant': 'Food & Dining',
    'food': 'Food & Dining',
    'lunch': 'Food & Dining',
    'dinner': 'Food & Dining',
    'panda express': 'Food & Dining',
    'gas': 'Transportation',
    'uber': 'Transportation',
    'lyft': 'Transportation',
    'amazon': 'Shopping',
    'target': 'Shopping',
    'walmart': 'Shopping',
    'grocery': 'Shopping',
    'whole foods': 'Shopping',
    'netflix': 'Entertainment',
    'spotify': 'Entertainment',
    'movie': 'Entertainment',
    'samsung': 'Shopping',
    'electronics': 'Shopping',
    'watch': 'Shopping',
    'salary': 'Income',
    'paid': 'Income',
    'paycheck': 'Income'
  };
  
  // Find matching category
  let category = 'Other';
  let confidence = 0.6;
  
  for (const [keyword, cat] of Object.entries(categoryMap)) {
    if (text.includes(keyword)) {
      category = cat;
      confidence = 0.9;
      break;
    }
  }
  
  // If it's income, override category
  if (isIncome) {
    category = 'Income';
    confidence = 0.95;
  }
  
  // Clean up description
  const description = input
    .replace(/\$?\d+(?:\.\d{2})?/g, '') // Remove amount
    .replace(/[-–—]/g, '') // Remove dashes
    .trim()
    .replace(/\s+/g, ' ') // Normalize spaces
    || 'Transaction';
  
  return {
    amount,
    description: description.charAt(0).toUpperCase() + description.slice(1),
    category,
    type: isIncome ? 'income' : 'expense',
    confidence
  };
};

export const generateTransactionId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};