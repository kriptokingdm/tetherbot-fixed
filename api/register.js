export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, email } = req.body;
    
    console.log('📝 Registration attempt:', { username, email });
    
    // Здесь будет логика регистрации
    // Пока заглушка
    res.status(200).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: Math.random().toString(36).substr(2, 9),
        username: username,
        email: email
      },
      token: 'vercel-token-' + Date.now()
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed' 
    });
  }
}