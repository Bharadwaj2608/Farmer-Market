import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { RiLeafLine, RiMenuLine, RiCloseLine, RiAddLine, RiUserLine, RiLogoutBoxLine } from 'react-icons/ri'

const NAV_LINKS = [
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/dashboard',   label: 'Dashboard',   auth: true },
  { to: '/orders',      label: 'Orders',       auth: true },
  { to: '/negotiations',label: 'Negotiate',    auth: true },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav style={{
        ...styles.nav,
        background: scrolled ? 'rgba(13,15,10,0.92)' : 'transparent',
        borderBottomColor: scrolled ? 'var(--border)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.35)' : 'none',
      }}>
        <div className="container" style={styles.inner}>

          {/* Logo */}
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>
              <RiLeafLine size={18} color="#0d0f0a" />
            </span>
            <span style={styles.logoText}>FarmDirect</span>
          </Link>

          {/* Desktop nav links */}
          <div style={styles.links}>
            {NAV_LINKS.filter(l => !l.auth || user).map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  ...styles.link,
                  ...(isActive(link.to) ? styles.linkActive : {}),
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div style={styles.actions}>
            {user ? (
              <>
                {user.role === 'farmer' && (
                  <Link to="/create-listing" className="btn btn-primary btn-sm">
                    <RiAddLine size={14} /> List Produce
                  </Link>
                )}
                <Link to="/profile" style={styles.avatar} title={user.name}>
                  {user.name?.charAt(0).toUpperCase()}
                </Link>
                <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
                  <RiLogoutBoxLine size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button style={styles.hamburger} onClick={() => setOpen(v => !v)} aria-label="Menu">
            {open ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div style={styles.drawer}>
            {NAV_LINKS.filter(l => !l.auth || user).map(link => (
              <Link key={link.to} to={link.to} style={{
                ...styles.drawerLink,
                ...(isActive(link.to) ? styles.drawerLinkActive : {})
              }}>
                {link.label}
              </Link>
            ))}
            <div style={styles.drawerDivider} />
            {user ? (
              <>
                {user.role === 'farmer' && (
                  <Link to="/create-listing" style={styles.drawerLink}>+ List Produce</Link>
                )}
                <Link to="/profile" style={styles.drawerLink}>
                  <RiUserLine size={14} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ ...styles.drawerLink, color: 'var(--red)', background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                >
                  <RiLogoutBoxLine size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.drawerLink}>Login</Link>
                <Link to="/register" style={{ ...styles.drawerLink, color: 'var(--lime)' }}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  )
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease',
    borderBottom: '1px solid transparent',
  },
  inner: {
    display: 'flex', alignItems: 'center', gap: 8,
    height: 64,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 9,
    textDecoration: 'none', flexShrink: 0, marginRight: 12,
  },
  logoIcon: {
    width: 30, height: 30, borderRadius: 8,
    background: 'var(--lime)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: 18, fontWeight: 900,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
  },
  links: {
    display: 'flex', alignItems: 'center', gap: 2, flex: 1,
  },
  link: {
    padding: '6px 13px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text2)',
    letterSpacing: '0.01em',
    transition: 'all 0.15s',
    textDecoration: 'none',
  },
  linkActive: {
    background: 'rgba(200,232,64,0.1)',
    color: 'var(--lime)',
  },
  actions: {
    display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'var(--surface2)',
    border: '1.5px solid var(--border2)',
    color: 'var(--lime)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700,
    textDecoration: 'none',
    flexShrink: 0,
    transition: 'border-color 0.15s',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center',
    color: 'var(--text3)',
    padding: 6, borderRadius: 6,
    transition: 'color 0.15s',
  },
  hamburger: {
    display: 'none',
    color: 'var(--text)',
    padding: 6,
    '@media(max-width:768px)': { display: 'flex' },
  },
  drawer: {
    background: 'rgba(13,15,10,0.97)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--border)',
    padding: '12px 0 20px',
  },
  drawerLink: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '13px 24px',
    fontSize: 15,
    color: 'var(--text2)',
    textDecoration: 'none',
    transition: 'color 0.15s',
    fontWeight: 500,
    cursor: 'pointer',
  },
  drawerLinkActive: { color: 'var(--lime)' },
  drawerDivider: { height: 1, background: 'var(--border)', margin: '8px 24px' },
}
