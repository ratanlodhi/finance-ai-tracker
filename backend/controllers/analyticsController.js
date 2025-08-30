const supabase = require('../lib/supabaseClient');

exports.getSummary = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { data: incomeData, error: incomeError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .gte('amount', 0);

    if (incomeError) {
      return res.status(500).json({ error: 'Failed to fetch income data' });
    }

    const { data: expenseData, error: expenseError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .lt('amount', 0);

    if (expenseError) {
      return res.status(500).json({ error: 'Failed to fetch expense data' });
    }

    const totalIncome = incomeData.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseData.reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome + totalExpenses; // expenses are negative

    res.json({
      totalIncome,
      totalExpenses,
      netSavings,
    });
  } catch (err) {
    console.error('Get summary error:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

exports.getCategories = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('category, amount');

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch categories data' });
    }

    // Aggregate spending by category
    const categoryMap = {};
    data.forEach((t) => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += t.amount;
    });

    res.json({ categories: categoryMap });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

exports.getTrends = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('date, amount');

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch trends data' });
    }

    // Aggregate spending by date (YYYY-MM-DD)
    const trendMap = {};
    data.forEach((t) => {
      const dateKey = t.date ? t.date.substring(0, 10) : 'unknown';
      if (!trendMap[dateKey]) {
        trendMap[dateKey] = 0;
      }
      trendMap[dateKey] += t.amount;
    });

    res.json({ trends: trendMap });
  } catch (err) {
    console.error('Get trends error:', err);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
};
