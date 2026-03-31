import { useEffect, useState, useCallback } from 'react'
import { ordersApi } from '../api'
import {
  Card, Table, Tr, Td, Button, Select, Badge, Modal,
  PageHeader, Toast, Spinner, fmt, fmtDate, PAYMENT_LABELS,
} from '../components/ui'
import type { Order, OrderStatus } from '../types'

const STATUS_OPTIONS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
]

export default function OrdersPage({ refresh }: { refresh: number }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setOrders(await ordersApi.getAll()) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load, refresh])

  const filtered = statusFilter ? orders.filter(o => o.status === statusFilter) : orders

  const openStatusModal = (o: Order) => { setSelectedOrder(o); setNewStatus(o.status) }

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return
    setSaving(true)
    try {
      await ordersApi.updateStatus(selectedOrder.id, newStatus)
      setToast({ msg: 'Statut mis à jour', type: 'success' })
      setSelectedOrder(null)
      load()
    } catch (e: any) {
      setToast({ msg: e.response?.data?.message || e.message, type: 'error' })
    } finally { setSaving(false) }
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length

  return (
    <div className="animate-fade">
      <PageHeader
        title="Commandes"
        sub={`${orders.length} commandes · ${pendingCount} en attente`}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as OrderStatus | '')}>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </div>

      <Card>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={24} /></div>
        ) : (
          <Table
            headers={['Référence', 'Montant', 'Paiement', 'Statut paiement', 'Adresse livraison', 'Statut', 'Date', 'Action']}
            empty={filtered.length === 0}
          >
            {filtered.map(o => (
              <Tr key={o.id}>
                <Td mono>{o.reference || o.id.slice(0, 10)}</Td>
                <Td><span style={{ fontWeight: 500 }}>{fmt(o.totalAmount)}</span></Td>
                <Td muted>{PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod}</Td>
                <Td><Badge value={o.paymentStatus} /></Td>
                <Td muted style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {o.shippingAddress || '—'}
                </Td>
                <Td><Badge value={o.status} /></Td>
                <Td muted>{fmtDate(o.createdAt)}</Td>
                <Td>
                  <Button size="sm" variant="primary" onClick={() => openStatusModal(o)}>
                    Statut
                  </Button>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Order detail + status modal */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Commande ${selectedOrder?.reference || ''}`}
        width={500}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Items */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Articles ({selectedOrder.items.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedOrder.items.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
                  }}>
                    {item.product.imageUrl
                      ? <img src={item.product.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                      : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--border)' }} />
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{item.product.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{fmt(item.unitPrice)} × {item.quantity}</div>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{fmt(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-dim)' }}>
                <span style={{ fontWeight: 500 }}>Total</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Infos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              {[
                { label: 'Paiement', value: PAYMENT_LABELS[selectedOrder.paymentMethod] },
                { label: 'Statut paiement', value: <Badge value={selectedOrder.paymentStatus} /> },
                { label: 'Adresse', value: selectedOrder.shippingAddress || '—' },
                { label: 'Notes', value: selectedOrder.notes || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Update status */}
            <Select
              label="Changer le statut"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as OrderStatus)}
            >
              {STATUS_OPTIONS.filter(o => o.value).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setSelectedOrder(null)}>Fermer</Button>
              <Button variant="primary" onClick={handleUpdateStatus} loading={saving}>
                Mettre à jour
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
