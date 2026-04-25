import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import api from '../utils/api'
import ListingCard from '../components/ListingCard'
import ThreeHero from '../components/ThreeHero'
import {
  RiPlantLine, RiTruckLine, RiShieldCheckLine,
  RiHandCoinLine, RiArrowRightLine, RiLeafLine,
  RiTimeLine, RiGroupLine,
} from 'react-icons/ri'

const CATEGORIES = [
  { slug: 'vegetables', label: 'Vegetables', icon: '🥦', desc: 'Leafy greens, roots & more' },
  { slug: 'fruits',     label: 'Fruits',     icon: '🍑', desc: 'Seasonal & tropical picks' },
  { slug: 'grains',     label: 'Grains',     icon: '🌾', desc: 'Wheat, rice, millets' },
  { slug: 'dairy',      label: 'Dairy',      icon: '🥛', desc: 'Milk, ghee, paneer' },
  { slug: 'spices',     label: 'Spices',     icon: '🌶️', desc: 'Aromatics & masalas' },
]

const STATS = [
  { val: '2,400+', label: 'Verified Farmers', icon: <RiLeafLine size={18} /> },
  { val: '18k+',   label: 'Listings Live',    icon: <RiPlantLine size={18} /> },
  { val: '120+',   label: 'Cities Covered',   icon: <RiGroupLine size={18} /> },
  { val: '40%',    label: 'More Earnings',    icon: <RiTimeLine size={18} /> },
]

const STEPS = [
  { icon: <RiPlantLine size={24} />, title: 'Farmers list produce', desc: 'Post available crops with quantity, price, and geo-location in minutes.' },
  { icon: <RiHandCoinLine size={24} />, title: 'Buyers negotiate', desc: 'Chat directly with farmers and lock in a fair, transparent price.' },
  { icon: <RiShieldCheckLine size={24} />, title: 'Escrow payment', desc: 'Funds are held safely until you confirm receipt and quality.' },
  { icon: <RiTruckLine size={24} />, title: 'Fresh delivery', desc: 'Produce dispatched straight from the farm to your door.' },
]

