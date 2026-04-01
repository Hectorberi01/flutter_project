import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, Menu, X, Package } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export function Navbar() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [dropOpen, setDropOpen] = useState(false)

  const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchVal.trim())}`)
      setSearchOpen(false)
      setSearchVal('')
    }
  }

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(245,240,232,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', height: 'var(--nav-h)',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
            <div style={{
              width: 36, height: 36, background: 'var(--terracotta)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Package size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.5 }}>
              HBA Market
            </span>
          </Link>

          {/* Nav links desktop */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="hide-mobile">
            {[
              { to: '/catalogue', label: 'Catalogue' },
              { to: '/catalogue?category=Vêtements', label: 'Mode' },
              { to: '/catalogue?category=Alimentation', label: 'Épicerie' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 500,
                textDecoration: 'none', color: 'var(--ink-muted)', transition: 'all 0.15s',
                background: location.pathname + location.search === to ? 'var(--cream-dark)' : 'transparent',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = location.pathname + location.search === to ? 'var(--cream-dark)' : 'transparent'}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search */}
            <button onClick={() => setSearchOpen(true)} style={{
              width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--ink-muted)', transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Search size={18} />
            </button>

            {/* Favorites */}
            {user && (
              <Link to="/favoris" style={{
                width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'transparent', textDecoration: 'none',
                color: 'var(--ink-muted)', transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cream-dark)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <Heart size={18} />
              </Link>
            )}

            {/* Cart */}
            <Link to="/panier" style={{
              position: 'relative', width: 38, height: 38, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', textDecoration: 'none', color: 'var(--ink-muted)',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cream-dark)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4, width: 16, height: 16,
                  background: 'var(--terracotta)', color: '#fff', borderRadius: '50%',
                  fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setDropOpen(o => !o)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px',
                  borderRadius: 24, background: 'transparent', border: '1.5px solid var(--border-dark)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'var(--terracotta)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                  }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }} className="hide-mobile">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                {dropOpen && (
                  <div onClick={() => setDropOpen(false)} style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
                    minWidth: 180, zIndex: 200, overflow: 'hidden',
                    animation: 'slideDown 0.15s ease',
                  }}>
                    {[
                      { to: '/mon-compte', label: 'Mon compte' },
                      { to: '/commandes', label: 'Mes commandes' },
                      { to: '/favoris', label: 'Mes favoris' },
                    ].map(({ to, label }) => (
                      <Link key={to} to={to} style={{
                        display: 'block', padding: '11px 16px', fontSize: 14,
                        color: 'var(--ink)', textDecoration: 'none', transition: 'background 0.1s',
                      }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cream)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        {label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', padding: '6px 0' }}>
                      <button onClick={logout} style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 16px', fontSize: 14, color: '#dc2626',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                      }}>
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/connexion" style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                borderRadius: 'var(--radius)', background: 'var(--ink)', color: '#fff',
                textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink-muted)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink)'}
              >
                <User size={15} />
                <span className="hide-mobile">Connexion</span>
              </Link>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(o => !o)} className="show-mobile" style={{
              width: 38, height: 38, display: 'none', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink)',
            }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div onClick={() => setSearchOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(28,20,16,0.4)',
          zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px',
          backdropFilter: 'blur(4px)',
        }}>
          <form onSubmit={handleSearch} onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 540, animation: 'scaleIn 0.2s ease',
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-light)' }} />
              <input
                autoFocus
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Rechercher un produit..."
                style={{
                  width: '100%', padding: '16px 16px 16px 48px', fontSize: 17,
                  background: 'var(--surface)', border: 'none', borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-body)',
                  color: 'var(--ink)', outline: 'none',
                }}
              />
            </div>
          </form>
        </div>
      )}

      {/* Mobile nav */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0,
          background: 'var(--cream)', borderBottom: '1px solid var(--border)',
          padding: 20, zIndex: 99, animation: 'slideDown 0.2s ease',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {[
            { to: '/catalogue', label: 'Catalogue' },
            { to: '/commandes', label: 'Mes commandes' },
            { to: '/favoris', label: 'Mes favoris' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
              padding: '12px 16px', borderRadius: 'var(--radius)', fontSize: 15, fontWeight: 500,
              textDecoration: 'none', color: 'var(--ink)',
            }}>
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  )
}
