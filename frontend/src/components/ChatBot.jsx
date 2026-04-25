import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { RiRobot2Line, RiCloseLine, RiSendPlane2Line, RiPlantLine } from 'react-icons/ri'

const cleanContent = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\b(\w+)\s+\1\b/gi, '$1')
    .trim()
}

const SUGGESTIONS = {
  farmer: [
    'What crops should I grow this season?',
    'How do I price my tomatoes?',
    'How do I create a listing?',
    'How to deal with pest attacks?',
  ],
  buyer: [
    'How do I negotiate with a farmer?',
    'What vegetables are fresh in this season?',
    'How does escrow payment work?',
    'How do I place an order?',
  ],
}

export default function ChatBot() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: user?.role === 'farmer'
        ? "Hi! I'm FarmBot 🌱 I can help you with crop advice, pricing, and using FarmDirect. What would you like to know?"
        : "Hi! I'm FarmBot 🌱 I can help you find fresh produce, negotiate prices, and navigate FarmDirect. How can I help?",
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if (!content || loading) return

    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/chat', {
        messages: newMessages,
        role: user?.role || 'buyer',
      })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I ran into an error. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!user) return null

  return (
    <>
      {/* ⭐ Floating button */}
      <button onClick={() => setOpen(o => !o)} style={s.fab}>
        {open
          ? <RiCloseLine size={22} color="#fff" />
          : <RiRobot2Line size={22} color="#1a2e1a" />
        }
        {!open && <span style={s.fabLabel}>FarmBot</span>}
      </button>

      {/* ⭐ Chat window — fully dark */}
      {open && (
        <div style={s.window}>

          {/* Header */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.botAvatar}>
                <RiPlantLine size={16} color="#c8e840" />
              </div>
              <div>
                <p style={s.botName}>FarmBot</p>
                <p style={s.botStatus}>AI assistant · online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={s.closeBtn}>
              <RiCloseLine size={18} color="#c8e840" />
            </button>
          </div>

          {/* Messages */}
          <div style={s.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{ ...s.msgRow, ...(msg.role === 'user' ? s.msgRowUser : {}) }}>
                {msg.role === 'assistant' && (
                  <div style={s.msgAvatar}>
                    <RiPlantLine size={12} color="#c8e840" />
                  </div>
                )}
                <div style={{ ...s.bubble, ...(msg.role === 'user' ? s.bubbleUser : s.bubbleBot) }}>
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j}>{cleanContent(line)}{j < msg.content.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div style={s.msgRow}>
                <div style={s.msgAvatar}>
                  <RiPlantLine size={12} color="#c8e840" />
                </div>
                <div style={{ ...s.bubbleBot, padding: '12px 16px' }}>
                  <div style={s.typingDots}>
                    <span style={s.dot} className="dot1" />
                    <span style={s.dot} className="dot2" />
                    <span style={s.dot} className="dot3" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div style={s.suggestions}>
              {(SUGGESTIONS[user.role] || SUGGESTIONS.buyer).map((s_text, i) => (
                <button key={i} onClick={() => sendMessage(s_text)} style={s.suggestion}>
                  {s_text}
                </button>
              ))}
            </div>
          )}

          {/* ⭐ Dark input row */}
          <div style={s.inputRow}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask FarmBot anything..."
              rows={1}
              style={s.input}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                ...s.sendBtn,
                opacity: !input.trim() || loading ? 0.4 : 1,
              }}
            >
              <RiSendPlane2Line size={16} color="#1a2e1a" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        .dot1 { animation: bounce 1.2s infinite 0s; }
        .dot2 { animation: bounce 1.2s infinite 0.2s; }
        .dot3 { animation: bounce 1.2s infinite 0.4s; }

        /* ⭐ Dark scrollbar */
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: #1a2e1a; }
        div::-webkit-scrollbar-thumb { background: #3a5c3a; border-radius: 4px; }

        /* ⭐ Input focus */
        .farmbot-input:focus {
          border-color: #c8e840 !important;
          outline: none !important;
        }
      `}</style>
    </>
  )
}

const s = {
  // ⭐ Floating button — lime green
  fab: {
    position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#c8e840',
    border: 'none', borderRadius: 50, padding: '12px 18px',
    cursor: 'pointer', boxShadow: '0 4px 20px rgba(200,232,64,0.3)',
    fontSize: 14, fontWeight: 600, color: '#1a2e1a',
    transition: 'all 0.2s',
  },
  fabLabel: { fontSize: 14, fontWeight: 600, color: '#1a2e1a' },

  // ⭐ Dark chat window
  window: {
    position: 'fixed', bottom: 90, right: 28, zIndex: 999,
    width: 360,
    background: '#0f1f0f',                          // very dark green
    border: '1px solid #3a5c3a',
    borderRadius: '16px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    maxHeight: '70vh',
  },

  // ⭐ Dark header
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px',
    background: '#1a2e1a',
    borderBottom: '1px solid #3a5c3a',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  botAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(200,232,64,0.15)',
    border: '1px solid rgba(200,232,64,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  botName: { fontSize: 14, fontWeight: 600, color: '#c8e840', margin: 0 },
  botStatus: { fontSize: 11, color: '#7a9e6e', margin: 0 },
  closeBtn: {
    background: 'rgba(200,232,64,0.1)', border: '1px solid rgba(200,232,64,0.2)',
    borderRadius: 6, cursor: 'pointer', padding: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  // ⭐ Dark messages area
  messages: {
    flex: 1, overflowY: 'auto', padding: '14px 14px 8px',
    display: 'flex', flexDirection: 'column', gap: 10,
    minHeight: 240, background: '#0f1f0f',
  },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 6 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(200,232,64,0.1)',
    border: '1px solid rgba(200,232,64,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  bubble: {
    maxWidth: '78%', padding: '9px 12px', borderRadius: 12,
    fontSize: 13, lineHeight: 1.55,
  },
  // ⭐ Bot bubble — dark
  bubbleBot: {
    background: '#1a2e1a',
    border: '1px solid #3a5c3a',
    color: '#d4e8c2',
    borderBottomLeftRadius: 3,
  },
  // ⭐ User bubble — lime
  bubbleUser: {
    background: '#c8e840',
    color: '#1a2e1a',
    fontWeight: 500,
    borderBottomRightRadius: 3,
  },

  // Typing dots
  typingDots: { display: 'flex', gap: 5, alignItems: 'center' },
  dot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#c8e840', display: 'inline-block',
  },

  // ⭐ Dark suggestions
  suggestions: {
    padding: '0 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 6,
    background: '#0f1f0f',
  },
  suggestion: {
    fontSize: 11, padding: '5px 10px', borderRadius: 20,
    border: '1px solid #3a5c3a', background: '#1a2e1a',
    color: '#7a9e6e', cursor: 'pointer',
    fontFamily: 'var(--font-body)', transition: 'all 0.15s',
  },

  // ⭐ Dark input row
  inputRow: {
    display: 'flex', alignItems: 'flex-end', gap: 8,
    padding: '10px 12px',
    borderTop: '1px solid #3a5c3a',
    background: '#1a2e1a',
  },
  input: {
    flex: 1, resize: 'none',
    border: '1.5px solid #3a5c3a',
    borderRadius: 8, padding: '8px 12px', fontSize: 13,
    fontFamily: 'var(--font-body)', lineHeight: 1.4,
    maxHeight: 80, outline: 'none',
    background: '#0f1f0f',
    color: '#d4e8c2',
    caretColor: '#c8e840',
  },
  sendBtn: {
    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
    background: '#c8e840', border: 'none',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.15s',
  },
}