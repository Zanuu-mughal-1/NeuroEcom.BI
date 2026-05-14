import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Download, Package, AlertTriangle, TrendingUp, DollarSign, X, RefreshCw, Trash2, Edit2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { HealthBadge } from '../../components/ui/StatusBadge'
import api from '../../utils/api'
import ProductDetail from './ProductDetail'
import ProductModal from '../../components/modals/ProductModal'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [healthFilter, setHealthFilter] = useState(searchParams.get('health') || '')
  const [selected, setSelected] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [newProduct, setNewProduct] = useState({
    Name: '', SKU: '', Category: 'Electronics', Price: 0, Cost: 0, Stock: 0, ReorderLevel: 10
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/products')
      setProducts(data)
      // Update selected product if in detail view
      setSelected(prev => prev ? (data.find(p => p.Id === prev.Id) || null) : null)
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

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/products', {
        ...newProduct,
        Price: parseFloat(newProduct.Price),
        Cost: parseFloat(newProduct.Cost),
        Stock: parseInt(newProduct.Stock),
        ReorderLevel: parseInt(newProduct.ReorderLevel),
        IsActive: true,
        IsDiscontinued: false
      })
      setIsAddModalOpen(false)
      setNewProduct({ Name: '', SKU: '', Category: 'Electronics', Price: 0, Cost: 0, Stock: 0, ReorderLevel: 10 })
      fetchProducts()
    } catch (err) {
      console.error('Failed to add product', err)
      alert('Failed to add product.')
    }
  }

  const filtered = products.filter(p =>
    (!search || p.Name.toLowerCase().includes(search.toLowerCase()) || p.SKU.includes(search) || p.Id.toString() === search) &&
    (!healthFilter ||
      (healthFilter === 'Active' ? p.IsActive :
        healthFilter === 'Discontinued' ? (!p.IsActive || p.IsDiscontinued) :
          (p.HealthStatus === healthFilter))
    )
  )

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

  const stockColor = (s, reorder) => {
    if (s === 0) return 'text-danger'
    if (s < reorder) return 'text-ember'
    return 'text-bloom'
  }

  if (selected) return <ProductDetail product={selected} onBack={() => setSelected(null)} onUpdate={fetchProducts} />

  if (loading && products.length === 0) {
    return <div className="p-6 flex items-center justify-center h-full text-text-dim">Loading inventory intelligence...</div>
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
            onClick={() => s.filter !== undefined ? setHealthFilter(s.filter) : null}>
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
            <input className="input pl-9 w-full" placeholder="Search products or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            className="select w-40"
            value={healthFilter}
            onChange={e => { setHealthFilter(e.target.value); setSearchParams({ health: e.target.value }) }}>
            <option value="">All Health</option>
            <option value="Healthy">🟢 Healthy</option>
            <option value="Warning">🟡 Warning</option>
            <option value="Critical">🔴 Critical</option>
            <option value="Inactive">⚪ Inactive</option>
            <option value="Discontinued">⚫ Discontinued</option>
          </select>
          <button onClick={fetchProducts} className="btn-ghost !p-2"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>
          <button className="btn-ghost flex items-center gap-2 text-sm" onClick={handleExport}><Download size={14} /> Export</button>
          <button className="btn-primary flex items-center gap-2 ml-auto" onClick={() => setIsAddModalOpen(true)}><Plus size={14} /> Add Product</button>
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
                <tr><td colSpan="8" className="py-10 text-center text-text-dim">Loading products...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="py-10 text-center text-text-dim">No products found matching filters</td></tr>
              ) : filtered.map(p => (
                <tr key={p.Id} className="table-row cursor-pointer" onClick={() => setSelected(p)}>
                  <td className="table-cell font-mono text-text-dim">{p.Id}</td>
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
                  <td className="table-cell text-right font-medium text-text-bright">Rs {p.Price?.toLocaleString()}</td>
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

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-lg relative animate-fade-up">
            <button
              className="absolute top-4 right-4 text-text-dim hover:text-text-white transition-colors"
              onClick={() => setIsAddModalOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="section-title mb-6">Add New Product</div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-text-dim mb-1">Product Name</label>
                  <input required className="input w-full" value={newProduct.Name} onChange={e => setNewProduct({ ...newProduct, Name: e.target.value })} placeholder="e.g. Wireless Gaming Mouse" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-dim mb-1">SKU</label>
                  <input required className="input w-full" value={newProduct.SKU} onChange={e => setNewProduct({ ...newProduct, SKU: e.target.value })} placeholder="e.g. WM-001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-dim mb-1">Category</label>
                  <select required className="select w-full" value={newProduct.Category} onChange={e => setNewProduct({ ...newProduct, Category: e.target.value })}>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Storage">Storage</option>
                    <option value="Audio">Audio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-dim mb-1">Price (Rs)</label>
                  <input required type="number" step="0.01" min="0" className="input w-full" value={newProduct.Price} onChange={e => setNewProduct({ ...newProduct, Price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-dim mb-1">Cost (Rs)</label>
                  <input required type="number" step="0.01" min="0" className="input w-full" value={newProduct.Cost} onChange={e => setNewProduct({ ...newProduct, Cost: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-dim mb-1">Initial Stock</label>
                  <input required type="number" min="0" className="input w-full" value={newProduct.Stock} onChange={e => setNewProduct({ ...newProduct, Stock: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-dim mb-1">Reorder Level</label>
                  <input required type="number" min="0" className="input w-full" value={newProduct.ReorderLevel} onChange={e => setNewProduct({ ...newProduct, ReorderLevel: e.target.value })} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" className="btn-ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
