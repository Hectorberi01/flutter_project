import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, User, Phone, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Input, Button, Spinner } from '../components/ui'

// ── Login ──────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Identifiants invalides')
    } finally { setLoading(false) }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', background: 'var(--cream)' }}>
      {/* Decorative left panel */}
      <div style={{
        flex: 1, background: 'var(--ink)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 60,
        position: 'relative', overflow: 'hidden',
      }} className="hide-mobile">
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(196,98,45,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(212,168,67,0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
          <div style={{ width: 64, height: 64, background: 'var(--terracotta)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <Package size={28} color="#fff" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--cream)', letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 16 }}>
            Bienvenue sur<br /><em style={{ color: 'var(--terra-light)', fontStyle: 'italic' }}>HBA Market</em>
          </h2>
          <p style={{ color: 'rgba(245,240,232,0.6)', fontSize: 15, lineHeight: 1.7 }}>
            Des milliers de produits africains authentiques, livrés partout en Afrique de l'Ouest.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 40 }}>
            {[{ val: '10K+', label: 'Produits' }, { val: '50K+', label: 'Clients' }, { val: '12', label: 'Pays' }].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--terra-light)' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`.hide-mobile { @media(max-width:768px){display:none!important} }`}</style>
      </div>

      {/* Form */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
            <div style={{ width: 32, height: 32, background: 'var(--terracotta)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>HBA Market</span>
          </Link>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, letterSpacing: -0.3, marginBottom: 6 }}>Bon retour !</h1>
          <p style={{ color: 'var(--ink-light)', fontSize: 15, marginBottom: 32 }}>Connectez-vous à votre compte</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" icon={<Mail size={15} />} required autoFocus />
            <Input label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" icon={<Lock size={15} />} required />

            {error && (
              <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', fontSize: 14, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--ink-light)' }}>
            Pas encore de compte ?{' '}
            <Link to="/inscription" style={{ color: 'var(--terracotta)', fontWeight: 600, textDecoration: 'none' }}>S'inscrire</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

// ── Register ───────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.phone || undefined)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'inscription')
    } finally { setLoading(false) }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, background: 'var(--terracotta)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>HBA Market</span>
        </Link>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '36px 36px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: -0.3, marginBottom: 6 }}>Créer un compte</h1>
          <p style={{ color: 'var(--ink-light)', fontSize: 14, marginBottom: 28 }}>Rejoignez notre communauté</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Nom complet *" value={form.name} onChange={set('name')} placeholder="Jean Dupont" icon={<User size={15} />} required autoFocus />
            <Input label="Email *" type="email" value={form.email} onChange={set('email')} placeholder="votre@email.com" icon={<Mail size={15} />} required />
            <Input label="Téléphone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+229 97 00 00 00" icon={<Phone size={15} />} />
            <Input label="Mot de passe *" type="password" value={form.password} onChange={set('password')} placeholder="••••••••  (min. 6 caractères)" icon={<Lock size={15} />} required />

            {error && (
              <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', fontSize: 14, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} style={{ marginTop: 4 }}>
              {loading ? "Création du compte..." : "Créer mon compte"}
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ink-light)' }}>
            Déjà un compte ?{' '}
            <Link to="/connexion" style={{ color: 'var(--terracotta)', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
