const supabase = require('../lib/supabaseClient');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header received:', authHeader);

  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token ? 'Present' : 'Missing');

  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    console.log('Supabase getUser result:', { user: user ? 'Present' : 'Null', error });

    if (error || !user) {
      console.log('Token verification failed:', error);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    console.log('Token verified successfully for user:', user.email);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
