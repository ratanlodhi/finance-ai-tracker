import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import { ParsedTransaction } from '@/types';
import { formatCurrency } from '@/lib/aiParser';

const TransactionInput: React.FC = () => {
  const { parseInput, addTransaction, loading } = useTransactions();
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedTransaction | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const examples = [
    "Coffee at Starbucks $6.50",
    "Gas station $40",
    "Monthly salary $4500",
    "Grocery shopping $120"
  ];

  const handleParse = async () => {
    if (!input.trim()) return;

    try {
      const result = await parseInput(input);
      setParsedData(result);
      setIsConfirming(true);
    } catch (error) {
      console.error('Failed to parse transaction:', error);
    }
  };

  const handleConfirm = () => {
    if (!parsedData) return;

    addTransaction({
      amount: parsedData.amount,
      description: parsedData.description,
      category: parsedData.category,
      type: parsedData.type,
      date: new Date().toISOString().split('T')[0]
    });

    // Reset form
    setInput('');
    setParsedData(null);
    setIsConfirming(false);
  };

  const handleCancel = () => {
    setParsedData(null);
    setIsConfirming(false);
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Smart Transaction Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfirming ? (
          <>
            {/* Input Section */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your transaction in natural language..."
                  className="flex-1 h-12 text-base"
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleParse()}
                  disabled={loading}
                />
                <Button
                  onClick={handleParse}
                  disabled={!input.trim() || loading}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Examples */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {examples.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(example)}
                      className="text-xs h-8 px-3 hover:bg-blue-50 hover:border-blue-200"
                      disabled={loading}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Confirmation Section */
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Transaction Parsed Successfully</span>
            </div>

            {/* Parsed Data Display */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(parsedData!.amount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <Badge 
                    variant={parsedData!.type === 'income' ? 'default' : 'secondary'}
                    className={parsedData!.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {parsedData!.type.charAt(0).toUpperCase() + parsedData!.type.slice(1)}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900">{parsedData!.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-gray-900">{parsedData!.category}</p>
                </div>
                <Badge className={getConfidenceColor(parsedData!.confidence)}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {getConfidenceText(parsedData!.confidence)}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm & Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                Edit Details
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionInput;