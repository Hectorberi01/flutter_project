import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Package, Pencil, Trash2 } from 'lucide-react'
import { productsApi } from '../api'
import {
  Card, Table, Tr, Td, Button, Input, Select, Badge,
  Modal, PageHeader, Toast, Spinner, fmt, fmtDate,
} from '../components/ui'
import type { Product } from '../types'

interface FormData {
  name: string; price: string; stock: string
  category: string; imageUrl: string; description: string
}

const EMPTY_FORM: FormData = { name: '', price: '', stock: '0', category: '', imageUrl: '', description: '' }

export default function ProductsPage({ refresh }: { refresh: number }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsApi.getAll()
      setProducts(res.products)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load, refresh])

  const categories = [...new Set(products.map(p => p.category).filter(Boolean) as string[])]

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !catFilter || p.category === catFilter
    return matchSearch && matchCat
  })

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name, price: String(p.price), stock: String(p.stock),
      category: p.category || '', imageUrl: p.imageUrl || '',
      description: p.description || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { setToast({ msg: 'Nom et prix requis', type: 'error' }); return }
    setSaving(true)
    try {
      const body = {
        name: form.name, price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        category: form.category || undefined,
        imageUrl: form.imageUrl || undefined,
        description: form.description || undefined,
      }
      if (editing) { await productsApi.update(editing.id, body); setToast({ msg: 'Produit mis à jour', type: 'success' }) }
      else { await productsApi.create(body); setToast({ msg: 'Produit créé', type: 'success' }) }
      setModalOpen(false)
      load()
    } catch (e: any) {
      setToast({ msg: e.response?.data?.message || e.message, type: 'error' })
    } finally { setSaving(false) }
  }

  const handleDelete = async (p: Product) => {
    if (!confirm(`Supprimer "${p.name}" ?`)) return
    setDeleting(p.id)
    try {
      await productsApi.delete(p.id)
      setToast({ msg: 'Produit supprimé', type: 'success' })
      load()
    } catch (e: any) {
      setToast({ msg: e.response?.data?.message || e.message, type: 'error' })
    } finally { setDeleting(null) }
  }

  const setField = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="animate-fade">
      <PageHeader
        title="Produits"
        sub={`${products.length} produits au total`}
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>
            Nouveau produit
          </Button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search size={14} />}
          />
        </div>
        <Select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <Card>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={24} /></div>
        ) : (
          <Table
            headers={['Produit', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Créé le', 'Actions']}
            empty={filtered.length === 0}
          >
            {filtered.map(p => (
              <Tr key={p.id}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={14} color="var(--text-tertiary)" /></div>
                    }
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </div>
                </Td>
                <Td muted>{p.category || '—'}</Td>
                <Td><span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmt(p.price)}</span></Td>
                <Td>
                  <span style={{ color: p.stock === 0 ? 'var(--red)' : p.stock < 5 ? 'var(--amber)' : 'var(--green)', fontWeight: 500 }}>
                    {p.stock}
                  </span>
                </Td>
                <Td>
                  <Badge value={p.isActive ? 'active' : 'inactive'} custom={p.isActive ? 'Actif' : 'Inactif'} />
                </Td>
                <Td muted>{fmtDate(p.createdAt)}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button size="sm" icon={<Pencil size={12} />} onClick={() => openEdit(p)}>Éditer</Button>
                    <Button size="sm" variant="danger" icon={deleting === p.id ? <Spinner size={11} /> : <Trash2 size={12} />} disabled={deleting === p.id} onClick={() => handleDelete(p)}>Suppr.</Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le produit' : 'Nouveau produit'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Nom *" value={form.name} onChange={setField('name')} placeholder="Nom du produit" autoFocus />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Prix (FCFA) *" type="number" value={form.price} onChange={setField('price')} placeholder="0" />
            <Input label="Stock" type="number" value={form.stock} onChange={setField('stock')} placeholder="0" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Catégorie" value={form.category} onChange={setField('category')} placeholder="Ex: Vêtements" />
            <Input label="URL image" value={form.imageUrl} onChange={setField('imageUrl')} placeholder="https://..." />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 5 }}>Description</label>
            <textarea
              value={form.description}
              onChange={setField('description')}
              placeholder="Description du produit..."
              rows={3}
              style={{
                width: '100%', padding: '8px 12px', background: 'var(--bg-input)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
                outline: 'none', resize: 'vertical',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editing ? 'Mettre à jour' : 'Créer le produit'}
            </Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
