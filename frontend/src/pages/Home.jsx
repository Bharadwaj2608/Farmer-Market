import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../utils/api'
import ListingCard from '../components/ListingCard'
import { RiPlantLine, RiTruckLine, RiShieldCheckLine, RiHandCoinLine } from 'react-icons/ri'

const CATEGORIES = ['vegetables', 'fruits', 'grains', 'dairy', 'spices']

export default function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/listings?limit=6').then(r => setListings(r.data.listings)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section style={hero.section}>
        <div className="container" style={hero.inner}>
          <div style={hero.content}>
            <p style={hero.eyebrow}>Farm to table, no middlemen</p>
            <h1 style={hero.h1}>Fresh produce,<br /><em>direct from farmers</em></h1>
            <p style={hero.sub}>Buy directly from verified farmers. Negotiate fair prices. Eliminate the middleman markup.</p>
            <div style={hero.ctas}>
              <Link to="/marketplace" className="btn btn-primary btn-lg">Browse Produce</Link>
              <Link to="/register" className="btn btn-secondary btn-lg">Sell as Farmer</Link>
            </div>
          </div>
          <div style={hero.visual}>
            <div style={hero.statsGrid}>
              {[
                { label: 'Active Farmers', val: '2,400+' },
                { label: 'Produce Listed', val: '18,000+' },
                { label: 'Cities Covered', val: '120+' },
                { label: 'Avg. Farmer Earnings ↑', val: '40%' },
              ].map(s => (
                <div key={s.label} style={hero.stat}>
                  <span style={hero.statVal}>{s.val}</span>
                  <span style={hero.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '48px 0', background: '#fff' }}>
        <div className="container">
          <h2 style={sec.h2}>Shop by category</h2>
          <div style={sec.catGrid}>
            {CATEGORIES.map(cat => (
              <Link to={`/marketplace?category=${cat}`} key={cat} style={sec.catCard}>
                <span style={sec.catIcon}>{catEmoji[cat]}</span>
                <span style={sec.catLabel}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fresh listings */}
      <section style={{ padding: '48px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h2 style={sec.h2}>Fresh listings</h2>
            <Link to="/marketplace" className="btn btn-outline btn-sm">View all</Link>
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : (
            <div style={sec.listingsGrid}>
              {listings.map(l => <ListingCard key={l._id} listing={l} />)}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '56px 0', background: '#fff' }}>
        <div className="container">
          <h2 style={{ ...sec.h2, textAlign: 'center', marginBottom: 40 }}>How FarmDirect works</h2>
          <div style={sec.stepsGrid}>
            {[
              { icon: <RiPlantLine size={28} />, title: 'Farmers list produce', desc: 'Farmers post available crops with quantity, price, and location.' },
              { icon: <RiHandCoinLine size={28} />, title: 'Buyers negotiate', desc: 'Chat directly with farmers and agree on a fair price.' },
              { icon: <RiShieldCheckLine size={28} />, title: 'Escrow payment', desc: 'Payment is held securely until you confirm delivery.' },
              { icon: <RiTruckLine size={28} />, title: 'Fresh delivery', desc: 'Farmer dispatches produce. You receive it fresh.' },
            ].map((step, i) => (
              <div key={i} style={sec.step}>
                <div style={sec.stepIcon}>{step.icon}</div>
                <h3 style={sec.stepTitle}>{step.title}</h3>
                <p style={sec.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section style={cta.section}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={cta.h2}>Are you a farmer?</h2>
          <p style={cta.p}>List your produce and start earning 40% more by selling directly to buyers.</p>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>Get started free →</Link>
        </div>
      </section>
    </div>
  )
}

const catEmoji = { vegetables: '🥦', fruits: '🍎', grains: '🌾', dairy: '🥛', spices: '🌶️' }

const hero = {
  section: { background: 'var(--cream)', padding: '72px 0 60px', borderBottom: '1px solid var(--border)' },
  inner: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' },
  content: { display: 'flex', flexDirection: 'column', gap: 20 },
  eyebrow: { fontSize: 13, fontWeight: 500, color: 'var(--green-mid)', letterSpacing: '0.06em', textTransform: 'uppercase' },
  h1: { fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 700, color: 'var(--earth)', lineHeight: 1.1 },
  sub: { fontSize: 17, color: 'var(--earth-mid)', lineHeight: 1.7, maxWidth: 440 },
  ctas: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  visual: { background: 'var(--green-pale)', borderRadius: 'var(--radius-lg)', padding: 32 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  stat: { background: '#fff', borderRadius: 'var(--radius-md)', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 4 },
  statVal: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--green)' },
  statLabel: { fontSize: 12, color: '#999' },
}

const sec = {
  h2: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--earth)', marginBottom: 24 },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 },
  catCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 12px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'all 0.18s', cursor: 'pointer' },
  catIcon: { fontSize: 32 },
  catLabel: { fontSize: 13, fontWeight: 500, color: 'var(--earth-mid)' },
  listingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 },
  step: { display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' },
  stepIcon: { width: 52, height: 52, background: 'var(--green-pale)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' },
  stepTitle: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--earth)' },
  stepDesc: { fontSize: 14, color: '#888', lineHeight: 1.6 },
}

const cta = {
  section: { padding: '60px 0', background: 'var(--green)', color: '#fff' },
  h2: { fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: '#fff', marginBottom: 12 },
  p: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' },
}
