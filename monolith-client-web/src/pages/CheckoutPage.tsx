import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapPin, CreditCard, Truck, Phone, Building, CheckCircle } from 'lucide-react'
import { ordersApi } from '../api'
import { useCart } from '../context/CartContext'
import { Button, Input, Toast, formatPrice, PAYMENT_LABELS, Spinner } from '../components/ui'
import type { PaymentMethod } from '../types'

const PAYMENT_OPTIONS: { value: PaymentMethod; icon: React.ReactNode }[] = [
  { value: 'cash_on_delivery', icon: <Truck size={18} /> },
  { value: 'mobile_money',    icon: <Phone size={18} /> },
  { value: 'card',            icon: <CreditCard size={18} /> },
  { value: 'bank_transfer',   icon: <Building size={18} /> },
]

export default function CheckoutPage() {
  const { cart, reload } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('cash_on_delivery')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [errors, setErrors] = useState<{ address?: string }>({})

  const items = cart?.items ?? []
  const total = cart?.total ?? 0

  if (!cart || items.length === 0) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Panier vide</h2>
        <Link to="/catalogue" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>Retour au catalogue</Link>
      </div>
    </main>
  )

  const validate = () => {
    const e: typeof errors = {}
    if (!address.trim()) e.address = 'Adresse de livraison requise'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const order = await ordersApi.checkout(address.trim(), payment, notes.trim() || undefined)
      await reload()
      navigate(`/commandes/${order.id}?new=1`)
    } catch (err: any) {
      setToast({ msg: err.response?.data?.message || err.message || 'Erreur lors de la commande', type: 'error' })
    } finally { setLoading(false) }
  }

  return (
    <main style={{ padding: '40px 0 80px', background: 'var(--surface-warm)' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, letterSpacing: -0.5, marginBottom: 36 }}>
          Finaliser la commande
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'start' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Shipping */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, background: 'var(--terracotta)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={18} color="#fff" />
                  </div>
                  <h2 style={{ fontSize: 17, fontWeight: 700 }}>Adresse de livraison</h2>
                </div>
                <Input
                  label="Adresse complète *"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Rue, quartier, ville, pays"
                  error={errors.address}
                />
                <div style={{ marginTop: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 }}>Instructions de livraison</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Informations supplémentaires pour le livreur..."
                    rows={3}
                    style={{
                      width: '100%', padding: '11px 14px', background: 'var(--surface-warm)',
                      border: '1.5px solid var(--border-dark)', borderRadius: 'var(--radius)',
                      fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--ink)',
                      outline: 'none', resize: 'vertical',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--terracotta)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-dark)'}
                  />
                </div>
              </div>

              {/* Payment */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, background: 'var(--gold)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={18} color="#fff" />
                  </div>
                  <h2 style={{ fontSize: 17, fontWeight: 700 }}>Mode de paiement</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PAYMENT_OPTIONS.map(({ value, icon }) => (
                    <label key={value} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px', borderRadius: 'var(--radius)',
                      border: `2px solid ${payment === value ? 'var(--terracotta)' : 'var(--border-dark)'}`,
                      background: payment === value ? 'rgba(196,98,45,0.06)' : 'var(--surface-warm)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} style={{ display: 'none' }} />
                      <div style={{ color: payment === value ? 'var(--terracotta)' : 'var(--ink-light)', transition: 'color 0.15s' }}>{icon}</div>
                      <span style={{ fontSize: 15, fontWeight: 500, flex: 1 }}>{PAYMENT_LABELS[value]}</span>
                      {payment === value && <CheckCircle size={18} color="var(--terracotta)" />}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ minWidth: 300 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, position: 'sticky', top: 88 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Votre commande</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--cream)', flexShrink: 0 }}>
                        {item.product.imageUrl
                          ? <img src={item.product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%' }} />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--ink-light)' }}>× {item.quantity}</p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--terracotta)' }}>{formatPrice(total)}</span>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  {loading ? 'Traitement...' : `Confirmer — ${formatPrice(total)}`}
                </Button>

                <p style={{ fontSize: 11, color: 'var(--ink-light)', textAlign: 'center', marginTop: 12 }}>
                  En confirmant, vous acceptez nos conditions générales de vente
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}
