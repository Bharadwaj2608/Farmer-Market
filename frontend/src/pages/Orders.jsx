import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const STATUS_COLORS = {
  pending:   'badge-amber',
  confirmed: 'badge-green',
  dispatched:'badge-green',
  delivered: 'badge-earth',
  cancelled: 'badge-red',
  refunded:  'badge-red',
}

const CROP_IMAGES = {
  'tomato':         'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=80&h=80&fit=crop',
  'fresh tomatoes': 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=80&h=80&fit=crop',
  'tomatoes':       'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=80&h=80&fit=crop',
  'watermelon':     'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=80&h=80&fit=crop',
  'mango':          'https://images.unsplash.com/photo-1553279768-865429fa0078?w=80&h=80&fit=crop',
  'potato':         'https://images.unsplash.com/photo-1518977676405-d4f0c4e9f80e?w=80&h=80&fit=crop',
  'onion':          'https://images.unsplash.com/photo-1508747703725-719777637510?w=80&h=80&fit=crop',
  'spinach':        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=80&h=80&fit=crop',
  'carrot':         'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=80&h=80&fit=crop',
  'banana':         'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=80&h=80&fit=crop',
  'apple':          'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=80&h=80&fit=crop',
  'cauliflower':    'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=80&h=80&fit=crop',
  'cabbage':        'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=80&h=80&fit=crop',
  'corn':           'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=80&h=80&fit=crop',
  'wheat':          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=80&h=80&fit=crop',
  'rice':           'https://images.unsplash.com/photo-1536304993881-ff86e0c9e5d8?w=80&h=80&fit=crop',
}
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop'

const getImageUrl = (cropName) => {
  const key = cropName?.toLowerCase().trim()
  return CROP_IMAGES[key] || DEFAULT_IMG
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const q = filter ? `?status=${filter}` : ''
    api.get(`/orders${q}`)
      .then(r => setOrders(r.data.orders))
      .finally(() => setLoading(false))
  }, [filter])

  const isFarmer = user?.role === 'farmer'

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div style={{ padding: '90px 0 60px' }}>
      <div className="container">

        {/* Dark hero header */}
        <div style={s.hero}>
          <h1 style={s.h1}>Orders</h1>
          <p style={s.sub}>{isFarmer ? 'Orders from buyers' : 'Your purchase orders'}</p>
        </div>

        {/* Dark filter buttons */}
        <div style={s.filters}>
          {['', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                ...s.filterBtn,
                background: filter === st ? '#c8e840' : '#1a2e1a',
                color: filter === st ? '#1a2e1a' : '#7a9e6e',
                border: `1px solid ${filter === st ? '#c8e840' : '#3a5c3a'}`,
                fontWeight: filter === st ? 700 : 400,
              }}
            >
              {st ? st.charAt(0).toUpperCase() + st.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          // ⭐ Centered empty state
          <div style={s.emptyState}>
            <span style={{ fontSize: 56 }}>📦</span>
            <h3 style={{ color: '#d4e8c2', marginTop: 16, fontSize: 20, fontFamily: 'var(--font-display)' }}>
              No orders found
            </h3>
            <p style={{ color: '#7a9e6e', fontSize: 14, marginTop: 6 }}>
              {isFarmer ? 'Orders from buyers will appear here' : 'Your orders will appear here'}
            </p>
            {!isFarmer && (
              <Link to="/marketplace" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 20 }}>
                Browse marketplace
              </Link>
            )}
          </div>
        ) : (
          <div style={s.list}>
            {orders.map(order => {
              const listing = order.listingId
              const other = isFarmer ? order.buyerId : order.farmerId
              const img = listing?.images?.[0] || getImageUrl(listing?.crop)

              return (
                <Link to={`/orders/${order._id}`} key={order._id} style={{ textDecoration: 'none' }}>
                  <div style={s.card}>
                    <img src={img} alt={listing?.crop} style={s.img} />
                    <div style={s.info}>
                      <div style={s.top}>
                        <span style={s.crop}>{listing?.crop || 'Produce'}</span>
                        <span className={`badge ${STATUS_COLORS[order.status] || 'badge-earth'}`}>{order.status}</span>
                      </div>
                      <p style={s.meta}>
                        {order.quantity} {order.unit} · ₹{order.agreedPrice}/{order.unit} ·{' '}
                        <strong style={{ color: '#c8e840' }}>₹{order.totalAmount.toLocaleString()} total</strong>
                      </p>
                      <p style={s.meta}>
                        {isFarmer ? `Buyer: ${other?.name}` : `Farmer: ${other?.name}`} ·{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      {order.paymentStatus === 'escrowed' && (
                        <span className="badge badge-green" style={{ marginTop: 4 }}>Payment escrowed</span>
                      )}
                    </div>
                    <div style={s.arrow}>→</div>
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
    marginBottom: 24,
  },
  h1: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: '#c8e840', margin: 0 },
  sub: { color: '#7a9e6e', fontSize: 14, marginTop: 4 },
  filters: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  filterBtn: {
    padding: '6px 16px', borderRadius: 20,
    fontSize: 13, cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.15s',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },

  // ⭐ Centered empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '45vh',
    textAlign: 'center',
    padding: '40px 24px',
    background: '#1a2e1a',
    border: '1px solid #3a5c3a',
    borderRadius: '16px',
  },

  card: {
    display: 'flex', alignItems: 'center', gap: 16, padding: 16,
    background: '#1a2e1a', border: '1px solid #3a5c3a',
    borderRadius: '12px', cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  img: { width: 70, height: 70, borderRadius: 10, objectFit: 'cover', flexShrink: 0 },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  top: { display: 'flex', alignItems: 'center', gap: 10 },
  crop: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: '#d4e8c2' },
  meta: { fontSize: 13, color: '#7a9e6e' },
  arrow: { color: '#7a9e6e', fontSize: 18, flexShrink: 0 },
}