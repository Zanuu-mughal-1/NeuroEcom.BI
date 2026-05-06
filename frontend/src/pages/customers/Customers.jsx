import { useState, useRef, useEffect } from 'react'
import { Search, Plus, Download, Users, UserCheck, TrendingUp, Flag } from 'lucide-react'
import { LoyaltyBadge, FlagBadge } from '../../components/ui/StatusBadge'
import { mockCustomers } from '../../utils/api'
import CustomerDetail from './CustomerDetail'

export default function Customers() {
  const [customers, setCustomers] = useState(mockCustomers)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const [tierDropdownOpen, setTierDropdownOpen] = useState(false)
  const tierDropdownRef = useRef(null)
  const tierOptions = ['', 'VIP', 'Gold', 'Silver', 'Bronze', 'New']
  const tierLabels = { '': 'All Tiers', VIP: '💎 VIP', Gold: '⭐ Gold', Silver: '🥈 Silver', Bronze: '🥉 Bronze', New: '🆕 New' }


  const [showAddModal, setShowAddModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    FirstName: '', LastName: '', Email: '', City: '', LoyaltyTier: 'New'
  })

  useEffect(() => {
    const handler = (e) => {
      if (tierDropdownRef.current && !tierDropdownRef.current.contains(e.target)) {
        setTierDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = customers.filter(c =>
    (!search || `${c.FirstName} ${c.LastName} ${c.Email}`.toLowerCase().includes(search.toLowerCase())) &&
    (!tierFilter || c.LoyaltyTier === tierFilter)
  )

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, icon: Users, bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' },
          { label: 'VIP Customers', value: customers.filter(c => c.LoyaltyTier === 'VIP').length, icon: TrendingUp, bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
          { label: 'Flagged', value: customers.filter(c => c.Flags?.length > 0).length, icon: Flag, bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
          { label: 'Total LTV', value: `$${customers.reduce((s, c) => s + c.TotalSpent, 0).toLocaleString()}`, icon: UserCheck, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
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
            <input className="input pl-9" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="relative" ref={tierDropdownRef}>
            <button
              className="input w-36 flex items-center justify-between gap-2"
              onClick={() => setTierDropdownOpen(o => !o)}
            >
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
                    style={{
                      color: tierFilter !== '' && tierFilter === opt ? '#06b6d4' : '#e2e8f0',
                      background: tierFilter !== '' && tierFilter === opt ? 'rgba(6,182,212,0.1)' : 'transparent',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = tierFilter !== '' && tierFilter === opt ? 'rgba(6,182,212,0.1)' : 'transparent'}
                    onClick={() => { setTierFilter(opt); setTierDropdownOpen(false) }}>
                    {tierLabels[opt]}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="btn-ghost flex items-center gap-2 text-sm"
            onClick={() => {
              const headers = ['Name', 'Email', 'City', 'Tier', 'Total Spent', 'Orders', 'Points', 'Status']
              const rows = filtered.map(c => [
                `${c.FirstName} ${c.LastName}`,
                c.Email,
                c.City,
                c.LoyaltyTier,
                c.TotalSpent,
                c.TotalOrders,
                c.LoyaltyPoints,
                c.IsBlocked ? 'Blocked' : 'Active'
              ])

              const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'customers.csv'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download size={14} /> Export
          </button>
          <button className="btn-primary flex items-center gap-2 ml-auto"
            onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Customer
          </button>
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="card w-full max-w-md p-6 space-y-4">
                <h2 className="text-lg font-bold text-text-white">Add New Customer</h2>

                {[['FirstName', 'First Name'], ['LastName', 'Last Name'], ['Email', 'Email'], ['City', 'City']].map(([field, label]) => (
                  <div key={field}>
                    <label className="text-xs text-text-dim mb-1 block">{label}</label>
                    <input className="input w-full" value={newCustomer[field]}
                      onChange={e => setNewCustomer(p => ({ ...p, [field]: e.target.value }))} />
                  </div>
                ))}

                <div>
                  <label className="text-xs text-text-dim mb-1 block">Tier</label>
                  <select className="select w-full"
                    style={{ background: '#1a1f2e', color: '#e2e8f0' }}
                    value={newCustomer.LoyaltyTier}
                    onChange={e => setNewCustomer(p => ({ ...p, LoyaltyTier: e.target.value }))}>
                    <option value="New">🆕 New</option>
                    <option value="Bronze">🥉 Bronze</option>
                    <option value="Silver">🥈 Silver</option>
                    <option value="Gold">⭐ Gold</option>
                    <option value="VIP">💎 VIP</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="btn-ghost flex-1" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button className="btn-primary flex-1" onClick={() => {
                    const customer =
                    {
                      ...newCustomer,
                      Id: customers.length + 1,
                      TotalSpent: 0,
                      TotalOrders: 0,
                      LoyaltyPoints: 0,
                      IsBlocked: false,
                      Flags: []
                    }
                    setCustomers(p => [...p, customer])
                    setShowAddModal(false)
                    setNewCustomer({ FirstName: '', LastName: '', Email: '', City: '', LoyaltyTier: 'New' })
                  }}>Add Customer</button>
                </div>
              </div>
            </div>
          )}
        </div>

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
              {filtered.map(c => (
                <tr key={c.Id} className="table-row cursor-pointer" onClick={() => setSelected(c)}>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, hsl(${c.Id * 47}deg 70% 50%), hsl(${c.Id * 47 + 40}deg 60% 40%))` }}>
                        {c.FirstName[0]}{c.LastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-text-bright text-sm">{c.FirstName} {c.LastName}</div>
                        <div className="text-xs text-text-dim">{c.Email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-text-dim">{c.City}</td>
                  <td className="table-cell text-center"><LoyaltyBadge tier={c.LoyaltyTier} /></td>
                  <td className="table-cell text-right font-semibold text-text-white">${c.TotalSpent.toLocaleString()}</td>
                  <td className="table-cell text-right text-text-mid">{c.TotalOrders}</td>
                  <td className="table-cell text-right">
                    <span className="text-xs font-mono text-neo-bright">{c.LoyaltyPoints.toLocaleString()}</span>
                  </td>
                  <td className="table-cell text-center">
                    {c.Flags?.length > 0 ? (
                      <FlagBadge type={c.Flags[0].FlagType} />
                    ) : (
                      <span className="text-xs text-text-dim">—</span>
                    )}
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
    </div >
  )
}
