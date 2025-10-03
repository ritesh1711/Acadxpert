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

  const isLoggedIn = !!localStorage.getItem('token');
  console.debug('[ChatWidget] mounted. isLoggedIn=', isLoggedIn);

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

  // Show the launcher even if not logged in, to verify visibility
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ position: 'fixed', right: 16, bottom: 16, padding: '10px 14px', borderRadius: 24, background: '#2563eb', color: 'white', border: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.15)', zIndex: 999999 }}>
        Chat
      </button>
    );
  }

  // If not logged in, show disabled state inside widget

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, width: 380, background: 'white', border: '1px solid #ddd', borderRadius: 10, boxShadow: '0 6px 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 999999 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: 8, background: '#111827', color: 'white' }}>
        <div style={{ fontWeight: 600 }}>Help & Chat</div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => setOpen(false)} style={{ background: 'transparent', color: 'white', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <button onClick={() => setTab('ai')} style={{ flex: 1, padding: 8, background: tab==='ai' ? '#eef2ff' : '#f8fafc', border: 'none' }}>Ask AI</button>
        <button onClick={() => setTab('admin')} style={{ flex: 1, padding: 8, background: tab==='admin' ? '#eef2ff' : '#f8fafc', border: 'none' }}>Ask Admin</button>
      </div>
      <div style={{ height: 300, overflowY: 'auto', padding: 10 }}>
        {tab==='ai' && (
          <div style={{ marginBottom: 12, color: '#374151', fontSize: 14 }}>
            Tips:
            <ul style={{ margin: '6px 0 0 16px' }}>
              <li>How do I submit my admission form?</li>
              <li>Which documents are required for upload?</li>
              <li>How can I view and download circulars?</li>
              <li>How do I update pending documents?</li>
            </ul>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: 8, textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', padding: '8px 12px', borderRadius: 16, background: m.role === 'user' ? '#2563eb' : '#e5e7eb', color: m.role === 'user' ? 'white' : '#111827', maxWidth: '85%' }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid #eee' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' ? send() : null} placeholder={tab === 'ai' ? 'Ask AI about academics/admissions...' : 'Message admin...'} style={{ flex: 1, padding: 10, border: 'none', outline: 'none' }} disabled={!isLoggedIn} />
        <button onClick={send} disabled={loading || !isLoggedIn} style={{ padding: '0 14px', background: (!isLoggedIn ? '#9ca3af' : '#2563eb'), color: 'white', border: 'none' }}>
          {isLoggedIn ? (loading ? '...' : 'Send') : 'Login required'}
        </button>
      </div>
    </div>
  );
}


