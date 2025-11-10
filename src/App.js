// src/App.js
import React from 'react';

function App() {
  return React.createElement('div', { 
    style: { 
      padding: '50px', 
      textAlign: 'center',
      backgroundColor: '#007cff',
      color: 'white',
      minHeight: '100vh'
    } 
  }, 
    React.createElement('h1', null, '🎉 TETHERBOT РАБОТАЕТ!'),
    React.createElement('p', null, 'React успешно загружен!'),
    React.createElement('button', {
      onClick: () => alert('Кнопка работает!')
    }, 'Тестовая кнопка')
  );
}

export default App;