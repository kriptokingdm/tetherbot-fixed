export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    
    console.log('🔐 Login attempt:', { username });
    
    // Заглушка - всегда успешный логин
    res.status(200).json({
      success: true,
      user: {
        id: '1',
        username: username,
        email: `${username}@tetherbot.com`
      },
      token: 'vercel-login-token-' + Date.now()
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
}