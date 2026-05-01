import { useState } from 'react'
import { ArrowLeft, Package, StopCircle, PlusCircle, MinusCircle, TrendingUp, TrendingDown, Tag, Bell, Star, Copy, Trash2, DollarSign } from 'lucide-react'
import { HealthBadge } from '../../components/ui/StatusBadge'
import { SalesAreaChart } from '../../components/charts/MiniChart'
import { generateSalesData } from '../../utils/api'

export default function ProductDetail({ product, onBack }) {
  const [activeAction, setActiveAction] = useState(null)
  const [qty, setQty] = useState(0)
  const [newPrice, setNewPrice] = useState(product.Price)
  const salesData = generateSalesData(30)

  const actions = [
    { id: 'StopSelling', icon: StopCircle, label: 'Stop Selling', color: 'danger' },
    { id: 'IncreaseInventory', icon: PlusCircle, label: 'Increase Stock', color: 'bloom' },
    { id: 'DecreaseInventory', icon: MinusCircle, label: 'Decrease Stock', color: 'ember' },
    { id: 'IncreasePrice', icon: TrendingUp, label: 'Increase Price', color: 'bloom' },
    { id: 'DecreasePrice', icon: TrendingDown, label: 'Decrease Price', color: 'danger' },
    { id: 'ApplyDiscount', icon: Tag, label: 'Apply Discount', color: 'royal' },
    { id: 'SetReorderAlert', icon: Bell, label: 'Set Reorder Alert', color: 'pulse' },
    { id: 'MarkForReview', icon: Star, label: 'Mark for Review', color: 'ember' },
    { id: 'Duplicate', icon: Copy, label: 'Duplicate', color: 'neo' },
    { id: 'Delete', icon: Trash2, label: 'Delete', color: 'danger' },
  ]

  const colorMap = {
    neo: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', text: '#818cf8' },
    bloom: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: '#34d399' },
    danger: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', text: '#f87171' },
    ember: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#fbbf24' },
    royal: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', text: '#a78bfa' },
    pulse: { bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)', text: '#22d3ee' },
  }

  const margin = ((product.Price - product.Cost) / product.Price * 100).toFixed(1)
  const profit = (product.Price - product.Cost).toFixed(2)

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="btn-ghost flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <Package size={18} className="text-neo-bright" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-white">{product.Name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-dim font-mono">{product.SKU}</span>
                <span className="text-text-dim">·</span>
                <span className="badge-dim text-xs">{product.Category}</span>
                <HealthBadge status={product.HealthStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Metrics + Actions */}
        <div className="space-y-4">
          {/* Financial Metrics */}
          <div className="card">
            <div className="section-title mb-4 flex items-center gap-2">
              <DollarSign size={15} className="text-neo" /> Financial Metrics
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Price', value: `$${product.Price}`, color: '#f8fafc' },
                { label: 'Cost', value: `$${product.Cost}`, color: '#9ca3af' },
                { label: 'Margin', value: `${margin}%`, color: '#34d399' },
                { label: 'Profit/Unit', value: `$${profit}`, color: '#818cf8' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="stat-label">{m.label}</div>
                  <div className="text-lg font-bold mt-0.5" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory */}
          <div className="card">
            <div className="section-title mb-4 flex items-center gap-2">
              <Package size={15} className="text-pulse" /> Inventory
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-dim">Current Stock</span>
                <span className={`text-lg font-bold font-mono ${product.Stock === 0 ? 'text-danger' : product.Stock < product.ReorderLevel ? 'text-ember' : 'text-bloom'}`}>
                  {product.Stock}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${Math.min(100, (product.Stock / (product.ReorderLevel * 3)) * 100)}%`,
                  background: product.Stock === 0 ? '#ef4444' : product.Stock < product.ReorderLevel ? '#f59e0b' : '#10b981'
                }} />
              </div>
              <div className="flex justify-between text-xs text-text-dim">
                <span>Reorder level: {product.ReorderLevel}</span>
                <span className={product.Stock < product.ReorderLevel ? 'text-ember font-medium' : 'text-text-dim'}>
                  {product.Stock < product.ReorderLevel ? '⚠️ Restock needed' : '✓ OK'}
                </span>
              </div>
            </div>
          </div>

          {/* Health Score */}
          <div className="card">
            <div className="section-title mb-4">Health Score</div>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={product.HealthScore >= 80 ? '#10b981' : product.HealthScore >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="2.5" strokeDasharray={`${product.HealthScore} 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-text-white" style={{ fontFamily: 'Bebas Neue' }}>{product.HealthScore}</span>
                </div>
              </div>
              <div>
                <HealthBadge status={product.HealthStatus} />
                <p className="text-xs text-text-dim mt-2 leading-relaxed">
                  {product.HealthScore >= 80 ? 'Product is performing well across all metrics.' : product.HealthScore >= 50 ? 'Some issues detected. Review recommended.' : 'Critical issues require immediate attention.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Chart */}
        <div className="space-y-4">
          <div className="card">
            <div className="section-title mb-1">Sales Trend</div>
            <div className="section-subtitle mb-4">Last 30 days</div>
            <div className="h-52">
              <SalesAreaChart data={salesData} color="#6366f1" dataKey="orders" prefix="" />
            </div>
          </div>
          <div className="card">
            <div className="section-title mb-4">Performance Metrics</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Units Sold (30d)', value: salesData.reduce((s,d)=>s+d.orders,0), color: '#818cf8' },
                { label: 'Revenue (30d)', value: `$${salesData.reduce((s,d)=>s+d.revenue,0).toLocaleString()}`, color: '#34d399' },
                { label: 'Return Rate', value: '8.2%', color: '#fbbf24' },
                { label: 'Rating', value: '4.6 ⭐', color: '#f97316' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="stat-label">{m.label}</div>
                  <div className="text-base font-bold mt-0.5" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="card">
          <div className="section-title mb-4">Product Actions</div>
          <div className="space-y-2">
            {actions.map(action => {
              const c = colorMap[action.color]
              const isActive = activeAction === action.id
              return (
                <div key={action.id}>
                  <button onClick={() => setActiveAction(isActive ? null : action.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                    style={{
                      background: isActive ? c.bg : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? c.border : 'rgba(255,255,255,0.05)'}`,
                    }}>
                    <action.icon size={15} style={{ color: c.text }} />
                    <span className="text-sm font-medium" style={{ color: isActive ? c.text : '#9ca3af' }}>{action.label}</span>
                  </button>
                  {isActive && (
                    <div className="mt-1 p-3 rounded-lg space-y-2" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                      {(action.id === 'IncreaseInventory' || action.id === 'DecreaseInventory') && (
                        <div>
                          <label className="stat-label">Quantity</label>
                          <input type="number" className="input mt-1" value={qty} onChange={e => setQty(e.target.value)} min={0} />
                        </div>
                      )}
                      {(action.id === 'IncreasePrice' || action.id === 'DecreasePrice') && (
                        <div>
                          <label className="stat-label">New Price ($)</label>
                          <input type="number" className="input mt-1" value={newPrice} onChange={e => setNewPrice(e.target.value)} step="0.01" />
                        </div>
                      )}
                      <button className="btn-primary w-full text-xs" style={{ background: `linear-gradient(135deg, ${c.text}66, ${c.text}44)`, border: `1px solid ${c.border}` }}>
                        Confirm {action.label}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
