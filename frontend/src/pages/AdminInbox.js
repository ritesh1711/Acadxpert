import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

/* --------------- Axios with token --------------- */
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

/* --------------- Global CSS injected once --------------- */
function GlobalStyles() {
  return (
    <style>{`
      :root {
        --bg: #f3f4f6;
        --card: #ffffff;
        --cardStroke: #e5e7eb;
        --fg: #1e293b;
        --muted: #64748b;
        --brand: #2563eb;
        --brandSoft: #dbeafe;
        --success: #10b981;
        --chipBg: #e0e7ff;
        --chipFg: #111827;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #0b0f19;
          --card: #1e293b;
          --cardStroke: #334155;
          --fg: #e5e7eb;
          --muted: #94a3b8;
          --brand: #3b82f6;
          --brandSoft: #1e293b;
          --chipBg: #334155;
          --chipFg: #e5e7eb;
        }
      }
      html, body, #root { height: 100%; background: var(--bg); margin: 0; }
      * { box-sizing: border-box; }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: none; }
      }
    `}</style>
  );
}

/* --------------- Inline styles (plain JS) --------------- */
const css = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(120deg, #e0e7ff 0%, #f3f4f6 100%)',
    padding: 24,
    display: 'flex',
    alignItems: 'stretch',
    gap: 24,
    color: 'var(--fg)',
    fontFamily: 'Segoe UI, Inter, sans-serif',
    transition: 'background 0.3s',
  },
  card: {
    backdropFilter: 'blur(8px) saturate(120%)',
    background: 'var(--card)',
    border: '1px solid var(--cardStroke)',
    borderRadius: 18,
    boxShadow: '0 8px 32px rgba(37,99,235,0.08), 0 2px 8px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s',
  },
  leftPane: {
    width: 340,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(120deg, #dbeafe 0%, #fff 100%)',
    borderRight: '1px solid var(--cardStroke)',
  },
  rightPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(120deg, #fff 0%, #e0e7ff 100%)',
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    padding: 16,
    background: 'rgba(255,255,255,0.95)',
    borderBottom: '1px solid var(--cardStroke)',
    boxShadow: '0 2px 8px rgba(37,99,235,0.04)',
  },
  search: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid var(--cardStroke)',
    outline: 'none',
    background: '#f3f4f6',
    color: 'var(--fg)',
    fontSize: 15,
    marginTop: 6,
    marginBottom: 4,
    transition: 'border 0.2s',
  },
  list: { overflowY: 'auto', padding: '8px 0' },
  threadItem: (active) => ({
    padding: 16,
    cursor: 'pointer',
    transition: 'background 180ms, transform 120ms',
    background: active ? 'linear-gradient(90deg, #dbeafe 60%, #fff 100%)' : 'transparent',
    borderRadius: 14,
    marginBottom: 6,
    border: active ? '2px solid #2563eb' : '1px solid var(--cardStroke)',
    boxShadow: active ? '0 2px 12px #2563eb22' : 'none',
    outline: active ? '2px solid #2563eb44' : 'none',
    position: 'relative',
    fontWeight: active ? 600 : 400,
  }),
  threadTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: { fontWeight: 600, fontSize: 16 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    padding: '0 8px',
    fontSize: 13,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    background: 'var(--brand)',
    boxShadow: '0 2px 8px #2563eb22',
    fontWeight: 600,
  },
  sub: { fontSize: 13, color: 'var(--muted)', marginTop: 2 },
  chatHead: {
    padding: 18,
    borderBottom: '1px solid var(--cardStroke)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: 'linear-gradient(90deg, #dbeafe 0%, #fff 100%)',
    boxShadow: '0 2px 8px #2563eb11',
  },
  avatar: () => ({
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #93c5fd, #a5b4fc)',
    display: 'grid',
    placeItems: 'center',
    color: '#0b1220',
    fontWeight: 700,
    fontSize: 18,
    boxShadow: '0 2px 8px #2563eb22',
    border: '2px solid #2563eb',
    marginRight: 8,
    userSelect: 'none',
  }),
  messages: {
    height: 480,
    overflowY: 'auto',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    background: 'linear-gradient(120deg, #fff 0%, #e0e7ff 100%)',
    borderRadius: 12,
    margin: '12px 0',
    boxShadow: '0 2px 12px #2563eb11',
  },
  bubbleRow: (isAdmin) => ({
    display: 'flex',
    justifyContent: isAdmin ? 'flex-end' : 'flex-start',
    animation: 'fadeInUp 180ms ease',
  }),
  bubble: (isAdmin) => ({
    maxWidth: 540,
    padding: '14px 18px',
    borderRadius: 18,
    borderTopRightRadius: isAdmin ? 6 : 18,
    borderTopLeftRadius: isAdmin ? 18 : 6,
    background: isAdmin
      ? 'linear-gradient(90deg, #2563eb 70%, #60a5fa 100%)'
      : 'linear-gradient(90deg, #e0e7ff 60%, #fff 100%)',
    color: isAdmin ? 'white' : '#1e293b',
    boxShadow: isAdmin ? '0 2px 12px #2563eb22' : '0 2px 8px #64748b22',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '0.01em',
    transition: 'background 0.2s',
    border: isAdmin ? '1px solid #2563eb' : '1px solid #e0e7ff',
  }),
  meta: { fontSize: 12, color: '#64748b', marginTop: 6, textAlign: 'right' },
  typing: {
    display: 'inline-flex',
    gap: 4,
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: 14,
    background: 'linear-gradient(90deg, #e0e7ff 60%, #fff 100%)',
    color: '#2563eb',
    fontWeight: 600,
    fontSize: 18,
    boxShadow: '0 2px 8px #2563eb11',
  },
  composerWrap: {
    padding: 16,
    borderTop: '1px solid var(--cardStroke)',
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end',
    background: 'rgba(255,255,255,0.97)',
    borderRadius: '0 0 18px 18px',
    boxShadow: '0 -2px 8px #2563eb11',
  },
  textarea: {
    flex: 1,
    minHeight: 48,
    maxHeight: 140,
    resize: 'vertical',
    borderRadius: 14,
    border: '1.5px solid #dbeafe',
    padding: '12px 14px',
    outline: 'none',
    background: '#f3f4f6',
    color: '#1e293b',
    fontSize: 15,
    fontWeight: 500,
    boxShadow: '0 2px 8px #2563eb11',
    transition: 'border 0.2s',
  },
  sendBtn: (disabled) => ({
    background: disabled
      ? 'rgba(37,99,235,0.4)'
      : 'linear-gradient(90deg, #2563eb 70%, #60a5fa 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: 14,
    fontWeight: 600,
    fontSize: 16,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: '0 2px 8px #2563eb22',
    transition: 'background 0.2s, transform 0.1s',
    outline: 'none',
  }),
  helperRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 6px',
    marginBottom: 8,
  },
  small: { fontSize: 13, color: '#64748b', fontWeight: 500 },
};

