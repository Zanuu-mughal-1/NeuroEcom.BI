import { useState } from 'react'
import { Search, Plus, Download, Users, UserCheck, TrendingUp, Flag } from 'lucide-react'
import { LoyaltyBadge, FlagBadge } from '../../components/ui/StatusBadge'
import { mockCustomers } from '../../utils/api'
import CustomerDetail from './CustomerDetail'

export default function Customers() {
  const [customers] = useState(mockCustomers)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = customers.filter(c =>
    (!search || `${c.FirstName} ${c.LastName} ${c.Email}`.toLowerCase().includes(search.toLowerCase())) &&
    (!tierFilter || c.LoyaltyTier === tierFilter)
  )

  if (selected) return <CustomerDetail customer={selected} onBack={() => setSelected(null)} />

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
          <select className="select w-32" value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
            <option value="">All Tiers</option>
            <option value="VIP">💎 VIP</option>
            <option value="Gold">⭐ Gold</option>
            <option value="Silver">🥈 Silver</option>
            <option value="Bronze">🥉 Bronze</option>
            <option value="New">🆕 New</option>
          </select>
          <button className="btn-ghost flex items-center gap-2 text-sm"><Download size={14} /> Export</button>
          <button className="btn-primary flex items-center gap-2 ml-auto"><Plus size={14} /> Add Customer</button>
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
    </div>
  )
}
