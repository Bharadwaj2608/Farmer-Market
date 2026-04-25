import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import {
  RiMoneyDollarCircleLine, RiShoppingBagLine, RiTimeLine,
  RiStarLine, RiAddLine, RiDeleteBinLine, RiSparklingLine,
  RiArrowUpLine, RiArrowDownLine, RiSubtractLine, RiRefreshLine,
  RiLightbulbLine, RiPlantLine, RiCalendarLine
} from 'react-icons/ri'
import toast from 'react-hot-toast'

const PRIORITY_COLOR = { high: '#ff6b6b', medium: '#ffa94d', low: '#69db7c' }
const PRIORITY_BG    = { high: 'rgba(255,107,107,0.1)', medium: 'rgba(255,169,77,0.1)', low: 'rgba(105,219,124,0.1)' }
const TREND_ICON     = {
  rising:  <RiArrowUpLine color="#69db7c" />,
  falling: <RiArrowDownLine color="#ff6b6b" />,
  stable:  <RiSubtractLine color="#ffa94d" />
}
const DEMAND_COLOR = { high: '#69db7c', medium: '#ffa94d', low: '#ff6b6b' }

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [forecast, setForecast] = useState(null)
  const [forecastMeta, setForecastMeta] = useState(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    Promise.all([
      api.get('/users/dashboard/stats'),
      user.role === 'farmer' ? api.get('/listings/farmer/my') : Promise.resolve({ data: [] })
    ]).then(([statsRes, listingsRes]) => {
      setStats(statsRes.data)
      setListings(listingsRes.data)
    }).finally(() => setLoading(false))
  }, [user.role])

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return
    try {
      await api.delete(`/listings/${id}`)
      setListings(ls => ls.filter(l => l._id !== id))
      toast.success('Listing deleted')
    } catch { toast.error('Failed to delete') }
  }

  const runForecast = async () => {
    setForecastLoading(true)
    setForecastError(null)
    setActiveTab('forecast')
    try {
      const res = await api.post('/ai/forecast')
      setForecast(res.data.forecast)
      setForecastMeta(res.data.meta)
      toast.success('AI forecast ready!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate forecast'
      setForecastError(msg)
      toast.error(msg)
    } finally {
      setForecastLoading(false)
    }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  const isFarmer = user.role === 'farmer'

  const statCards = isFarmer ? [
    { icon: <RiMoneyDollarCircleLine size={22} />, label: 'Total revenue',  val: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: '#69db7c' },
    { icon: <RiShoppingBagLine size={22} />,       label: 'Total orders',   val: stats?.totalOrders || 0,                          color: '#ffa94d' },
    { icon: <RiTimeLine size={22} />,              label: 'Pending orders', val: stats?.pendingOrders || 0,                        color: '#ff6b6b' },
    { icon: <RiStarLine size={22} />,              label: 'Trust score',    val: stats?.trustScore || '—',                         color: '#c8e840' },
  ] : [
    { icon: <RiShoppingBagLine size={22} />,       label: 'Total orders',  val: stats?.totalOrders || 0,                          color: '#69db7c' },
    { icon: <RiTimeLine size={22} />,              label: 'Active orders', val: stats?.activeOrders || 0,                         color: '#ffa94d' },
    { icon: <RiMoneyDollarCircleLine size={22} />, label: 'Total spent',   val: `₹${(stats?.totalSpent || 0).toLocaleString()}`,  color: '#c8e840' },
    { icon: <RiStarLine size={22} />,              label: 'Trust score',   val: stats?.trustScore || '—',                         color: '#ff6b6b' },
  ]

  return (
    // ⭐ FIX 1: paddingTop 90px fixes navbar overlap
    <div style={{ padding: '90px 0 60px' }}>
      <div className="container">

        {/* ⭐ FIX 2: Dark hero header */}
        <div style={s.heroBanner}>
          <div>
            <h1 style={s.h1}>Welcome, {user.name}</h1>
            <p style={s.sub}>{isFarmer ? (user.farmDetails?.farmName || 'Your farm') : 'Buyer dashboard'}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {isFarmer && (
              <button onClick={runForecast} className="btn btn-outline" disabled={forecastLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: '#3a5c3a', color: '#c8e840' }}>
                <RiSparklingLine size={16} />
                {forecastLoading ? 'Analysing...' : 'AI Forecast'}
              </button>
            )}
            {isFarmer && (
              <Link to="/create-listing" className="btn btn-primary">
                <RiAddLine /> New listing
              </Link>
            )}
          </div>
        </div>

        {/* ⭐ FIX 3: Dark stat cards */}
        <div style={s.statsGrid}>
          {statCards.map(c => (
            <div key={c.label} style={s.statCard}>
              <div style={{ ...s.statIcon, color: c.color, background: 'rgba(255,255,255,0.05)' }}>{c.icon}</div>
              <div>
                <p style={s.statLabel}>{c.label}</p>
                <p style={{ ...s.statVal, color: c.color }}>{c.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={s.quickLinks}>
          <Link to="/orders"       className="btn btn-secondary">View orders →</Link>
          <Link to="/negotiations" className="btn btn-secondary">View negotiations →</Link>
          {!isFarmer && <Link to="/marketplace" className="btn btn-primary">Browse marketplace →</Link>}
        </div>

        {isFarmer && (
          <>
            {/* ⭐ FIX 4: Dark tabs */}
            <div style={s.tabs}>
              <button onClick={() => setActiveTab('overview')}
                style={{ ...s.tab, ...(activeTab === 'overview' ? s.tabActive : {}) }}>
                My listings
              </button>
              <button onClick={() => setActiveTab('forecast')}
                style={{ ...s.tab, ...(activeTab === 'forecast' ? s.tabActive : {}) }}>
                <RiSparklingLine size={14} style={{ marginRight: 4 }} />
                AI demand forecast
                {forecast && <span style={s.newBadge}>Ready</span>}
              </button>
            </div>

            {activeTab === 'overview' && (
              listings.length === 0 ? (
                <div className="empty-state">
                  <h3>No listings yet</h3>
                  <p>Create your first listing to start selling</p>
                  <Link to="/create-listing" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>
                    <RiAddLine /> Create listing
                  </Link>
                </div>
              ) : (
                // ⭐ FIX 5: Dark table
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        {['Crop', 'Price', 'Qty left', 'Sold', 'Status', 'Views', 'Actions'].map(h => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(l => (
                        <tr key={l._id} style={s.tr}>
                          <td style={s.td}>
                            <Link to={`/listings/${l._id}`} style={{ color: '#c8e840', fontWeight: 500 }}>{l.crop}</Link>
                            <br /><span style={{ fontSize: 12, color: '#7a9e6e' }}>{l.category}</span>
                          </td>
                          <td style={s.td}>₹{l.pricePerUnit}/{l.unit}</td>
                          <td style={s.td}>{l.quantity} {l.unit}</td>
                          <td style={s.td}>{l.quantitySold || 0} {l.unit}</td>
                          <td style={s.td}>
                            <span className={`badge ${l.status === 'active' ? 'badge-green' : 'badge-earth'}`}>{l.status}</span>
                          </td>
                          <td style={s.td}>{l.views || 0}</td>
                          <td style={s.td}>
                            <button style={s.deleteBtn} onClick={() => deleteListing(l._id)}>
                              <RiDeleteBinLine />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {activeTab === 'forecast' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {!forecast && !forecastLoading && !forecastError && (
                  // ⭐ FIX 6: Dark forecast empty state
                  <div style={s.forecastEmpty}>
                    <div style={s.forecastEmptyIcon}><RiSparklingLine size={32} color="#c8e840" /></div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#c8e840', marginBottom: 8 }}>
                      AI demand forecast
                    </h3>
                    <p style={{ color: '#7a9e6e', fontSize: 14, maxWidth: 420, textAlign: 'center', lineHeight: 1.7, marginBottom: 20 }}>
                      Claude analyses your order history, active listings, and Indian seasonal patterns to tell you what to grow, when to sell, and how to price.
                    </p>
                    <button onClick={runForecast} className="btn btn-primary btn-lg">
                      <RiSparklingLine size={18} /> Generate my forecast
                    </button>
                  </div>
                )}

                {forecastLoading && (
                  <div style={s.forecastEmpty}>
                    <div className="spinner" />
                    <p style={{ color: '#7a9e6e', fontSize: 14, marginTop: 16 }}>Claude is analysing your farm data...</p>
                    <p style={{ color: '#3a5c3a', fontSize: 12, marginTop: 4 }}>This takes about 5–10 seconds</p>
                  </div>
                )}

                {forecastError && !forecastLoading && (
                  <div style={{ padding: 24, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <p style={{ color: '#ff6b6b', marginBottom: 12 }}>{forecastError}</p>
                    <button onClick={runForecast} className="btn btn-secondary btn-sm">
                      <RiRefreshLine /> Retry
                    </button>
                  </div>
                )}

                {forecast && !forecastLoading && (
                  <>
                    <div style={s.metaBar}>
                      <span style={{ fontSize: 13, color: '#7a9e6e' }}>
                        Analysed <strong style={{ color: '#c8e840' }}>{forecastMeta?.ordersAnalysed}</strong> orders ·&nbsp;
                        <strong style={{ color: '#c8e840' }}>{forecastMeta?.cropsTracked}</strong> crops · {forecastMeta?.period}
                      </span>
                      <button onClick={runForecast} className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <RiRefreshLine size={13} /> Refresh
                      </button>
                    </div>

                    <div style={s.summaryCard}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <RiSparklingLine size={16} color="#c8e840" />
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#c8e840' }}>AI summary</span>
                      </div>
                      <p style={{ fontSize: 15, color: '#d4e8c2', lineHeight: 1.7 }}>{forecast.summary}</p>
                    </div>

                    {forecast.marketInsight && (
                      <div style={s.insightCard}>
                        <RiLightbulbLine size={16} color="#ffa94d" style={{ flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: 14, color: '#d4e8c2', lineHeight: 1.6 }}>{forecast.marketInsight}</p>
                      </div>
                    )}

                    {forecast.topCrops?.length > 0 && (
                      <div>
                        <h2 style={s.sectionTitle}>Your top crops — demand outlook</h2>
                        <div style={s.cropsGrid}>
                          {forecast.topCrops.map((c, i) => (
                            <div key={i} style={s.cropCard}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div>
                                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#d4e8c2', marginBottom: 4 }}>{c.crop}</h3>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                                    {TREND_ICON[c.trend]}
                                    <span style={{ color: c.trend === 'rising' ? '#69db7c' : c.trend === 'falling' ? '#ff6b6b' : '#ffa94d', fontWeight: 500 }}>
                                      {c.trend}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: 26, fontWeight: 700, color: '#c8e840', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{c.demandScore}</span>
                                  <span style={{ fontSize: 11, color: '#7a9e6e', display: 'block' }}>demand score</span>
                                </div>
                              </div>
                              <p style={{ fontSize: 13, color: '#7a9e6e', marginBottom: 12, lineHeight: 1.5 }}>{c.reason}</p>
                              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#7a9e6e' }}>
                                  <RiMoneyDollarCircleLine size={13} color="#69db7c" />
                                  {c.suggestedPrice}
                                </span>
                                {c.bestMonthsToSell?.length > 0 && (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#7a9e6e' }}>
                                    <RiCalendarLine size={13} color="#ffa94d" />
                                    Best: {c.bestMonthsToSell.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {forecast.recommendations?.length > 0 && (
                      <div>
                        <h2 style={s.sectionTitle}>Action recommendations</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {forecast.recommendations.map((r, i) => (
                            <div key={i} style={{ ...s.recCard, borderLeftColor: PRIORITY_COLOR[r.priority] }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: '#7a9e6e', fontWeight: 500 }}>
                                    {r.type}
                                  </span>
                                  <span style={{ fontSize: 14, fontWeight: 500, color: '#d4e8c2' }}>{r.title}</span>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, flexShrink: 0, background: PRIORITY_BG[r.priority], color: PRIORITY_COLOR[r.priority] }}>
                                  {r.priority}
                                </span>
                              </div>
                              <p style={{ fontSize: 13, color: '#7a9e6e', lineHeight: 1.6 }}>{r.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {forecast.nextSeasonCrops?.length > 0 && (
                      <div>
                        <h2 style={s.sectionTitle}>Grow next season</h2>
                        <div style={s.cropsGrid}>
                          {forecast.nextSeasonCrops.map((c, i) => (
                            <div key={i} style={{ ...s.cropCard, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(200,232,64,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <RiPlantLine size={18} color="#c8e840" />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: '#d4e8c2' }}>{c.crop}</span>
                                  <span style={{ fontSize: 12, fontWeight: 500, color: DEMAND_COLOR[c.expectedDemand] }}>
                                    {c.expectedDemand} demand
                                  </span>
                                </div>
                                <p style={{ fontSize: 13, color: '#7a9e6e', lineHeight: 1.5 }}>{c.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {!isFarmer && (
          <div style={s.buyerCard}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#c8e840', marginBottom: 8 }}>Find fresh produce</h3>
            <p style={{ fontSize: 14, color: '#7a9e6e', marginBottom: 16 }}>Browse listings from verified farmers near you</p>
            <Link to="/marketplace" className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>Browse marketplace →</Link>
          </div>
        )}

      </div>
    </div>
  )
}

const s = {
  // ⭐ Dark hero banner
  heroBanner: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 100%)',
    border: '1px solid #3a5c3a',
    borderLeft: '4px solid #c8e840',
    borderRadius: '16px',
    padding: '28px 32px',
    marginBottom: 24,
  },
  h1: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: '#c8e840' },
  sub: { color: '#7a9e6e', fontSize: 14, marginTop: 4 },

  // ⭐ Dark stat cards
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard: {
    background: '#1a2e1a', border: '1px solid #3a5c3a',
    borderRadius: 'var(--radius-md)', padding: '18px 20px',
    display: 'flex', alignItems: 'center', gap: 14,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statLabel: { fontSize: 12, color: '#7a9e6e', marginBottom: 2 },
  statVal: { fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)' },

  quickLinks: { display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' },

  // ⭐ Dark tabs
  tabs: {
    display: 'flex', gap: 4, background: '#1a2e1a',
    border: '1px solid #3a5c3a',
    borderRadius: 'var(--radius-sm)', padding: 4,
    marginBottom: 24, width: 'fit-content',
  },
  tab: {
    display: 'flex', alignItems: 'center', padding: '8px 16px',
    borderRadius: 6, fontSize: 14, fontWeight: 500,
    color: '#7a9e6e', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
  },
  tabActive: { background: '#2d4a2d', color: '#c8e840', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' },
  newBadge: { marginLeft: 8, fontSize: 10, background: '#c8e840', color: '#1a2e1a', padding: '1px 6px', borderRadius: 20 },

  // ⭐ Dark table
  tableWrap: {
    background: '#1a2e1a', border: '1px solid #3a5c3a',
    borderRadius: 'var(--radius-md)', overflow: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#2d4a2d' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#7a9e6e', borderBottom: '1px solid #3a5c3a', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #3a5c3a' },
  td: { padding: '14px 16px', fontSize: 14, color: '#d4e8c2', verticalAlign: 'middle' },
  deleteBtn: {
    padding: '6px 8px', borderRadius: 6,
    border: '1px solid #3a5c3a', background: 'transparent',
    color: '#ff6b6b', cursor: 'pointer',
  },

  // ⭐ Dark forecast
  forecastEmpty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px',
    background: '#1a2e1a', border: '1px solid #3a5c3a', borderRadius: 'var(--radius-lg)',
  },
  forecastEmptyIcon: {
    width: 64, height: 64, background: 'rgba(200,232,64,0.1)',
    borderRadius: 'var(--radius-lg)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  metaBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 16px', background: '#1a2e1a',
    border: '1px solid #3a5c3a', borderRadius: 'var(--radius-sm)',
  },
  summaryCard: {
    padding: 20, background: 'rgba(200,232,64,0.06)',
    border: '1px solid rgba(200,232,64,0.2)', borderRadius: 'var(--radius-md)',
  },
  insightCard: {
    display: 'flex', gap: 10, padding: 16,
    background: 'rgba(255,169,77,0.06)', border: '1px solid rgba(255,169,77,0.2)',
    borderRadius: 'var(--radius-md)', alignItems: 'flex-start',
  },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: '#d4e8c2', margin: '0 0 14px' },
  cropsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 },
  cropCard: {
    padding: 20, background: '#1a2e1a',
    border: '1px solid #3a5c3a', borderRadius: 'var(--radius-md)',
  },
  recCard: {
    padding: '14px 18px', background: '#1a2e1a',
    border: '1px solid #3a5c3a', borderLeft: '3px solid',
    borderRadius: 'var(--radius-sm)',
  },
  buyerCard: {
    marginTop: 20, padding: 24,
    background: 'rgba(200,232,64,0.06)', border: '1px solid rgba(200,232,64,0.2)',
    borderRadius: 'var(--radius-md)', textAlign: 'center',
  },
}