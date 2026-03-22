import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['vegetables', 'fruits', 'grains', 'dairy', 'spices', 'other']
const UNITS = ['kg', 'quintal', 'ton', 'dozen', 'box', 'litre']

export default function CreateListing() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [form, setForm] = useState({
    crop: '', category: 'vegetables', description: '',
    quantity: '', unit: 'kg', pricePerUnit: '', isNegotiable: true,
    minOrderQuantity: '1', harvestDate: '', expiryDate: '',
    address: '', city: '', state: '', lat: '', lng: '', tags: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      images.forEach(img => fd.append('images', img))

      const res = await api.post('/listings', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Listing created!')
      navigate(`/listings/${res.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '32px 0 60px' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={s.h1}>List your produce</h1>
        <p style={s.sub}>Fill in the details to let buyers find your crop</p>

        <form onSubmit={handleSubmit} style={s.form}>
          {/* Basic info */}
          <div className="card" style={s.section}>
            <h2 style={s.sectionTitle}>Crop details</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Crop name *</label>
                <input value={form.crop} onChange={e => set('crop', e.target.value)} placeholder="e.g. Tomatoes, Wheat" required />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Quality, grade, farming method, certifications..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="organic, pesticide-free, grade-A" />
            </div>
          </div>

          {/* Pricing */}
          <div className="card" style={s.section}>
            <h2 style={s.sectionTitle}>Quantity & pricing</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Available quantity *</label>
                <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} min={0} required />
              </div>
              <div className="form-group">
                <label className="form-label">Unit *</label>
                <select value={form.unit} onChange={e => set('unit', e.target.value)}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price per {form.unit} (₹) *</label>
                <input type="number" value={form.pricePerUnit} onChange={e => set('pricePerUnit', e.target.value)} min={0} required />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum order ({form.unit})</label>
                <input type="number" value={form.minOrderQuantity} onChange={e => set('minOrderQuantity', e.target.value)} min={1} />
              </div>
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="negotiable" checked={form.isNegotiable}
                onChange={e => set('isNegotiable', e.target.checked)} style={{ width: 'auto' }} />
              <label htmlFor="negotiable" style={{ fontSize: 14, cursor: 'pointer', color: 'var(--earth-mid)' }}>
                Allow buyers to negotiate price
              </label>
            </div>
          </div>

          {/* Dates */}
          <div className="card" style={s.section}>
            <h2 style={s.sectionTitle}>Harvest & expiry</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Harvest date</label>
                <input type="date" value={form.harvestDate} onChange={e => set('harvestDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Best before</label>
                <input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card" style={s.section}>
            <h2 style={s.sectionTitle}>Farm location</h2>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Village / area name" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} required placeholder="Nashik" />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input value={form.state} onChange={e => set('state', e.target.value)} required placeholder="Maharashtra" />
              </div>
              <div className="form-group">
                <label className="form-label">Latitude (optional)</label>
                <input type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="20.0059" />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude (optional)</label>
                <input type="number" step="any" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="73.7897" />
              </div>
            </div>
            <span className="form-hint">Coordinates enable distance-based search for buyers</span>
          </div>

          {/* Images */}
          <div className="card" style={s.section}>
            <h2 style={s.sectionTitle}>Photos (up to 5)</h2>
            <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files).slice(0, 5))}
              style={{ fontSize: 14, padding: 10, borderRadius: 'var(--radius-sm)', border: '1.5px dashed var(--border)', background: 'var(--cream)', cursor: 'pointer' }} />
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {images.map((f, i) => (
                  <img key={i} src={URL.createObjectURL(f)} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                ))}
              </div>
            )}
            <span className="form-hint">Upload clear photos of your produce (JPG, PNG, max 5MB each)</span>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Publishing...' : 'Publish listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const s = {
  h1: { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: 'var(--earth)', marginBottom: 6 },
  sub: { color: '#999', fontSize: 15, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  section: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--earth)', marginBottom: 4 },
}
