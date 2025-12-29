import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Home from './Home';
import History from './History';
import Profile from './Profile';
import Help from './Help';
import SettingsApp from './SettingsApp';
import { ProfileIcon, ExchangeIcon, HistoryIcon } from './NavIcons';

// URL API
const API_BASE_URL = 'https://tethrab.shop';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [telegramUser, setTelegramUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);
  const [toast, setToast] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Определяем темную тему
  const detectDarkMode = useCallback(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme === 'dark';
    }
    
    // По умолчанию - темная тема
    return true;
  }, []);

  // Простая функция применения темы
  const applyTheme = useCallback(() => {
    const root = document.documentElement;
    const darkMode = detectDarkMode();
    setIsDarkMode(darkMode);
    
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
      root.style.setProperty('--tg-theme-bg-color', '#1a1d21');
      root.style.setProperty('--tg-theme-text-color', '#ffffff');
      root.style.setProperty('--tg-theme-button-color', '#3390ec');
    } else {
      root.removeAttribute('data-theme');
      root.style.setProperty('--tg-theme-bg-color', '#ffffff');
      root.style.setProperty('--tg-theme-text-color', '#000000');
      root.style.setProperty('--tg-theme-button-color', '#3390ec');
    }
  }, [detectDarkMode]);

  // Переключение темы
  const toggleTheme = useCallback(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    localStorage.setItem('theme', newTheme);
    const darkMode = newTheme === 'dark';
    setIsDarkMode(darkMode);
    applyTheme();
    
    showToast(`Тема изменена на ${darkMode ? 'тёмную' : 'светлую'}`, 'success');
  }, [applyTheme, showToast]);

  // Показ уведомлений
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Загрузка реферальных данных (с обработкой ошибок)
  const loadReferralData = useCallback(async () => {
    try {
      const userId = getUserId();
      console.log('📡 Загрузка реферальных данных для ID:', userId);
      
      // Используем AbortController для избежания утечек памяти
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
      
      const response = await fetch(`${API_BASE_URL}/api/referrals/info/${userId}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setReferralData(result.data);
        }
      }
    } catch (error) {
      // Игнорируем ошибки загрузки реферальных данных
      console.warn('⚠️ Ошибка загрузки реферальных данных (не критично):', error.message);
    }
  }, []);

  // Получение ID пользователя
  const getUserId = () => {
    try {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        const tgUser = tg.initDataUnsafe?.user;
        if (tgUser?.id) return tgUser.id.toString();
      }

      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed.telegramId?.toString() || parsed.id?.toString();
      }

      return '7879866656';
    } catch (error) {
      return '7879866656';
    }
  };

  // Навигация с управлением кнопкой "Назад"
  const navigateTo = useCallback((page) => {
    if (page === currentPage) return;
    
    console.log(`➡️ Переход на страницу: ${page}`);
    window.location.hash = page;
    setCurrentPage(page);
    
    // Управляем встроенной кнопкой "Назад" Telegram
    if (window.Telegram?.WebApp?.BackButton) {
      const tg = window.Telegram.WebApp;
      
      try {
        if (page === 'home') {
          // На главной странице скрываем кнопку "Назад"
          tg.BackButton.hide();
        } else {
          // На других страницах показываем кнопку "Назад"
          tg.BackButton.show();
        }
      } catch (e) {
        console.log('BackButton не поддерживается в этой версии');
      }
    }
  }, [currentPage]);

  // Инициализация Telegram WebApp
  const initTelegramWebApp = useCallback(() => {
    console.log('🤖 Инициализация Telegram WebApp...');
    
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      try {
        tg.ready();
        tg.expand();
        
        console.log('📱 Версия Telegram WebApp:', tg.version);
        
        // ================================
        // 🔙 ВСТРОЕННАЯ КНОПКА "НАЗАД"
        // ================================
        if (tg.BackButton) {
          console.log('🔙 BackButton доступна');
          
          // Настраиваем обработчик нажатия кнопки "Назад"
          tg.BackButton.onClick(() => {
            console.log('⬅️ Нажата встроенная кнопка "Назад"');
            navigateTo('home');
          });
          
          // Изначально скрываем кнопку (мы на главной)
          if (currentPage === 'home') {
            try {
              tg.BackButton.hide();
            } catch (e) {
              // Игнорируем ошибку если метод не поддерживается
            }
          }
        } else {
          console.log('⚠️ BackButton не доступна в этой версии');
        }
        
        // ================================
        // ⚙️ ВСТРОЕННАЯ КНОПКА НАСТРОЕК (⋮)
        // ================================
        if (tg.SettingsButton) {
          console.log('⚙️ SettingsButton доступна');
          
          // Показываем кнопку в меню "три точки"
          tg.SettingsButton.show();
          
          // Обработчик клика
          tg.SettingsButton.onClick(() => {
            console.log('⚙️ Нажата кнопка Настройки (⋮)');
            navigateTo('settings');
          });
          
        } else {
          console.log('⚠️ SettingsButton не поддерживается в этой версии Telegram');
          
          // Фолбэк — сообщаем пользователю
          setTimeout(() => {
            showToast('Настройки доступны в профиле 👤', 'info');
          }, 1500);
        }
        
      } catch (error) {
        console.error('❌ Ошибка инициализации Telegram:', error);
      }
      
      // Инициализация пользователя
      if (tg.initDataUnsafe?.user) {
        const tgUser = tg.initDataUnsafe.user;
        const userData = {
          id: tgUser.id.toString(),
          telegramId: tgUser.id,
          username: tgUser.username || `user_${tgUser.id}`,
          firstName: tgUser.first_name || 'Пользователь',
          photoUrl: tgUser.photo_url || null
        };
        
        setTelegramUser(userData);
        localStorage.setItem('telegramUser', JSON.stringify(userData));
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        setTimeout(() => {
          showToast(`Добро пожаловать, ${userData.firstName}! 👋`, 'success');
        }, 1000);
      }
      
      console.log('✅ Telegram WebApp инициализирован');
    } else {
      // Режим разработки
      console.log('💻 Режим разработки');
      
      const devUser = {
        id: '7879866656',
        telegramId: '7879866656',
        username: 'test_user',
        firstName: 'Тестовый',
        photoUrl: null
      };
      
      setTelegramUser(devUser);
      localStorage.setItem('currentUser', JSON.stringify(devUser));
    }
    
    applyTheme();
  }, [applyTheme, showToast, navigateTo, currentPage]);

  // Инициализация приложения (один раз!)
  useEffect(() => {
    if (initialized) return;
    
    console.log('🚀 Инициализация TetherRabbit...');
    
    const initApp = async () => {
      try {
        // Устанавливаем пользователя по умолчанию
        const debugUser = {
          id: '7879866656',
          telegramId: '7879866656',
          username: 'TERBCEO',
          firstName: 'G'
        };
        
        if (!localStorage.getItem('currentUser')) {
          localStorage.setItem('currentUser', JSON.stringify(debugUser));
        }
        
        // Проверяем hash URL
        const hash = window.location.hash.replace('#', '');
        if (hash && ['home', 'profile', 'history', 'help', 'settings'].includes(hash)) {
          setCurrentPage(hash);
        }
        
        // Инициализируем Telegram
        initTelegramWebApp();
        
        // Загружаем реферальные данные в фоне
        setTimeout(() => {
          loadReferralData();
        }, 300);
        
        // Завершаем загрузку
        setTimeout(() => {
          setIsLoading(false);
          setInitialized(true);
          console.log('✅ Инициализация завершена');
        }, 800);
        
      } catch (error) {
        console.error('❌ Критическая ошибка инициализации:', error);
        setIsLoading(false);
        setInitialized(true);
      }
    };
    
    initApp();
  }, [initTelegramWebApp, loadReferralData, initialized]);

  // Рендер страниц
  const renderPage = () => {
    const commonProps = {
      telegramUser: telegramUser,
      navigateTo: navigateTo,
      API_BASE_URL: API_BASE_URL,
      showToast: showToast,
      toggleTheme: toggleTheme,
      isDarkMode: isDarkMode
    };
    
    switch(currentPage) {
      case 'history': 
        return <History key="history" {...commonProps} />;
      case 'profile': 
        return <Profile key="profile" {...commonProps} />;
      case 'help': 
        return <Help key="help" {...commonProps} />;
      case 'settings':
        return <SettingsApp key="settings" {...commonProps} />;
      default: 
        return <Home key="home" {...commonProps} />;
    }
  };

  // Плавающая навигация
  const Navigation = () => {
    const availableEarnings = referralData?.stats?.available_earnings || 0;
    const showBadge = availableEarnings >= 10;
    
    return (
      <div className="floating-nav">
        <button 
          className={`nav-item-floating ${currentPage === 'profile' ? 'active' : ''}`} 
          onClick={() => navigateTo('profile')}
          aria-label="Профиль"
        >
          <div className="nav-icon-floating">
            <ProfileIcon active={currentPage === 'profile'} />
          </div>
          <span className="nav-label-floating">Профиль</span>
          {showBadge && (
            <span className="nav-badge-floating">
              ${availableEarnings.toFixed(0)}
            </span>
          )}
        </button>
        
        <div className="nav-center-floating">
          <button 
            className="nav-center-circle-floating" 
            onClick={() => navigateTo('home')}
            aria-label="Обмен"
          >
            <ExchangeIcon active={true} />
          </button>
          <span className="nav-center-label-floating">Обмен</span>
        </div>
        
        <button 
          className={`nav-item-floating ${currentPage === 'history' ? 'active' : ''}`} 
          onClick={() => navigateTo('history')}
          aria-label="История"
        >
          <div className="nav-icon-floating">
            <HistoryIcon active={currentPage === 'history'} />
          </div>
          <span className="nav-label-floating">История</span>
        </button>
      </div>
    );
  };

  // Лоадер
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка TetherRabbit...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-wrapper">
        <div className="app-content">
          {renderPage()}
          {currentPage !== 'help' && currentPage !== 'settings' && <Navigation />}
          
          {toast && (
            <div className={`telegram-toast ${toast.type}`}>
              <span className="telegram-toast-icon">
                {toast.type === 'success' ? '✅' :
                 toast.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span className="telegram-toast-text">{toast.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
