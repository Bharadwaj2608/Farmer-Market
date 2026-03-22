import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import ListingCard from '../components/ListingCard'
import { RiSearchLine, RiFilterLine } from 'react-icons/ri'

const CATEGORIES = ['', 'vegetables', 'fruits', 'grains', 'dairy', 'spices', 'other']
const SORT_OPTIONS = [
  { val: 'createdAt', label: 'Newest first' },
  { val: 'price_asc', label: 'Price: Low to High' },
  { val: 'price_desc', label: 'Price: High to Low' },
]

export default function Marketplace() {
  const [params, setParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState(params.get('search') || '')
  const [category, setCategory] = useState(params.get('category') || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [page, setPage] = useState(1)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (search) q.set('search', search)
      if (category) q.set('category', category)
      if (minPrice) q.set('minPrice', minPrice)
      if (maxPrice) q.set('maxPrice', maxPrice)
      q.set('sortBy', sortBy)
      q.set('page', page)
      q.set('limit', 12)
      const res = await api.get(`/listings?${q}`)
      setListings(res.data.listings)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } finally {
      setLoading(false)
    }
  }, [search, category, minPrice, maxPrice, sortBy, page])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchListings() }

  return (
    <div style={{ padding: '32px 0 60px' }}>
      <div className="container">
        <div style={s.header}>
          <div>
            <h1 style={s.h1}>Marketplace</h1>
            <p style={s.sub}>{total} listings available from verified farmers</p>
          </div>
        </div>

        {/* Filters bar */}
        <div style={s.filtersBar}>
          <form onSubmit={handleSearch} style={s.searchForm}>
            <RiSearchLine size={16} color="#999" style={{ flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tomatoes, wheat, mango..."
              style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14 }} />
          </form>

          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} style={s.filterSelect}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All categories'}</option>)}
          </select>

          <input type="number" placeholder="Min ₹" value={minPrice} onChange={e => setMinPrice(e.target.value)}
            style={{ ...s.filterSelect, width: 90 }} />
          <input type="number" placeholder="Max ₹" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            style={{ ...s.filterSelect, width: 90 }} />

          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={s.filterSelect}>
            {SORT_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <h3>No listings found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div style={s.grid}>
              {listings.map(l => <ListingCard key={l._id} listing={l} />)}
            </div>

            {pages > 1 && (
              <div style={s.pagination}>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const s = {
  header: { marginBottom: 24 },
  h1: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--earth)' },
  sub: { color: '#999', fontSize: 14, marginTop: 4 },
  filtersBar: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 28, flexWrap: 'wrap' },
  searchForm: { display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 },
  filterSelect: { border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: 13, color: 'var(--earth)', background: '#fff', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  pagination: { display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 },
}
