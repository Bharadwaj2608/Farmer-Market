import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { RiPlantLine, RiMenuLine, RiCloseLine } from 'react-icons/ri'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <RiPlantLine size={22} color="var(--green)" />
          <span style={styles.logoText}>FarmDirect</span>
        </Link>

        <div style={styles.links}>
          <Link to="/marketplace" style={{ ...styles.link, ...(isActive('/marketplace') ? styles.linkActive : {}) }}>
            Marketplace
          </Link>
          {user && (
            <>
              <Link to="/dashboard" style={{ ...styles.link, ...(isActive('/dashboard') ? styles.linkActive : {}) }}>
                Dashboard
              </Link>
              <Link to="/orders" style={{ ...styles.link, ...(isActive('/orders') ? styles.linkActive : {}) }}>
                Orders
              </Link>
              <Link to="/negotiations" style={{ ...styles.link, ...(isActive('/negotiations') ? styles.linkActive : {}) }}>
                Negotiations
              </Link>
            </>
          )}
        </div>

        <div style={styles.actions}>
          {user ? (
            <>
              {user.role === 'farmer' && (
                <Link to="/create-listing" className="btn btn-primary btn-sm">+ List Produce</Link>
              )}
              <div style={styles.userMenu}>
                <Link to="/profile" style={styles.avatar}>
                  {user.name?.charAt(0).toUpperCase()}
                </Link>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        <button style={styles.menuBtn} onClick={() => setOpen(!open)}>
          {open ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
        </button>
      </div>

      {open && (
        <div style={styles.mobileMenu}>
          <Link to="/marketplace" style={styles.mobileLink} onClick={() => setOpen(false)}>Marketplace</Link>
          {user && <>
            <Link to="/dashboard" style={styles.mobileLink} onClick={() => setOpen(false)}>Dashboard</Link>
            <Link to="/orders" style={styles.mobileLink} onClick={() => setOpen(false)}>Orders</Link>
            <Link to="/negotiations" style={styles.mobileLink} onClick={() => setOpen(false)}>Negotiations</Link>
            <Link to="/profile" style={styles.mobileLink} onClick={() => setOpen(false)}>Profile</Link>
            <button onClick={() => { handleLogout(); setOpen(false) }} style={{ ...styles.mobileLink, color: 'var(--red)', background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              Logout
            </button>
          </>}
          {!user && <>
            <Link to="/login" style={styles.mobileLink} onClick={() => setOpen(false)}>Login</Link>
            <Link to="/register" style={styles.mobileLink} onClick={() => setOpen(false)}>Sign Up</Link>
          </>}
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: { background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 },
  inner: { display: 'flex', alignItems: 'center', gap: 24, height: 64 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--earth)' },
  links: { display: 'flex', alignItems: 'center', gap: 4, flex: 1, '@media(max-width:768px)': { display: 'none' } },
  link: { padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--earth-mid)', transition: 'all 0.15s' },
  linkActive: { background: 'var(--green-pale)', color: 'var(--green)', fontWeight: 500 },
  actions: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  userMenu: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'var(--green)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 600, textDecoration: 'none'
  },
  logoutBtn: { fontSize: 13, color: 'var(--earth-mid)', cursor: 'pointer', background: 'none', border: 'none' },
  menuBtn: { display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--earth)', '@media(max-width:768px)': { display: 'block' } },
  mobileMenu: { background: '#fff', borderTop: '1px solid var(--border)', padding: '12px 0' },
  mobileLink: { display: 'block', padding: '12px 24px', fontSize: 15, color: 'var(--earth)', textDecoration: 'none' },
}
