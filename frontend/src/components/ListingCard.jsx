import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RiMapPinLine, RiScales2Line, RiVerifiedBadgeFill, RiHandCoinLine } from 'react-icons/ri'

const CAT_BADGE = {
  vegetables: 'badge-green',
  fruits:     'badge-amber',
  grains:     'badge-earth',
  dairy:      'badge-earth',
  spices:     'badge-amber',
  other:      'badge-earth',
}

// ⭐ Reliable Unsplash images for common crops
const CROP_IMAGES = {
  'tomato':         'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&h=300&fit=crop',
  'fresh tomatoes': 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&h=300&fit=crop',
  'tomatoes':       'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&h=300&fit=crop',
  'watermelon':     'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
  'mango':          'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
  'potato':         'https://images.unsplash.com/photo-1518977676405-d4f0c4e9f80e?w=400&h=300&fit=crop',
  'potatoes':       'https://images.unsplash.com/photo-1518977676405-d4f0c4e9f80e?w=400&h=300&fit=crop',
  'onion':          'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=300&fit=crop',
  'onions':         'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=300&fit=crop',
  'wheat':          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
  'rice':           'https://images.unsplash.com/photo-1536304993881-ff86e0c9e5d8?w=400&h=300&fit=crop',
  'milk':           'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
  'spinach':        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
  'carrot':         'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
  'carrots':        'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
  'banana':         'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
  'bananas':        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
  'apple':          'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop',
  'apples':         'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop',
  'grapes':         'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=300&fit=crop',
  'cauliflower':    'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&h=300&fit=crop',
  'cabbage':        'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&h=300&fit=crop',
  'brinjal':        'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&h=300&fit=crop',
  'eggplant':       'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&h=300&fit=crop',
  'chilli':         'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&h=300&fit=crop',
  'chillies':       'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&h=300&fit=crop',
  'garlic':         'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
  'lemon':          'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&h=300&fit=crop',
  'orange':         'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop',
  'papaya':         'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop',
  'corn':           'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop',
  'maize':          'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop',
  'peas':           'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&h=300&fit=crop',
  'cucumber':       'https://images.unsplash.com/photo-1601929862217-41f3d93fc4c3?w=400&h=300&fit=crop',
  'pumpkin':        'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400&h=300&fit=crop',
  'sugarcane':      'https://images.unsplash.com/photo-1596273501830-22de7c5a7f78?w=400&h=300&fit=crop',
  'cotton':         'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400&h=300&fit=crop',
  'soybean':        'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=400&h=300&fit=crop',
  'groundnut':      'https://images.unsplash.com/photo-1567575879-c8b6ec3a0e7d?w=400&h=300&fit=crop',
  'peanut':         'https://images.unsplash.com/photo-1567575879-c8b6ec3a0e7d?w=400&h=300&fit=crop',
}

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'

const getImageUrl = (cropName) => {
  const key = cropName?.toLowerCase().trim()
  return CROP_IMAGES[key] || DEFAULT_IMG
}

