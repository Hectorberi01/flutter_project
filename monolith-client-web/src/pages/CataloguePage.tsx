import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { productsApi } from '../api'
import { ProductCard } from '../components/ui/ProductCard'
import { Button, Spinner } from '../components/ui'
import type { Product } from '../types'

const CATEGORIES = ['Vêtements', 'Alimentation', 'Beauté', 'Électronique', 'Maison', 'Sport']
const SORTS = [
  { val: '', label: 'Pertinence' },
  { val: 'price_asc', label: 'Prix croissant' },
  { val: 'price_desc', label: 'Prix décroissant' },
]

export default function CataloguePage() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState(params.get('search') || '')
  const [category, setCategory] = useState(params.get('category') || '')
  const [sort, setSort] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const load = useCallback(async (p = 1, reset = false) => {
    setLoading(true)
    try {
      const res = await productsApi.getAll({
        search: search || undefined,
        category: category || undefined,
        page: p,
        limit: 16,
      })
      let sorted = [...res.products]
      if (sort === 'price_asc') sorted.sort((a, b) => a.price - b.price)
      if (sort === 'price_desc') sorted.sort((a, b) => b.price - a.price)
      setProducts(reset || p === 1 ? sorted : prev => [...prev, ...sorted])
      setTotal(res.total)
      setPage(p)
      setPages(res.pages)
    } finally { setLoading(false) }
  }, [search, category, sort])

  useEffect(() => { load(1, true) }, [load])

  useEffect(() => {
    const cat = params.get('category') || ''
    const s = params.get('search') || ''
    setCategory(cat)
    setSearch(s)
  }, [params])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setParams(prev => { const n = new URLSearchParams(prev); search ? n.set('search', search) : n.delete('search'); return n })
  }

  const handleCategory = (cat: string) => {
    const newCat = category === cat ? '' : cat
    setCategory(newCat)
    setParams(prev => { const n = new URLSearchParams(prev); newCat ? n.set('category', newCat) : n.delete('category'); return n })
  }

  const clearFilters = () => {
    setSearch(''); setCategory(''); setSort(''); setParams({})
  }

  const hasFilters = search || category || sort

  return (
    <main style={{ minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface-warm)', borderBottom: '1px solid var(--border)', padding: '32px 0 24px' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, letterSpacing: -0.5, marginBottom: 20 }}>
            {category ? category : 'Tout le catalogue'}
            {total > 0 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 400, color: 'var(--ink-light)', marginLeft: 12 }}>({total} produits)</span>}
          </h1>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 200, maxWidth: 400, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-light)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                style={{
                  width: '100%', padding: '10px 14px 10px 38px', background: 'var(--surface)',
                  border: '1.5px solid var(--border-dark)', borderRadius: 'var(--radius)',
                  fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--terracotta)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-dark)'}
              />
            </form>

            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              padding: '10px 14px', background: 'var(--surface)', border: '1.5px solid var(--border-dark)',
              borderRadius: 'var(--radius)', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink)', cursor: 'pointer', outline: 'none',
            }}>
              {SORTS.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
            </select>

            <Button variant="ghost" size="sm" onClick={() => setFiltersOpen(o => !o)}>
              <SlidersHorizontal size={15} />
              Filtres
            </Button>

            {hasFilters && (
              <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 20, background: 'var(--terracotta)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <X size={13} /> Effacer les filtres
              </button>
            )}
          </div>

          {/* Category chips */}
          {filtersOpen && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, animation: 'slideDown 0.15s ease' }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => handleCategory(cat)} style={{
                  padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                  border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s',
                  borderColor: category === cat ? 'var(--terracotta)' : 'var(--border-dark)',
                  background: category === cat ? 'var(--terracotta)' : 'var(--surface)',
                  color: category === cat ? '#fff' : 'var(--ink)',
                }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products grid */}
      <div className="container" style={{ padding: '32px 24px' }}>
        {loading && products.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={36} /></div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--ink-light)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Aucun produit trouvé</h3>
            <p style={{ fontSize: 15 }}>Essayez avec d'autres mots-clés ou catégories</p>
            <button onClick={clearFilters} style={{ marginTop: 20, padding: '10px 24px', background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Voir tous les produits
            </button>
          </div>
        ) : (
          <>
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {products.map(p => (
                <div key={p.id} className="animate-fade-up">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {page < pages && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
                <Button variant="ghost" onClick={() => load(page + 1)} loading={loading}>
                  Charger plus de produits
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
