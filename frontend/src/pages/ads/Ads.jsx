import { useState } from 'react'
import { Megaphone, TrendingUp, DollarSign, Target, Play, Pause, Search } from 'lucide-react'
import { CampaignStatusBadge } from '../../components/ui/StatusBadge'
import { SalesAreaChart, SimpleBarChart } from '../../components/charts/MiniChart'
import { mockCampaigns, generateSalesData } from '../../utils/api'

export default function Ads() {
  const [campaigns] = useState(mockCampaigns)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = campaigns.filter(c => !statusFilter || c.Status === statusFilter)
  const totalSpend = campaigns.reduce((s, c) => s + c.TotalSpend, 0)
  const totalRevenue = campaigns.reduce((s, c) => s + c.TotalRevenue, 0)
  const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100).toFixed(1) : 0
  const overallROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : 0

  const chartData = generateSalesData(30)
  const platformData = [
    { name: 'Facebook', value: 250 },
    { name: 'Google', value: 200 },
    { name: 'Instagram', value: 100 },
  ]

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Campaigns', value: campaigns.filter(c => c.Status === 'Active').length, icon: Megaphone, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
          { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}`, icon: DollarSign, bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' },
          { label: 'Overall ROI', value: `${overallROI}%`, icon: Target, bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
          { label: 'ROAS', value: `${overallROAS}x`, icon: TrendingUp, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="text-lg font-bold text-text-white mt-0.5">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <div className="section-title mb-1">Revenue vs Spend</div>
          <div className="section-subtitle mb-4">Last 30 days</div>
          <div className="h-48">
            <SalesAreaChart data={chartData} color="#10b981" dataKey="revenue" prefix="$" />
          </div>
        </div>
        <div className="card">
          <div className="section-title mb-1">ROI by Platform</div>
          <div className="section-subtitle mb-4">Performance comparison</div>
          <div className="h-48">
            <SimpleBarChart data={platformData} dataKey="value" color="#6366f1" />
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input className="input pl-9" placeholder="Search campaigns..." />
          </div>
          <select className="select w-32" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Ended">Ended</option>
            <option value="Draft">Draft</option>
          </select>
          <button className="btn-primary ml-auto flex items-center gap-2"><Megaphone size={14} /> New Campaign</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="table-header text-left">Campaign</th>
                <th className="table-header text-left">Platform</th>
                <th className="table-header text-right">Budget</th>
                <th className="table-header text-right">Spend</th>
                <th className="table-header text-right">Revenue</th>
                <th className="table-header text-right">ROI</th>
                <th className="table-header text-right">Clicks</th>
                <th className="table-header text-center">Status</th>
                <th className="table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const roi = c.TotalSpend > 0 ? ((c.TotalRevenue - c.TotalSpend) / c.TotalSpend * 100).toFixed(1) : 0
                return (
                  <tr key={c.Id} className="table-row cursor-pointer" onClick={() => setSelected(c === selected ? null : c)}>
                    <td className="table-cell">
                      <div className="font-semibold text-text-bright text-sm">{c.Name}</div>
                      <div className="text-xs text-text-dim">{c.Product?.Name}</div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${c.Platform === 'Facebook' ? 'badge-neo' : c.Platform === 'Google' ? 'badge-danger' : 'badge-royal'}`}>
                        {c.Platform}
                      </span>
                    </td>
                    <td className="table-cell text-right text-text-mid">${c.Budget.toLocaleString()}</td>
                    <td className="table-cell text-right text-danger font-medium">${c.TotalSpend.toLocaleString()}</td>
                    <td className="table-cell text-right text-bloom font-medium">${c.TotalRevenue.toLocaleString()}</td>
                    <td className="table-cell text-right">
                      <span className={`font-bold ${+roi > 100 ? 'text-bloom' : +roi > 0 ? 'text-ember' : 'text-danger'}`}>
                        {roi}%
                      </span>
                    </td>
                    <td className="table-cell text-right text-text-mid font-mono">{c.Clicks.toLocaleString()}</td>
                    <td className="table-cell text-center"><CampaignStatusBadge status={c.Status} /></td>
                    <td className="table-cell text-center">
                      <div className="flex gap-1 justify-center" onClick={e => e.stopPropagation()}>
                        {c.Status === 'Active'
                          ? <button className="btn-ghost text-xs !py-1 !px-2 flex items-center gap-1"><Pause size={11} /> Pause</button>
                          : <button className="btn-success text-xs !py-1 !px-2 flex items-center gap-1"><Play size={11} /> Start</button>
                        }
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
