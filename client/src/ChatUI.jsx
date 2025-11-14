import React, { useState, useEffect, useRef } from 'react';

/**
 * ChatGPT-like UI Component
 * Single-file React component with embedded styles
 * 
 * Features:
 * - Left collapsible sidebar
 * - Chat-centered layout
 * - Message bubbles with animations
 * - Typing indicator
 * - Mobile responsive
 * - Accessibility features
 */

const ChatUI = ({ 
  messages = [], 
  onSendMessage, 
  isLoading = false,
  error = null,
  onClearChat = () => {},
  onNewChat = () => {},
  chatHistory = [],
  onSelectChat = () => {},
  currentChatId = null,
  onFileUpload = () => {},
  onDeleteChat = () => {},
  onDeleteAllChats = () => {},
  onEditMessage = () => {}
}) => {
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [editingMessageId, setEditingMessageId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const videoStreamRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close upload menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUploadMenu && !event.target.closest('.input-actions')) {
        setShowUploadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUploadMenu]);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    
    const messageData = {
      text: input.trim(),
      attachments: attachments
    };
    
    onSendMessage(messageData);
    setInput('');
    setAttachments([]);
  };

  // File upload handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('audio/') ? 'audio' : 
            file.type.startsWith('video/') ? 'video' : 'file',
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    setShowUploadMenu(false);
  };

  // Camera capture using MediaDevices API
  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera
      });
      videoStreamRef.current = stream;
      
      // Show a simple modal to capture photo
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;
      
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.style.cssText = 'max-width: 90%; max-height: 70%; border-radius: 8px;';
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = 'margin-top: 20px; display: flex; gap: 10px;';
      
      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capture Photo';
      captureBtn.style.cssText = `
        padding: 12px 24px;
        background: #10a37f;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
      `;
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.cssText = `
        padding: 12px 24px;
        background: #444654;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
      `;
      
      const capturePhoto = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const attachment = {
              id: Date.now(),
              file: file,
              type: 'image',
              name: file.name,
              size: file.size,
              url: URL.createObjectURL(file)
            };
            setAttachments(prev => [...prev, attachment]);
          }
          
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
          setShowUploadMenu(false);
        }, 'image/jpeg', 0.9);
      };
      
      const cancelCapture = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
        setShowUploadMenu(false);
      };
      
      captureBtn.onclick = capturePhoto;
      cancelBtn.onclick = cancelCapture;
      
      buttonContainer.appendChild(captureBtn);
      buttonContainer.appendChild(cancelBtn);
      modal.appendChild(videoElement);
      modal.appendChild(buttonContainer);
      document.body.appendChild(modal);
      
    } catch (err) {
      alert('Error accessing camera: ' + err.message);
      setShowUploadMenu(false);
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const removed = prev.find(a => a.id === id);
      if (removed && removed.url) {
        URL.revokeObjectURL(removed.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        
        const attachment = {
          id: Date.now(),
          file: audioFile,
          type: 'audio',
          name: audioFile.name,
          size: audioFile.size,
          url: URL.createObjectURL(audioFile)
        };
        setAttachments(prev => [...prev, attachment]);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setShowUploadMenu(false);
    } catch (err) {
      alert('Error accessing microphone: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Speech-to-text handlers using Web Speech API
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setShowUploadMenu(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access.');
      } else {
        alert('Speech recognition error: ' + event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Copy message to clipboard
  // eslint-disable-next-line no-unused-vars
  const handleCopyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Message copied successfully
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Start editing a message
  // eslint-disable-next-line no-unused-vars
  const startEditing = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditText(currentText);
  };

  // Save edited message
  // eslint-disable-next-line no-unused-vars
  const saveEdit = () => {
    if (editText.trim() && editingMessageId) {
      onEditMessage(editingMessageId, editText.trim());
      setEditingMessageId(null);
      setEditText('');
    }
  };

  // Cancel editing
  // eslint-disable-next-line no-unused-vars
  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg, idx) => {
    const date = formatDate(msg.timestamp);
    const prevDate = idx > 0 ? formatDate(messages[idx - 1].timestamp) : null;
    
    if (date !== prevDate) {
      acc.push({ type: 'date', content: date, id: `date-${idx}` });
    }
    acc.push(msg);
    return acc;
  }, []);

  return (
    <>
      <style>{`
        :root {
          --bg-primary: #343541;
          --bg-secondary: #202123;
          --bg-tertiary: #40414f;
          --bg-message-user: #10a37f;
          --bg-message-assistant: #444654;
          --text-primary: #ececf1;
          --text-secondary: #8e8ea0;
          --border-color: #565869;
          --hover-bg: #2f303e;
          --focus-ring: #10a37f;
          --error-bg: #fee2e2;
          --error-text: #dc2626;
          --warning-bg: #fef3c7;
          --warning-text: #d97706;
        }

        * {
          box-sizing: border-box;
        }

        .chat-ui-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          display: flex;
          height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          overflow: hidden;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-color);
          transition: transform 0.3s ease;
        }

        .sidebar.closed {
          transform: translateX(-100%);
        }

        .sidebar-header {
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .new-chat-btn {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .new-chat-btn:hover {
          background: var(--hover-bg);
        }

        .new-chat-btn:focus {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .sidebar-item {
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 14px;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-item:hover {
          background: var(--hover-bg);
        }

        .sidebar-toggle {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 100;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: var(--text-primary);
          display: none;
        }

        .sidebar-toggle:focus {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        /* Main Chat Area */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .chat-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-secondary);
        }

        .chat-title {
          font-size: 16px;
          font-weight: 600;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px 0;
        }

        .message-group {
          margin-bottom: 24px;
        }

        .date-divider {
          text-align: center;
          color: var(--text-secondary);
          font-size: 12px;
          padding: 16px 0;
          position: relative;
        }

        .date-divider::before,
        .date-divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 30%;
          height: 1px;
          background: var(--border-color);
        }

        .date-divider::before {
          left: 0;
        }

        .date-divider::after {
          right: 0;
        }

        .message-wrapper {
          display: flex;
          padding: 16px 0;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-wrapper.user {
          justify-content: flex-end;
        }

        .message-wrapper.assistant {
          justify-content: flex-start;
        }

        .message-content {
          max-width: 65%;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .message-wrapper.user .message-content {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .message-wrapper.user .message-avatar {
          background: var(--bg-message-user);
        }

        .message-wrapper.assistant .message-avatar {
          background: var(--bg-tertiary);
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 12px;
          line-height: 1.6;
          font-size: 15px;
          word-wrap: break-word;
          position: relative;
        }

        .message-wrapper.user .message-bubble {
          background: var(--bg-message-user);
          color: white;
        }

        .message-wrapper.assistant .message-bubble {
          background: var(--bg-message-assistant);
          color: var(--text-primary);
        }

        .message-text {
          margin: 0;
          white-space: pre-wrap;
        }

        .message-note {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          font-style: italic;
          opacity: 0.8;
        }

        .message-time {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .code-block {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin: 8px 0;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          overflow-x: auto;
          position: relative;
        }

        .code-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .copy-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 4px 8px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-secondary);
          animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        /* Input Area */
        .input-container {
          padding: 16px;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-color);
        }

        .input-wrapper {
          max-width: 768px;
          margin: 0 auto;
          position: relative;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: var(--bg-message-assistant);
          border-radius: 24px;
          border: 1px solid var(--border-color);
          padding: 12px 16px;
          transition: border-color 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: var(--focus-ring);
        }

        .input-field {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 15px;
          font-family: inherit;
          resize: none;
          outline: none;
          max-height: 200px;
          overflow-y: auto;
        }

        .input-field::placeholder {
          color: var(--text-secondary);
        }

        .input-actions {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-size: 18px;
        }

        .icon-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .icon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn {
          background: var(--bg-message-user);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .send-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn:focus {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        /* Error/Warning Messages */
        .error-message {
          background: var(--error-bg);
          color: var(--error-text);
          padding: 12px 16px;
          border-radius: 8px;
          margin: 8px 16px;
          font-size: 14px;
        }

        .warning-message {
          background: var(--warning-bg);
          color: var(--warning-text);
          padding: 12px 16px;
          border-radius: 8px;
          margin: 8px 16px;
          font-size: 14px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .sidebar-toggle {
            display: block;
          }

          .message-content {
            max-width: 85%;
          }

          .input-wrapper {
            padding: 10px 12px;
          }
        }

        /* Scrollbar */
        .chat-messages::-webkit-scrollbar,
        .sidebar-content::-webkit-scrollbar {
          width: 8px;
        }

        .chat-messages::-webkit-scrollbar-track,
        .sidebar-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-messages::-webkit-scrollbar-thumb,
        .sidebar-content::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover,
        .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: var(--text-secondary);
        }

        /* Attachment Styles */
        .message-attachments {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .attachment-preview {
          max-width: 100%;
        }

        .attachment-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }

        .attachments-preview {
          animation: slideIn 0.2s ease-out;
        }

        .upload-menu {
          animation: slideIn 0.2s ease-out;
        }

        /* Click outside to close menu */
        @media (max-width: 768px) {
          .upload-menu {
            right: 0;
            left: auto;
          }
        }
      `}</style>

      <div className="chat-ui-container">
        {/* Sidebar Toggle (Mobile) */}
        <button
          className="sidebar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        {/* Left Sidebar */}
        <aside 
          className={`sidebar ${!sidebarOpen ? 'closed' : ''} ${mobileMenuOpen ? 'open' : ''}`}
          aria-label="Chat history sidebar"
        >
          <div className="sidebar-header">
            <button 
              className="new-chat-btn"
              onClick={onNewChat}
              aria-label="Start new chat"
            >
              <span>+</span>
              <span>New chat</span>
            </button>
            {chatHistory && chatHistory.length > 0 && (
              <button 
                className="delete-all-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteAllChats();
                }}
                aria-label="Delete all chats"
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--error-text)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(220, 38, 38, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <span>🗑️</span>
                <span>Delete All</span>
              </button>
            )}
          </div>
          <div className="sidebar-content">
            {chatHistory && chatHistory.length > 0 ? (
              <>
                <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Recent Chats
                </div>
                {chatHistory.map((chat, index) => {
                  const isActive = chat.id === currentChatId;
                  return (
                    <div
                      key={chat.id || index}
                      className="sidebar-item"
                      onClick={() => {
                        onSelectChat(chat.id);
                        setMobileMenuOpen(false);
                      }}
                      style={{ 
                        cursor: 'pointer',
                        background: isActive ? 'var(--hover-bg)' : 'transparent',
                        position: 'relative'
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onSelectChat(chat.id);
                          setMobileMenuOpen(false);
                        }
                      }}
                      aria-label={`Load chat: ${chat.title || 'Untitled'}`}
                      aria-current={isActive ? 'true' : undefined}
                      onMouseEnter={(e) => {
                        const deleteBtn = e.currentTarget.querySelector('.delete-chat-btn');
                        if (deleteBtn) deleteBtn.style.display = 'flex';
                      }}
                      onMouseLeave={(e) => {
                        const deleteBtn = e.currentTarget.querySelector('.delete-chat-btn');
                        if (deleteBtn) deleteBtn.style.display = 'none';
                      }}
                    >
                      <span>💬</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {chat.title || 'Untitled Chat'}
                      </span>
                      {chat.messageCount && (
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {chat.messageCount}
                        </span>
                      )}
                      <button
                        className="delete-chat-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this chat?')) {
                            onDeleteChat(chat.id);
                          }
                        }}
                        aria-label={`Delete chat: ${chat.title || 'Untitled'}`}
                        style={{
                          display: 'none',
                          position: 'absolute',
                          right: '8px',
                          background: 'rgba(220, 38, 38, 0.2)',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'var(--error-text)',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          fontSize: '12px',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s',
                          zIndex: 10
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(220, 38, 38, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(220, 38, 38, 0.2)';
                        }}
                        title="Delete chat"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                No chat history yet.<br />
                Start a conversation to see it here.
              </div>
            )}
          </div>
          {/* Footer with attribution */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--text-secondary)'
          }}>
            Built by <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Sameer Khan</span>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main" role="main">
          <div className="chat-header">
            <h1 className="chat-title">AI CHAT BOT</h1>
            <button
              className="icon-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>

          <div className="chat-messages" role="log" aria-live="polite">
            {groupedMessages.length === 0 && !isLoading && (
              <div className="message-group">
                <div className="message-wrapper assistant">
                  <div className="message-content">
                    <div className="message-avatar">🤖</div>
                    <div className="message-bubble">
                      <p className="message-text">
                        Hello! I'm your AI assistant. How can I help you today?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {groupedMessages.map((item) => {
              if (item.type === 'date') {
                return (
                  <div key={item.id} className="date-divider">
                    {item.content}
                  </div>
                );
              }

              const isUser = item.sender === 'user';
              const isEditing = editingMessageId === item.id;
              
              return (
                <div key={item.id} className="message-group">
                  <div className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
                    <div className="message-content">
                      <div className="message-avatar">
                        {isUser ? '👤' : '🤖'}
                      </div>
                      <div className="message-bubble" style={{ position: 'relative' }}>
                        {isEditing && isUser ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              style={{
                                width: '100%',
                                minHeight: '60px',
                                padding: '8px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  saveEdit();
                                } else if (e.key === 'Escape') {
                                  cancelEdit();
                                }
                              }}
                              autoFocus
                            />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={saveEdit}
                                style={{
                                  padding: '6px 12px',
                                  background: '#10a37f',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                style={{
                                  padding: '6px 12px',
                                  background: 'var(--bg-tertiary)',
                                  color: 'var(--text-primary)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {item.attachments && item.attachments.length > 0 && (
                              <div className="message-attachments" style={{ marginBottom: '8px' }}>
                                {item.attachments.map((att, idx) => (
                                  <div key={idx} className="attachment-preview">
                                    {att.type === 'image' && (
                                      <img 
                                        src={att.url || att.file} 
                                        alt={att.name} 
                                        style={{ maxWidth: '300px', borderRadius: '8px', marginBottom: '4px' }}
                                      />
                                    )}
                                    {att.type === 'audio' && (
                                      <audio controls style={{ width: '100%', maxWidth: '300px' }}>
                                        <source src={att.url || att.file} />
                                      </audio>
                                    )}
                                    {att.type === 'file' && (
                                      <div style={{ padding: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>📄</span>
                                        <span style={{ fontSize: '13px' }}>{att.name}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {item.text && <p className="message-text">{item.text}</p>}
                            {item.note && (
                              <div className="message-note">
                                ⚠️ {item.note}
                              </div>
                            )}
                            <div className="message-time" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              {formatTime(item.timestamp)}
                              {isUser && !isEditing && (
                                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                                  <button
                                    onClick={() => handleCopyMessage(item.text)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--text-secondary)',
                                      cursor: 'pointer',
                                      padding: '2px 4px',
                                      fontSize: '12px',
                                      opacity: 0.7,
                                      transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                                    onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                                    title="Copy message"
                                    aria-label="Copy message"
                                  >
                                    📋
                                  </button>
                                  <button
                                    onClick={() => startEditing(item.id, item.text)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--text-secondary)',
                                      cursor: 'pointer',
                                      padding: '2px 4px',
                                      fontSize: '12px',
                                      opacity: 0.7,
                                      transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                                    onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                                    title="Edit message"
                                    aria-label="Edit message"
                                  >
                                    ✏️
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="message-group">
                <div className="message-wrapper assistant">
                  <div className="message-content">
                    <div className="message-avatar">🤖</div>
                    <div className="message-bubble">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-container">
            {/* Attachment Previews */}
            {attachments.length > 0 && (
              <div className="attachments-preview" style={{ 
                padding: '8px 16px', 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                borderBottom: '1px solid var(--border-color)'
              }}>
                {attachments.map((att) => (
                  <div key={att.id} className="attachment-item" style={{
                    position: 'relative',
                    display: 'inline-block'
                  }}>
                    {att.type === 'image' && (
                      <img 
                        src={att.url} 
                        alt={att.name}
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                    )}
                    {att.type === 'audio' && (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-color)'
                      }}>
                        🎤
                      </div>
                    )}
                    {att.type === 'file' && (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-color)'
                      }}>
                        📄
                      </div>
                    )}
                    <button
                      onClick={() => removeAttachment(att.id)}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: 'var(--error-text)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      aria-label="Remove attachment"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="input-wrapper" style={{ position: 'relative' }}>
              <textarea
                ref={inputRef}
                className="input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message AI Chat Bot..."
                rows={1}
                disabled={isLoading}
                aria-label="Message input"
                style={{
                  minHeight: '24px',
                  height: 'auto',
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
              <div className="input-actions">
                <div style={{ position: 'relative' }}>
                  <button
                    className="icon-btn"
                    onClick={() => setShowUploadMenu(!showUploadMenu)}
                    aria-label="Upload options"
                    title="Upload options"
                  >
                    📎
                  </button>
                  {showUploadMenu && (
                    <div className="upload-menu" style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '0',
                      marginBottom: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      minWidth: '180px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      zIndex: 1000
                    }}>
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                        }}
                        style={{
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <span>📁</span>
                        <span>Upload Files</span>
                      </button>
                      <button
                        onClick={handleCameraCapture}
                        style={{
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <span>📷</span>
                        <span>Take Photo</span>
                      </button>
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                        }}
                        style={{
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <span>🖼️</span>
                        <span>Choose Photo</span>
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="icon-btn"
                  onClick={isListening ? stopListening : startListening}
                  aria-label={isListening ? "Stop listening" : "Start speech-to-text"}
                  title={isListening ? "Stop listening" : "Speech to text"}
                  style={{
                    color: isListening ? 'var(--error-text)' : 'var(--text-secondary)'
                  }}
                >
                  {isListening ? '⏹️' : '🎙️'}
                </button>
                <button
                  className="icon-btn"
                  onClick={isRecording ? stopRecording : startRecording}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                  title={isRecording ? "Stop recording" : "Record audio"}
                  style={{
                    color: isRecording ? 'var(--error-text)' : 'var(--text-secondary)'
                  }}
                >
                  {isRecording ? '⏹️' : '🎤'}
                </button>
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  aria-label="Send message"
                >
                  <span>Send</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </main>
      </div>
    </>
  );
};

export default ChatUI;

