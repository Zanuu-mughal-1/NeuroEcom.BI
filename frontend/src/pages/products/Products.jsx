import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Plus, Download, Package, AlertTriangle, TrendingUp, DollarSign, RefreshCw, Trash2, Edit2, X } from 'lucide-react'
import { HealthBadge } from '../../components/ui/StatusBadge'
import api from '../../utils/api'
import ProductDetail from './ProductDetail'
import ProductModal from '../../components/modals/ProductModal'

function matchesHealthFilter(p, healthFilter) {
  if (!healthFilter) return true
  if (healthFilter === 'Active') return !!p.IsActive && !p.IsDiscontinued
  if (healthFilter === 'Discontinued') return !p.IsActive || !!p.IsDiscontinued
  if (healthFilter === 'Inactive') return !p.IsActive && !p.IsDiscontinued
  return (p.HealthStatus || '') === healthFilter
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [healthFilter, setHealthFilter] = useState(searchParams.get('health') || '')
  const [selected, setSelected] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/products')
      setProducts(data)
      setSelected(prev => (prev ? data.find(p => p.Id === prev.Id) || null : null))
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const health = searchParams.get('health')
    if (health) setHealthFilter(health)
    fetchProducts()
  }, [searchParams, fetchProducts])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      fetchProducts()
    } catch (err) {
      console.error('Failed to delete product', err)
    }
  }

  const handleEdit = (product, e) => {
    e.stopPropagation()
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchesSearch =
      !search ||
      (p.Name && p.Name.toLowerCase().includes(q)) ||
      ((p.SKU || '').toLowerCase().includes(q)) ||
      (p.Id != null && p.Id.toString() === search)
    return matchesSearch && matchesHealthFilter(p, healthFilter)
  })

  const handleExport = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'Cost', 'Stock', 'Health Status']
    const csvData = filtered.map(p =>
      [p.Id, `"${p.Name}"`, p.SKU, p.Category, p.Price, p.Cost, p.Stock, p.HealthStatus].join(',')
    )
    const csvContent = [headers.join(','), ...csvData].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products_export.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleUpdate = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data)
      setSelected(prev => {
        if (!prev) return null
        return res.data.find(p => p.Id === prev.Id) || null
      })
    } catch (err) {
      console.error('Failed to update products', err)
    }
  }

  const setFilterAndUrl = (f) => {
    setHealthFilter(f)
    if (f) setSearchParams({ health: f })
    else setSearchParams({})
  }

  if (selected) {
    return <ProductDetail product={selected} onBack={() => setSelected(null)} onUpdate={handleUpdate} />
  }

  if (loading && products.length === 0) {
    return <div className="p-6 flex items-center justify-center h-full text-text-dim">Loading products...</div>
  }

  const stockColor = (s, reorder) => {
    if (s === 0) return 'text-danger'
    if (s < reorder) return 'text-ember'
    return 'text-bloom'
  }

  return (
    <div className="p-6 space-y-5 animate-fade-up relative">
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        onSuccess={fetchProducts}
        product={editingProduct}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Products', value: products.length, icon: Package, bg: 'rgba(99,102,241,0.1)', color: '#6366f1', filter: '' },
          { label: 'Active SKUs', value: products.filter(p => p.IsActive).length, icon: TrendingUp, bg: 'rgba(16,185,129,0.1)', color: '#10b981', filter: 'Active' },
          { label: 'Out of Stock', value: products.filter(p => p.Stock === 0).length, icon: AlertTriangle, bg: 'rgba(239,68,68,0.1)', color: '#ef4444', filter: 'Critical' },
          { label: 'Inactive / Disc.', value: products.filter(p => !p.IsActive || p.IsDiscontinued).length, icon: X, bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', filter: 'Discontinued' },
          { label: 'Inventory Value', value: `Rs ${products.reduce((s, p) => s + p.Stock * p.Cost, 0).toLocaleString()}`, icon: DollarSign, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', filter: '' },
        ].map(s => (
          <div key={s.label}
            className="card flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02]"
            onClick={() => (s.filter !== undefined && s.filter !== '') ? setFilterAndUrl(s.filter) : null}
            title={s.filter ? `Click to filter by ${s.label}` : ''}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="text-xl font-bold text-text-bright mt-0.5">{loading ? '...' : s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card !p-0 overflow-hidden relative z-10">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input className="input pl-9 w-full" placeholder="Search products or SKU or ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            className="select w-40"
            value={healthFilter}
            onChange={e => {
              const v = e.target.value
              setHealthFilter(v)
              if (v) setSearchParams({ health: v })
              else setSearchParams({})
            }}>
            <option value="">All Health</option>
            <option value="Healthy">Healthy</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
            <option value="Inactive">Inactive</option>
            <option value="Discontinued">Discontinued</option>
          </select>
          <button type="button" onClick={fetchProducts} className="btn-ghost !p-2"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>
          <button type="button" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 ml-auto"><Plus size={14} /> Add Product</button>
          <button type="button" className="btn-ghost flex items-center gap-2 text-sm" onClick={handleExport}><Download size={14} /> Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-abyss border-b border-border">
                <th className="table-header text-left">ID</th>
                <th className="table-header text-left">Product</th>
                <th className="table-header text-left">Category</th>
                <th className="table-header text-right">Price</th>
                <th className="table-header text-right">Margin</th>
                <th className="table-header text-right">Stock</th>
                <th className="table-header text-center">Health</th>
                <th className="table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-text-dim">Loading products...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-text-dim">No products found matching filters</td></tr>
              ) : filtered.map(p => (
                <tr key={p.Id} className="table-row cursor-pointer" onClick={() => setSelected(p)}>
                  <td className="table-cell font-mono text-text-dim">{p.Id}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface border border-border/50 flex-shrink-0">
                        {p.ImageUrl ? (
                          <img src={p.ImageUrl.startsWith('/') ? `http://localhost:5000${p.ImageUrl}` : p.ImageUrl} alt={p.Name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
                        ) : null}
                        <div className={`w-full h-full items-center justify-center bg-abyss ${p.ImageUrl ? 'hidden' : 'flex'}`}>
                          <Package size={14} className="text-neo" />
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-text-bright text-sm">{p.Name}</div>
                        <div className="text-xs text-text-dim font-mono">{p.SKU}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell"><span className="badge-dim">{p.Category}</span></td>
                  <td className="table-cell text-right font-medium text-text-bright">Rs {p.Price?.toLocaleString?.() ?? p.Price}</td>
                  <td className="table-cell text-right">
                    <span className={p.Margin >= 50 ? 'text-bloom font-semibold' : p.Margin >= 30 ? 'text-ember' : 'text-danger'}>
                      {p.Margin?.toFixed(1) || 0}%
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <span className={`font-mono font-bold ${stockColor(p.Stock, p.ReorderLevel)}`}>{p.Stock}</span>
                  </td>
                  <td className="table-cell text-center">
                    <HealthBadge status={!p.IsActive ? 'Inactive' : (p.IsDiscontinued ? 'Discontinued' : (p.HealthStatus || 'Warning'))} />
                  </td>
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                      <button type="button" onClick={(e) => handleEdit(p, e)} className="btn-ghost !p-1.5 text-neo"><Edit2 size={14} /></button>
                      <button type="button" onClick={(e) => handleDelete(p.Id, e)} className="btn-ghost !p-1.5 text-danger"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border">
          <span className="text-xs text-text-dim">Showing {filtered.length} of {products.length} products</span>
        </div>
      </div>
    </div>
  )
}
