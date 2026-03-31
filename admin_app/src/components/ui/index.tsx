import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, useEffect } from 'react'
import clsx from 'clsx'

// ── Badge ─────────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'En attente',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  confirmed: { label: 'Confirmée',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  shipped:   { label: 'Expédiée',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  delivered: { label: 'Livrée',      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  cancelled: { label: 'Annulée',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  admin:     { label: 'Admin',        color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  user:      { label: 'Utilisateur', color: '#8b8ba8', bg: 'rgba(139,139,168,0.1)' },
  paid:      { label: 'Payé',        color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  unpaid:    { label: 'Non payé',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  refunded:  { label: 'Remboursé',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
}

export function Badge({ value, custom }: { value: string; custom?: string }) {
  const cfg = STATUS_MAP[value] || { label: custom || value, color: '#8b8ba8', bg: 'rgba(139,139,168,0.1)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 500,
      color: cfg.color, background: cfg.bg, letterSpacing: 0.2,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md'
  loading?: boolean
  icon?: ReactNode
}

export function Button({ variant = 'outline', size = 'md', loading, icon, children, className, ...props }: BtnProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#fff', border: 'none' },
    ghost:   { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' },
    danger:  { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' },
    outline: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' },
  }
  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '4px 10px', fontSize: 12, gap: 5 },
    md: { padding: '7px 14px', fontSize: 13, gap: 7 },
  }
  return (
    <button
      {...props}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)',
        fontWeight: 500, cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled || loading ? 0.5 : 1, transition: 'all 0.15s',
        ...styles[variant], ...sizes[size],
      }}
    >
      {loading ? <Spinner size={12} /> : icon}
      {children}
    </button>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: 20, ...style,
    }} className={className}>
      {children}
    </div>
  )
}

// ── MetricCard ────────────────────────────────────────────────────────────────
export function MetricCard({
  label, value, sub, icon, color = 'var(--accent)',
}: {
  label: string; value: string | number; sub?: string; icon: ReactNode; color?: string
}) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: 0.3 }}>
          {label.toUpperCase()}
        </span>
        <div style={{
          width: 34, height: 34, borderRadius: 'var(--radius-sm)',
          background: `${color}20`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color,
        }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{sub}</div>}
      </div>
    </Card>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export function Input({ label, error, icon, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
            {icon}
          </span>
        )}
        <input
          {...props}
          style={{
            width: '100%', padding: icon ? '8px 12px 8px 34px' : '8px 12px',
            background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 13,
            fontFamily: 'var(--font-sans)', outline: 'none', transition: 'border-color 0.15s',
            ...props.style,
          }}
          onFocus={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-focus)' }}
          onBlur={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)' }}
        />
      </div>
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

export function Select({ label, children, ...props }: { label?: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>}
      <select
        {...props}
        style={{
          padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 13,
          fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer',
        }}
      >
        {children}
      </select>
    </div>
  )
}

export function Textarea({ label, ...props }: { label?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>}
      <textarea
        {...props}
        style={{
          width: '100%', padding: '8px 12px', background: 'var(--bg-input)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
          outline: 'none', resize: 'vertical', minHeight: 72,
        }}
      />
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 460 }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; width?: number
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: 24, width, maxWidth: '90vw',
          maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.2s ease both',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────
export function Table({ headers, children, empty }: {
  headers: string[]; children: ReactNode; empty?: boolean
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 500,
                color: 'var(--text-tertiary)', letterSpacing: 0.5, textTransform: 'uppercase',
                borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empty
            ? <tr><td colSpan={headers.length} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Aucun résultat</td></tr>
            : children
          }
        </tbody>
      </table>
    </div>
  )
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      style={{ borderBottom: '1px solid var(--border)', cursor: onClick ? 'pointer' : undefined, transition: 'background 0.1s' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </tr>
  )
}

export function Td({ children, mono, muted, style }: { children: ReactNode; mono?: boolean; muted?: boolean; style?: React.CSSProperties }) {
  return (
    <td style={{
      padding: '11px 12px', color: muted ? 'var(--text-secondary)' : 'var(--text-primary)',
      fontFamily: mono ? 'var(--font-mono)' : undefined, fontSize: mono ? 12 : undefined,
      ...style,
    }}>
      {children}
    </td>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid var(--border)`, borderTopColor: 'var(--accent)',
      animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  )
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>{title}</h1>
        {sub && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = type === 'success'
    ? { bg: 'var(--green-dim)', border: 'rgba(16,185,129,0.25)', color: 'var(--green)' }
    : { bg: 'var(--red-dim)', border: 'rgba(239,68,68,0.25)', color: 'var(--red)' }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      padding: '12px 18px', borderRadius: 'var(--radius-md)',
      background: colors.bg, border: `1px solid ${colors.border}`,
      color: colors.color, fontSize: 13, fontWeight: 500,
      boxShadow: 'var(--shadow-md)', animation: 'fadeIn 0.2s ease both',
      maxWidth: 360,
    }}>
      {message}
    </div>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--accent-dim)', color: 'var(--accent)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</div>
      {sub && <div style={{ fontSize: 13, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── Formatters ────────────────────────────────────────────────────────────────
export const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(Math.round(n))

export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

export const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'Livraison',
  mobile_money: 'Mobile Money',
  card: 'Carte',
  bank_transfer: 'Virement',
}
