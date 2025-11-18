// src/SupportChat.js
import React, { useState, useEffect, useRef } from 'react';
import './SupportChat.css';

const SupportChat = ({ orderId, onClose, exchangeData }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    const serverUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001'
    : 'https://0799a269ae88e6f622930debdf994027.serveo.net';

    useEffect(() => {
        console.log('💬 SupportChat mounted for order:', orderId);
        loadChatMessages();
        startPolling();
        return () => stopPolling();
    }, [orderId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    let pollingInterval;

    const startPolling = () => {
        pollingInterval = setInterval(loadChatMessages, 3000);
    };

    const stopPolling = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
    };

    const loadChatMessages = async () => {
        try {
            console.log('🔄 Loading chat messages for order:', orderId);
            const response = await fetch(`${serverUrl}/api/chat/messages/${orderId}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('📨 Chat messages loaded:', data);

            if (data.success) {
                setMessages(data.messages || []);
                setError('');
            } else {
                setError(data.error || 'Failed to load messages');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки чата:', error);
            setError('Connection error');
            
            // Demo messages for testing
            if (messages.length === 0) {
                setMessages([
                    {
                        id: 1,
                        text: '✅ Заявка создана успешно! Ожидайте подтверждения оплаты.',
                        sender: 'support',
                        timestamp: new Date().toISOString()
                    }
                ]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageToSend = {
            orderId: orderId,
            message: newMessage.trim(),
            sender: 'user'
        };

        try {
            console.log('📤 Sending message:', messageToSend);
            const response = await fetch(`${serverUrl}/api/chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageToSend)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Message sent:', data);

            if (data.success) {
                setNewMessage('');
                // Reload messages to get the new one
                loadChatMessages();
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
            alert('Ошибка отправки сообщения');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="support-chat-overlay">
            <div className="support-chat-container">
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-info">
                        <h3>💬 Чат поддержки</h3>
                        <div className="order-info">
                            <span className="order-id">Заявка: #{orderId}</span>
                            {exchangeData && (
                                <span className="order-details">
                                    {exchangeData.type === 'buy' ? 'Покупка' : 'Продажа'} {exchangeData.amount} {exchangeData.type === 'buy' ? 'RUB' : 'USDT'}
                                </span>
                            )}
                        </div>
                    </div>
                    <button className="close-chat-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {isLoading ? (
                        <div className="loading-messages">
                            <div className="loading-spinner">⏳</div>
                            <p>Загрузка сообщений...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <p>⚠️ {error}</p>
                            <button onClick={loadChatMessages}>Повторить</button>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="no-messages">
                            <p>Нет сообщений</p>
                            <p>Начните общение с поддержкой</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message ${message.sender === 'user' ? 'user-message' : 'support-message'}`}
                            >
                                <div className="message-content">
                                    <div className="message-text">{message.text}</div>
                                    <div className="message-time">
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                                <div className="message-sender">
                                    {message.sender === 'user' ? '👤 Вы' : '🛟 Поддержка'}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Введите сообщение..."
                            className="chat-input"
                            rows="1"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="send-button"
                        >
                            📤
                        </button>
                    </div>
                    <div className="chat-hint">
                        Нажмите Enter для отправки, Shift+Enter для новой строки
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportChat;