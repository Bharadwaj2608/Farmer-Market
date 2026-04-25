import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const STATUS_COLORS = {
  active: 'badge-amber',
  accepted: 'badge-green',
  rejected: 'badge-red',
  ordered: 'badge-earth',
}

const CROP_IMAGES = {
  'tomato':         'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=70&h=70&fit=crop',
  'fresh tomatoes': 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=70&h=70&fit=crop',
  'tomatoes':       'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=70&h=70&fit=crop',
  'watermelon':     'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=70&h=70&fit=crop',
  'mango':          'https://images.unsplash.com/photo-1553279768-865429fa0078?w=70&h=70&fit=crop',
  'potato':         'https://images.unsplash.com/photo-1518977676405-d4f0c4e9f80e?w=70&h=70&fit=crop',
  'onion':          'https://images.unsplash.com/photo-1508747703725-719777637510?w=70&h=70&fit=crop',
  'spinach':        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=70&h=70&fit=crop',
  'carrot':         'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=70&h=70&fit=crop',
  'banana':         'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=70&h=70&fit=crop',
  'apple':          'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=70&h=70&fit=crop',
  'cauliflower':    'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=70&h=70&fit=crop',
  'cabbage':        'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=70&h=70&fit=crop',
  'corn':           'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=70&h=70&fit=crop',
  'wheat':          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=70&h=70&fit=crop',
  'rice':           'https://images.unsplash.com/photo-1536304993881-ff86e0c9e5d8?w=70&h=70&fit=crop',
}
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=70&h=70&fit=crop'

const getImageUrl = (cropName) => {
  const key = cropName?.toLowerCase().trim()
  return CROP_IMAGES[key] || DEFAULT_IMG
}

export default function Negotiations() {
  const { user } = useAuth()
  const [negotiations, setNegotiations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/negotiations').then(r => setNegotiations(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    // ⭐ FIX: paddingTop 90px fixes navbar overlap
    <div style={{ padding: '90px 0 60px' }}>
      <div className="container">

        {/* ⭐ Dark hero header */}
        <div style={s.hero}>
          <h1 style={s.h1}>Negotiations</h1>
          <p style={s.sub}>Price negotiations with {user?.role === 'farmer' ? 'buyers' : 'farmers'}</p>
        </div>

        {negotiations.length === 0 ? (
          <div className="empty-state">
            <h3>No negotiations yet</h3>
            <p>{user?.role === 'buyer'
              ? 'When you make an offer on a listing, your negotiations appear here.'
              : 'When buyers make offers on your listings, they appear here.'}
            </p>
            {user?.role === 'buyer' && (
              <Link to="/marketplace" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>
                Browse marketplace
              </Link>
            )}
          </div>
        ) : (
          <div style={s.list}>
            {negotiations.map(neg => {
              const listing = neg.listingId
              const other = user?.role === 'farmer' ? neg.buyerId : neg.farmerId
              const lastMsg = neg.messages?.[neg.messages.length - 1]
              // ⭐ FIX: Use Unsplash instead of placehold.co
              const img = listing?.images?.[0] || getImageUrl(listing?.crop)

              return (
                <Link to={`/negotiations/${neg._id}`} key={neg._id} style={{ textDecoration: 'none' }}>
                  <div style={s.card}>
                    <img src={img} alt={listing?.crop} style={s.img} />
                    <div style={s.body}>
                      <div style={s.top}>
                        <div>
                          <span style={s.crop}>{listing?.crop}</span>
                          <span style={{ fontSize: 13, color: '#7a9e6e', marginLeft: 8 }}>
                            with {other?.name}
                          </span>
                        </div>
                        <span className={`badge ${STATUS_COLORS[neg.status] || 'badge-earth'}`}>{neg.status}</span>
                      </div>
                      <div style={s.prices}>
                        <span style={s.priceLabel}>Listed: <strong style={{ color: '#d4e8c2' }}>₹{listing?.pricePerUnit}/{listing?.unit}</strong></span>
                        {neg.agreedPrice && (
                          <span style={{ ...s.priceLabel, color: '#c8e840' }}>Agreed: <strong>₹{neg.agreedPrice}/{listing?.unit}</strong></span>
                        )}
                      </div>
                      {lastMsg && (
                        <p style={s.lastMsg}>
                          {lastMsg.senderRole === user?.role ? 'You: ' : `${other?.name}: `}
                          {lastMsg.message || (lastMsg.type === 'offer' ? `Offered ₹${lastMsg.price}` : lastMsg.type)}
                        </p>
                      )}
                      <p style={s.time}>{new Date(neg.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ color: '#7a9e6e', fontSize: 18, flexShrink: 0 }}>→</div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  hero: {
    background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 100%)',
    border: '1px solid #3a5c3a',
    borderLeft: '4px solid #c8e840',
    borderRadius: '16px',
    padding: '28px 32px',
    marginBottom: 28,
  },
  h1: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: '#c8e840', margin: 0 },
  sub: { color: '#7a9e6e', fontSize: 14, marginTop: 4 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    display: 'flex', alignItems: 'center', gap: 16, padding: 16,
    background: '#1a2e1a', border: '1px solid #3a5c3a',
    borderRadius: '12px', cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  img: { width: 70, height: 70, borderRadius: 10, objectFit: 'cover', flexShrink: 0 },
  body: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  crop: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: '#d4e8c2' },
  prices: { display: 'flex', gap: 16 },
  priceLabel: { fontSize: 13, color: '#7a9e6e' },
  lastMsg: { fontSize: 13, color: '#7a9e6e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 },
  time: { fontSize: 11, color: '#3a5c3a' },
}