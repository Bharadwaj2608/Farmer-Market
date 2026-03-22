import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { RiMapPinLine, RiScales2Line, RiCalendarLine, RiVerifiedBadgeFill, RiStarFill } from 'react-icons/ri'

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderForm, setOrderForm] = useState({ quantity: 1, deliveryAddress: '', city: '', state: '' })
  const [negForm, setNegForm] = useState({ price: '', quantity: 1, message: '' })
  const [tab, setTab] = useState('order') // 'order' | 'negotiate'
  const [submitting, setSubmitting] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(r => { setListing(r.data); setNegForm(f => ({ ...f, price: r.data.pricePerUnit })) })
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    setSubmitting(true)
    try {
      const res = await api.post('/orders', {
        listingId: listing._id,
        quantity: Number(orderForm.quantity),
        deliveryAddress: { address: orderForm.deliveryAddress, city: orderForm.city, state: orderForm.state },
      })
      toast.success('Order placed!')
      navigate(`/orders/${res.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally { setSubmitting(false) }
  }

  const handleNegotiate = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    setSubmitting(true)
    try {
      const res = await api.post('/negotiations', {
        listingId: listing._id,
        price: Number(negForm.price),
        quantity: Number(negForm.quantity),
        message: negForm.message,
      })
      toast.success('Negotiation started!')
      navigate(`/negotiations/${res.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!listing) return <div className="container" style={{ padding: 40 }}>Listing not found.</div>

  const farmer = listing.farmerId
  const images = listing.images?.length ? listing.images : [`https://placehold.co/700x420/e8f3ec/2a5c3f?text=${encodeURIComponent(listing.crop)}`]
  const isBuyer = user?.role === 'buyer'
  const isFarmerOwner = user?._id === listing.farmerId?._id?.toString() || user?._id === listing.farmerId?._id

  return (
    <div style={{ padding: '32px 0 60px' }}>
      <div className="container">
        <div style={s.grid}>
          {/* Left: images + info */}
          <div>
            <div style={s.imgWrap}>
              <img src={images[imgIdx]} alt={listing.crop} style={s.img} />
              {images.length > 1 && (
                <div style={s.thumbs}>
                  {images.map((img, i) => (
                    <img key={i} src={img} onClick={() => setImgIdx(i)}
                      style={{ ...s.thumb, ...(i === imgIdx ? s.thumbActive : {}) }} />
                  ))}
                </div>
              )}
            </div>

            {/* Farmer card */}
            <div className="card" style={{ padding: 20, marginTop: 20 }}>
              <h3 style={s.sectionTitle}>Sold by</h3>
              <Link to={`/users/${farmer?._id}`} style={s.farmerRow}>
                <div style={s.farmerAvatar}>{farmer?.name?.charAt(0)}</div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--earth)' }}>{farmer?.farmDetails?.farmName || farmer?.name}</p>
                  <p style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <RiMapPinLine size={12} />
                    {farmer?.farmDetails?.location?.city || 'India'}
                  </p>
                </div>
                {farmer?.trustScore > 0 && (
                  <div style={s.trustBadge}>
                    <RiStarFill size={13} color="var(--amber)" />
                    <span>{farmer.trustScore}</span>
                    <span style={{ color: '#999' }}>({farmer.totalReviews})</span>
                  </div>
                )}
              </Link>
              {farmer?.farmDetails?.description && (
                <p style={{ fontSize: 13, color: '#888', marginTop: 10 }}>{farmer.farmDetails.description}</p>
              )}
            </div>
          </div>

          {/* Right: details + action */}
          <div>
            <div style={s.badges}>
              <span className="badge badge-green">{listing.category}</span>
              {listing.isNegotiable && <span className="badge badge-amber">Negotiable</span>}
              <span className={`badge ${listing.status === 'active' ? 'badge-green' : 'badge-earth'}`}>{listing.status}</span>
            </div>

            <h1 style={s.h1}>{listing.crop}</h1>
            <div style={s.price}>
              <span style={s.priceNum}>₹{listing.pricePerUnit}</span>
              <span style={s.priceUnit}>per {listing.unit}</span>
            </div>

            {listing.description && <p style={s.desc}>{listing.description}</p>}

            <div style={s.specs}>
              <div style={s.spec}><RiScales2Line size={15} color="var(--green)" /><span>{listing.quantity} {listing.unit} available</span></div>
              <div style={s.spec}><RiScales2Line size={15} color="var(--green)" /><span>Min order: {listing.minOrderQuantity} {listing.unit}</span></div>
              {listing.location?.city && <div style={s.spec}><RiMapPinLine size={15} color="var(--green)" /><span>{listing.location.city}, {listing.location.state}</span></div>}
              {listing.harvestDate && <div style={s.spec}><RiCalendarLine size={15} color="var(--green)" /><span>Harvested: {new Date(listing.harvestDate).toLocaleDateString()}</span></div>}
            </div>

            <div className="divider" />

            {isFarmerOwner ? (
              <div style={{ padding: 16, background: 'var(--cream)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--earth-mid)' }}>
                This is your listing. <Link to="/dashboard" style={{ color: 'var(--green)' }}>Go to dashboard →</Link>
              </div>
            ) : isBuyer ? (
              <>
                {listing.isNegotiable && (
                  <div style={s.tabs}>
                    <button onClick={() => setTab('order')} style={{ ...s.tab, ...(tab === 'order' ? s.tabActive : {}) }}>Buy Now</button>
                    <button onClick={() => setTab('negotiate')} style={{ ...s.tab, ...(tab === 'negotiate' ? s.tabActive : {}) }}>Negotiate Price</button>
                  </div>
                )}

                {tab === 'order' ? (
                  <form onSubmit={handleOrder} style={s.form}>
                    <div className="form-group">
                      <label className="form-label">Quantity ({listing.unit})</label>
                      <input type="number" min={listing.minOrderQuantity} max={listing.quantity}
                        value={orderForm.quantity} onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Delivery address</label>
                      <input placeholder="Street address" value={orderForm.deliveryAddress}
                        onChange={e => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })} required />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input value={orderForm.city} onChange={e => setOrderForm({ ...orderForm, city: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State</label>
                        <input value={orderForm.state} onChange={e => setOrderForm({ ...orderForm, state: e.target.value })} required />
                      </div>
                    </div>
                    <div style={s.totalRow}>
                      <span>Total</span>
                      <strong style={{ fontSize: 20, color: 'var(--green)', fontFamily: 'var(--font-display)' }}>
                        ₹{(listing.pricePerUnit * orderForm.quantity).toLocaleString()}
                      </strong>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                      {submitting ? 'Placing order...' : 'Place Order'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleNegotiate} style={s.form}>
                    <div className="form-group">
                      <label className="form-label">Your offer (₹ per {listing.unit})</label>
                      <input type="number" value={negForm.price} onChange={e => setNegForm({ ...negForm, price: e.target.value })} required />
                      <span className="form-hint">Listed at ₹{listing.pricePerUnit}</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantity ({listing.unit})</label>
                      <input type="number" min={listing.minOrderQuantity} max={listing.quantity}
                        value={negForm.quantity} onChange={e => setNegForm({ ...negForm, quantity: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message to farmer</label>
                      <textarea rows={3} placeholder="Explain your offer, bulk discount request, etc."
                        value={negForm.message} onChange={e => setNegForm({ ...negForm, message: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-outline btn-lg" style={{ width: '100%' }} disabled={submitting}>
                      {submitting ? 'Sending offer...' : 'Send Offer'}
                    </button>
                  </form>
                )}
              </>
            ) : !user ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <Link to="/login" className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>Login to buy</Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' },
  imgWrap: { borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--cream-dark)', aspectRatio: '4/3' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbs: { display: 'flex', gap: 8, padding: 10, background: '#fff', borderTop: '1px solid var(--border)' },
  thumb: { width: 56, height: 56, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: '2px solid transparent', opacity: 0.7 },
  thumbActive: { border: '2px solid var(--green)', opacity: 1 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--earth)', marginBottom: 12 },
  farmerRow: { display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' },
  farmerAvatar: { width: 44, height: 44, borderRadius: '50%', background: 'var(--green-pale)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, flexShrink: 0 },
  trustBadge: { display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', fontSize: 14, fontWeight: 500, color: 'var(--earth)' },
  badges: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  h1: { fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--earth)', marginBottom: 12 },
  price: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  priceNum: { fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--green)' },
  priceUnit: { fontSize: 15, color: '#999' },
  desc: { fontSize: 15, color: 'var(--earth-mid)', lineHeight: 1.7, marginBottom: 20 },
  specs: { display: 'flex', flexDirection: 'column', gap: 8 },
  spec: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--earth-mid)' },
  tabs: { display: 'flex', background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)', padding: 4, gap: 4, marginBottom: 20 },
  tab: { flex: 1, padding: '8px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500, color: 'var(--earth-mid)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s' },
  tabActive: { background: '#fff', color: 'var(--green)', boxShadow: 'var(--shadow-sm)' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--border)' },
}
