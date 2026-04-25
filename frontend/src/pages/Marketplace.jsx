import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import ListingCard from '../components/ListingCard'
import { RiSearchLine } from 'react-icons/ri'

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
    // ⭐ FIX 1: paddingTop accounts for fixed navbar height
    <div style={{ padding: '90px 0 60px' }}>
      <div className="container">

        {/* ⭐ FIX 2: Hero header with dark farm theme */}
        <div style={s.hero}>
          <h1 style={s.h1}>Marketplace</h1>
          <p style={s.sub}>{total} listings available from verified farmers</p>
        </div>

        {/* ⭐ FIX 3: Dark themed filter bar */}
        <div style={s.filtersBar}>

          {/* Search */}
          <form onSubmit={handleSearch} style={s.searchForm}>
            <RiSearchLine size={16} color="#a3b899" style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tomatoes, wheat, mango..."
              style={s.searchInput}
            />
          </form>

          <div style={s.divider} />

          {/* Category */}
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} style={s.select}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All categories'}</option>
            ))}
          </select>

          {/* Price range */}
          <input type="number" placeholder="Min ₹" value={minPrice}
            onChange={e => setMinPrice(e.target.value)} style={{ ...s.select, width: 90 }} />
          <input type="number" placeholder="Max ₹" value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)} style={{ ...s.select, width: 90 }} />

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={s.select}>
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
  // ⭐ Dark hero section
  hero: {
    background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 100%)',
    borderRadius: '16px',
    padding: '36px 32px',
    marginBottom: 24,
    borderLeft: '4px solid #8bc34a',
  },
  h1: {
    fontFamily: 'var(--font-display)',
    fontSize: 36,
    fontWeight: 700,
    color: '#c8e6a0',  // ⭐ lime green like your listing cards
    margin: 0,
  },
  sub: {
    color: '#7a9e6e',
    fontSize: 14,
    marginTop: 6,
  },

  // ⭐ Dark themed filter bar
  filtersBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#1e2f1e',          // ⭐ dark green instead of white
    border: '1px solid #3a5c3a',
    borderRadius: '12px',
    padding: '12px 18px',
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 200,
  },
  searchInput: {
    border: 'none',
    background: 'none',
    outline: 'none',
    flex: 1,
    fontSize: 14,
    color: '#d4e8c2',              // ⭐ light green text
  },
  divider: {
    width: 1,
    height: 24,
    background: '#3a5c3a',
  },
  select: {
    border: '1px solid #3a5c3a',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: 13,
    color: '#d4e8c2',              // ⭐ light green text
    background: '#2a3f2a',         // ⭐ dark green background
    cursor: 'pointer',
    outline: 'none',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
  },
}