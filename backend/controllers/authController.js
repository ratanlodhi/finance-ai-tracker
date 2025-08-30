const supabase = require('../lib/supabaseClient');

exports.verifyToken = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Check if user exists in users table
    let { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!dbUser) {
      // Insert new user if not exists
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          picture: user.user_metadata?.avatar_url || 'https://via.placeholder.com/40x40?text=U'
        }])
        .select()
        .single();

      if (insertError) {
        return res.status(500).json({ error: 'Failed to create user' });
      }
      dbUser = data;
    }

    res.json({ user: { id: dbUser.id, email: dbUser.email, name: dbUser.name, picture: dbUser.picture } });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

exports.logout = (req, res) => {
  // Logout handled client-side with Supabase
  res.json({ message: 'Logged out successfully' });
};

exports.getProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('id, email, name, picture')
      .eq('id', user.id)
      .single();

    if (dbError) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: dbUser });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(403).json({ error: 'Invalid token' });
  }
};
