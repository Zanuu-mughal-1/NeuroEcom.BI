import { useState, useRef, useEffect } from 'react'
import { Search, Plus, Download, Users, UserCheck, TrendingUp, Flag, Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { LoyaltyBadge, FlagBadge } from '../../components/ui/StatusBadge'
import { customerApi, mockCustomers } from '../../utils/api'
import CustomerDetail from './CustomerDetail'
import { useData } from '../../context/DataContext'

export default function Customers() {
  const { isOnline } = useData()
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState(null)
  const [tierDropdownOpen, setTierDropdownOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    FirstName: '', LastName: '', Email: '', City: '', LoyaltyTier: 'New'
  })

  const tierDropdownRef = useRef(null)
  const msgTimer = useRef(null)
  const tierOptions = ['', 'VIP', 'Gold', 'Silver', 'Bronze', 'New']
  const tierLabels = { '': 'All Tiers', VIP: '💎 VIP', Gold: '⭐ Gold', Silver: '🥈 Silver', Bronze: '🥉 Bronze', New: '🆕 New' }

  // ── Fetch from SQL on mount and on filter/connection change ──
  useEffect(() => { fetchCustomers() }, [tierFilter, isOnline])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await customerApi.getAll(search || undefined, tierFilter || undefined)
      if (res.data && Array.isArray(res.data)) {
        setCustomers(res.data)
      } else {
        setCustomers([])
      }
    } catch (err) {
      console.error("Fetch customers failed:", err)
      const detail = err.response?.data?.details || err.message
      showMsg('error', `Database connection failed: ${detail}`)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  // ── Close tier dropdown on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (tierDropdownRef.current && !tierDropdownRef.current.contains(e.target)) setTierDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const showMsg = (type, text) => {
    setActionMsg({ type, text })
    clearTimeout(msgTimer.current)
    msgTimer.current = setTimeout(() => setActionMsg(null), 3000)
  }

  // ── Client-side filter (search runs against already-fetched list) ──
  const filtered = customers.filter(c =>
    (!search || `${c.FirstName} ${c.LastName} ${c.Email}`.toLowerCase().includes(search.toLowerCase())) &&
    (!tierFilter || c.LoyaltyTier === tierFilter)
  )

  // ── Add Customer: try to persist to SQL, fall back to local state ──
  const handleAddCustomer = async () => {
    if (!newCustomer.FirstName || !newCustomer.LastName || !newCustomer.Email) {
      showMsg('error', 'First name, last name, and email are required.')
      return
    }
    setAddLoading(true)
    const payload = {
      ...newCustomer,
      TotalSpent: 0, TotalOrders: 0, LoyaltyPoints: 0,
      IsBlocked: false, Flags: []
    }
    try {
      await customerApi.create(payload)
      showMsg('success', `${newCustomer.FirstName} ${newCustomer.LastName} saved to database.`)
      await fetchCustomers()   // Reload from SQL so we get the real Id
    } catch {
      // Backend offline — add locally
      setCustomers(prev => [...prev, { ...payload, Id: Date.now() }])
      showMsg('error', 'Backend offline — customer added locally only.')
    } finally {
      setAddLoading(false)
      setShowAddModal(false)
      setNewCustomer({ FirstName: '', LastName: '', Email: '', City: '', LoyaltyTier: 'New' })
    }
  }

  const handleExport = () => {
    const headers = ['Name', 'Email', 'City', 'Tier', 'Total Spent', 'Orders', 'Points', 'Status']
    const rows = filtered.map(c => [
      `${c.FirstName} ${c.LastName}`, c.Email, c.City, c.LoyaltyTier,
      c.TotalSpent, c.TotalOrders, c.LoyaltyPoints, c.IsBlocked ? 'Blocked' : 'Active'
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'customers.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Render CustomerDetail page ──
  if (selected) return (
    <CustomerDetail
      customer={selected}
      onBack={() => setSelected(null)}
      onUpdate={(updatedCustomer) => {
        setCustomers(prev => prev.map(c => c.Id === updatedCustomer.Id ? updatedCustomer : c))
        setSelected(updatedCustomer)
      }}
    />
  )

  return (
    <div className="p-6 space-y-5 animate-fade-up">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline 
            ? <><Wifi size={13} className="text-bloom" /><span className="text-xs font-semibold text-bloom">Connected to Live Database</span></>
            : <><WifiOff size={13} className="text-danger" /><span className="text-xs font-semibold text-danger">Database Offline</span></>
          }
          {loading && <RefreshCw size={12} className="animate-spin text-neo ml-2" />}
        </div>
        {actionMsg && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold animate-fade-in ${
            actionMsg.type === 'success' ? 'bg-bloom/10 text-bloom border border-bloom/20' : 'bg-danger/10 text-danger border border-danger/20'
          }`}>
            {actionMsg.type === 'success' ? <CheckCircle size={10} /> : <XCircle size={10} />}
            {actionMsg.text}
          </div>
        )}
        <button onClick={fetchCustomers} disabled={loading}
          className="btn-ghost text-xs flex items-center gap-1.5 border border-border/40 px-3 py-1.5 rounded-lg">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, icon: Users, bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' },
          { label: 'VIP Customers', value: customers.filter(c => c.LoyaltyTier === 'VIP').length, icon: TrendingUp, bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
          { label: 'Flagged', value: customers.filter(c => c.Flags?.length > 0).length, icon: Flag, bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
          { label: 'Total LTV', value: `$${customers.reduce((s, c) => s + (c.TotalSpent || 0), 0).toLocaleString()}`, icon: UserCheck, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
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

      {/* Table Card */}
      <div className="card !p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              className="input pl-9"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchCustomers()}
            />
          </div>

          {/* Tier Dropdown */}
          <div className="relative" ref={tierDropdownRef}>
            <button className="input w-36 flex items-center justify-between gap-2" onClick={() => setTierDropdownOpen(o => !o)}>
              <span>{tierLabels[tierFilter]}</span>
              <svg width="12" height="12" viewBox="0 0 12 12"
                style={{ transform: tierDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                fill="currentColor">
                <path d="M6 8L1 3h10L6 8z" />
              </svg>
            </button>
            {tierDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-lg overflow-hidden"
                style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                {tierOptions.map(opt => (
                  <div key={opt} className="px-3 py-2 text-sm cursor-pointer"
                    style={{ color: tierFilter === opt && opt !== '' ? '#06b6d4' : '#e2e8f0', background: tierFilter === opt && opt !== '' ? 'rgba(6,182,212,0.1)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = tierFilter === opt && opt !== '' ? 'rgba(6,182,212,0.1)' : 'transparent'}
                    onClick={() => { setTierFilter(opt); setTierDropdownOpen(false) }}>
                    {tierLabels[opt]}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn-ghost flex items-center gap-2 text-sm" onClick={handleExport}>
            <Download size={14} /> Export
          </button>
          <button className="btn-primary flex items-center gap-2 ml-auto" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Customer
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="table-header text-left">Customer</th>
                <th className="table-header text-left">City</th>
                <th className="table-header text-center">Tier</th>
                <th className="table-header text-right">Total Spent</th>
                <th className="table-header text-right">Orders</th>
                <th className="table-header text-right">Points</th>
                <th className="table-header text-center">Flags</th>
                <th className="table-header text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="table-cell text-center text-text-dim py-10 opacity-50">
                    {loading ? 'Loading customers...' : 'No customers found.'}
                  </td>
                </tr>
              )}
              {filtered.map(c => (
                <tr key={c.Id} className="table-row cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setSelected(c)}>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, hsl(${(c.Id || 1) * 47}deg 70% 50%), hsl(${(c.Id || 1) * 47 + 40}deg 60% 40%))` }}>
                        {c.FirstName?.[0]}{c.LastName?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-text-bright text-sm">{c.FirstName} {c.LastName}</div>
                        <div className="text-xs text-text-dim">{c.Email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-text-dim">{c.City}</td>
                  <td className="table-cell text-center"><LoyaltyBadge tier={c.LoyaltyTier} /></td>
                  <td className="table-cell text-right font-semibold text-text-white">${(c.TotalSpent || 0).toLocaleString()}</td>
                  <td className="table-cell text-right text-text-mid">{c.TotalOrders || 0}</td>
                  <td className="table-cell text-right">
                    <span className="text-xs font-mono text-neo-bright">{(c.LoyaltyPoints || 0).toLocaleString()}</span>
                  </td>
                  <td className="table-cell text-center">
                    {c.Flags?.length > 0
                      ? <FlagBadge type={c.Flags[0].FlagType} />
                      : <span className="text-xs text-text-dim">—</span>}
                  </td>
                  <td className="table-cell text-center">
                    {c.IsBlocked
                      ? <span className="badge-danger">Blocked</span>
                      : <span className="badge-bloom">Active</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-border/50">
          <span className="text-xs text-text-dim">Showing {filtered.length} of {customers.length} customers</span>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-text-white">Add New Customer</h2>

            {[['FirstName', 'First Name *'], ['LastName', 'Last Name *'], ['Email', 'Email *'], ['City', 'City']].map(([field, label]) => (
              <div key={field}>
                <label className="text-xs text-text-dim mb-1 block">{label}</label>
                <input
                  className="input w-full"
                  value={newCustomer[field]}
                  onChange={e => setNewCustomer(p => ({ ...p, [field]: e.target.value }))}
                />
              </div>
            ))}

            <div>
              <label className="text-xs text-text-dim mb-1 block">Loyalty Tier</label>
              <select className="select w-full" style={{ background: '#1a1f2e', color: '#e2e8f0' }}
                value={newCustomer.LoyaltyTier}
                onChange={e => setNewCustomer(p => ({ ...p, LoyaltyTier: e.target.value }))}>
                <option value="New">🆕 New</option>
                <option value="Bronze">🥉 Bronze</option>
                <option value="Silver">🥈 Silver</option>
                <option value="Gold">⭐ Gold</option>
                <option value="VIP">💎 VIP</option>
              </select>
            </div>

            {!isOnline && (
              <div className="text-xs text-ember bg-ember/10 border border-ember/20 rounded-lg px-3 py-2">
                ⚠️ Backend is offline. Customer will be added locally only.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button className="btn-ghost flex-1" onClick={() => setShowAddModal(false)} disabled={addLoading}>Cancel</button>
              <button className="btn-primary flex-1 flex items-center justify-center gap-2"
                onClick={handleAddCustomer} disabled={addLoading}>
                {addLoading ? <><RefreshCw size={13} className="animate-spin" /> Saving...</> : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

