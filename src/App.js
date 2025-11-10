import React from 'react';

function App() {
  console.log('App component rendered');
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      backgroundColor: '#28a745',
      color: 'white',
      minHeight: '100vh',
      fontSize: '24px'
    }}>
      <h1>✅ TETHERBOT РАБОТАЕТ!</h1>
      <p>Если видишь этот текст - React работает</p>
      <button 
        style={{ padding: '15px 30px', fontSize: '18px' }}
        onClick={() => alert('КНОПКА РАБОТАЕТ!')}
      >
        Тестовая кнопка
      </button>
    </div>
  );
}

export default App;