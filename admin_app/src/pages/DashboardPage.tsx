import { useEffect, useState } from 'react'
import { ShoppingBag, Package, Users, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { dashboardApi } from '../api'
import {
  MetricCard, Card, Badge, Table, Tr, Td,
  fmt, fmtDate, PAYMENT_LABELS, Spinner, PageHeader,
} from '../components/ui'
import type { Order } from '../types'

interface Stats {
  totalOrders: number
  pendingOrders: number
  revenue: number
  totalProducts: number
  outOfStock: number
  totalUsers: number
  adminCount: number
  statusBreakdown: Record<string, number>
  categoryBreakdown: Record<string, number>
  recentOrders: Order[]
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6',
  shipped: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444',
}
const STATUS_FR: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
}

export default function DashboardPage({ refresh }: { refresh: number }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    dashboardApi.getStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [refresh])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <Spinner size={28} />
    </div>
  )
  if (!stats) return null

  const pieData = Object.entries(stats.statusBreakdown).map(([k, v]) => ({
    name: STATUS_FR[k] || k, value: v, color: STATUS_COLORS[k] || '#555',
  }))

  const catData = Object.entries(stats.categoryBreakdown)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="animate-fade">
      <PageHeader title="Tableau de bord" sub={`Mis à jour à ${new Date().toLocaleTimeString('fr-FR')}`} />

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard
          label="Commandes" value={stats.totalOrders}
          sub={`${stats.pendingOrders} en attente`}
          icon={<ShoppingBag size={16} />} color="var(--accent)"
        />
        <MetricCard
          label="Chiffre d'affaires" value={fmt(stats.revenue)}
          sub="Commandes livrées"
          icon={<TrendingUp size={16} />} color="var(--green)"
        />
        <MetricCard
          label="Produits actifs" value={stats.totalProducts}
          sub={`${stats.outOfStock} en rupture`}
          icon={<Package size={16} />} color="var(--amber)"
        />
        <MetricCard
          label="Utilisateurs" value={stats.totalUsers}
          sub={`${stats.adminCount} admin(s)`}
          icon={<Users size={16} />} color="var(--blue)"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Donut status */}
        <Card>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 14 }}>
            Statuts des commandes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [v, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Categories bar */}
        <Card>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 14 }}>
            Top catégories produits
          </div>
          {catData.length === 0
            ? <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Aucune catégorie</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {catData.map(({ name, value }) => {
                  const max = catData[0].value
                  return (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      <div style={{ flex: 1, height: 5, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: 'var(--accent)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, width: 20, textAlign: 'right' }}>{value}</span>
                    </div>
                  )
                })}
              </div>
            )
          }
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 14 }}>
          Dernières commandes
        </div>
        <Table
          headers={['Référence', 'Client', 'Montant', 'Paiement', 'Statut', 'Date']}
          empty={stats.recentOrders.length === 0}
        >
          {stats.recentOrders.map(o => (
            <Tr key={o.id}>
              <Td mono>{o.reference || o.id.slice(0, 8)}</Td>
              <Td>{o.user?.name || '—'}</Td>
              <Td><span style={{ fontWeight: 500 }}>{fmt(o.totalAmount)}</span></Td>
              <Td muted>{PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod}</Td>
              <Td><Badge value={o.status} /></Td>
              <Td muted>{fmtDate(o.createdAt)}</Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
