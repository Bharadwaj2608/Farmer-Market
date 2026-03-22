import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { RiSendPlane2Line } from 'react-icons/ri'

const MSG_TYPE_LABELS = { offer: 'Offer', counter: 'Counter offer', accept: 'Accepted', reject: 'Rejected', message: 'Message' }
const MSG_TYPE_COLORS = { offer: 'var(--amber)', counter: 'var(--earth-light)', accept: 'var(--green)', reject: 'var(--red)', message: 'transparent' }

export default function NegotiationChat() {
  const { id } = useParams()
  const { user } = useAuth()
  const socket = useSocket()
  const navigate = useNavigate()
  const [neg, setNeg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [msgType, setMsgType] = useState('offer')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.get(`/negotiations/${id}`).then(r => {
      setNeg(r.data)
      setMessages(r.data.messages || [])
      setPrice(r.data.listingId?.pricePerUnit || '')
      setQuantity(r.data.agreedQuantity || 1)
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!socket) return
    socket.emit('join_negotiation', id)
    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg])
    })
    return () => socket.off('new_message')
  }, [socket, id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() && msgType === 'message') return
    setSending(true)
    try {
      await api.post(`/negotiations/${id}/message`, {
        type: msgType,
        price: msgType !== 'message' ? Number(price) : undefined,
        quantity: msgType !== 'message' ? Number(quantity) : undefined,
        message,
      })
      setMessage('')
      // Re-fetch to get updated status
      const res = await api.get(`/negotiations/${id}`)
      setNeg(res.data)
      setMessages(res.data.messages)

      if (msgType === 'accept') {
        toast.success('Offer accepted! You can now place the order.')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send')
    } finally { setSending(false) }
  }

  const placeOrder = async () => {
    try {
      const res = await api.post('/orders', {
        listingId: neg.listingId._id,
        quantity: neg.agreedQuantity,
        agreedPrice: neg.agreedPrice,
        negotiationId: id,
        deliveryAddress: user.deliveryAddresses?.[0] || {},
      })
      toast.success('Order placed!')
      navigate(`/orders/${res.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!neg) return null

  const listing = neg.listingId
  const isFarmer = user?.role === 'farmer'
  const other = isFarmer ? neg.buyerId : neg.farmerId
  const isActive = neg.status === 'active'
  const isAccepted = neg.status === 'accepted'

  return (
    <div style={{ padding: '24px 0 0' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Header */}
        <div className="card" style={s.header}>
          <Link to="/negotiations" style={{ color: 'var(--green)', fontSize: 13 }}>← Negotiations</Link>
          <div style={s.headerMain}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={listing?.images?.[0] || `https://placehold.co/52x52/e8f3ec/2a5c3f?text=${encodeURIComponent(listing?.crop || '?')}`}
                alt={listing?.crop}
                style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover' }}
              />
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--earth)', marginBottom: 2 }}>{listing?.crop}</h2>
                <p style={{ fontSize: 13, color: '#888' }}>
                  Listed ₹{listing?.pricePerUnit}/{listing?.unit} · With {other?.name}
                </p>
              </div>
            </div>
            <span className={`badge ${neg.status === 'active' ? 'badge-amber' : neg.status === 'accepted' ? 'badge-green' : 'badge-red'}`}>
              {neg.status}
            </span>
          </div>

          {isAccepted && user?.role === 'buyer' && (
            <div style={{ padding: '12px 16px', background: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', marginTop: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--green)', marginBottom: 8 }}>
                <strong>Deal agreed!</strong> ₹{neg.agreedPrice}/{listing?.unit} × {neg.agreedQuantity} {listing?.unit} = ₹{(neg.agreedPrice * neg.agreedQuantity).toLocaleString()}
              </p>
              <button className="btn btn-primary btn-sm" onClick={placeOrder}>Place order now →</button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={s.chatBox}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#ccc', padding: 40, fontSize: 14 }}>
              Send your first offer to start negotiating
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id
            const senderName = isMe ? 'You' : other?.name
            return (
              <div key={i} style={{ ...s.msgRow, ...(isMe ? s.msgRowMe : {}) }}>
                {!isMe && (
                  <div style={s.avatar}>{other?.name?.charAt(0)}</div>
                )}
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ ...s.bubble, ...(isMe ? s.bubbleMe : s.bubbleOther) }}>
                    {msg.type !== 'message' && (
                      <div style={{ ...s.msgTypeTag, background: MSG_TYPE_COLORS[msg.type] + '22', color: MSG_TYPE_COLORS[msg.type], border: `1px solid ${MSG_TYPE_COLORS[msg.type]}44` }}>
                        {MSG_TYPE_LABELS[msg.type]}
                        {msg.price && ` · ₹${msg.price}/${listing?.unit}`}
                        {msg.quantity && ` · ${msg.quantity} ${listing?.unit}`}
                      </div>
                    )}
                    {msg.message && <p style={{ fontSize: 14, color: isMe ? '#fff' : 'var(--earth)' }}>{msg.message}</p>}
                  </div>
                  <p style={{ ...s.msgMeta, ...(isMe ? { textAlign: 'right' } : {}) }}>
                    {senderName} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {isMe && (
                  <div style={{ ...s.avatar, background: 'var(--green)', color: '#fff' }}>{user?.name?.charAt(0)}</div>
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        {isActive && (
          <div className="card" style={s.inputArea}>
            <div style={s.typeSelector}>
              {(isFarmer ? ['counter', 'accept', 'reject', 'message'] : ['offer', 'message']).map(t => (
                <button key={t} onClick={() => setMsgType(t)}
                  style={{ ...s.typeBtn, ...(msgType === t ? s.typeBtnActive : {}) }}>
                  {MSG_TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            <form onSubmit={sendMessage} style={s.form}>
              {msgType !== 'message' && msgType !== 'reject' && msgType !== 'accept' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <input type="number" placeholder={`Price (₹ per ${listing?.unit})`} value={price}
                    onChange={e => setPrice(e.target.value)} style={{ flex: 1 }} />
                  <input type="number" placeholder="Qty" value={quantity}
                    onChange={e => setQuantity(e.target.value)} style={{ width: 80 }} />
                </div>
              )}
              {msgType === 'accept' && neg.messages?.length > 0 && (
                <div style={{ padding: '8px 12px', background: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--green)' }}>
                  Accepting the latest offer. Both parties will be notified.
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <input placeholder={msgType === 'reject' ? 'Reason for rejection (optional)' : 'Add a message...'} value={message}
                  onChange={e => setMessage(e.target.value)} style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary" disabled={sending} style={{ flexShrink: 0 }}>
                  <RiSendPlane2Line size={16} />
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!isActive && (
          <div style={{ padding: '16px', textAlign: 'center', fontSize: 14, color: '#999', background: '#fff', borderTop: '1px solid var(--border)' }}>
            This negotiation is {neg.status}.
            {neg.status === 'rejected' && ' Start a new offer from the listing page.'}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  header: { padding: 20, marginBottom: 0, borderRadius: 'var(--radius-md) var(--radius-md) 0 0', display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--border)' },
  headerMain: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatBox: { background: '#fff', minHeight: 400, maxHeight: 500, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  msgRowMe: { flexDirection: 'row-reverse' },
  avatar: { width: 30, height: 30, borderRadius: '50%', background: 'var(--cream-dark)', color: 'var(--earth-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 },
  bubble: { padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 6 },
  bubbleMe: { background: 'var(--green)', borderBottomRightRadius: 4 },
  bubbleOther: { background: 'var(--cream)', borderBottomLeftRadius: 4, border: '1px solid var(--border)' },
  msgTypeTag: { fontSize: 12, fontWeight: 500, padding: '3px 8px', borderRadius: 'var(--radius-full)', display: 'inline-block' },
  msgMeta: { fontSize: 11, color: '#bbb', marginTop: 4 },
  inputArea: { borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 },
  typeSelector: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  typeBtn: { padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 500, border: '1px solid var(--border)', background: '#fff', color: 'var(--earth-mid)', cursor: 'pointer', transition: 'all 0.15s' },
  typeBtnActive: { background: 'var(--green)', color: '#fff', border: '1px solid var(--green)' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
}
