import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { favoritesApi } from '../../api'
import { formatPrice } from '../ui'
import type { Product } from '../../types'

interface Props {
  product: Product
  isFav?: boolean
  onFavToggle?: () => void
}

export function ProductCard({ product, isFav = false, onFavToggle }: Props) {
  const { user } = useAuth()
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [localFav, setLocalFav] = useState(isFav)
  const [added, setAdded] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) { window.location.href = '/connexion'; return }
    setAdding(true)
    try {
      await addItem(product.id)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } finally { setAdding(false) }
  }

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) { window.location.href = '/connexion'; return }
    setFavLoading(true)
    try {
      const res = await favoritesApi.toggle(product.id)
      setLocalFav(res.added)
      onFavToggle?.()
    } finally { setFavLoading(false) }
  }

  return (
    <Link to={`/produit/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <article style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', border: '1px solid var(--border)',
        transition: 'all 0.25s', cursor: 'pointer',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: 'var(--cream)' }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={32} color="var(--ink-light)" />
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(245,240,232,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--ink-muted)', background: 'var(--surface)', padding: '4px 12px', borderRadius: 20 }}>
                RUPTURE
              </span>
            </div>
          )}

          {/* Category tag */}
          {product.category && (
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: 'rgba(28,20,16,0.75)', color: '#fff',
              fontSize: 10, fontWeight: 600, letterSpacing: 0.8,
              padding: '3px 9px', borderRadius: 20, textTransform: 'uppercase',
              backdropFilter: 'blur(4px)',
            }}>
              {product.category}
            </div>
          )}

          {/* Fav button */}
          <button onClick={handleFav} disabled={favLoading} style={{
            position: 'absolute', top: 8, right: 8, width: 34, height: 34,
            borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(4px)',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Heart size={15} fill={localFav ? '#C4622D' : 'none'} color={localFav ? '#C4622D' : '#5C4A3A'} />
          </button>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px 16px' }}>
          <p style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
            {product.category || 'Produit'}
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--terracotta)' }}>
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 && (
              <button onClick={handleAddToCart} disabled={adding} style={{
                width: 36, height: 36, borderRadius: '50%',
                background: added ? 'var(--gold)' : 'var(--ink)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                transform: added ? 'scale(1.1)' : 'scale(1)',
              }}>
                <ShoppingCart size={15} color="#fff" />
              </button>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
