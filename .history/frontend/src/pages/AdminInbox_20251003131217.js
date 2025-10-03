import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

// Axios with token
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Design tokens + light/dark support
const css = {
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(59,130,246,0.08))',
    padding: 16,
    display: 'flex',
    alignItems: 'stretch',
    gap: 16,
    color: 'var(--fg)',
  },
  rootVars: `
    :root {
      --bg: #0b0f19;
      --card: rgba(255,255,255,0.75);
      --cardStroke: rgba(17,24,39,0.08);
      --fg: #0b1220;
      --muted: #6b7280;
      --brand: #2563eb;
      --brandSoft: #dbeafe;
      --success: #10b981;
      --chipBg: #e5e7eb;
      --chipFg: #111827;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0b0f19;
        --card: rgba(17,24,39,0.6);
        --cardStroke: rgba(255,255,255,0.06);
        --fg: #e5e7eb;
        --muted: #9ca3af;
        --brand: #3b82f6;
        --brandSoft: rgba(59,130,246,0.15);
        --chipBg: rgba(255,255,255,0.08);
        --chipFg: #e5e7eb;
      }
    }
    html, body, #root { height: 100%; background: var(--bg); }
    * { box-sizing: border-box; }
  `,
  card: {
    backdropFilter: 'saturate(120%) blur(10px)',
    background: 'var(--card)',
    border: '1px solid var(--cardStroke)',
    borderRadius: 16,
    boxShadow:
      '0 10px 25px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  leftPane: {
    width: 320,
    display: 'flex',
    flexDirection: 'column',
  },
  rightPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    padding: 12,
    background: 'inherit',
    borderBottom: '1px solid var(--cardStroke)',
  },
  search: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--cardStroke)',
    outline: 'none',
    background: 'transparent',
    color: 'var(--fg)',
  },
  list: {
    overflowY: 'auto',
  },
  threadItem: (active) => ({
    padding: 12,
    cursor: 'pointer',
    transition: 'background 180ms ease, transform 120ms ease',
    background: active ? 'var(--brandSoft)' : 'transparent',
    borderBottom: '1px solid var(--cardStroke)',
  }),
  threadTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: { fontWeight: 600 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    padding: '0 6px',
    fontSize: 12,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    background: 'var(--brand)',
  },
  sub: { fontSize: 12, color: 'var(--muted)', marginTop: 4 },
  chatHead: {
    padding: 14,
    borderBottom: '1px solid var(--cardStroke)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: (seed) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: `linear-gradient(135deg, #93c5fd, #a5b4fc)`,
    display: 'grid',
    placeItems: 'center',
    color: '#0b1220',
    fontWeight: 700,
  }),
  messages: {
    height: 440,
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  bubbleRow: (isAdmin) => ({
    display: 'flex',
    justifyContent: isAdmin ? 'flex-end' : 'flex-start',
    animation: 'fadeInUp 180ms ease',
  }),
  bubble: (isAdmin) => ({
    maxWidth: 520,
    padding: '10px 14px',
    borderRadius: 16,
    borderTopRightRadius: isAdmin ? 4 : 16,
    borderTopLeftRadius: isAdmin ? 16 : 4,
    background: isAdmin ? 'var(--brand)' : 'var(--chipBg)',
    color: isAdmin ? 'white' : 'var(--chipFg)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }),
  meta: { fontSize: 11, color: 'var(--muted)', marginTop: 4 },
  typing: {
    display: 'inline-flex',
    gap: 4,
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: 12,
    background: 'var(--chipBg)',
    color: 'var(--chipFg)',
  },
  composerWrap: {
    padding: 12,
    borderTop: '1px solid var(--cardStroke)',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
    resize: 'vertical',
    borderRadius: 12,
    border: '1px solid var(--cardStroke)',
    padding: '10px 12px',
    outline: 'none',
    background: 'transparent',
    color: 'var(--fg)',
  },
  sendBtn: (disabled) => ({
    background: disabled ? 'rgba(37,99,235,0.4)' : 'var(--brand)',
    color: 'white',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 12,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'transform 120ms ease',
  }),
  helperRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2px',
  },
  small: { fontSize: 12, color: 'var(--muted)' },
};

// keyframe style tag for animations
const Keyframes = () => (
  <style>{`
    ${css.rootVars}
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .thread:hover { transform: translateY(-1px); }
  `}</style>
);

type Thread = {
  threadKey: string;
  student?: { name?: string; username?: string; course?: string; semester?: number };
  lastMessage?: { text?: string; at?: string };
  unread?: number;
};

type Msg = { text: string; role: 'admin' | 'student'; at?: string; _id?: string };

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

  const openThread = async (threadKey: string, student?: Thread['student']) => {
    const studentId = threadKey.split(':')[0];
    setActive({ studentId, student });
    const res = await api.get(`/chat/admin/threads/${studentId}`);
    setMsgs(res.data?.data || []);
    // optionally could mark as read here
  };

  const reply = async () => {
    if (!input.trim() || !active || sending) return;
    const optimistic: Msg = { text: input, role: 'admin', at: new Date().toISOString(), _id: `tmp-${Date.now()}` };
    setMsgs((prev) => [...prev, optimistic]);
    const payload = input;
    setInput('');
    setSending(true);
    try {
      const res = await api.post(`/chat/admin/threads/${active.studentId}/reply`, { message: payload });
      const saved = res.data?.data as Msg;
      setMsgs((prev) => prev.map((m) => (m._id === optimistic._id ? saved : m)));
    } catch {
      // rollback optimistic
      setMsgs((prev) => prev.filter((m) => m._id !== optimistic._id));
      setInput(payload);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { loadThreads(); }, []);
  useEffect(() => {
    // auto-scroll to bottom on new messages
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs]);

  // fake typing indicator when admin is typing
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
      <Keyframes />
      <div style={css.page}>
        {/* Left pane: thread list */}
        <div style={{ ...css.card, ...css.leftPane }}>
          <div style={{ ...css.stickyHeader }}>
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

          <div style={{ ...css.list }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 16, color: 'var(--muted)' }}>
                No threads found. Try a different search.
              </div>
            ) : (
              filtered.map((t) => {
                const activeState =
                  !!active && active.studentId === t.threadKey.split(':')[0];
                const name = t.student?.name || t.student?.username || 'Student';
                return (
                  <div
                    className="thread"
                    key={t.threadKey}
                    onClick={() => openThread(t.threadKey, t.student)}
                    style={css.threadItem(activeState)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openThread(t.threadKey, t.student)}
                  >
                    <div style={css.threadTop}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={css.avatar(name)}>
                          {name.slice(0, 1).toUpperCase()}
                        </div>
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

        {/* Right pane: conversation */}
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
                        <div style={css.meta}>
                          {time} {isAdmin ? '• ✓ Delivered' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div style={css.bubbleRow(false)}>
                    <div style={css.typing}>
                      <span className="dot">•</span>
                      <span className="dot">•</span>
                      <span className="dot">•</span>
                    </div>
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
                <button
                  onClick={reply}
                  disabled={disabled}
                  style={css.sendBtn(disabled)}
                  aria-disabled={disabled}
                >
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