export default function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    api.get('/listings?limit=6').then(r => setListings(r.data.listings)).finally(() => setLoading(false))
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={s.heroSection}>
        <ThreeHero />

        {/* Radial glow behind text */}
        <div style={s.heroGlow} />

        <div className="container" style={s.heroInner}>
          <div style={{ ...s.heroContent, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(28px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
            <span className="section-label">Farm to table · No middlemen</span>
            <h1 style={s.heroH1}>
              Fresh produce,<br />
              <em>direct from<br />the soil.</em>
            </h1>
            <p style={s.heroSub}>
              Buy directly from verified farmers. Negotiate fair prices.<br />
              Eliminate the middleman markup — forever.
            </p>
            <div style={s.heroCtas}>
              <Link to="/marketplace" className="btn btn-primary btn-lg" style={{ gap: 10 }}>
                Browse Produce <RiArrowRightLine size={16} />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Sell as Farmer
              </Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={s.statsStrip}>
          <div className="container">
            <div style={s.statsGrid}>
              {STATS.map((st, i) => (
                <div key={i} style={s.statItem}>
                  <span style={s.statIcon}>{st.icon}</span>
                  <span style={s.statVal}>{st.val}</span>
                  <span style={s.statLabel}>{st.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────── */}
      <section style={s.section}>
        <div className="container">
          <span className="section-label">Browse by type</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
            <h2 className="section-title">What are you<br /><em>looking for?</em></h2>
            <Link to="/marketplace" className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
              All categories <RiArrowRightLine size={13} />
            </Link>
          </div>

          <div style={s.catGrid}>
            {CATEGORIES.map(cat => (
              <Link to={`/marketplace?category=${cat.slug}`} key={cat.slug} style={s.catCard} className="cat-card">
                <span style={s.catIcon}>{cat.icon}</span>
                <div>
                  <p style={s.catName}>{cat.label}</p>
                  <p style={s.catDesc}>{cat.desc}</p>
                </div>
                <RiArrowRightLine size={16} style={{ color: 'var(--lime)', marginLeft: 'auto', flexShrink: 0, opacity: 0.7 }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FRESH LISTINGS ──────────────────────────────── */}
      <section style={{ ...s.section, background: 'var(--bg2)', padding: '80px 0' }}>
        <div className="container">
          <span className="section-label">Just listed</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
            <h2 className="section-title">Fresh <em>listings</em></h2>
            <Link to="/marketplace" className="btn btn-outline btn-sm">
              View all <RiArrowRightLine size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : (
            <div style={s.listingsGrid}>
              {listings.map(l => <ListingCard key={l._id} listing={l} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section style={s.section}>
        <div className="container">
          <span className="section-label">Process</span>
          <h2 className="section-title" style={{ marginBottom: 52 }}>How <em>FarmDirect</em> works</h2>

          <div style={s.stepsGrid}>
            {STEPS.map((step, i) => (
              <div key={i} style={s.step}>
                <div style={s.stepNum}>{String(i + 1).padStart(2, '0')}</div>
                <div style={s.stepIconBox}>{step.icon}</div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
                {i < STEPS.length - 1 && <div style={s.stepConnector} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section style={s.ctaSection}>
        <div style={s.ctaGlow} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <span style={s.ctaTag}>For farmers</span>
          <h2 style={s.ctaH2}>Start earning <em>more</em><br />from your harvest.</h2>
          <p style={s.ctaP}>
            List your produce today and reach buyers directly across 120+ cities.<br />
            No commission. No delays. Just fair prices.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get started free <RiArrowRightLine size={16} />
            </Link>
            <Link to="/marketplace" className="btn btn-secondary btn-lg">Browse marketplace</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer style={s.footer}>
        <div className="container">
          <div style={s.footerTop}>
            <div>
              <div style={s.footerLogo}>
                <RiLeafLine size={22} color="var(--lime)" />
                <span>FarmDirect</span>
              </div>
              <p style={s.footerTagline}>Connecting farmers &amp; buyers.<br />No middlemen. Just freshness.</p>
            </div>
            <div style={s.footerLinks}>
              <div>
                <p style={s.footerLinkHead}>Platform</p>
                <Link to="/marketplace" style={s.footerLink}>Marketplace</Link>
                <Link to="/register" style={s.footerLink}>Sell Produce</Link>
                <Link to="/login" style={s.footerLink}>Login</Link>
              </div>
              <div>
                <p style={s.footerLinkHead}>Account</p>
                <Link to="/dashboard" style={s.footerLink}>Dashboard</Link>
                <Link to="/orders" style={s.footerLink}>Orders</Link>
                <Link to="/negotiations" style={s.footerLink}>Negotiations</Link>
              </div>
            </div>
          </div>
          <div style={s.footerBottom}>
            <p style={{ color: 'var(--text3)', fontSize: 12 }}>© {new Date().getFullYear()} FarmDirect. All rights reserved.</p>
            <p style={{ color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>v1.0.0</p>
          </div>
        </div>
      </footer>

      <style>{`
        .cat-card:hover {
          background: var(--surface2) !important;
          border-color: rgba(200,232,64,0.3) !important;
          box-shadow: 0 0 0 1px rgba(200,232,64,0.12), var(--shadow-md) !important;
        }
        .cat-card { transition: all 0.2s; }
      `}</style>
    </div>
  )
}

/* ─── Styles ───────────────────────────────────────────── */
const s = {
  heroSection: {
    position: 'relative',
    minHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: 'radial-gradient(ellipse 80% 60% at 70% 50%, #0f1e08 0%, var(--bg) 70%)',
  },
  heroGlow: {
    position: 'absolute',
    left: '-10%', top: '20%',
    width: '55%', height: '60%',
    background: 'radial-gradient(ellipse, rgba(200,232,64,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroInner: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '80px 32px 40px',
    position: 'relative',
    zIndex: 2,
  },
  heroContent: { maxWidth: 580 },
  heroH1: {
    fontSize: 'clamp(44px, 6vw, 80px)',
    fontWeight: 900,
    color: 'var(--text)',
    lineHeight: 1.08,
    margin: '8px 0 20px',
  },
  heroSub: {
    fontSize: 17,
    color: 'var(--text2)',
    lineHeight: 1.75,
    marginBottom: 32,
    maxWidth: 460,
  },
  heroCtas: { display: 'flex', gap: 12, flexWrap: 'wrap' },

  statsStrip: {
    position: 'relative',
    zIndex: 2,
    borderTop: '1px solid var(--border)',
    background: 'rgba(13,15,10,0.7)',
    backdropFilter: 'blur(12px)',
    padding: '24px 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 1,
  },
  statItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 24px',
    borderRight: '1px solid var(--border)',
  },
  statIcon: { color: 'var(--lime)', flexShrink: 0 },
  statVal: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--lime)', flexShrink: 0 },
  statLabel: { fontSize: 12, color: 'var(--text2)', lineHeight: 1.3 },

  section: { padding: '80px 0', background: 'var(--bg)' },

  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 12,
  },
  catCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '16px 18px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  catIcon: { fontSize: 28, flexShrink: 0 },
  catName: { fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 },
  catDesc: { fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 },

  listingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
  },

  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 32,
    position: 'relative',
  },
  step: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 },
  stepNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--lime)',
    opacity: 0.6,
    letterSpacing: '0.12em',
  },
  stepIconBox: {
    width: 52, height: 52,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-md)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--lime)',
  },
  stepTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 18, fontWeight: 700,
    color: 'var(--text)',
  },
  stepDesc: { fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 },
  stepConnector: {
    position: 'absolute',
    top: 86, right: -20,
    width: 40, height: 1,
    background: 'var(--border2)',
  },

  ctaSection: {
    position: 'relative',
    padding: '100px 0',
    background: 'var(--bg2)',
    overflow: 'hidden',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
  },
  ctaGlow: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: 600, height: 300,
    background: 'radial-gradient(ellipse, rgba(200,232,64,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaTag: {
    display: 'inline-block',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--lime)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: 16,
    border: '1px solid rgba(200,232,64,0.3)',
    padding: '4px 12px',
    borderRadius: 3,
  },
  ctaH2: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(32px, 4.5vw, 56px)',
    fontWeight: 900,
    color: 'var(--text)',
    marginBottom: 16,
    lineHeight: 1.12,
  },
  ctaP: {
    fontSize: 16, color: 'var(--text2)', lineHeight: 1.8,
    marginBottom: 36, maxWidth: 540, margin: '0 auto 36px',
  },

  footer: {
    background: 'var(--bg)', borderTop: '1px solid var(--border)',
    padding: '56px 0 32px',
  },
  footerTop: {
    display: 'flex', justifyContent: 'space-between',
    gap: 48, marginBottom: 40,
    flexWrap: 'wrap',
  },
  footerLogo: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
    fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)',
  },
  footerTagline: { fontSize: 13, color: 'var(--text3)', lineHeight: 1.7 },
  footerLinks: { display: 'flex', gap: 48 },
  footerLinkHead: {
    fontSize: 11, fontWeight: 700, color: 'var(--text2)',
    letterSpacing: '0.1em', textTransform: 'uppercase',
    marginBottom: 12, fontFamily: 'var(--font-mono)',
  },
  footerLink: {
    display: 'block', fontSize: 13, color: 'var(--text3)',
    marginBottom: 8, transition: 'color 0.15s',
  },
  footerBottom: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 20, borderTop: '1px solid var(--border)',
    flexWrap: 'wrap', gap: 8,
  },
}
