import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, useEffect } from 'react'

// ── Button ────────────────────────────────────────────────────────────────────
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, fullWidth, children, style, ...props }: BtnProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: 0.2,
    cursor: props.disabled || loading ? 'not-allowed' : 'pointer',
    opacity: props.disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s', border: 'none', textDecoration: 'none',
    width: fullWidth ? '100%' : undefined,
  }
  const variants = {
    primary:   { background: 'var(--terracotta)', color: '#fff', padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '16px 32px' : '11px 24px', borderRadius: 'var(--radius)', fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15 },
    secondary: { background: 'var(--ink)', color: '#fff', padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '16px 32px' : '11px 24px', borderRadius: 'var(--radius)', fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15 },
    ghost:     { background: 'transparent', color: 'var(--ink)', padding: size === 'sm' ? '7px 14px' : '10px 20px', borderRadius: 'var(--radius)', fontSize: 14, border: '1.5px solid var(--border-dark)' },
    danger:    { background: '#fee2e2', color: '#dc2626', padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13 },
  }
  return (
    <button {...props} style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => {
        if (!props.disabled && !loading) {
          if (variant === 'primary') e.currentTarget.style.background = 'var(--terra-dark)'
          if (variant === 'secondary') e.currentTarget.style.background = 'var(--ink-muted)'
          if (variant === 'ghost') e.currentTarget.style.background = 'var(--cream-dark)'
        }
      }}
      onMouseLeave={e => {
        if (variant === 'primary') e.currentTarget.style.background = 'var(--terracotta)'
        if (variant === 'secondary') e.currentTarget.style.background = 'var(--ink)'
        if (variant === 'ghost') e.currentTarget.style.background = 'transparent'
      }}
    >
      {loading ? <Spinner size={14} color={variant === 'ghost' ? 'var(--ink)' : '#fff'} /> : children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; icon?: ReactNode
}

export function Input({ label, error, icon, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-light)', display: 'flex' }}>{icon}</span>}
        <input {...props} style={{
          width: '100%', padding: icon ? '11px 14px 11px 38px' : '11px 14px',
          background: 'var(--surface)', border: `1.5px solid ${error ? '#dc2626' : 'var(--border-dark)'}`,
          borderRadius: 'var(--radius)', fontSize: 15, fontFamily: 'var(--font-body)',
          color: 'var(--ink)', outline: 'none', transition: 'border-color 0.2s',
          ...style,
        }}
          onFocus={e => { e.target.style.borderColor = error ? '#dc2626' : 'var(--terracotta)' }}
          onBlur={e => { e.target.style.borderColor = error ? '#dc2626' : 'var(--border-dark)' }}
        />
      </div>
      {error && <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'var(--terracotta)' }: { size?: number; color?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${color}30`, borderTopColor: color,
      animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: 'En attente',  bg: '#fef3c7', color: '#92400e' },
  confirmed: { label: 'Confirmée',   bg: '#dbeafe', color: '#1e40af' },
  shipped:   { label: 'Expédiée',    bg: '#ede9fe', color: '#5b21b6' },
  delivered: { label: 'Livrée',      bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'Annulée',     bg: '#fee2e2', color: '#991b1b' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] || { label: status, bg: 'var(--cream-dark)', color: 'var(--ink-muted)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      padding: '14px 20px', borderRadius: 'var(--radius)',
      background: type === 'success' ? 'var(--ink)' : '#dc2626',
      color: '#fff', fontSize: 14, fontWeight: 500,
      boxShadow: 'var(--shadow-lg)', animation: 'fadeUp 0.25s ease',
      maxWidth: 360, display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, children, width = 480 }: { open: boolean; onClose: () => void; children: ReactNode; width?: number }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(28,20,16,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        width, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)', animation: 'scaleIn 0.2s ease',
      }}>
        {children}
      </div>
    </div>
  )
}

// ── Formatters ────────────────────────────────────────────────────────────────
export const formatPrice = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(Math.round(n))

export const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

export const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'Paiement à la livraison',
  mobile_money: 'Mobile Money',
  card: 'Carte bancaire',
  bank_transfer: 'Virement bancaire',
}
