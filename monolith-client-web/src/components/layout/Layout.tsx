import { Link } from 'react-router-dom'
import { Package, Instagram, Twitter, Facebook } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

export function Footer() {
  return (
    <footer style={{
      background: 'var(--ink)', color: 'var(--cream)',
      padding: '56px 0 32px', marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, background: 'var(--terracotta)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={16} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>HBA Market</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.6)', lineHeight: 1.7 }}>
              La marketplace dédiée aux produits africains de qualité, livrés partout en Afrique de l'Ouest.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: 'rgba(255,255,255,0.08)', color: 'var(--cream)',
                  textDecoration: 'none', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--terracotta)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Boutique', links: [{ to: '/catalogue', label: 'Tous les produits' }, { to: '/catalogue?category=Vêtements', label: 'Mode & Textile' }, { to: '/catalogue?category=Alimentation', label: 'Alimentation' }, { to: '/catalogue?category=Beauté', label: 'Beauté & Santé' }] },
            { title: 'Mon compte', links: [{ to: '/connexion', label: 'Se connecter' }, { to: '/inscription', label: 'S\'inscrire' }, { to: '/commandes', label: 'Mes commandes' }, { to: '/favoris', label: 'Mes favoris' }] },
            { title: 'Informations', links: [{ to: '#', label: 'À propos' }, { to: '#', label: 'Livraison' }, { to: '#', label: 'Retours' }, { to: '#', label: 'Contact' }] },
          ].map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--terra-light)', marginBottom: 16 }}>{title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(({ to, label }) => (
                  <Link key={label} to={to} style={{ fontSize: 14, color: 'rgba(245,240,232,0.65)', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--cream)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.65)'}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.4)' }}>© 2026 HBA Marketplace. Tous droits réservés.</span>
          <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.4)' }}>Fait avec ♥ en Afrique de l'Ouest</span>
        </div>
      </div>
    </footer>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </>
  )
}
