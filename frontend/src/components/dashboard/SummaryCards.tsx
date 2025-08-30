import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import { formatCurrency } from '@/lib/aiParser';

const SummaryCards: React.FC = () => {
  const { getFinancialSummary } = useTransactions();
  const summary = getFinancialSummary();

  const cards = [
    {
      title: 'Total Income',
      value: summary.totalIncome,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+12.5%'
    },
    {
      title: 'Total Expenses',
      value: summary.totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: '-3.2%'
    },
    {
      title: 'Net Savings',
      value: summary.savings,
      icon: PiggyBank,
      color: summary.savings >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: summary.savings >= 0 ? 'bg-blue-50' : 'bg-red-50',
      trend: summary.savings >= 0 ? '+8.1%' : '-5.3%'
    },
    {
      title: 'Transactions',
      value: summary.transactionCount,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: `${summary.transactionCount} total`,
      isCount: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">
                  {card.isCount ? card.value : formatCurrency(card.value)}
                </div>
                <p className={`text-xs ${card.color} font-medium`}>
                  {card.trend}
                </p>
              </div>
            </CardContent>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 pointer-events-none" />
          </Card>
        );
      })}
    </div>
  );
};

export default SummaryCards;