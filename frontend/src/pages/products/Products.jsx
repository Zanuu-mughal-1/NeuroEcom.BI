import { useState } from 'react'
import { Search, Filter, Plus, Download, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'
import { HealthBadge } from '../../components/ui/StatusBadge'
import { mockProducts } from '../../utils/api'
import ProductDetail from './ProductDetail'

export default function Products() {
  const [products] = useState(mockProducts)
  const [search, setSearch] = useState('')
  const [healthFilter, setHealthFilter] = useState('')
  const [selected, setSelected] = useState(null)

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
              <div className="text-xl font-bold text-text-white mt-0.5">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
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
          <button className="btn-ghost flex items-center gap-2 text-sm"><Filter size={14} /> Filter</button>
          <button className="btn-ghost flex items-center gap-2 text-sm"><Download size={14} /> Export</button>
          <button className="btn-primary flex items-center gap-2 ml-auto"><Plus size={14} /> Add Product</button>
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
                <th className="table-header text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
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
                      {p.Margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <span className={`font-mono font-bold ${stockColor(p.Stock, p.ReorderLevel)}`}>{p.Stock}</span>
                  </td>
                  <td className="table-cell text-center"><HealthBadge status={p.HealthStatus} /></td>
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${p.HealthScore}%`, background: p.HealthScore >= 80 ? '#10b981' : p.HealthScore >= 50 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <span className="text-xs font-mono text-text-dim">{p.HealthScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border/50">
          <span className="text-xs text-text-dim">Showing {filtered.length} of {products.length} products</span>
        </div>
      </div>
    </div>
  )
}
