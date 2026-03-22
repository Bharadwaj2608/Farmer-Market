import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: '', phone: '',
    farmName: '', city: '', state: '', description: '',
    deliveryCity: '', deliveryState: '', deliveryAddress: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password,
        role: form.role, phone: form.phone,
        ...(form.role === 'farmer' ? {
          farmDetails: {
            farmName: form.farmName,
            location: { city: form.city, state: form.state },
            description: form.description,
          }
        } : {
          deliveryAddresses: form.deliveryAddress ? [{
            label: 'Home', address: form.deliveryAddress,
            city: form.deliveryCity, state: form.deliveryState, isDefault: true,
          }] : []
        })
      }
      const user = await register(payload)
      toast.success(`Account created! Welcome, ${user.name}`)
      navigate(user.role === 'farmer' ? '/dashboard' : '/marketplace')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card} className="card">
        <h1 style={s.h1}>Create account</h1>

        {/* Step indicator */}
        <div style={s.steps}>
          {[1, 2].map(n => (
            <div key={n} style={{ ...s.stepDot, ...(step >= n ? s.stepActive : {}) }}>{n}</div>
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); if (!form.role) return toast.error('Select a role'); setStep(2) } : handleSubmit} style={s.form}>
          {step === 1 && <>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Rajesh Kumar" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} placeholder="Min. 6 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone (optional)</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label className="form-label">I am a...</label>
              <div style={s.roleGrid}>
                {['farmer', 'buyer'].map(role => (
                  <button type="button" key={role} onClick={() => set('role', role)}
                    style={{ ...s.roleBtn, ...(form.role === role ? s.roleBtnActive : {}) }}>
                    <span style={{ fontSize: 28 }}>{role === 'farmer' ? '🌾' : '🛒'}</span>
                    <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{role}</span>
                    <span style={{ fontSize: 12, color: '#999' }}>{role === 'farmer' ? 'List & sell produce' : 'Buy directly'}</span>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Continue →</button>
          </>}

          {step === 2 && <>
            {form.role === 'farmer' ? <>
              <div className="form-group">
                <label className="form-label">Farm name</label>
                <input value={form.farmName} onChange={e => set('farmName', e.target.value)} placeholder="Green Valley Farm" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Pune" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="Maharashtra" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">About your farm</label>
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What do you grow? Any certifications?" style={{ resize: 'vertical' }} />
              </div>
            </> : <>
              <div className="form-group">
                <label className="form-label">Delivery address (optional)</label>
                <input value={form.deliveryAddress} onChange={e => set('deliveryAddress', e.target.value)} placeholder="Street address" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input value={form.deliveryCity} onChange={e => set('deliveryCity', e.target.value)} placeholder="Mumbai" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input value={form.deliveryState} onChange={e => set('deliveryState', e.target.value)} placeholder="Maharashtra" />
                </div>
              </div>
            </>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </>}
        </form>

        <p style={s.footer}>
          Already have an account? <Link to="/login" style={{ color: 'var(--green)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--cream)' },
  card: { width: '100%', maxWidth: 480, padding: 36, boxShadow: 'var(--shadow-md)' },
  h1: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--earth)', marginBottom: 20 },
  steps: { display: 'flex', gap: 8, marginBottom: 28 },
  stepDot: { width: 28, height: 28, borderRadius: '50%', background: 'var(--cream-dark)', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 },
  stepActive: { background: 'var(--green)', color: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  roleBtn: { display: 'flex', flexDirection: 'column', gap: 4, padding: '16px 12px', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', cursor: 'pointer', transition: 'all 0.18s', alignItems: 'center', textAlign: 'center' },
  roleBtnActive: { border: '2px solid var(--green)', background: 'var(--green-pale)' },
  footer: { marginTop: 24, fontSize: 14, color: '#999', textAlign: 'center' },
}
