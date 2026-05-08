import { useState } from 'react'
import { Megaphone, TrendingUp, DollarSign, Target, Play, Pause, Search } from 'lucide-react'
import { CampaignStatusBadge } from '../../components/ui/StatusBadge'
import { SalesAreaChart, SimpleBarChart } from '../../components/charts/MiniChart'
import { adApi, mockCampaigns, generateSalesData } from '../../utils/api'
import { useData } from '../../context/DataContext'
import { RefreshCw, Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function Ads() {
  const { isOnline } = useData()
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState(null)
  const msgTimer = useRef(null)

  const showMsg = (type, text) => {
    if (msgTimer.current) clearTimeout(msgTimer.current)
    setActionMsg({ type, text })
    msgTimer.current = setTimeout(() => setActionMsg(null), 4000)
  }

  const fetchAds = async () => {
    setLoading(true)
    try {
      if (isOnline) {
        const res = await adApi.getAll()
        if (res.data) setCampaigns(res.data)
      } else {
        setCampaigns(mockCampaigns)
      }
    } catch (err) {
      console.error("Fetch ads failed:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAds() }, [isOnline])

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

  const takeAction = async (id, action) => {
    if (!isOnline) {
      showMsg('error', 'Offline mode - cannot modify database')
      return
    }
    setActionLoading(true)
    try {
      await adApi.takeAction(id, { action })
      showMsg('success', `Campaign ${action} successful`)
      fetchAds()
    } catch (err) {
      showMsg('error', `Failed to ${action} campaign`)
    } finally {
      setActionLoading(false)
    }
  }
  return (
    <div className="p-6 space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline 
            ? <><Wifi size={13} className="text-bloom" /><span className="text-xs font-semibold text-bloom">Live Database</span></>
            : <><WifiOff size={13} className="text-ember" /><span className="text-xs font-semibold text-ember">Offline — mock data</span></>
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
      </div>
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
          <button className="btn-primary ml-auto flex items-center gap-2">
            <Megaphone size={14} /> New Campaign
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="table-header text-left">Campaign Strategy</th>
                <th className="table-header text-left">Channel</th>
                <th className="table-header text-right">Budget Allocation</th>
                <th className="table-header text-right">Actual Spend</th>
                <th className="table-header text-right">Neural Revenue</th>
                <th className="table-header text-right">ROI (%)</th>
                <th className="table-header text-right">Engagement</th>
                <th className="table-header text-center">Protocol Status</th>
                <th className="table-header text-center">Execution Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(c => {
                const roi = c.TotalSpend > 0 ? ((c.TotalRevenue - c.TotalSpend) / c.TotalSpend * 100).toFixed(1) : 0
                return (
                  <tr key={c.Id}
                    className={`table-row cursor-pointer group hover:bg-white/[0.02] transition-colors ${selected?.Id === c.Id ? 'bg-neo/5' : ''}`}
                    onClick={() => setSelected(c === selected ? null : c)}>
                    <td className="table-cell">
                      <div className="font-bold text-text-bright text-sm uppercase tracking-tighter">{c.Name}</div>
                      <div className="text-[10px] text-text-dim opacity-60 font-medium">{c.Product?.Name || 'Global Strategy'}</div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge text-[9px] font-black uppercase tracking-[0.15em] border border-white/5 ${c.Platform === 'Facebook' ? 'bg-blue-500/10 text-blue-400' : c.Platform === 'Google' ? 'bg-danger/10 text-danger' : 'bg-royal/10 text-royal-bright'}`}>
                        {c.Platform}
                      </span>
                    </td>
                    <td className="table-cell text-right text-text-mid font-mono text-xs font-bold">${(c.Budget || 0).toLocaleString()}</td>
                    <td className="table-cell text-right text-ember font-bold text-sm" style={{ fontFamily: 'Bebas Neue' }}>${(c.TotalSpend || 0).toLocaleString()}</td>
                    <td className="table-cell text-right text-bloom font-bold text-sm" style={{ fontFamily: 'Bebas Neue' }}>${(c.TotalRevenue || 0).toLocaleString()}</td>
                    <td className="table-cell text-right">
                      <span className={`font-mono font-black text-xs ${+roi > 100 ? 'text-bloom' : +roi > 0 ? 'text-ember' : 'text-danger'}`}>
                        {roi}%
                      </span>
                    </td>
                    <td className="table-cell text-right text-text-mid font-mono text-[10px] opacity-70">
                      {(c.Clicks || 0).toLocaleString()} <span className="text-[8px] opacity-40">INT</span>
                    </td>
                    <td className="table-cell text-center">
                      <CampaignStatusBadge status={c.Status} />
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex gap-2 justify-center" onClick={e => e.stopPropagation()}>
                        {c.Status === 'Active' ? (
                          <button
                            disabled={actionLoading}
                            onClick={() => takeAction(c.Id, 'Pause')}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-ember/10 text-ember border border-ember/20 hover:bg-ember hover:text-white transition-all">
                            <Pause size={12} fill="currentColor" />
                          </button>
                        ) : (
                          <button
                            disabled={actionLoading}
                            onClick={() => takeAction(c.Id, 'Start')}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-bloom/10 text-bloom border border-bloom/20 hover:bg-bloom hover:text-white transition-all">
                            <Play size={12} fill="currentColor" className="ml-0.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="px-5 py-4 border-t border-border/50 bg-black/20 flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim opacity-50">
            Marketing Core Synchronized: {filtered.length} strategies active
          </span>
          <div className="flex gap-1.5">
            {[1, 2].map(p => (
              <button key={p} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${p === 1 ? 'bg-neo/20 text-neo-bright border border-neo/30' : 'text-text-dim hover:text-text-mid'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
