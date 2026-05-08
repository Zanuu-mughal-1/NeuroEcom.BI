import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Plus, Download, Package, AlertTriangle, TrendingUp, DollarSign, RefreshCw, Trash2, Edit2 } from 'lucide-react'
import { HealthBadge } from '../../components/ui/StatusBadge'
import api from '../../utils/api'
import ProductDetail from './ProductDetail'
import ProductModal from '../../components/modals/ProductModal'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [healthFilter, setHealthFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/products')
      setProducts(data)
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

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

  const filtered = products.filter(p =>
    (!search || p.Name.toLowerCase().includes(search.toLowerCase()) || p.SKU.includes(search)) &&
    (!healthFilter || p.HealthStatus === healthFilter)
  )

  if (selected) return <ProductDetail product={selected} onBack={() => setSelected(null)} />

  const stockColor = (s, reorder) => {
    if (s === 0) return 'text-danger'
    if (s < reorder) return 'text-ember'
    return 'text-bloom'
  }

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} 
        onSuccess={fetchProducts} 
        product={editingProduct}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length, icon: Package, bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
          { label: 'Active SKUs', value: products.filter(p => p.IsActive).length, icon: TrendingUp, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
          { label: 'Out of Stock', value: products.filter(p => p.Stock === 0).length, icon: AlertTriangle, bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
          { label: 'Inventory Value', value: `$${products.reduce((s, p) => s + p.Stock * p.Cost, 0).toLocaleString()}`, icon: DollarSign, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="text-xl font-bold text-text-white mt-0.5">{loading ? '...' : s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input className="input pl-9" placeholder="Search products or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-36" value={healthFilter} onChange={e => setHealthFilter(e.target.value)}>
            <option value="">All Health</option>
            <option value="Healthy">🟢 Healthy</option>
            <option value="Warning">🟡 Warning</option>
            <option value="Critical">🔴 Critical</option>
          </select>
          <button onClick={fetchProducts} className="btn-ghost !p-2"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 ml-auto"><Plus size={14} /> Add Product</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
                <tr><td colSpan="7" className="py-10 text-center text-text-dim">Loading products...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="py-10 text-center text-text-dim">No products found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.Id} className="table-row cursor-pointer" onClick={() => setSelected(p)}>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <Package size={14} className="text-neo" />
                      </div>
                      <div>
                        <div className="font-semibold text-text-bright text-sm">{p.Name}</div>
                        <div className="text-xs text-text-dim font-mono">{p.SKU}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell"><span className="badge-dim">{p.Category}</span></td>
                  <td className="table-cell text-right font-medium text-text-white">${p.Price}</td>
                  <td className="table-cell text-right">
                    <span className={p.Margin >= 50 ? 'text-bloom font-semibold' : p.Margin >= 30 ? 'text-ember' : 'text-danger'}>
                      {p.Margin?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <span className={`font-mono font-bold ${stockColor(p.Stock, p.ReorderLevel)}`}>{p.Stock}</span>
                  </td>
                  <td className="table-cell text-center"><HealthBadge status={p.HealthStatus} /></td>
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={(e) => handleEdit(p, e)} className="btn-ghost !p-1.5 text-neo"><Edit2 size={14} /></button>
                      <button onClick={(e) => handleDelete(p.Id, e)} className="btn-ghost !p-1.5 text-danger"><Trash2 size={14} /></button>
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
