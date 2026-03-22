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

export default function Negotiations() {
  const { user } = useAuth()
  const [negotiations, setNegotiations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/negotiations').then(r => setNegotiations(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div style={{ padding: '32px 0 60px' }}>
      <div className="container">
        <h1 style={s.h1}>Negotiations</h1>
        <p style={s.sub}>Price negotiations with {user?.role === 'farmer' ? 'buyers' : 'farmers'}</p>

        {negotiations.length === 0 ? (
          <div className="empty-state">
            <h3>No negotiations yet</h3>
            <p>{user?.role === 'buyer' ? 'When you make an offer on a listing, your negotiations appear here.' : 'When buyers make offers on your listings, they appear here.'}</p>
            {user?.role === 'buyer' && (
              <Link to="/marketplace" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>Browse marketplace</Link>
            )}
          </div>
        ) : (
          <div style={s.list}>
            {negotiations.map(neg => {
              const listing = neg.listingId
              const other = user?.role === 'farmer' ? neg.buyerId : neg.farmerId
              const lastMsg = neg.messages?.[neg.messages.length - 1]
              const img = listing?.images?.[0] || `https://placehold.co/70x70/e8f3ec/2a5c3f?text=${encodeURIComponent(listing?.crop || '?')}`

              return (
                <Link to={`/negotiations/${neg._id}`} key={neg._id} style={{ textDecoration: 'none' }}>
                  <div className="card" style={s.card}>
                    <img src={img} alt={listing?.crop} style={s.img} />
                    <div style={s.body}>
                      <div style={s.top}>
                        <div>
                          <span style={s.crop}>{listing?.crop}</span>
                          <span style={{ fontSize: 13, color: '#888', marginLeft: 8 }}>
                            with {other?.name}
                          </span>
                        </div>
                        <span className={`badge ${STATUS_COLORS[neg.status] || 'badge-earth'}`}>{neg.status}</span>
                      </div>
                      <div style={s.prices}>
                        <span style={s.priceLabel}>Listed: <strong>₹{listing?.pricePerUnit}/{listing?.unit}</strong></span>
                        {neg.agreedPrice && (
                          <span style={{ ...s.priceLabel, color: 'var(--green)' }}>Agreed: <strong>₹{neg.agreedPrice}/{listing?.unit}</strong></span>
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
                    <div style={{ color: '#ccc', fontSize: 18, flexShrink: 0 }}>→</div>
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
  h1: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--earth)', marginBottom: 6 },
  sub: { color: '#999', fontSize: 14, marginBottom: 24 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { display: 'flex', alignItems: 'center', gap: 16, padding: 16, cursor: 'pointer', transition: 'box-shadow 0.2s' },
  img: { width: 70, height: 70, borderRadius: 10, objectFit: 'cover', flexShrink: 0 },
  body: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  crop: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--earth)' },
  prices: { display: 'flex', gap: 16 },
  priceLabel: { fontSize: 13, color: '#888' },
  lastMsg: { fontSize: 13, color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 },
  time: { fontSize: 11, color: '#ccc' },
}
