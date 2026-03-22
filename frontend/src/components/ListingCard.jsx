import { Link } from 'react-router-dom'
import { RiMapPinLine, RiScales2Line, RiVerifiedBadgeFill } from 'react-icons/ri'
// import PriceSuggestion from "../components/PriceSuggestion";
const categoryColors = {
  vegetables: 'badge-green',
  fruits: 'badge-amber',
  grains: 'badge-earth',
  dairy: 'badge-earth',
  spices: 'badge-amber',
  other: 'badge-earth',
}



const s = {
  wrapper: { margin: "12px 0" },
  btn: {
    padding: "8px 16px",
    background: "var(--green)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "var(--font-body)",
    opacity: 1,
  },
  card: {
    marginTop: 10,
    padding: "12px 16px",
    background: "var(--green-pale)",
    border: "1px solid var(--border)",
    borderRadius: 8,
  },
  label: { fontSize: 11, color: "var(--earth-mid)", margin: "0 0 4px" },
  price: { fontSize: 20, fontWeight: 700, color: "var(--green)", margin: "0 0 6px" },
  unit: { fontSize: 13, fontWeight: 400 },
  reason: { fontSize: 12, color: "var(--earth-mid)", margin: 0 },
  error: { fontSize: 12, color: "red", marginTop: 6 },
};

// Inside your CreateListing.jsx or wherever your listing form is

export default function ListingCard({ listing }) {
  const farmer = listing.farmerId
  const img = listing.images?.[0] || `https://placehold.co/400x260/e8f3ec/2a5c3f?text=${encodeURIComponent(listing.crop)}`

  return (
    <Link to={`/listings/${listing._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={styles.card}>
        <div style={styles.imgWrap}>
          <img src={img} alt={listing.crop} style={styles.img} />
          <span className={`badge ${categoryColors[listing.category] || 'badge-earth'}`} style={styles.catBadge}>
            {listing.category}
          </span>
          {listing.isNegotiable && (
            <span className="badge badge-amber" style={{ ...styles.catBadge, top: 42 }}>Negotiable</span>
          )}
        </div>

        <div style={styles.body}>
          <h3 style={styles.crop}>{listing.crop}</h3>

          <div style={styles.price}>
            <span style={styles.priceNum}>₹{listing.pricePerUnit}</span>
            <span style={styles.priceUnit}>/ {listing.unit}</span>
          </div>

          <div style={styles.meta}>
            <span style={styles.metaItem}>
              <RiScales2Line size={13} />
              {listing.quantity} {listing.unit} available
            </span>
            {listing.location?.city && (
              <span style={styles.metaItem}>
                <RiMapPinLine size={13} />
                {listing.location.city}
              </span>
            )}
          </div>

          {farmer && (
            <div style={styles.farmer}>
              <div style={styles.farmerAvatar}>{farmer.name?.charAt(0)}</div>
              <div>
                <p style={styles.farmerName}>{farmer.farmDetails?.farmName || farmer.name}</p>
                {farmer.trustScore > 0 && (
                  <p style={styles.farmerScore}>
                    <RiVerifiedBadgeFill size={11} color="var(--amber)" />
                    {farmer.trustScore} rating
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

const styles = {
  card: { transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' },
  imgWrap: { position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--cream-dark)' },
  img: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  catBadge: { position: 'absolute', top: 10, left: 10 },
  body: { padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
  crop: { fontSize: 18, fontWeight: 600, color: 'var(--earth)', fontFamily: 'var(--font-display)' },
  price: { display: 'flex', alignItems: 'baseline', gap: 4 },
  priceNum: { fontSize: 22, fontWeight: 600, color: 'var(--green)', fontFamily: 'var(--font-display)' },
  priceUnit: { fontSize: 13, color: '#999' },
  meta: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 2 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' },
  farmer: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border)' },
  farmerAvatar: { width: 28, height: 28, borderRadius: '50%', background: 'var(--green-pale)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 },
  farmerName: { fontSize: 12, fontWeight: 500, color: 'var(--earth-mid)' },
  farmerScore: { display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#999' },
}
