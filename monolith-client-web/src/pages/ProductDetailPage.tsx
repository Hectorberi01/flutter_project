import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, ShoppingCart, Truck, Shield, ChevronRight } from 'lucide-react'
import { productsApi, favoritesApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { Button, Spinner, Toast, formatPrice } from '../components/ui'
import type { Product } from '../types'

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!id) return
    productsApi.getById(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) { navigate('/connexion'); return }
    setAdding(true)
    try {
      await addItem(product!.id, qty)
      setToast({ msg: `${product!.name} ajouté au panier`, type: 'success' })
    } catch (e: any) {
      setToast({ msg: e.response?.data?.message || 'Erreur', type: 'error' })
    } finally { setAdding(false) }
  }

  const handleFav = async () => {
    if (!user) { navigate('/connexion'); return }
    try {
      const res = await favoritesApi.toggle(product!.id)
      setIsFav(res.added)
      setToast({ msg: res.message, type: 'success' })
    } catch { /**/ }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spinner size={36} /></div>
  if (!product) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Produit introuvable</h2>
      <Link to="/catalogue" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>Retour au catalogue</Link>
    </div>
  )

  return (
    <main style={{ padding: '32px 0 80px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-light)', marginBottom: 32 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Accueil</Link>
          <ChevronRight size={13} />
          <Link to="/catalogue" style={{ color: 'inherit', textDecoration: 'none' }}>Catalogue</Link>
          {product.category && (<><ChevronRight size={13} /><Link to={`/catalogue?category=${product.category}`} style={{ color: 'inherit', textDecoration: 'none' }}>{product.category}</Link></>)}
          <ChevronRight size={13} />
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 56, alignItems: 'start' }}>
          {/* Image */}
          <div>
            <div style={{
              aspectRatio: '1', background: 'var(--cream)', borderRadius: 'var(--radius-lg)',
              overflow: 'hidden', border: '1px solid var(--border)',
            }}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={64} color="var(--ink-light)" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <Link to={`/catalogue?category=${product.category}`} style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--terracotta)', textDecoration: 'none' }}>
                {product.category}
              </Link>
            )}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700, letterSpacing: -0.5, marginTop: 8, marginBottom: 16, lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <div style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--terracotta)', marginBottom: 20 }}>
              {formatPrice(product.price)}
            </div>

            {/* Stock */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, marginBottom: 24, background: product.stock > 0 ? '#d1fae5' : '#fee2e2', color: product.stock > 0 ? '#065f46' : '#991b1b', fontSize: 13, fontWeight: 600 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: product.stock > 0 ? '#10b981' : '#dc2626' }} />
              {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
            </div>

            {product.description && (
              <p style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.8, marginBottom: 28 }}>
                {product.description}
              </p>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 10 }}>Quantité</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: 'fit-content', border: '1.5px solid var(--border-dark)', borderRadius: 'var(--radius)' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink)' }}>−</button>
                  <span style={{ width: 48, textAlign: 'center', fontWeight: 600, fontSize: 16 }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink)' }}>+</button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              {product.stock > 0 && (
                <Button variant="primary" size="lg" onClick={handleAddToCart} loading={adding} style={{ flex: 1 }}>
                  <ShoppingCart size={18} />
                  Ajouter au panier
                </Button>
              )}
              <button onClick={handleFav} style={{
                width: 52, height: 52, borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--surface)', border: '1.5px solid var(--border-dark)', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
              }}>
                <Heart size={20} fill={isFav ? 'var(--terracotta)' : 'none'} color={isFav ? 'var(--terracotta)' : 'var(--ink)'} />
              </button>
            </div>

            {/* Reassurances */}
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: <Truck size={16} />, text: 'Livraison sous 3-5 jours ouvrables' },
                { icon: <Shield size={16} />, text: 'Paiement 100% sécurisé' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--ink-muted)' }}>
                  <div style={{ color: 'var(--terracotta)' }}>{icon}</div>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}
