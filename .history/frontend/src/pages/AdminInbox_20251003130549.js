import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => { const t = localStorage.getItem('token'); if (t) config.headers.Authorization = `Bearer ${t}`; return config; });

export default function AdminInbox() {
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');

  const loadThreads = async () => {
    const res = await api.get('/chat/admin/threads');
    setThreads(res.data?.data || []);
  };

  const openThread = async (threadKey, student) => {
    const studentId = threadKey.split(':')[0];
    setActive({ studentId, student });
    const res = await api.get(`/chat/admin/threads/${studentId}`);
    setMsgs(res.data?.data || []);
  };

  const reply = async () => {
    if (!input.trim() || !active) return;
    const res = await api.post(`/chat/admin/threads/${active.studentId}/reply`, { message: input });
    setMsgs(prev => [...prev, res.data?.data]);
    setInput('');
  };

  useEffect(() => { loadThreads(); }, []);

  return (
    <div style={{ display: 'flex', gap: 16, padding: 16 }}>
      <div style={{ width: 300, borderRight: '1px solid #eee' }}>
        <h3>Student Threads</h3>
        {threads.map(t => (
          <div key={t.threadKey} onClick={() => openThread(t.threadKey, t.student)} style={{ padding: 8, cursor: 'pointer' }}>
            <div>{t.student?.name || t.student?.username}</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>{t.student?.course} Sem {t.student?.semester}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        {active ? (
          <>
            <h3>Chat with {active.student?.name || active.studentId}</h3>
            <div style={{ height: 360, overflowY: 'auto', border: '1px solid #eee', padding: 8 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ marginBottom: 8, textAlign: m.role === 'admin' ? 'right' : 'left' }}>
                  <span style={{ display: 'inline-block', padding: '8px 12px', borderRadius: 16, background: m.role === 'admin' ? '#2563eb' : '#e5e7eb', color: m.role === 'admin' ? 'white' : '#111827' }}>{m.text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', marginTop: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter'?reply():null} style={{ flex: 1 }} />
              <button onClick={reply} style={{ marginLeft: 8 }}>Send</button>
            </div>
          </>
        ) : <div>Select a thread</div>}
      </div>
    </div>
  );
}



