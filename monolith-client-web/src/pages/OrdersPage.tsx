import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Package, ChevronRight, CheckCircle } from 'lucide-react'
import { ordersApi } from '../api'
import { StatusBadge, Spinner, formatPrice, formatDate, PAYMENT_LABELS } from '../components/ui'
import type { Order } from '../types'

// ── Liste commandes ────────────────────────────────────────────────────────────
export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.getAll().then(setOrders).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={32} /></div>

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 700, letterSpacing: -0.5, marginBottom: 32 }}>
          Mes commandes
        </h1>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Aucune commande</h3>
            <p style={{ color: 'var(--ink-light)', marginBottom: 24 }}>Vous n'avez pas encore passé de commande.</p>
            <Link to="/catalogue" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--terracotta)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, textDecoration: 'none' }}>
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {orders.map(order => (
              <Link key={order.id} to={`/commandes/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: 22,
                  display: 'flex', alignItems: 'center', gap: 20,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--terracotta)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  {/* Icon */}
                  <div style={{ width: 48, height: 48, background: 'var(--cream)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={22} color="var(--terracotta)" />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>
                        {order.reference || order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-light)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span>{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>{PAYMENT_LABELS[order.paymentMethod]}</span>
                      <span>·</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--terracotta)' }}>
                      {formatPrice(order.totalAmount)}
                    </div>
                  </div>

                  <ChevronRight size={18} color="var(--ink-light)" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

// ── Détail commande ────────────────────────────────────────────────────────────
export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const isNew = searchParams.get('new') === '1'
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ordersApi.getById(id).then(setOrder).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={32} /></div>
  if (!order) return (
    <main style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Commande introuvable</h2>
      <Link to="/commandes" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>Mes commandes</Link>
    </main>
  )

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Success banner */}
        {isNew && (
          <div style={{
            background: '#d1fae5', border: '1.5px solid #6ee7b7', borderRadius: 'var(--radius-lg)',
            padding: '20px 24px', marginBottom: 32, display: 'flex', gap: 14, alignItems: 'center',
            animation: 'fadeUp 0.4s ease',
          }}>
            <CheckCircle size={28} color="#059669" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#065f46' }}>Commande confirmée !</div>
              <div style={{ fontSize: 14, color: '#047857', marginTop: 2 }}>
                Votre commande <strong>{order.reference}</strong> a été enregistrée avec succès.
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Link to="/commandes" style={{ fontSize: 13, color: 'var(--ink-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              ← Mes commandes
            </Link>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: -0.3 }}>
              {order.reference || order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p style={{ color: 'var(--ink-light)', fontSize: 14, marginTop: 4 }}>Passée le {formatDate(order.createdAt)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Articles */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15 }}>
            Articles ({order.items.length})
          </div>
          {order.items.map((item, i) => (
            <div key={item.id} style={{
              padding: '16px 24px', display: 'flex', gap: 16, alignItems: 'center',
              borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: 'var(--cream)', flexShrink: 0 }}>
                {item.product.imageUrl
                  ? <img src={item.product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%' }} />
                }
              </div>
              <div style={{ flex: 1 }}>
                <Link to={`/produit/${item.product.id}`} style={{ fontWeight: 600, fontSize: 15, textDecoration: 'none', color: 'var(--ink)' }}>
                  {item.product.name}
                </Link>
                <p style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 2 }}>{formatPrice(item.unitPrice)} × {item.quantity}</p>
              </div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', background: 'var(--cream)', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--terracotta)' }}>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Infos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Mode de paiement', value: PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod },
            { label: 'Statut paiement', value: order.paymentStatus === 'paid' ? '✓ Payé' : 'En attente' },
            { label: 'Adresse de livraison', value: order.shippingAddress || '—' },
            { label: 'Notes', value: order.notes || '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
