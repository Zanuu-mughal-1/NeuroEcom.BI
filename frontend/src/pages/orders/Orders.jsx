import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Download, ShoppingCart, DollarSign, Clock, CheckCircle, XCircle, Truck, Package, FileText, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { OrderStatusBadge, RTORiskBadge } from '../../components/ui/StatusBadge'
import { orderApi, mockOrders } from '../../utils/api'
import { useData } from '../../context/DataContext'

export default function Orders() {
  const { isOnline } = useData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [selected, setSelected] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [trackingNo, setTrackingNo] = useState('')
  const [actionMsg, setActionMsg] = useState(null) // { type: 'success'|'error', text }
  const dropdownRef = useRef(null)
  const msgTimer = useRef(null)

  const statusOptions = ['', 'Pending', 'Shipped', 'Delivered', 'Cancelled']
  const statusLabels = { '': 'All Status', Pending: 'Pending', Shipped: 'Shipped', Delivered: 'Delivered', Cancelled: 'Cancelled' }

  // Sync statusFilter when URL searchParams change
  useEffect(() => {
    const status = searchParams.get('status') || ''
    if (status !== statusFilter) {
      setStatusFilter(status)
    }
  }, [searchParams])

  // Update URL when statusFilter changes
  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus)
    if (newStatus) {
      setSearchParams({ status: newStatus })
    } else {
      setSearchParams({})
    }
    setDropdownOpen(false)
  }

  // ── Fetch orders from backend on mount and on filter/connection change ──
  useEffect(() => { fetchOrders() }, [statusFilter, isOnline])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await orderApi.getAll({ status: statusFilter || undefined })
      if (res.data && Array.isArray(res.data)) {
        setOrders(res.data)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error("Fetch orders failed:", err)
      const detail = err.response?.data?.details || err.message
      showMsg('error', `Database connection failed: ${detail}`)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Auto-clear action message after 3 s ──
  const showMsg = (type, text) => {
    setActionMsg({ type, text })
    clearTimeout(msgTimer.current)
    msgTimer.current = setTimeout(() => setActionMsg(null), 3000)
  }

  const filtered = orders.filter(o =>
    (!search || o.OrderNumber?.includes(search) ||
      `${o.Customer?.FirstName} ${o.Customer?.LastName}`.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || o.FulfillmentStatus === statusFilter)
  )

  const handleExport = () => {
    const csv = [
      ['Order', 'Customer', 'Email', 'Amount', 'Payment', 'Status', 'RTO Risk', 'Date'],
      ...filtered.map(o => [
        o.OrderNumber,
        `${o.Customer?.FirstName} ${o.Customer?.LastName}`,
        o.Customer?.Email,
        o.TotalAmount,
        o.PaymentMethod,
        o.FulfillmentStatus,
        o.RTORiskScore,
        new Date(o.OrderDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'orders.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Core action: calls POST /api/orders/{id}/action → persists to SQL ──
  const takeAction = async (action) => {
    if (!selected) return

    if (!isOnline) {
      showMsg('error', 'Not connected to database. Start the backend and try again.')
      return
    }

    setActionLoading(true)
    try {
      await orderApi.takeAction(selected.Id, {
        action,
        notes: `${action} applied by admin`,
        trackingNumber: action === 'Ship' && trackingNo ? trackingNo : undefined
      })
      showMsg('success', `Order ${action}ed successfully and saved to database.`)
      setTrackingNo('')
      setSelected(null)
      await fetchOrders()   // Refresh list from SQL
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Unknown error'
      showMsg('error', `Failed to ${action} order: ${msg}`)
    } finally {
      setActionLoading(false)
    }
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.TotalAmount || 0), 0)
  const avgValue = orders.length ? totalRevenue / orders.length : 0

  return (
    <div className="p-6 space-y-5 animate-fade-up">

      {/* Connection Status Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isOnline
            ? <><Wifi size={13} className="text-bloom" /><span className="text-xs font-semibold text-bloom">Connected to Live Database</span></>
            : <><WifiOff size={13} className="text-danger" /><span className="text-xs font-semibold text-danger">Database Offline</span></>
          }
          {loading && <RefreshCw size={12} className="animate-spin text-neo ml-2" />}
        </div>
        {actionMsg && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold animate-fade-in ${actionMsg.type === 'success' ? 'bg-bloom/10 text-bloom border border-bloom/20' : 'bg-danger/10 text-danger border border-danger/20'
            }`}>
            {actionMsg.type === 'success' ? <CheckCircle size={10} /> : <XCircle size={10} />}
            {actionMsg.text}
          </div>
        )}
        <button onClick={fetchOrders} disabled={loading}
          className="btn-ghost text-xs flex items-center gap-1.5 border border-border/40 px-3 py-1.5 rounded-lg">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: ShoppingCart, bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' },
          { label: 'Total Revenue', value: `Rs ${totalRevenue.toLocaleString()}`, icon: DollarSign, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
          { label: 'Avg Order Value', value: `Rs ${avgValue.toFixed(2)}`, icon: Clock, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
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

      {/* Orders Table Card */}
      <div className="card !p-0 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              className="input pl-9"
              placeholder="Order ID or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button className="input w-36 flex items-center justify-between gap-2" onClick={() => setDropdownOpen(o => !o)}>
              <span>{statusLabels[statusFilter]}</span>
              <svg width="12" height="12" viewBox="0 0 12 12"
                style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                fill="currentColor">
                <path d="M6 8L1 3h10L6 8z" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-lg overflow-hidden"
                style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                {statusOptions.map(opt => (
                  <div key={opt} className="px-3 py-2 text-sm cursor-pointer"
                    style={{ color: statusFilter === opt ? '#06b6d4' : '#e2e8f0', background: statusFilter === opt ? 'rgba(6,182,212,0.1)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = statusFilter === opt ? 'rgba(6,182,212,0.1)' : 'transparent'}
                    onClick={() => handleStatusChange(opt)}>
                    {statusLabels[opt]}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn-ghost flex items-center gap-2 text-sm ml-auto" onClick={handleExport}>
            <Download size={14} /> Export
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-abyss border-b border-border">
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="table-cell text-center text-text-dim py-10 opacity-50">
                    {loading ? 'Loading orders...' : 'No orders found.'}
                  </td>
                </tr>
              )}
              {filtered.map(o => (
                <tr key={o.Id}
                  className={`table-row cursor-pointer transition-colors ${selected?.Id === o.Id ? 'bg-neo/5' : 'hover:bg-white/[0.02]'}`}
                  onClick={() => setSelected(o.Id === selected?.Id ? null : o)}>
                  <td className="table-cell">
                    <span className="font-mono text-neo-bright text-sm font-semibold">{o.OrderNumber}</span>
                  </td>
                  <td className="table-cell">
                    <div className="font-medium text-text-bright text-sm">{o.Customer?.FirstName} {o.Customer?.LastName}</div>
                    <div className="text-xs text-text-dim">{o.Customer?.Email}</div>
                  </td>
                  <td className="table-cell text-right">
                    <span className="font-bold text-text-white">${(o.TotalAmount || 0).toLocaleString()}</span>
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

        {/* Order Detail / Action Panel */}
        {selected && (
          <div className="border-t border-border/50 p-5 bg-neo/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="section-title">Order Details — {selected.OrderNumber}</div>
                {!isOnline && (
                  <div className="text-[10px] text-ember font-bold mt-0.5">⚠️ Backend offline — actions will not persist</div>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost text-xs">Close</button>
            </div>

            {/* Detail Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Status', value: selected.FulfillmentStatus, color: '#e2e8f0' },
                { label: 'Payment', value: selected.PaymentMethod, color: '#e2e8f0' },
                { label: 'Amount', value: `$${selected.TotalAmount}`, color: '#10b981' },
                { label: 'Risk Decision', value: selected.RTODecision || 'Standard Flow', color: selected.RTORiskScore > 50 ? '#ef4444' : '#10b981' },
              ].map(m => (
                <div key={m.label}>
                  <div className="stat-label text-[10px] uppercase font-black opacity-50 tracking-widest">{m.label}</div>
                  <div className="text-sm font-bold mt-1" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Actions + Tracking */}
            <div className="flex flex-col lg:flex-row gap-5 items-end border-t border-white/5 pt-5">
              <div className="flex-1 space-y-2 w-full lg:w-auto">
                <label className="text-[10px] uppercase font-black text-text-dim tracking-widest">
                  Administrative Actions {!isOnline && <span className="text-ember">(requires live backend)</span>}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { action: 'Confirm', icon: CheckCircle, hoverClass: 'hover:bg-bloom/10 hover:text-bloom hover:border-bloom/50' },
                    { action: 'Ship', icon: Truck, hoverClass: 'hover:bg-neo/10 hover:text-neo-bright hover:border-neo/50' },
                    { action: 'Deliver', icon: Package, hoverClass: 'hover:bg-bloom/10 hover:text-bloom hover:border-bloom/50' },
                    { action: 'Cancel', icon: XCircle, hoverClass: 'hover:bg-danger/10 hover:text-danger hover:border-danger/50' },
                  ].map(({ action, icon: Icon, hoverClass }) => (
                    <button key={action}
                      disabled={actionLoading}
                      onClick={() => takeAction(action)}
                      className={`btn-ghost text-[10px] font-bold uppercase tracking-widest border border-border/50 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 ${hoverClass}`}>
                      <Icon size={14} /> {action}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-72 space-y-2">
                <label className="text-[10px] uppercase font-black text-text-dim tracking-widest">
                  Tracking Number <span className="opacity-50 normal-case font-normal">(used with Ship)</span>
                </label>
                <div className="flex gap-2">
                  <input className="input !py-2.5 text-xs font-mono flex-1"
                    placeholder="Enter tracking ID..."
                    value={trackingNo}
                    onChange={e => setTrackingNo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && takeAction('Ship')}
                  />
                  <button
                    onClick={() => takeAction('Ship')}
                    disabled={actionLoading || !trackingNo}
                    className="btn-primary p-2.5 rounded-xl flex items-center justify-center disabled:opacity-40"
                    title="Ship with this tracking number">
                    <FileText size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading indicator */}
            {actionLoading && (
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-neo-bright animate-pulse">
                <RefreshCw size={12} className="animate-spin" /> Saving to database...
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/50 bg-black/20 flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim">
            {filtered.length} of {orders.length} orders
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${p === 1 ? 'bg-neo/20 text-neo-bright border border-neo/30' : 'text-text-dim hover:text-text-mid'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
