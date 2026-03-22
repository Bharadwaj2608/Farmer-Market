import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { RiMapPinLine, RiPhoneLine, RiCheckLine } from 'react-icons/ri'

const STATUS_STEPS = ['pending', 'confirmed', 'dispatched', 'delivered']

const STATUS_COLORS = {
  pending: 'badge-amber', confirmed: 'badge-green',
  dispatched: 'badge-green', delivered: 'badge-earth',
  cancelled: 'badge-red', refunded: 'badge-red',
}

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (status, note = '') => {
    setUpdating(true)
    try {
      const res = await api.patch(`/orders/${id}/status`, { status, note })
      setOrder(res.data)
      toast.success(`Order ${status}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setUpdating(false) }
  }

  const simulatePayment = async () => {
    setUpdating(true)
    try {
      const res = await api.patch(`/orders/${id}/payment`)
      setOrder(res.data)
      toast.success('Payment escrowed!')
    } catch (err) {
      toast.error('Payment failed')
    } finally { setUpdating(false) }
  }

  const submitReview = async () => {
    try {
      await api.post('/reviews', { orderId: id, ...review })
      setReviewSubmitted(true)
      toast.success('Review submitted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!order) return <div className="container" style={{ padding: 40 }}>Order not found.</div>

  const isFarmer = user?.role === 'farmer'
  const isBuyer = user?.role === 'buyer'
  const listing = order.listingId
  const buyer = order.buyerId
  const farmer = order.farmerId
  const currentStep = STATUS_STEPS.indexOf(order.status)
  const img = listing?.images?.[0] || `https://placehold.co/120x120/e8f3ec/2a5c3f?text=${encodeURIComponent(listing?.crop || '?')}`

  return (
    <div style={{ padding: '32px 0 60px' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={s.header}>
          <Link to="/orders" style={{ color: 'var(--green)', fontSize: 14 }}>← Back to orders</Link>
          <span className={`badge ${STATUS_COLORS[order.status] || 'badge-earth'}`} style={{ fontSize: 14, padding: '6px 14px' }}>
            {order.status}
          </span>
        </div>

        {/* Progress tracker */}
        {!['cancelled', 'refunded'].includes(order.status) && (
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={s.stepper}>
              {STATUS_STEPS.map((step, i) => (
                <div key={step} style={s.stepItem}>
                  <div style={{ ...s.stepCircle, ...(i <= currentStep ? s.stepDone : {}) }}>
                    {i <= currentStep ? <RiCheckLine size={14} /> : i + 1}
                  </div>
                  <span style={{ ...s.stepLabel, ...(i <= currentStep ? { color: 'var(--green)', fontWeight: 500 } : {}) }}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ ...s.stepLine, ...(i < currentStep ? s.stepLineDone : {}) }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={s.grid}>
          {/* Left: product + details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <img src={img} alt={listing?.crop} style={{ width: 90, height: 90, borderRadius: 10, objectFit: 'cover' }} />
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--earth)', marginBottom: 6 }}>
                    {listing?.crop}
                  </h2>
                  <p style={{ color: '#888', fontSize: 14 }}>{order.quantity} {order.unit} @ ₹{order.agreedPrice}/{order.unit}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--green)', fontWeight: 700, marginTop: 4 }}>
                    ₹{order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            {order.deliveryAddress?.address && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={s.cardTitle}>Delivery address</h3>
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 14, color: 'var(--earth-mid)' }}>
                  <RiMapPinLine size={15} color="var(--green)" style={{ marginTop: 2, flexShrink: 0 }} />
                  {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.state}
                </p>
              </div>
            )}

            {/* Payment */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={s.cardTitle}>Payment</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--earth-mid)', marginBottom: 8 }}>
                <span>Status</span>
                <span className={`badge ${order.paymentStatus === 'released' ? 'badge-green' : order.paymentStatus === 'escrowed' ? 'badge-amber' : 'badge-earth'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentId && <p style={{ fontSize: 12, color: '#999' }}>ID: {order.paymentId}</p>}
              {isBuyer && order.paymentStatus === 'unpaid' && order.status === 'pending' && (
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={simulatePayment} disabled={updating}>
                  {updating ? 'Processing...' : 'Pay ₹' + order.totalAmount.toLocaleString() + ' (Escrow)'}
                </button>
              )}
            </div>

            {/* Status history */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={s.cardTitle}>Order history</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {order.statusHistory?.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                    <span style={{ color: '#999', flexShrink: 0 }}>{new Date(h.timestamp).toLocaleDateString()}</span>
                    <span style={{ fontWeight: 500, color: 'var(--earth-mid)', textTransform: 'capitalize' }}>{h.status}</span>
                    {h.note && <span style={{ color: '#aaa' }}>— {h.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: parties + actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Farmer info */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={s.cardTitle}>Farmer</h3>
              <p style={{ fontWeight: 500, color: 'var(--earth)', marginBottom: 4 }}>{farmer?.name}</p>
              {farmer?.farmDetails?.farmName && <p style={{ fontSize: 13, color: '#888' }}>{farmer.farmDetails.farmName}</p>}
              {farmer?.phone && (
                <a href={`tel:${farmer.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--green)', marginTop: 8 }}>
                  <RiPhoneLine size={13} /> {farmer.phone}
                </a>
              )}
            </div>

            {/* Buyer info */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={s.cardTitle}>Buyer</h3>
              <p style={{ fontWeight: 500, color: 'var(--earth)', marginBottom: 4 }}>{buyer?.name}</p>
              {buyer?.phone && (
                <a href={`tel:${buyer.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--green)', marginTop: 8 }}>
                  <RiPhoneLine size={13} /> {buyer.phone}
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={s.cardTitle}>Actions</h3>
              {isFarmer && order.status === 'pending' && order.paymentStatus === 'escrowed' && (
                <button className="btn btn-primary" onClick={() => updateStatus('confirmed', 'Farmer confirmed order')} disabled={updating}>
                  Confirm order
                </button>
              )}
              {isFarmer && order.status === 'confirmed' && (
                <button className="btn btn-primary" onClick={() => updateStatus('dispatched', 'Order dispatched')} disabled={updating}>
                  Mark as dispatched
                </button>
              )}
              {isBuyer && order.status === 'dispatched' && (
                <button className="btn btn-primary" onClick={() => updateStatus('delivered', 'Buyer confirmed delivery')} disabled={updating}>
                  Confirm delivery received
                </button>
              )}
              {['pending', 'confirmed'].includes(order.status) && (
                <button className="btn btn-danger" onClick={() => updateStatus('cancelled', 'Cancelled by user')} disabled={updating}>
                  Cancel order
                </button>
              )}
              {order.negotiationId && (
                <Link to={`/negotiations/${order.negotiationId}`} className="btn btn-secondary">View negotiation chat</Link>
              )}
            </div>

            {/* Review */}
            {order.status === 'delivered' && !reviewSubmitted && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={s.cardTitle}>Leave a review</h3>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setReview(r => ({ ...r, rating: n }))}
                      style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', color: n <= review.rating ? 'var(--amber)' : '#ddd' }}>
                      ★
                    </button>
                  ))}
                </div>
                <textarea rows={3} placeholder="Share your experience..." value={review.comment}
                  onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                  style={{ marginBottom: 10, resize: 'vertical' }} />
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={submitReview}>Submit review</button>
              </div>
            )}
            {reviewSubmitted && (
              <div className="card" style={{ padding: 16, background: 'var(--green-pale)', border: '1px solid var(--green-light)' }}>
                <p style={{ color: 'var(--green)', fontSize: 14, fontWeight: 500 }}>✓ Review submitted. Thank you!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  stepper: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, position: 'relative' },
  stepCircle: { width: 32, height: 32, borderRadius: '50%', background: 'var(--cream-dark)', color: '#bbb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, zIndex: 1 },
  stepDone: { background: 'var(--green)', color: '#fff' },
  stepLabel: { fontSize: 12, color: '#bbb', textAlign: 'center' },
  stepLine: { position: 'absolute', top: 16, left: '50%', width: '100%', height: 2, background: 'var(--cream-dark)', zIndex: 0 },
  stepLineDone: { background: 'var(--green)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--earth)', marginBottom: 12 },
}
