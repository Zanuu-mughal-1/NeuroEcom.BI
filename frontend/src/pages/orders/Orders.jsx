import { useState, useEffect, useCallback } from 'react'
import { Search, Download, ShoppingCart, DollarSign, Clock, CheckCircle, RefreshCw, XCircle, Truck, PackageCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { OrderStatusBadge, RTORiskBadge } from '../../components/ui/StatusBadge'
import api from '../../utils/api'

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [selected, setSelected] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/orders')
      setOrders(data)
    } catch (err) {
      console.error('Failed to fetch orders', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    const status = searchParams.get('status')
    if (status) setStatusFilter(status)
  }, [searchParams])

  const handleAction = async (id, action) => {
    setActionLoading(id)
    try {
      await api.post(`/orders/${id}/action`, { Action: action, Notes: `System update: ${action}` })
      fetchOrders()
      if (selected?.Id === id) {
        const { data } = await api.get(`/orders/${id}`)
        setSelected(data.order)
      }
    } catch (err) {
      console.error(`Failed to ${action} order`, err)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = orders.filter(o =>
    (!search || o.OrderNumber.includes(search) || `${o.Customer?.FirstName} ${o.Customer?.LastName}`.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || o.FulfillmentStatus === statusFilter)
  )

  const totalRevenue = orders.reduce((s, o) => s + (o.TotalAmount || 0), 0)
  const avgValue = orders.length ? totalRevenue / orders.length : 0

  const handleExport = () => {
    const headers = ['Order #', 'Customer', 'Amount', 'Payment', 'Status', 'Risk Score', 'Date']
    const csvData = filtered.map(o =>
      [o.OrderNumber, `"${o.Customer?.FirstName} ${o.Customer?.LastName}"`, o.TotalAmount, o.PaymentMethod, o.FulfillmentStatus, o.RTORiskScore, o.OrderDate].join(',')
    )
    const csvContent = [headers.join(','), ...csvData].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders_export.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: ShoppingCart, bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' },
          { label: 'Total Revenue', value: `Rs ${totalRevenue.toLocaleString()}`, icon: DollarSign, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
          { label: 'Avg Order Value', value: `Rs ${avgValue.toFixed(0)}`, icon: Clock, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
          { label: 'Pending', value: orders.filter(o => o.FulfillmentStatus === 'Pending').length, icon: CheckCircle, bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
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

      {/* Orders Table Card */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input className="input pl-9 w-full" placeholder="Order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select 
            className="select w-40" 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setSearchParams(e.target.value ? { status: e.target.value } : {}) }}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button onClick={fetchOrders} className="btn-ghost !p-2 ml-auto hover:bg-surface"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>
          <button onClick={handleExport} className="btn-ghost flex items-center gap-2 text-sm"><Download size={14} /> Export</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-abyss border-b border-border">
                <th className="table-header text-left">Order</th>
                <th className="table-header text-left">Customer</th>
                <th className="table-header text-right">Amount</th>
                <th className="table-header text-center">Payment</th>
                <th className="table-header text-center">Status</th>
                <th className="table-header text-center">Risk Score</th>
                <th className="table-header text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr><td colSpan="7" className="py-10 text-center text-text-dim">Loading orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="py-10 text-center text-text-dim">No orders found matching filters</td></tr>
              ) : filtered.map(o => (
                <tr key={o.Id} className="table-row cursor-pointer" onClick={() => setSelected(o === selected ? null : o)}>
                  <td className="table-cell">
                    <span className="font-mono text-neo-bright text-sm font-semibold">{o.OrderNumber}</span>
                  </td>
                  <td className="table-cell">
                    <div className="font-medium text-text-bright text-sm">{o.Customer?.FirstName} {o.Customer?.LastName}</div>
                    <div className="text-xs text-text-dim">{o.Customer?.Email}</div>
                  </td>
                  <td className="table-cell text-right">
                    <span className="font-bold text-text-bright">Rs {o.TotalAmount?.toLocaleString()}</span>
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

        {/* Order Detail Panel */}
        {selected && (
          <div className="border-t border-border p-5 animate-fade-in bg-neo/5">
            <div className="flex items-center justify-between mb-4">
              <div className="section-title">Order Details — {selected.OrderNumber}</div>
              <button onClick={() => setSelected(null)} className="btn-ghost text-xs">Close</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Status', value: selected.FulfillmentStatus },
                { label: 'Payment', value: selected.PaymentMethod },
                { label: 'Amount', value: `Rs ${selected.TotalAmount?.toLocaleString()}` },
                { label: 'RTO Decision', value: selected.RTODecision || '—' },
              ].map(m => (
                <div key={m.label}>
                  <div className="stat-label">{m.label}</div>
                  <div className="text-sm font-semibold text-text-bright mt-0.5">{m.value}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {selected.FulfillmentStatus === 'Pending' && (
                <button onClick={() => handleAction(selected.Id, 'Confirm')} disabled={actionLoading === selected.Id} className="btn-primary flex items-center gap-2 text-xs">
                  <CheckCircle size={14} /> Confirm Order
                </button>
              )}
              {selected.FulfillmentStatus === 'Confirmed' && (
                <button onClick={() => handleAction(selected.Id, 'Ship')} disabled={actionLoading === selected.Id} className="btn-success flex items-center gap-2 text-xs">
                  <Truck size={14} /> Ship Order
                </button>
              )}
              {selected.FulfillmentStatus === 'Shipped' && (
                <button onClick={() => handleAction(selected.Id, 'Deliver')} disabled={actionLoading === selected.Id} className="btn-bloom flex items-center gap-2 text-xs">
                  <PackageCheck size={14} /> Mark Delivered
                </button>
              )}
              {['Pending', 'Confirmed'].includes(selected.FulfillmentStatus) && (
                <button onClick={() => handleAction(selected.Id, 'Cancel')} disabled={actionLoading === selected.Id} className="btn-ghost text-danger flex items-center gap-2 text-xs border border-danger/20 hover:bg-danger/5">
                  <XCircle size={14} /> Cancel Order
                </button>
              )}
              <button className="btn-ghost text-xs border border-border px-4 py-1.5 rounded-lg hover:bg-surface transition-colors">Print Invoice</button>
            </div>
          </div>
        )}
        <div className="px-4 py-3 border-t border-border bg-void/30">
          <span className="text-xs text-text-dim">Showing {filtered.length} of {orders.length} orders</span>
        </div>
      </div>
    </div>
  )
}