/* --------------- Component --------------- */
export default function AdminInbox() {
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

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
    if (!input.trim() || !active || sending) return;
    const optimistic = { text: input, role: 'admin', at: new Date().toISOString(), _id: `tmp-${Date.now()}` };
    setMsgs((prev) => [...prev, optimistic]);
    const payload = input;
    setInput('');
    setSending(true);
    try {
      const res = await api.post(`/chat/admin/threads/${active.studentId}/reply`, { message: payload });
      const saved = res.data?.data;
      setMsgs((prev) => prev.map((m) => (m._id === optimistic._id ? saved : m)));
    } catch {
      setMsgs((prev) => prev.filter((m) => m._id !== optimistic._id));
      setInput(payload);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { loadThreads(); }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    if (!active) return;
    if (input.trim()) {
      setIsTyping(true);
      const t = setTimeout(() => setIsTyping(false), 1200);
      return () => clearTimeout(t);
    } else {
      setIsTyping(false);
    }
  }, [input, active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => {
      const nm = t.student?.name || t.student?.username || '';
      const line = `${nm} ${t.student?.course ?? ''} ${t.student?.semester ?? ''}`.toLowerCase();
      return line.includes(q);
    });
  }, [threads, query]);

  const charCount = input.length;
  const disabled = sending || !input.trim();

  return (
    <>
      <GlobalStyles />
      <div style={css.page}>
        {/* Left pane */}
        <div style={{ ...css.card, ...css.leftPane }}>
          <div style={css.stickyHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Student Threads</h3>
              <button
                onClick={loadThreads}
                title="Refresh"
                style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}
                aria-label="Refresh threads"
              >
                ⟳
              </button>
            </div>
            <input
              placeholder="Search name, course..."
              style={css.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={css.list}>
            {filtered.length === 0 ? (
              <div style={{ padding: 16, color: 'var(--muted)' }}>No threads found. Try a different search.</div>
            ) : (
              filtered.map((t) => {
                const activeState = !!active && active.studentId === t.threadKey.split(':')[0];
                const name = t.student?.name || t.student?.username || 'Student';
                return (
                  <div
                    key={t.threadKey}
                    onClick={() => openThread(t.threadKey, t.student)}
                    style={css.threadItem(activeState)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openThread(t.threadKey, t.student)}
                  >
                    <div style={css.threadTop}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={css.avatar(name)}>{name.slice(0, 1).toUpperCase()}</div>
                        <div>
                          <div style={css.name}>{name}</div>
                          <div style={css.sub}>
                            {t.student?.course} • Sem {t.student?.semester}
                          </div>
                        </div>
                      </div>
                      {!!t.unread && <span style={css.badge}>{t.unread}</span>}
                    </div>
                    {!!t.lastMessage?.text && (
                      <div style={{ ...css.sub, marginTop: 6 }}>
                        {t.lastMessage.text.length > 32
                          ? t.lastMessage.text.slice(0, 32) + '…'
                          : t.lastMessage.text}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right pane */}
        <div style={{ ...css.card, ...css.rightPane }}>
          {active ? (
            <>
              <div style={css.chatHead}>
                <div style={css.avatar(active.student?.name || active.studentId)}>
                  {(active.student?.name || active.studentId).slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    Chat with {active.student?.name || active.studentId}
                  </div>
                  <div style={css.sub}>
                    {active.student?.course} • Sem {active.student?.semester}
                  </div>
                </div>
              </div>

              <div ref={scrollRef} style={css.messages} aria-live="polite">
                {msgs.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 60 }}>
                    Start the conversation by sending a message.
                  </div>
                )}
                {msgs.map((m, i) => {
                  const isAdmin = m.role === 'admin';
                  const time = m.at
                    ? new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';
                  return (
                    <div key={m._id || i} style={css.bubbleRow(isAdmin)}>
                      <div>
                        <div style={css.bubble(isAdmin)}>{m.text}</div>
                        <div style={css.meta}>{time} {isAdmin ? '• ✓ Delivered' : ''}</div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div style={css.bubbleRow(false)}>
                    <div style={css.typing}><span>•</span><span>•</span><span>•</span></div>
                  </div>
                )}
              </div>

              <div style={css.composerWrap}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      reply();
                    }
                  }}
                  placeholder="Write a message…  (Enter to send • Shift+Enter for newline)"
                  style={css.textarea}
                  maxLength={1000}
                />
                <button onClick={reply} disabled={disabled} style={css.sendBtn(disabled)} aria-disabled={disabled}>
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </div>

              <div style={css.helperRow}>
                <div style={css.small}>Press Enter to send • Shift+Enter for newline</div>
                <div style={css.small}>{charCount}/1000</div>
              </div>
            </>
          ) : (
            <div style={{ padding: 24, color: 'var(--muted)' }}>
              Select a thread from the left to view messages.
            </div>
          )}
        </div>
      </div>
    </>
  );
}