export default function ListingCard({ listing }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const farmer = listing.farmerId
  const img = listing.images?.[0] || getImageUrl(listing.crop)

  return (
    <Link to={`/listings/${listing._id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div style={s.card} className="listing-card">

        {/* Image */}
        <div style={s.imgWrap}>

          {/* Shimmer while loading */}
          {!imgLoaded && !imgError && (
            <div style={s.shimmer} className="shimmer-anim" />
          )}

          {/* Fallback if image fails */}
          {imgError && (
            <div style={s.fallback}>
              <span style={s.fallbackEmoji}>🌾</span>
              <span style={s.fallbackText}>{listing.crop}</span>
            </div>
          )}

          <img
            src={img}
            alt={listing.crop}
            style={{ ...s.img, opacity: imgLoaded ? 1 : 0 }}
            className="listing-img"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true) }}
          />

          <div style={s.imgOverlay} />

          {/* Badges */}
          <div style={s.badges}>
            <span className={`badge ${CAT_BADGE[listing.category] || 'badge-earth'}`}>
              {listing.category}
            </span>
            {listing.isNegotiable && (
              <span className="badge badge-lime" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <RiHandCoinLine size={10} /> Negotiable
              </span>
            )}
          </div>

          {/* Price overlay */}
          <div style={s.priceOverlay}>
            <span style={s.priceNum}>₹{listing.pricePerUnit}</span>
            <span style={s.priceUnit}>/{listing.unit}</span>
          </div>
        </div>

        {/* Body */}
        <div style={s.body}>
          <h3 style={s.cropName}>{listing.crop}</h3>

          <div style={s.meta}>
            <span style={s.metaItem}>
              <RiScales2Line size={12} />
              {listing.quantity} {listing.unit}
            </span>
            {listing.location?.city && (
              <span style={s.metaItem}>
                <RiMapPinLine size={12} />
                {listing.location.city}
              </span>
            )}
          </div>

          {farmer && (
            <div style={s.farmer}>
              <div style={s.farmerAvatar}>
                {farmer.name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={s.farmerName}>{farmer.farmDetails?.farmName || farmer.name}</p>
                {farmer.trustScore > 0 && (
                  <p style={s.farmerScore}>
                    <RiVerifiedBadgeFill size={10} color="var(--amber)" />
                    {farmer.trustScore} rating
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .listing-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          overflow: hidden;
          transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .listing-card:hover {
          border-color: rgba(200,232,64,0.35);
          box-shadow: 0 0 0 1px rgba(200,232,64,0.1), 0 12px 40px rgba(0,0,0,0.5);
          transform: translateY(-4px);
        }
        .listing-card:hover .listing-img {
          transform: scale(1.05);
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .shimmer-anim {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </Link>
  )
}

const s = {
  card: {},
  imgWrap: {
    position: 'relative',
    aspectRatio: '4/3',
    overflow: 'hidden',
    background: '#1a2e1a',
  },
  shimmer: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(90deg, #1a2e1a 25%, #2d4a2d 50%, #1a2e1a 75%)',
    backgroundSize: '200% 100%',
    zIndex: 1,
  },
  fallback: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a2e1a, #2d4a2d)',
    zIndex: 1,
  },
  fallbackEmoji: { fontSize: 48 },
  fallbackText: {
    fontSize: 14, color: '#7a9e6e',
    marginTop: 8, fontWeight: 600,
  },
  img: {
    width: '100%', height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease, opacity 0.4s ease',
    position: 'relative', zIndex: 2,
  },
  imgOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(13,15,10,0.7) 0%, transparent 50%)',
    pointerEvents: 'none', zIndex: 3,
  },
  badges: {
    position: 'absolute', top: 10, left: 10,
    display: 'flex', gap: 5, flexWrap: 'wrap', zIndex: 4,
  },
  priceOverlay: {
    position: 'absolute', bottom: 10, right: 12,
    display: 'flex', alignItems: 'baseline', gap: 3, zIndex: 4,
  },
  priceNum: {
    fontFamily: 'var(--font-display)',
    fontSize: 22, fontWeight: 900,
    color: 'var(--lime)',
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  priceUnit: {
    fontSize: 12, color: 'rgba(255,255,255,0.6)',
    fontFamily: 'var(--font-mono)',
  },
  body: {
    padding: '14px 16px 16px',
    display: 'flex', flexDirection: 'column', gap: 8, flex: 1,
  },
  cropName: {
    fontFamily: 'var(--font-display)',
    fontSize: 18, fontWeight: 700,
    color: 'var(--text)', lineHeight: 1.2,
  },
  meta: { display: 'flex', flexWrap: 'wrap', gap: 12 },
  metaItem: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, color: 'var(--text3)',
    fontFamily: 'var(--font-mono)',
  },
  farmer: {
    display: 'flex', alignItems: 'center', gap: 9,
    marginTop: 4, paddingTop: 10,
    borderTop: '1px solid var(--border)',
  },
  farmerAvatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'var(--surface2)',
    border: '1.5px solid var(--border2)',
    color: 'var(--lime)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  farmerName: {
    fontSize: 12, fontWeight: 600, color: 'var(--text2)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  farmerScore: {
    display: 'flex', alignItems: 'center', gap: 3,
    fontSize: 11, color: 'var(--text3)',
  },
}