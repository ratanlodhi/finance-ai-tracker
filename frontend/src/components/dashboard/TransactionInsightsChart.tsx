import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Area } from 'recharts';
import { useTransactions } from '@/contexts/TransactionContext';
import { formatCurrency } from '@/lib/aiParser';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

const TransactionInsightsChart: React.FC = () => {
  const { transactions, getTrendData } = useTransactions();
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Get transaction insights
  const getTransactionInsights = () => {
    const now = new Date();
    const insights = {
      totalTransactions: transactions.length,
      avgTransactionAmount: transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
        : 0,
      largestTransaction: transactions.length > 0
        ? Math.max(...transactions.map(t => t.amount))
        : 0,
      recentActivity: transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          const daysDiff = (now.getTime() - transactionDate.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 7;
        })
        .length
    };
    return insights;
  };

  const insights = getTransactionInsights();

  // Get daily transaction volume
  const getDailyVolume = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayTransactions = transactions.filter(t => t.date.startsWith(date));
      const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income,
        expenses,
        count: dayTransactions.length,
        net: income - expenses
      };
    });
  };

  const dailyData = getDailyVolume();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">
                {entry.dataKey === 'count' ? entry.value : formatCurrency(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (transactions.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Transaction Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center space-y-2">
              <TrendingUp className="h-12 w-12 mx-auto opacity-50" />
              <p>No transaction data available</p>
              <p className="text-sm">Add some transactions to see insights</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold">Transaction Insights</CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewType === 'daily' ? 'default' : 'outline'}
            onClick={() => setViewType('daily')}
          >
            Daily
          </Button>
          <Button
            size="sm"
            variant={viewType === 'weekly' ? 'default' : 'outline'}
            onClick={() => setViewType('weekly')}
          >
            Weekly
          </Button>
          <Button
            size="sm"
            variant={viewType === 'monthly' ? 'default' : 'outline'}
            onClick={() => setViewType('monthly')}
          >
            Monthly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <div className="text-sm text-gray-600">Avg Transaction</div>
            <div className="font-semibold text-blue-600">
              {formatCurrency(insights.avgTransactionAmount)}
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <div className="text-sm text-gray-600">Largest</div>
            <div className="font-semibold text-green-600">
              {formatCurrency(insights.largestTransaction)}
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-purple-600" />
            <div className="text-sm text-gray-600">This Week</div>
            <div className="font-semibold text-purple-600">
              {insights.recentActivity}
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {insights.totalTransactions}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        {/* Transaction Volume Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis
                yAxisId="amount"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                yAxisId="count"
                dataKey="count"
                fill="#E5E7EB"
                name="Transaction Count"
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="amount"
                type="monotone"
                dataKey="net"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Net Amount"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded" />
            <span className="text-gray-700">Transaction Count</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-gray-700">Net Amount</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionInsightsChart;
