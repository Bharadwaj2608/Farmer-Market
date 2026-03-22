import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const STATUS_COLORS = {
  pending: 'badge-amber',
  confirmed: 'badge-green',
  dispatched: 'badge-green',
  delivered: 'badge-earth',
  cancelled: 'badge-red',
  refunded: 'badge-red',
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
    <div style={{ padding: '32px 0 60px' }}>
      <div className="container">
        <h1 style={s.h1}>Orders</h1>

        <div style={s.filters}>
          {['', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map(st => (
            <button key={st} onClick={() => setFilter(st)}
              className={`btn btn-sm ${filter === st ? 'btn-primary' : 'btn-secondary'}`}>
              {st || 'All'}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders found</h3>
            <p>{isFarmer ? 'Orders from buyers will appear here' : 'Your orders will appear here'}</p>
            {!isFarmer && <Link to="/marketplace" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>Browse marketplace</Link>}
          </div>
        ) : (
          <div style={s.list}>
            {orders.map(order => {
              const listing = order.listingId
              const other = isFarmer ? order.buyerId : order.farmerId
              const img = listing?.images?.[0] || `https://placehold.co/80x80/e8f3ec/2a5c3f?text=${encodeURIComponent(listing?.crop || '?')}`
              return (
                <Link to={`/orders/${order._id}`} key={order._id} style={{ textDecoration: 'none' }}>
                  <div className="card" style={s.card}>
                    <img src={img} alt={listing?.crop} style={s.img} />
                    <div style={s.info}>
                      <div style={s.top}>
                        <span style={s.crop}>{listing?.crop || 'Produce'}</span>
                        <span className={`badge ${STATUS_COLORS[order.status] || 'badge-earth'}`}>{order.status}</span>
                      </div>
                      <p style={s.meta}>
                        {order.quantity} {order.unit} · ₹{order.agreedPrice}/{order.unit} ·{' '}
                        <strong style={{ color: 'var(--green)' }}>₹{order.totalAmount.toLocaleString()} total</strong>
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
  h1: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--earth)', marginBottom: 20 },
  filters: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { display: 'flex', alignItems: 'center', gap: 16, padding: 16, transition: 'box-shadow 0.2s', cursor: 'pointer' },
  img: { width: 70, height: 70, borderRadius: 10, objectFit: 'cover', flexShrink: 0 },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  top: { display: 'flex', alignItems: 'center', gap: 10 },
  crop: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--earth)' },
  meta: { fontSize: 13, color: '#888' },
  arrow: { color: '#ccc', fontSize: 18, flexShrink: 0 },
}
