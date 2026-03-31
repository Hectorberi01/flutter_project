import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  LogOut, Settings, Bell, RefreshCw,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Avatar, Spinner } from '../ui'
import { type ReactNode, useState } from 'react'

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard',    icon: <LayoutDashboard size={15} /> },
  { to: '/products', label: 'Produits',     icon: <Package size={15} /> },
  { to: '/orders',   label: 'Commandes',    icon: <ShoppingBag size={15} /> },
  { to: '/users',    label: 'Utilisateurs', icon: <Users size={15} /> },
]

export function Sidebar({ pendingCount }: { pendingCount: number }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside style={{
      width: 'var(--sidebar-width)', height: '100vh',
      background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, background: 'var(--accent)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LayoutDashboard size={15} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>Monolith</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: 0.5 }}>ADMIN PANEL</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', padding: '6px 8px', letterSpacing: 0.8, fontWeight: 500 }}>
          NAVIGATION
        </div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 'var(--radius-sm)',
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              transition: 'all 0.15s',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
            })}
          >
            {item.icon}
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.label === 'Commandes' && pendingCount > 0 && (
              <span style={{
                background: 'var(--accent)', color: '#fff',
                borderRadius: 10, fontSize: 10, padding: '1px 6px', fontWeight: 600,
              }}>{pendingCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div style={{ padding: '12px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Avatar name={user.name} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 'var(--radius-sm)',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--red-dim)'
              e.currentTarget.style.color = 'var(--red)'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <LogOut size={13} />
            Se déconnecter
          </button>
        </div>
      )}
    </aside>
  )
}

export function AppLayout({ children, pendingCount, onRefresh, refreshing }: {
  children: ReactNode; pendingCount: number; onRefresh: () => void; refreshing: boolean
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar pendingCount={pendingCount} />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <header style={{
          height: 'var(--topbar-height)', background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 12, position: 'sticky', top: 0, zIndex: 40,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            localhost:3000
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 'var(--radius-sm)',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-sans)', opacity: refreshing ? 0.5 : 1,
            }}
          >
            <RefreshCw size={12} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : undefined }} />
            Actualiser
          </button>
        </header>
        <main style={{ flex: 1, padding: 24, animation: 'fadeIn 0.2s ease' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
