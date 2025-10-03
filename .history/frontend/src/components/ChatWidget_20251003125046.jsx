import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function ChatWidget() {
  const [tab, setTab] = useState('ai');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const [hoverBtn, setHoverBtn] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

  const loadAdminThread = async () => {
    try {
      const res = await api.get('/chat/admin/thread');
      setMessages(res.data?.data || []);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    if (tab === 'admin') loadAdminThread();
    if (tab === 'ai') setMessages([]);
  }, [tab, isLoggedIn]);

  const send = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      if (tab === 'ai') {
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        const res = await api.post('/chat/ai', { message: input });
        setMessages(prev => [...prev, { role: 'ai', text: res.data?.reply || '' }]);
      } else {
        const res = await api.post('/chat/admin', { message: input });
        setMessages(prev => [...prev, res.data?.data]);
      }
      setInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // launcher button when closed
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHoverBtn(true)}
        onMouseLeave={() => setHoverBtn(false)}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          padding: '12px 18px',
          borderRadius: 50,
          background: hoverBtn ? '#1e40af' : '#2563eb',
          color: 'white',
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          transition: 'all 0.3s',
          transform: hoverBtn ? 'scale(1.05)' : 'scale(1)',
          zIndex: 999999
        }}
      >
        💬 Chat
      </button>
    );
  }

  return (
    <div
     style={{
        padding: '8px 12px',
        borderRadius: 16,
        background: m.role === 'user' ? '#2563eb' : '#f3f4f6',
        color: m.role === 'user' ? 'white' : '#111827',
        maxWidth: '75%',
        fontSize: 14,
        lineHeight: 1.4,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        transition: 'all 0.2s',
        whiteSpace: 'pre-wrap',       // keeps formatting & wraps lines
        wordBreak: 'break-word',      // breaks long words
        overflowWrap: 'anywhere'  
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#111827',
          color: 'white',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600
        }}
      >
        <span>Help & Chat</span>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: 20,
            cursor: 'pointer'
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = 'white')}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex' }}>
        <button
          onClick={() => setTab('ai')}
          style={{
            flex: 1,
            padding: 10,
            background: tab === 'ai' ? '#eef2ff' : '#f9fafb',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            borderBottom: tab === 'ai' ? '2px solid #2563eb' : 'none',
            transition: 'background 0.3s'
          }}
        >
          Ask AI
        </button>
        <button
          onClick={() => setTab('admin')}
          style={{
            flex: 1,
            padding: 10,
            background: tab === 'admin' ? '#eef2ff' : '#f9fafb',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            borderBottom: tab === 'admin' ? '2px solid #2563eb' : 'none',
            transition: 'background 0.3s'
          }}
        >
          Ask Admin
        </button>
      </div>

      {/* Chat body */}
      <div style={{ flex: 1, padding: 12, overflowY: 'auto', fontSize: 14 }}>
        {tab === 'ai' && (
          <div style={{ marginBottom: 12, color: '#374151', fontSize: 13 }}>
            <b>Tips:</b>
            <ul style={{ margin: '6px 0 0 16px' }}>
              <li>How do I submit my admission form?</li>
              <li>Which documents are required?</li>
              <li>How can I view circulars?</li>
              <li>How do I update documents?</li>
            </ul>
          </div>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 8
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 16,
                background: m.role === 'user' ? '#2563eb' : '#f3f4f6',
                color: m.role === 'user' ? 'white' : '#111827',
                maxWidth: '75%',
                fontSize: 14,
                lineHeight: 1.4,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div
        style={{
          display: 'flex',
          borderTop: '1px solid #e5e7eb',
          padding: 8
        }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => (e.key === 'Enter' ? send() : null)}
          placeholder={tab === 'ai' ? 'Ask AI...' : 'Message admin...'}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 20,
            border: '1px solid #d1d5db',
            outline: 'none',
            transition: 'all 0.2s'
          }}
          onFocus={e =>
            (e.currentTarget.style.boxShadow =
              '0 0 6px rgba(37,99,235,0.3)')
          }
          onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
          disabled={!isLoggedIn}
        />
        <button
          onClick={send}
          disabled={loading || !isLoggedIn}
          style={{
            background: !isLoggedIn ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0 16px',
            marginLeft: 6,
            borderRadius: '50%',
            cursor: loading || !isLoggedIn ? 'not-allowed' : 'pointer',
            fontSize: 16,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e =>
            !loading &&
            isLoggedIn &&
            (e.currentTarget.style.background = '#1e40af')
          }
          onMouseLeave={e =>
            !loading &&
            isLoggedIn &&
            (e.currentTarget.style.background = '#2563eb')
          }
        >
          {isLoggedIn ? (loading ? '...' : '➤') : 'Login'}
        </button>
      </div>
    </div>
  );
}
