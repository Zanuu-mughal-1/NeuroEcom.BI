import { useState } from 'react'
import { Search, Download, ShoppingCart, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { OrderStatusBadge, RTORiskBadge } from '../../components/ui/StatusBadge'
import { mockOrders } from '../../utils/api'

export default function Orders() {
  const [orders] = useState(mockOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = orders.filter(o =>
    (!search || o.OrderNumber.includes(search) || `${o.Customer?.FirstName} ${o.Customer?.LastName}`.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || o.FulfillmentStatus === statusFilter)
  )

  const totalRevenue = orders.reduce((s, o) => s + o.TotalAmount, 0)
  const avgValue = orders.length ? totalRevenue / orders.length : 0

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: ShoppingCart, bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
          { label: 'Avg Order Value', value: `$${avgValue.toFixed(2)}`, icon: Clock, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
          { label: 'Pending', value: orders.filter(o => o.FulfillmentStatus === 'Pending').length, icon: CheckCircle, bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
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
            <input className="input pl-9" placeholder="Order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-36" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="btn-ghost flex items-center gap-2 text-sm ml-auto"><Download size={14} /> Export</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="table-header text-left">Order</th>
                <th className="table-header text-left">Customer</th>
                <th className="table-header text-right">Amount</th>
                <th className="table-header text-center">Payment</th>
                <th className="table-header text-center">Status</th>
                <th className="table-header text-center">RTO Risk</th>
                <th className="table-header text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.Id} className="table-row cursor-pointer" onClick={() => setSelected(o)}>
                  <td className="table-cell">
                    <span className="font-mono text-neo-bright text-sm font-semibold">{o.OrderNumber}</span>
                  </td>
                  <td className="table-cell">
                    <div className="font-medium text-text-bright text-sm">{o.Customer?.FirstName} {o.Customer?.LastName}</div>
                    <div className="text-xs text-text-dim">{o.Customer?.Email}</div>
                  </td>
                  <td className="table-cell text-right">
                    <span className="font-bold text-text-white">${o.TotalAmount.toLocaleString()}</span>
                  </td>
                  <td className="table-cell text-center">
                    <span className={`badge ${o.PaymentMethod === 'COD' ? 'badge-ember' : o.PaymentMethod === 'UPI' ? 'badge-pulse' : 'badge-neo'}`}>
                      {o.PaymentMethod}
                    </span>
                  </td>
                  <td className="table-cell text-center"><OrderStatusBadge status={o.FulfillmentStatus} /></td>
                  <td className="table-cell text-center"><RTORiskBadge score={o.RTORiskScore} /></td>
                  <td className="table-cell text-right text-xs text-text-dim">
                    {new Date(o.OrderDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="border-t border-border/50 p-5" style={{ background: 'rgba(99,102,241,0.04)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="section-title">Order Details — {selected.OrderNumber}</div>
              <button onClick={() => setSelected(null)} className="btn-ghost text-xs">Close</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Status', value: selected.FulfillmentStatus },
                { label: 'Payment', value: selected.PaymentMethod },
                { label: 'Amount', value: `$${selected.TotalAmount}` },
                { label: 'RTO Decision', value: selected.RTODecision || '—' },
              ].map(m => (
                <div key={m.label}>
                  <div className="stat-label">{m.label}</div>
                  <div className="text-sm font-semibold text-text-bright mt-0.5">{m.value}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Confirm', 'Ship', 'Deliver', 'Cancel'].map(a => (
                <button key={a} className="btn-ghost text-xs">{a} Order</button>
              ))}
              <button className="btn-primary text-xs">Print Invoice</button>
            </div>
          </div>
        )}
        <div className="px-4 py-3 border-t border-border/50">
          <span className="text-xs text-text-dim">Showing {filtered.length} of {orders.length} orders</span>
        </div>
      </div>
    </div>
  )
}
