import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatUI from './ChatUI';

// Automatically detect API URL based on environment
const getApiUrl = () => {
  // If REACT_APP_API_URL is explicitly set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // In production (Vercel), use relative URL to same domain
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  // Development fallback
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiUrl();

function App() {
  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load chat history and current chat from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed);
      }

      const savedCurrentChat = localStorage.getItem('currentChatId');
      if (savedCurrentChat) {
        const chatId = savedCurrentChat;
        setCurrentChatId(chatId);
        
        // Load messages for current chat
        const savedMessages = localStorage.getItem(`chatMessages_${chatId}`);
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed);
        }
      } else {
        // If no current chat, create a new one
        const newChatId = `chat_${Date.now()}`;
        setCurrentChatId(newChatId);
        localStorage.setItem('currentChatId', newChatId);
      }
    } catch (err) {
      // Ignore parse errors
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      localStorage.setItem(`chatMessages_${currentChatId}`, JSON.stringify(messages));
      
      // Update chat history with latest message preview
      const lastMessage = messages[messages.length - 1];
      const chatTitle = messages.length > 0 
        ? (messages[0].text.substring(0, 50) + (messages[0].text.length > 50 ? '...' : ''))
        : 'New Chat';
      
      setChatHistory(prev => {
        const updated = prev.filter(chat => chat.id !== currentChatId);
        const updatedChat = {
          id: currentChatId,
          title: chatTitle,
          messageCount: messages.length,
          lastMessage: lastMessage.text.substring(0, 100),
          timestamp: lastMessage.timestamp || new Date().toISOString()
        };
        // Sort by timestamp (most recent first) and keep last 20 chats
        return [updatedChat, ...updated]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 20);
      });
    }
  }, [messages, currentChatId]);

  // Save chat history to localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleSendMessage = async (messageData) => {
    const text = typeof messageData === 'string' ? messageData : messageData.text || '';
    const attachments = typeof messageData === 'object' ? (messageData.attachments || []) : [];
    
    if ((!text.trim() && attachments.length === 0) || isLoading) return;

    // Prepare attachments for storage (convert File objects to URLs)
    const attachmentData = attachments.map(att => ({
      id: att.id,
      type: att.type,
      name: att.name,
      size: att.size,
      url: att.url || URL.createObjectURL(att.file)
    }));

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      attachments: attachmentData.length > 0 ? attachmentData : undefined
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData if there are attachments
      let requestData;
      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append('message', text.trim() || '');
        attachments.forEach((att, idx) => {
          formData.append(`attachment_${idx}`, att.file);
          formData.append(`attachment_${idx}_type`, att.type);
        });
        requestData = formData;
      } else {
        requestData = { message: text.trim() };
      }

      const response = await axios.post(`${API_BASE_URL}/api/chat`, requestData, 
        attachments.length > 0 ? {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } : {}
      );

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        note: response.data.note || null
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    setCurrentChatId(newChatId);
    setMessages([]);
    setError(null);
    localStorage.setItem('currentChatId', newChatId);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    setError(null);
    localStorage.setItem('currentChatId', chatId);
    
    // Load messages for selected chat
    const savedMessages = localStorage.getItem(`chatMessages_${chatId}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (err) {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    if (currentChatId) {
      localStorage.removeItem(`chatMessages_${currentChatId}`);
      setChatHistory(prev => prev.filter(chat => chat.id !== currentChatId));
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleDeleteChat = (chatId) => {
    // Remove chat messages from localStorage
    localStorage.removeItem(`chatMessages_${chatId}`);
    
    // Remove from chat history
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    
    // If deleted chat was current, create a new one
    if (chatId === currentChatId) {
      const newChatId = `chat_${Date.now()}`;
      setCurrentChatId(newChatId);
      setMessages([]);
      setError(null);
      localStorage.setItem('currentChatId', newChatId);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleDeleteAllChats = () => {
    if (window.confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
      // Get all chat IDs from history
      const chatIds = chatHistory.map(chat => chat.id);
      
      // Remove all chat messages from localStorage
      chatIds.forEach(chatId => {
        localStorage.removeItem(`chatMessages_${chatId}`);
      });
      
      // Clear chat history
      localStorage.removeItem('chatHistory');
      setChatHistory([]);
      
      // Create a new chat
      const newChatId = `chat_${Date.now()}`;
      setCurrentChatId(newChatId);
      setMessages([]);
      setError(null);
      localStorage.setItem('currentChatId', newChatId);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleEditMessage = async (messageId, newText) => {
    // Find the message and all subsequent messages (user and AI)
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Update the message text
    const updatedMessages = messages.map((msg, idx) => {
      if (idx === messageIndex) {
        return { ...msg, text: newText, timestamp: new Date().toISOString() };
      }
      return msg;
    });

    // Remove all messages after the edited message (including any AI response)
    const trimmedMessages = updatedMessages.slice(0, messageIndex + 1);
    
    // Update messages state
    setMessages(trimmedMessages);
    setIsLoading(true);
    setError(null);
    
    // Send the edited message to get a new AI response
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, { 
        message: newText.trim() 
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        note: response.data.note || null
      };

      // Add only the AI response (user message is already updated in place)
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatUI
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      error={error}
      onNewChat={handleNewChat}
      onClearChat={handleClearChat}
      chatHistory={chatHistory}
      onSelectChat={handleSelectChat}
      currentChatId={currentChatId}
      onDeleteChat={handleDeleteChat}
      onDeleteAllChats={handleDeleteAllChats}
      onEditMessage={handleEditMessage}
    />
  );
}

export default App;
