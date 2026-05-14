import { useState, useEffect } from 'react'
import { Megaphone, TrendingUp, DollarSign, Target, Play, Pause, Search, RefreshCw, Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react'
import { CampaignStatusBadge } from '../../components/ui/StatusBadge'
import { SalesAreaChart, SimpleBarChart } from '../../components/charts/MiniChart'
import api from '../../utils/api'
import { useData } from '../../context/DataContext'

export default function Ads() {
  const { isOnline } = useData()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [actionMsg, setActionMsg] = useState(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const res = await api.get('/ads')
      setCampaigns(res.data)
    } catch (err) {
      console.error('Failed to fetch campaigns', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, action, budget = null) => {
    try {
      await api.post(`/ads/${id}/action`, { Action: action, Budget: budget })
      setActionMsg({ type: 'success', text: `Campaign ${action}ed successfully` })
      fetchCampaigns()
      setTimeout(() => setActionMsg(null), 3000)
    } catch (err) {
      console.error('Action failed', err)
      setActionMsg({ type: 'error', text: 'Action failed' })
      setTimeout(() => setActionMsg(null), 3000)
    }
  }

  const filtered = campaigns.filter(c => !statusFilter || c.Status === statusFilter)
  const totalSpend = campaigns.reduce((s, c) => s + c.TotalSpend, 0)
  const totalRevenue = campaigns.reduce((s, c) => s + c.TotalRevenue, 0)
  const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100).toFixed(1) : 0
  const overallROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : 0

  const platformMap = {}
  campaigns.forEach(c => {
    if (!platformMap[c.Platform]) platformMap[c.Platform] = 0
    platformMap[c.Platform] += c.TotalRevenue
  })
  const platformData = Object.entries(platformMap).map(([name, value]) => ({ name, value }))

  const trendData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return {
      date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      revenue: Math.round((totalRevenue / 30) * (0.7 + Math.random() * 0.6)),
    }
  })

  if (loading) return <div className="p-6 text-text-dim">Loading Campaigns...</div>

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
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold animate-fade-in ${actionMsg.type === 'success' ? 'bg-bloom/10 text-bloom border border-bloom/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
            {actionMsg.type === 'success' ? <CheckCircle size={10} /> : <XCircle size={10} />}
            {actionMsg.text}
          </div>
        )}
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card !p-0 overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="relative max-w-xs flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              <input className="input pl-9" placeholder="Filter campaigns..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStatusFilter('')} className={`btn-ghost text-xs ${!statusFilter ? 'bg-neo/10 text-neo-bright' : ''}`}>All</button>
              <button onClick={() => setStatusFilter('Active')} className={`btn-ghost text-xs ${statusFilter === 'Active' ? 'bg-bloom/10 text-bloom' : ''}`}>Active</button>
              <button onClick={() => setStatusFilter('Paused')} className={`btn-ghost text-xs ${statusFilter === 'Paused' ? 'bg-ember/10 text-ember' : ''}`}>Paused</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-abyss border-b border-border text-left">
                  <th className="table-header">Campaign</th>
                  <th className="table-header">Platform</th>
                  <th className="table-header text-right">Spend</th>
                  <th className="table-header text-right">Revenue</th>
                  <th className="table-header text-right">ROAS</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(c => (
                  <tr key={c.Id} className="table-row">
                    <td className="table-cell">
                      <div className="font-semibold text-text-bright">{c.CampaignName}</div>
                    </td>
                    <td className="table-cell text-sm text-text-dim">{c.Platform}</td>
                    <td className="table-cell text-right text-text-mid">${c.TotalSpend.toLocaleString()}</td>
                    <td className="table-cell text-right text-bloom font-semibold">${c.TotalRevenue.toLocaleString()}</td>
                    <td className="table-cell text-right">
                      <span className={(c.TotalRevenue / c.TotalSpend) >= 3 ? 'text-bloom' : 'text-ember'}>
                        {(c.TotalRevenue / c.TotalSpend).toFixed(1)}x
                      </span>
                    </td>
                    <td className="table-cell text-center"><CampaignStatusBadge status={c.Status} /></td>
                    <td className="table-cell text-center">
                      <button 
                        onClick={() => handleAction(c.Id, c.Status === 'Active' ? 'Pause' : 'Resume')}
                        className="btn-ghost p-1.5 rounded-lg hover:bg-white/5"
                      >
                        {c.Status === 'Active' ? <Pause size={14} className="text-ember" /> : <Play size={14} className="text-bloom" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card">
            <div className="section-title mb-4">Channel Revenue</div>
            <div className="h-48">
              <SimpleBarChart data={platformData} color="#6366f1" />
            </div>
          </div>
          <div className="card">
            <div className="section-title mb-4">Revenue Trend (30D)</div>
            <div className="h-48">
              <SalesAreaChart data={trendData} color="#10b981" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
