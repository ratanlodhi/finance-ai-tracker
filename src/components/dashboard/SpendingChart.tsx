import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTransactions } from '@/contexts/TransactionContext';
import { formatCurrency } from '@/lib/aiParser';

const COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280'  // Gray
];

const SpendingChart: React.FC = () => {
  const { getCategorySummary } = useTransactions();
  const categoryData = getCategorySummary();

  if (categoryData.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center space-y-2">
              <PieChart className="h-12 w-12 mx-auto opacity-50" />
              <p>No expense data available</p>
              <p className="text-sm">Add some transactions to see your spending breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = categoryData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.category}</p>
          <p className="text-sm text-gray-600">
            Amount: <span className="font-medium">{formatCurrency(data.amount)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
          </p>
          <p className="text-sm text-gray-600">
            Transactions: <span className="font-medium">{data.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }} className="text-sm">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Category breakdown */}
        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
          {chartData.slice(0, 5).map((category, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.fill }}
                />
                <span className="text-gray-700">{category.category}</span>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {formatCurrency(category.amount)}
                </div>
                <div className="text-xs text-gray-500">
                  {category.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingChart;