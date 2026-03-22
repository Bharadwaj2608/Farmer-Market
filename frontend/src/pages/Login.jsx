import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { RiPlantLine } from 'react-icons/ri'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'farmer' ? '/dashboard' : '/marketplace')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card} className="card">
        <div style={s.logo}>
          <RiPlantLine size={28} color="var(--green)" />
          <span style={s.logoText}>FarmDirect</span>
        </div>
        <h1 style={s.h1}>Welcome back</h1>
        <p style={s.sub}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={s.footer}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--green)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--cream)' },
  card: { width: '100%', maxWidth: 420, padding: 36, boxShadow: 'var(--shadow-md)' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--earth)' },
  h1: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--earth)', marginBottom: 6 },
  sub: { color: '#999', fontSize: 14, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  footer: { marginTop: 24, fontSize: 14, color: '#999', textAlign: 'center' },
}
