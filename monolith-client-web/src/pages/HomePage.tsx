import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Star } from 'lucide-react'
import { productsApi } from '../api'
import { ProductCard } from '../components/ui/ProductCard'
import { Spinner } from '../components/ui'
import type { Product } from '../types'

const CATEGORIES = [
  { name: 'Vêtements', emoji: '👗', color: '#E8845A' },
  { name: 'Alimentation', emoji: '🌾', color: '#D4A843' },
  { name: 'Beauté', emoji: '✨', color: '#C4622D' },
  { name: 'Électronique', emoji: '📱', color: '#5C4A3A' },
  { name: 'Maison', emoji: '🏡', color: '#9B8674' },
  { name: 'Sport', emoji: '⚽', color: '#1C1410' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.getAll({ limit: 8 })
      .then(r => setFeatured(r.products))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--ink)', color: 'var(--cream)',
        padding: '80px 0 100px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(196,98,45,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: '30%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(212,168,67,0.1)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(196,98,45,0.2)', border: '1px solid rgba(196,98,45,0.3)',
              borderRadius: 20, padding: '6px 14px', marginBottom: 28,
            }}>
              <Star size={12} fill="#D4A843" color="#D4A843" />
              <span style={{ fontSize: 13, color: 'var(--gold-light)', fontWeight: 500 }}>
                La marketplace africaine de confiance
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 6vw, 72px)',
              fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 24,
            }}>
              Découvrez les{' '}
              <em style={{ color: 'var(--terra-light)', fontStyle: 'italic' }}>trésors</em>
              {' '}de l'Afrique
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(245,240,232,0.7)', lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
              Des milliers de produits authentiques — mode, artisanat, alimentation — livrés directement depuis les producteurs africains.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/catalogue" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 28px', background: 'var(--terracotta)', color: '#fff',
                borderRadius: 'var(--radius)', fontWeight: 700, textDecoration: 'none',
                fontSize: 16, transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--terra-light)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--terracotta)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
              >
                Explorer le catalogue
                <ArrowRight size={18} />
              </Link>
              <Link to="/inscription" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: 'transparent', color: 'var(--cream)',
                borderRadius: 'var(--radius)', fontWeight: 600, textDecoration: 'none',
                fontSize: 16, border: '1.5px solid rgba(245,240,232,0.3)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,240,232,0.7)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,240,232,0.3)'}
              >
                Créer un compte
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, marginTop: 64, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
            {[
              { val: '10K+', label: 'Produits' },
              { val: '50K+', label: 'Clients satisfaits' },
              { val: '12', label: 'Pays desservis' },
              { val: '98%', label: 'Avis positifs' },
            ].map(({ val, label }) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--terra-light)' }}>{val}</div>
                <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section style={{ padding: '72px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: 8 }}>CATÉGORIES</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, letterSpacing: -0.5 }}>
                Explorez par univers
              </h2>
            </div>
            <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--terracotta)', textDecoration: 'none' }}>
              Tout voir <ArrowRight size={15} />
            </Link>
          </div>

          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {CATEGORIES.map(({ name, emoji, color }) => (
              <Link key={name} to={`/catalogue?category=${encodeURIComponent(name)}`}
                className="animate-fade-up"
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '24px 16px',
                  textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = color + '10'
                    e.currentTarget.style.borderColor = color + '40'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--surface)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ─────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 80px', background: 'var(--surface-warm)' }}>
        <div className="container" style={{ paddingTop: 72 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: 8 }}>SÉLECTION</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, letterSpacing: -0.5 }}>
                Produits du moment
              </h2>
            </div>
            <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--terracotta)', textDecoration: 'none' }}>
              Voir tout <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
          ) : (
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {featured.map(p => (
                <div key={p.id} className="animate-fade-up">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Trust banner ──────────────────────────────────────────────────── */}
      <section style={{ padding: '64px 0', background: 'var(--cream-dark)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { icon: <Truck size={28} />, title: 'Livraison rapide', desc: 'Partout en Afrique de l\'Ouest sous 3-5 jours' },
              { icon: <Shield size={28} />, title: 'Paiement sécurisé', desc: 'Mobile Money, carte bancaire et livraison' },
              { icon: <RefreshCw size={28} />, title: 'Retours faciles', desc: '14 jours pour changer d\'avis' },
              { icon: <Star size={28} />, title: 'Produits certifiés', desc: 'Chaque vendeur est vérifié par nos équipes' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 52, height: 52, background: 'var(--terracotta)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--terracotta)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: '#fff', letterSpacing: -0.5, marginBottom: 16 }}>
            Prêt à découvrir l'Afrique ?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Rejoignez des milliers de clients qui font confiance à HBA Marketplace.
          </p>
          <Link to="/inscription" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '16px 36px', background: '#fff', color: 'var(--terracotta)',
            borderRadius: 'var(--radius)', fontWeight: 700, textDecoration: 'none',
            fontSize: 17, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            Créer mon compte gratuitement
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  )
}
