import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Button, Toast, formatPrice, Spinner } from '../components/ui'

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart, isLoading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId)
    try { await removeItem(itemId) }
    catch { setToast({ msg: 'Erreur lors de la suppression', type: 'error' }) }
    finally { setRemovingId(null) }
  }

  const handleUpdate = async (itemId: string, qty: number) => {
    try { await updateItem(itemId, qty) }
    catch { setToast({ msg: 'Erreur lors de la mise à jour', type: 'error' }) }
  }

  if (!user) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <ShoppingCart size={56} color="var(--ink-light)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Connectez-vous</h2>
        <p style={{ color: 'var(--ink-light)', marginBottom: 24 }}>Pour accéder à votre panier</p>
        <Button onClick={() => navigate('/connexion')}>Se connecter</Button>
      </div>
    </main>
  )

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spinner size={36} /></div>

  const items = cart?.items ?? []
  const total = cart?.total ?? 0

  if (items.length === 0) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Votre panier est vide</h2>
        <p style={{ color: 'var(--ink-light)', marginBottom: 32, fontSize: 16 }}>Découvrez nos produits et ajoutez vos coups de cœur</p>
        <Button onClick={() => navigate('/catalogue')} size="lg">
          <Package size={18} /> Explorer le catalogue
        </Button>
      </div>
    </main>
  )

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>
          Mon panier
        </h1>
        <p style={{ color: 'var(--ink-light)', marginBottom: 36, fontSize: 15 }}>
          {items.length} article{items.length > 1 ? 's' : ''}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'start' }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map(item => (
              <div key={item.id} style={{
                background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)', padding: 20,
                display: 'flex', gap: 20, alignItems: 'center',
                opacity: removingId === item.id ? 0.4 : 1, transition: 'opacity 0.2s',
              }}>
                {/* Image */}
                <Link to={`/produit/${item.productId}`} style={{ flexShrink: 0 }}>
                  <div style={{ width: 88, height: 88, borderRadius: 10, overflow: 'hidden', background: 'var(--cream)' }}>
                    {item.product.imageUrl
                      ? <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={24} color="var(--ink-light)" /></div>
                    }
                  </div>
                </Link>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/produit/${item.productId}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product.name}
                    </h3>
                  </Link>
                  {item.product.category && (
                    <p style={{ fontSize: 12, color: 'var(--ink-light)', marginBottom: 10 }}>{item.product.category}</p>
                  )}
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--terracotta)' }}>
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                {/* Qty + delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-dark)', borderRadius: 'var(--radius)' }}>
                    <button onClick={() => item.quantity > 1 ? handleUpdate(item.id, item.quantity - 1) : handleRemove(item.id)}
                      style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--ink)' }}>
                      −
                    </button>
                    <span style={{ width: 36, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{item.quantity}</span>
                    <button onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--ink)' }}>
                      +
                    </button>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: 16, minWidth: 90, textAlign: 'right' }}>
                    {formatPrice(item.product.price * item.quantity)}
                  </div>

                  <button onClick={() => handleRemove(item.id)} disabled={removingId === item.id}
                    style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', border: 'none', cursor: 'pointer', transition: 'all 0.15s', color: '#dc2626' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            <button onClick={() => clearCart()} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-light)', textDecoration: 'underline', padding: 0 }}>
              Vider le panier
            </button>
          </div>

          {/* Summary */}
          <div style={{ minWidth: 300 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, position: 'sticky', top: 88 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Récapitulatif</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--ink-muted)' }}>
                  <span>Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--ink-muted)' }}>
                  <span>Livraison</span>
                  <span style={{ color: 'var(--green, #10b981)', fontWeight: 600 }}>Gratuite</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--terracotta)' }}>{formatPrice(total)}</span>
              </div>

              <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/commande')}>
                Commander <ArrowRight size={18} />
              </Button>

              <Link to="/catalogue" style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: 14, color: 'var(--ink-light)', textDecoration: 'none' }}>
                ← Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}
