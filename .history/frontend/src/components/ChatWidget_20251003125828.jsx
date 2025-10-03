import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getAvatar(role) {
  if (role === 'user') return <span className="bg-blue-600 text-white rounded-full px-2 py-1 text-xs mr-2">You</span>;
  if (role === 'ai') return <span className="bg-purple-500 text-white rounded-full px-2 py-1 text-xs mr-2">AI</span>;
  return <span className="bg-gray-700 text-white rounded-full px-2 py-1 text-xs mr-2">Admin</span>;
}

export default function ChatWidget() {
  const [tab, setTab] = useState('ai');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    // Auto-scroll to bottom on new message
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const send = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const now = new Date();
      if (tab === 'ai') {
        setMessages(prev => [...prev, { role: 'user', text: input, time: now }]);
        const res = await api.post('/chat/ai', { message: input });
        setMessages(prev => [...prev, { role: 'ai', text: res.data?.reply || '', time: new Date() }]);
      } else {
        setMessages(prev => [...prev, { role: 'user', text: input, time: now }]);
        const res = await api.post('/chat/admin', { message: input });
        setMessages(prev => [...prev, { ...res.data?.data, time: new Date() }]);
      }
      setInput('');
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong.', time: new Date() }]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ position: 'fixed', right: 16, bottom: 16, padding: '10px 14px', borderRadius: 24, background: '#2563eb', color: 'white', border: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.15)', zIndex: 999999 }}>
        💬 Chat
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 w-[380px] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden z-[999999]">
      <div className="flex items-center px-4 py-2 bg-gray-900 text-white">
        <div className="font-bold text-lg">Help & Chat</div>
        <button onClick={() => setOpen(false)} className="ml-auto text-xl font-bold hover:text-red-400">×</button>
      </div>
      <div className="flex">
        <button onClick={() => setTab('ai')} className={`flex-1 py-2 font-semibold ${tab==='ai' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'} border-b-2 ${tab==='ai' ? 'border-blue-600' : 'border-transparent'}`}>Ask AI</button>
        <button onClick={() => setTab('admin')} className={`flex-1 py-2 font-semibold ${tab==='admin' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'} border-b-2 ${tab==='admin' ? 'border-blue-600' : 'border-transparent'}`}>Ask Admin</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50" style={{ minHeight: 220, maxHeight: 300 }}>
        {tab === 'ai' && (
          <div className="mb-3 text-gray-600 text-sm">
            <b>Tips:</b>
            <ul className="list-disc ml-5 mt-1">
              <li>How do I submit my admission form?</li>
              <li>Which documents are required for upload?</li>
              <li>How can I view and download circulars?</li>
              <li>How do I update pending documents?</li>
            </ul>
          </div>
        )}
        {messages.length === 0 && (
          <div className="text-gray-400 text-center py-8">No messages yet.</div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-end mb-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role !== 'user' && getAvatar(m.role)}
            <div className={`px-5 py-3 rounded-2xl shadow max-w-[80%] text-base whitespace-pre-line
              ${m.role === 'user' ? 'bg-blue-600 text-white' : m.role === 'ai' ? 'bg-purple-50 text-gray-900 border border-purple-200' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}>
              {m.role === 'ai' || m.role === 'admin'
                ? <ReactMarkdown>{m.text}</ReactMarkdown>
                : m.text
              }
              <div className="text-xs text-gray-400 mt-2 text-right">{m.time ? formatTime(m.time) : ''}</div>
            </div>
            {m.role === 'user' && getAvatar(m.role)}
          </div>
        ))}
        {loading && (
          <div className="flex justify-center items-center py-2">
            <span className="animate-spin h-5 w-5 mr-2 border-2 border-blue-600 border-t-transparent rounded-full"></span>
            <span className="text-blue-600 text-xs">Sending...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex border-t border-gray-200 bg-white px-3 py-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' ? send() : null}
          placeholder={tab === 'ai' ? 'Ask AI about academics/admissions...' : 'Message admin...'}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
          disabled={!isLoggedIn || loading}
        />
        <button
          onClick={send}
          disabled={loading || !isLoggedIn}
          className={`ml-2 px-4 py-2 rounded-lg text-sm font-semibold ${!isLoggedIn ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} transition`}
        >
          {isLoggedIn ? (loading ? '...' : 'Send') : 'Login required'}
        </button>
      </div>
    </div>
  );
}


