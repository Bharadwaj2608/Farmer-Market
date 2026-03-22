import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { RiUserLine, RiPlantLine, RiMapPinLine } from 'react-icons/ri'

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    farmName: user?.farmDetails?.farmName || '',
    city: user?.farmDetails?.location?.city || '',
    state: user?.farmDetails?.location?.state || '',
    description: user?.farmDetails?.description || '',
    deliveryAddress: user?.deliveryAddresses?.[0]?.address || '',
    deliveryCity: user?.deliveryAddresses?.[0]?.city || '',
    deliveryState: user?.deliveryAddresses?.[0]?.state || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        ...(user.role === 'farmer' ? {
          farmDetails: {
            farmName: form.farmName,
            location: { city: form.city, state: form.state },
            description: form.description,
          }
        } : {
          deliveryAddresses: [{
            label: 'Home',
            address: form.deliveryAddress,
            city: form.deliveryCity,
            state: form.deliveryState,
            isDefault: true,
          }]
        })
      }
      const res = await api.put('/users/profile/me', payload)
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '32px 0 60px' }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 style={s.h1}>My Profile</h1>

        {/* Profile card */}
        <div className="card" style={s.profileCard}>
          <div style={s.avatarLg}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--earth)', marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ fontSize: 14, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
              {user?.role === 'farmer' ? <RiPlantLine size={14} /> : <RiUserLine size={14} />}
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              {user?.farmDetails?.location?.city && (
                <><RiMapPinLine size={14} /> {user.farmDetails.location.city}</>
              )}
            </p>
            {user?.trustScore > 0 && (
              <p style={{ fontSize: 13, color: 'var(--amber)', marginTop: 4 }}>
                ★ {user.trustScore} · {user.totalReviews} reviews
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} style={s.form}>
          {/* Basic */}
          <div className="card" style={s.section}>
            <h3 style={s.sectionTitle}>Personal details</h3>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input value={user?.email} disabled style={{ background: 'var(--cream)', color: '#999' }} />
              <span className="form-hint">Email cannot be changed</span>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
          </div>

          {/* Farmer details */}
          {user?.role === 'farmer' && (
            <div className="card" style={s.section}>
              <h3 style={s.sectionTitle}>Farm details</h3>
              <div className="form-group">
                <label className="form-label">Farm name</label>
                <input value={form.farmName} onChange={e => set('farmName', e.target.value)} placeholder="Green Valley Farm" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input value={form.state} onChange={e => set('state', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">About your farm</label>
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* Buyer delivery */}
          {user?.role === 'buyer' && (
            <div className="card" style={s.section}>
              <h3 style={s.sectionTitle}>Default delivery address</h3>
              <div className="form-group">
                <label className="form-label">Street address</label>
                <input value={form.deliveryAddress} onChange={e => set('deliveryAddress', e.target.value)} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input value={form.deliveryCity} onChange={e => set('deliveryCity', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input value={form.deliveryState} onChange={e => set('deliveryState', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className="btn btn-danger" onClick={logout} style={{ flexShrink: 0 }}>
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const s = {
  h1: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--earth)', marginBottom: 24 },
  profileCard: { padding: 24, display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 },
  avatarLg: { width: 64, height: 64, borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  section: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--earth)', marginBottom: 4 },
}
