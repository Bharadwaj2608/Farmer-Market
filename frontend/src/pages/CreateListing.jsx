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
    // ⭐ FIX 1: paddingTop 90px fixes navbar overlap
    <div style={{ padding: '90px 0 60px' }}>
      <div className="container" style={{ maxWidth: 720 }}>

        {/* ⭐ FIX 2: Dark hero header */}
        <div style={s.hero}>
          <h1 style={s.h1}>List your produce</h1>
          <p style={s.sub}>Fill in the details to let buyers find your crop</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>

          {/* Crop details */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Crop details</h2>
            <div style={s.grid2}>
              <div style={s.formGroup}>
                <label style={s.label}>CROP NAME *</label>
                <input
                  value={form.crop}
                  onChange={e => set('crop', e.target.value)}
                  placeholder="e.g. Tomatoes, Wheat"
                  required
                  style={s.input}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>CATEGORY *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} style={s.input}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>DESCRIPTION</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Quality, grade, farming method, certifications..."
                style={{ ...s.input, resize: 'vertical', minHeight: 80 }}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>TAGS (COMMA-SEPARATED)</label>
              <input
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="organic, pesticide-free, grade-A"
                style={s.input}
              />
            </div>
          </div>

          {/* Quantity & pricing */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Quantity & pricing</h2>
            <div style={s.grid2}>
              <div style={s.formGroup}>
                <label style={s.label}>AVAILABLE QUANTITY *</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={e => set('quantity', e.target.value)}
                  min={0} required
                  style={s.input}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>UNIT *</label>
                <select value={form.unit} onChange={e => set('unit', e.target.value)} style={s.input}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>PRICE PER {form.unit.toUpperCase()} (₹) *</label>
                <input
                  type="number"
                  value={form.pricePerUnit}
                  onChange={e => set('pricePerUnit', e.target.value)}
                  min={0} required
                  style={s.input}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>MINIMUM ORDER ({form.unit.toUpperCase()})</label>
                <input
                  type="number"
                  value={form.minOrderQuantity}
                  onChange={e => set('minOrderQuantity', e.target.value)}
                  min={1}
                  style={s.input}
                />
              </div>
            </div>
            {/* Negotiable checkbox */}
            <div style={s.checkRow}>
              <input
                type="checkbox"
                id="negotiable"
                checked={form.isNegotiable}
                onChange={e => set('isNegotiable', e.target.checked)}
                style={s.checkbox}
              />
              <label htmlFor="negotiable" style={s.checkLabel}>
                Allow buyers to negotiate price
              </label>
            </div>
          </div>

          {/* Harvest & expiry */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Harvest & expiry</h2>
            <div style={s.grid2}>
              <div style={s.formGroup}>
                <label style={s.label}>HARVEST DATE</label>
                <input
                  type="date"
                  value={form.harvestDate}
                  onChange={e => set('harvestDate', e.target.value)}
                  style={s.input}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>BEST BEFORE</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={e => set('expiryDate', e.target.value)}
                  style={s.input}
                />
              </div>
            </div>
          </div>

          {/* Farm location */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Farm location</h2>
            <div style={s.formGroup}>
              <label style={s.label}>ADDRESS</label>
              <input
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Village / area name"
                style={s.input}
              />
            </div>
            <div style={s.grid2}>
              <div style={s.formGroup}>
                <label style={s.label}>CITY *</label>
                <input
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  required placeholder="Nashik"
                  style={s.input}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>STATE *</label>
                <input
                  value={form.state}
                  onChange={e => set('state', e.target.value)}
                  required placeholder="Maharashtra"
                  style={s.input}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>LATITUDE (OPTIONAL)</label>
                <input
                  type="number" step="any"
                  value={form.lat}
                  onChange={e => set('lat', e.target.value)}
                  placeholder="20.0059"
                  style={s.input}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>LONGITUDE (OPTIONAL)</label>
                <input
                  type="number" step="any"
                  value={form.lng}
                  onChange={e => set('lng', e.target.value)}
                  placeholder="73.7897"
                  style={s.input}
                />
              </div>
            </div>
            <p style={s.hint}>Coordinates enable distance-based search for buyers</p>
          </div>

          {/* Photos */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Photos (up to 5)</h2>
            <label style={s.fileLabel}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => setImages(Array.from(e.target.files).slice(0, 5))}
                style={{ display: 'none' }}
              />
              <span style={s.fileBtn}>📷 Choose photos</span>
              <span style={s.fileHint}>JPG, PNG — max 5MB each</span>
            </label>
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {images.map((f, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(f)}
                    alt=""
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '2px solid #3a5c3a' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={s.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={s.submitBtn}
            >
              {loading ? 'Publishing...' : 'Publish listing'}
            </button>
          </div>
        </form>

        <style>{`
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            opacity: 0.5;
            cursor: pointer;
          }
          input::placeholder, textarea::placeholder {
            color: #3a5c3a !important;
          }
          input:focus, textarea:focus, select:focus {
            outline: none !important;
            border-color: #c8e840 !important;
            box-shadow: 0 0 0 2px rgba(200,232,64,0.1) !important;
          }
          option {
            background: #1a2e1a;
            color: #d4e8c2;
          }
        `}</style>
      </div>
    </div>
  )
}

const s = {
  // ⭐ Dark hero
  hero: {
    background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 100%)',
    border: '1px solid #3a5c3a',
    borderLeft: '4px solid #c8e840',
    borderRadius: '16px',
    padding: '28px 32px',
    marginBottom: 28,
  },
  h1: { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: '#c8e840', margin: 0 },
  sub: { color: '#7a9e6e', fontSize: 15, marginTop: 6 },

  form: { display: 'flex', flexDirection: 'column', gap: 20 },

  // ⭐ Dark section cards
  section: {
    background: '#1a2e1a',
    border: '1px solid #3a5c3a',
    borderRadius: '16px',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 17, fontWeight: 600,
    color: '#c8e840', marginBottom: 4,
  },

  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },

  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },

  label: {
    fontSize: 11, fontWeight: 600,
    color: '#7a9e6e', letterSpacing: 0.8,
  },

  // ⭐ Dark inputs
  input: {
    background: '#0f1f0f',
    border: '1.5px solid #3a5c3a',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: 14,
    color: '#d4e8c2',
    fontFamily: 'var(--font-body)',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },

  checkRow: { display: 'flex', alignItems: 'center', gap: 10 },
  checkbox: { width: 16, height: 16, accentColor: '#c8e840', cursor: 'pointer' },
  checkLabel: { fontSize: 14, color: '#7a9e6e', cursor: 'pointer' },

  hint: { fontSize: 12, color: '#3a5c3a', marginTop: -8 },

  // ⭐ Dark file upload
  fileLabel: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    border: '2px dashed #3a5c3a',
    borderRadius: '12px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    background: '#0f1f0f',
  },
  fileBtn: {
    fontSize: 14, fontWeight: 600,
    color: '#c8e840',
    background: 'rgba(200,232,64,0.1)',
    padding: '8px 20px',
    borderRadius: '20px',
    border: '1px solid rgba(200,232,64,0.3)',
  },
  fileHint: { fontSize: 12, color: '#3a5c3a' },

  // ⭐ Buttons
  cancelBtn: {
    padding: '12px 24px', borderRadius: '10px',
    border: '1px solid #3a5c3a', background: 'transparent',
    color: '#7a9e6e', fontSize: 14, cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  submitBtn: {
    flex: 1, padding: '12px 24px', borderRadius: '10px',
    border: 'none', background: '#c8e840',
    color: '#1a2e1a', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'var(--font-body)',
    transition: 'opacity 0.2s',
  },
}