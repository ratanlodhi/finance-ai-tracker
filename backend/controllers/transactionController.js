const supabase = require('../lib/supabaseClient');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function for retrying OpenAI calls with exponential backoff
async function retryOpenAICall(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (err.error && err.error.code === 'rate_limit_exceeded' && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limit exceeded, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

exports.parseTransaction = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text input is required' });
  }

  try {
    const prompt = "Parse the following transaction text into JSON with fields: amount (number), category (string), description (string), type ('income' or 'expense'), confidence (number between 0 and 1). If any field is missing or unclear, return null for that field.\n\nText: \"" + text + "\"\n\nOutput JSON:";

    const response = await retryOpenAICall(() => openai.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      store: true,
    }));

    let responseText = response.output_text.trim();

    // Remove markdown code blocks if present
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse AI response', details: responseText });
    }

    res.json({ parsed });
  } catch (err) {
    console.error('AI parsing error:', err);
    if (err.error && err.error.code === 'insufficient_quota') {
      res.status(429).json({ error: 'OpenAI quota exceeded. Please check your billing details.' });
    } else {
      res.status(500).json({ error: 'AI parsing failed' });
    }
  }
};

exports.createTransaction = async (req, res) => {
  const userId = req.user.id;
  const { amount, category, description, date, type } = req.body;

  if (amount == null || !category || !description || !type) {
    return res.status(400).json({ error: 'Amount, category, description, and type are required' });
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ user_id: userId, amount, category, description, date: date || new Date().toISOString(), type }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to create transaction', details: error });
    }

    res.status(201).json({ transaction: data });
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

exports.getTransactions = async (req, res) => {
  const userId = req.user.id;
  const { category, startDate, endDate } = req.query;

  try {
    let query = supabase.from('transactions').select('*').eq('user_id', userId);

    if (category) {
      query = query.eq('category', category);
    }
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    res.json({ transactions: data });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

exports.updateTransaction = async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;
  const { amount, category, description, date } = req.body;

  try {
    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('transactions')
      .select('user_id')
      .eq('id', transactionId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    if (existing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('transactions')
      .update({ amount, category, description, date })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update transaction' });
    }

    res.json({ transaction: data });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

exports.deleteTransaction = async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;

  try {
    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('transactions')
      .select('user_id')
      .eq('id', transactionId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    if (existing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete transaction' });
    }

    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};
