import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, User, Package, MapPin, Phone, Mail, Save } from 'lucide-react'
import { favoritesApi, authApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { ProductCard } from '../components/ui/ProductCard'
import { Button, Input, Toast, Spinner } from '../components/ui'
import type { Favorite } from '../types'

// ── Favorites ──────────────────────────────────────────────────────────────────
export function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    favoritesApi.getAll().then(setFavorites).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    load()
  }, [user])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={32} /></div>

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 700, letterSpacing: -0.5, marginBottom: 32 }}>
          Mes favoris
        </h1>

        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Heart size={56} color="var(--ink-light)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Aucun favori</h3>
            <p style={{ color: 'var(--ink-light)', marginBottom: 24 }}>Ajoutez des produits à vos favoris en cliquant sur le cœur</p>
            <Link to="/catalogue" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--terracotta)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, textDecoration: 'none' }}>
              Explorer le catalogue
            </Link>
          </div>
        ) : (
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {favorites.map(fav => (
              <div key={fav.id} className="animate-fade-up">
                <ProductCard product={fav.product} isFav={true} onFavToggle={load} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

// ── Profile ────────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!user) navigate('/connexion')
  }, [user])

  if (!user) return null

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await authApi.updateMe({ name: form.name, phone: form.phone || undefined, address: form.address || undefined })
      updateUser(updated)
      setToast({ msg: 'Profil mis à jour', type: 'success' })
    } catch (err: any) {
      setToast({ msg: err.response?.data?.message || 'Erreur', type: 'error' })
    } finally { setSaving(false) }
  }

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <main style={{ padding: '40px 0 80px', background: 'var(--surface-warm)' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 700, letterSpacing: -0.5, marginBottom: 32 }}>
          Mon compte
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start' }}>
          {/* Form */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 28 }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 64, height: 64, background: 'var(--terracotta)', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#fff',
              }}>
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{user.name}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 2 }}>{user.email}</div>
                {user.role === 'admin' && (
                  <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 10px', background: 'rgba(196,98,45,0.12)', color: 'var(--terracotta)', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    ADMINISTRATEUR
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Input label="Nom complet" value={form.name} onChange={set('name')} icon={<User size={15} />} />
              <div style={{ padding: '11px 14px', background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={15} color="var(--ink-light)" />
                <span style={{ fontSize: 15, color: 'var(--ink-muted)' }}>{user.email}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-light)', marginLeft: 'auto' }}>non modifiable</span>
              </div>
              <Input label="Téléphone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+229 97 00 00 00" icon={<Phone size={15} />} />
              <Input label="Adresse de livraison par défaut" value={form.address} onChange={set('address')} placeholder="Rue, quartier, ville" icon={<MapPin size={15} />} />

              <Button type="submit" variant="primary" loading={saving} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                <Save size={16} /> Enregistrer les modifications
              </Button>
            </form>
          </div>

          {/* Sidebar links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { to: '/commandes', label: 'Mes commandes', icon: <Package size={16} /> },
              { to: '/favoris', label: 'Mes favoris', icon: <Heart size={16} /> },
            ].map(({ to, label, icon }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--ink)',
                fontWeight: 500, fontSize: 15, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--terracotta)'; (e.currentTarget as HTMLElement).style.color = 'var(--terracotta)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)' }}
              >
                {icon} {label}
              </Link>
            ))}

            <button onClick={handleLogout} style={{
              padding: '14px 18px', background: 'transparent',
              border: '1px solid #fecaca', borderRadius: 'var(--radius)',
              color: '#dc2626', fontWeight: 500, fontSize: 15, cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}
