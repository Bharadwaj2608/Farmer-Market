import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { RiRobot2Line, RiCloseLine, RiSendPlane2Line, RiPlantLine } from 'react-icons/ri'
const cleanContent = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  
    .replace(/\*\*(.*?)\*\*/g, '$1')     // Remove **bold**
    .replace(/\*(.*?)\*/g, '$1')            // Remove *italic*
    .replace(/#{1,6}\s*/g, '')              // Remove ### headers
    .replace(/\b(\w+)\s+\1\b/gi, '$1')     // Remove duplicate words
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
      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)} style={s.fab}>
        {open
          ? <RiCloseLine size={22} color="#fff" />
          : <RiRobot2Line size={22} color="#fff" />
        }
        {!open && <span style={s.fabLabel}>FarmBot</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div style={s.window}>
          {/* Header */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.botAvatar}><RiPlantLine size={16} color="#fff" /></div>
              <div>
                <p style={s.botName}>FarmBot</p>
                <p style={s.botStatus}>AI assistant · online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={s.closeBtn}>
              <RiCloseLine size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={s.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{ ...s.msgRow, ...(msg.role === 'user' ? s.msgRowUser : {}) }}>
                {msg.role === 'assistant' && (
                  <div style={s.msgAvatar}><RiPlantLine size={12} color="var(--green)" /></div>
                )}
                <div style={{ ...s.bubble, ...(msg.role === 'user' ? s.bubbleUser : s.bubbleBot) }}>
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div style={s.msgRow}>
                <div style={s.msgAvatar}><RiPlantLine size={12} color="var(--green)" /></div>
                <div style={s.bubbleBot}>
                  <div style={s.typing}>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only show at start */}
          {messages.length === 1 && (
            <div style={s.suggestions}>
              {(SUGGESTIONS[user.role] || SUGGESTIONS.buyer).map((s_text, i) => (
                <button key={i} onClick={() => sendMessage(s_text)} style={s.suggestion}>
                  {s_text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
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
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={s.sendBtn}>
              <RiSendPlane2Line size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  )
}

const s = {
  fab: {
    position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--green)', color: '#fff',
    border: 'none', borderRadius: 50, padding: '12px 18px',
    cursor: 'pointer', boxShadow: '0 4px 16px rgba(42,92,63,0.35)',
    fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)',
    transition: 'all 0.2s',
  },
  fabLabel: { fontSize: 14, fontWeight: 500 },
  window: {
    position: 'fixed', bottom: 90, right: 28, zIndex: 999,
    width: 360, background: '#fff',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
    boxShadow: '0 8px 32px rgba(45,36,22,0.15)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    maxHeight: '70vh',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', background: 'var(--green)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  botAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  botName: { fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 },
  botStatus: { fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 },
  closeBtn: {
    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6,
    color: '#fff', cursor: 'pointer', padding: 4, display: 'flex',
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: '14px 14px 8px',
    display: 'flex', flexDirection: 'column', gap: 10,
    minHeight: 240,
  },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 6 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
    background: 'var(--green-pale)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  bubble: {
    maxWidth: '78%', padding: '9px 12px', borderRadius: 12,
    fontSize: 13, lineHeight: 1.55,
  },
  bubbleBot: {
    background: 'var(--cream)', color: 'var(--earth)',
    borderBottomLeftRadius: 3,
  },
  bubbleUser: {
    background: 'var(--green)', color: '#fff',
    borderBottomRightRadius: 3,
  },
  typing: {
    display: 'flex', gap: 4, padding: '2px 4px',
    '& span': {
      width: 6, height: 6, borderRadius: '50%',
      background: '#aaa', display: 'inline-block',
      animation: 'bounce 1.2s infinite',
    }
  },
  suggestions: {
    padding: '0 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 6,
  },
  suggestion: {
    fontSize: 11, padding: '5px 10px', borderRadius: 20,
    border: '1px solid var(--border)', background: '#fff',
    color: 'var(--earth-mid)', cursor: 'pointer',
    fontFamily: 'var(--font-body)', transition: 'all 0.15s',
  },
  inputRow: {
    display: 'flex', alignItems: 'flex-end', gap: 8,
    padding: '10px 12px', borderTop: '1px solid var(--border)',
    background: '#fff',
  },
  input: {
    flex: 1, resize: 'none', border: '1.5px solid var(--border)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13,
    fontFamily: 'var(--font-body)', lineHeight: 1.4,
    maxHeight: 80, outline: 'none',
  },
  sendBtn: {
    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
    background: 'var(--green)', border: 'none',
    color: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 1, transition: 'opacity 0.15s',
  },
}