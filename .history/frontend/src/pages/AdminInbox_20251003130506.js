import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => { const t = localStorage.getItem('token'); if (t) config.headers.Authorization = `Bearer ${t}`; return config; });

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getAvatar(role) {
  if (role === 'admin') return <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', padding: '4px 8px', fontSize: 12, marginLeft: 8 }}>Admin</span>;
  return <span style={{ background: '#e5e7eb', color: '#111827', borderRadius: '50%', padding: '4px 8px', fontSize: 12, marginRight: 8 }}>Student</span>;
}

export default function AdminInbox() {
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const loadThreads = async () => {
    const res = await api.get('/chat/admin/threads');
    setThreads(res.data?.data || []);
  };

  const openThread = async (threadKey, student) => {
    const studentId = threadKey.split(':')[0];
    setActive({ studentId, student, threadKey });
    setLoading(true);
    const res = await api.get(`/chat/admin/threads/${studentId}`);
    setMsgs(res.data?.data || []);
    setLoading(false);
  };

  const reply = async () => {
    if (!input.trim() || !active) return;
    setLoading(true);
    const res = await api.post(`/chat/admin/threads/${active.studentId}/reply`, { message: input });
    setMsgs(prev => [...prev, res.data?.data]);
    setInput('');
    setLoading(false);
  };

  useEffect(() => { loadThreads(); }, []);
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, active]);

  return (
    <div style={{ display: 'flex', gap: 16, padding: 16, height: '80vh' }}>
      <div style={{ width: 300, borderRight: '1px solid #eee', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: 12 }}>Student Threads</h3>
        {threads.map(t => (
          <div
            key={t.threadKey}
            onClick={() => openThread(t.threadKey, t.student)}
            style={{
              padding: 10,
              cursor: 'pointer',
              background: active?.threadKey === t.threadKey ? '#eef2ff' : 'transparent',
              borderRadius: 8,
              marginBottom: 4,
              transition: 'background 0.2s'
            }}
          >
            <div style={{ fontWeight: 600 }}>{t.student?.name || t.student?.username}</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>{t.student?.course} Sem {t.student?.semester}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {active ? (
          <>
            <h3 style={{ marginBottom: 8, fontWeight: 600 }}>
              Chat with {active.student?.name || active.studentId}
            </h3>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #eee', padding: 12, borderRadius: 8, background: '#f9fafb' }}>
              {loading && (
                <div style={{ textAlign: 'center', color: '#2563eb', margin: '16px 0' }}>
                  Loading messages...
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: m.role === 'admin' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  marginBottom: 18,
                  gap: 8,
                  transition: 'box-shadow 0.2s',
                }}>
                  {m.role !== 'admin' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {getAvatar(m.role)}
                    </div>
                  )}
                  <div style={{
                    padding: '12px 20px',
                    borderRadius: 20,
                    background: m.role === 'admin' ? '#2563eb' : '#f3f4f6',
                    color: m.role === 'admin' ? 'white' : '#111827',
                    maxWidth: '70%',
                    fontSize: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: m.role === 'admin' ? '1px solid #2563eb' : '1px solid #e5e7eb',
                    position: 'relative',
                  }}>
                    <span style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{m.text}</span>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6, textAlign: 'right' }}>
                      {m.time ? formatTime(m.time) : ''}
                    </div>
                  </div>
                  {m.role === 'admin' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {getAvatar(m.role)}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', marginTop: 12 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' ? reply() : null}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 15,
                  outline: 'none'
                }}
                placeholder="Type your reply..."
                disabled={loading}
              />
              <button
                onClick={reply}
                disabled={loading}
                style={{
                  marginLeft: 8,
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0 18px',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: 80, fontSize: 18 }}>
            Select a thread to start chatting
          </div>
        )}
      </div>
    </div>
  );
}



