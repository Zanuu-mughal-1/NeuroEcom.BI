import { useState, useEffect, useCallback } from 'react'
import { Megaphone, TrendingUp, DollarSign, Target, Play, Pause, Search, RefreshCw, CheckCircle, XCircle, Trash2, Edit2 } from 'lucide-react'
import { CampaignStatusBadge } from '../../components/ui/StatusBadge'
import { SalesAreaChart, SimpleBarChart } from '../../components/charts/MiniChart'
import api from '../../utils/api'
import CampaignModal from '../../components/modals/CampaignModal'

export default function Ads() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success'|'error', message: string }
  const [actionLoading, setActionLoading] = useState(null) // campaignId being acted on
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [chartData, setChartData] = useState([])

  const showToast = useCallback((type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const [{ data: camps }, { data: history }] = await Promise.all([
        api.get('/ads'),
        api.get('/ads/history')
      ])
      setCampaigns(camps)
      setChartData(history)
    } catch (error) {
      console.error('Failed to fetch campaigns or history', error)
      showToast('error', 'Failed to fetch live data from API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleAction = async (id, action) => {
    setActionLoading(id)
    try {
      await api.post(`/ads/${id}/action`, { Action: action })
      showToast('success', `Campaign ${action === 'Start' ? 'started' : 'paused'} successfully`)
      fetchCampaigns()
    } catch (error) {
      console.error(`Failed to ${action} campaign`, error)
      const msg = error?.response?.data?.message || error?.response?.statusText || 'Server unreachable'
      showToast('error', `Failed to ${action.toLowerCase()} campaign: ${msg}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this campaign?')) return
    setActionLoading(id)
    try {
      await api.delete(`/ads/${id}`)
      showToast('success', 'Campaign deleted successfully')
      fetchCampaigns()
    } catch (error) {
      console.error('Failed to delete campaign', error)
      showToast('error', 'Failed to delete campaign')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = (campaign, e) => {
    e.stopPropagation()
    setEditingCampaign(campaign)
    setIsModalOpen(true)
  }

  const filtered = campaigns.filter(c => {
    const matchesStatus = !statusFilter || c.Status === statusFilter
    const matchesSearch = !searchTerm || 
      c.Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.Platform.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalSpend = campaigns.reduce((s, c) => s + (c.TotalSpend || 0), 0)
  const totalRevenue = campaigns.reduce((s, c) => s + (c.TotalRevenue || 0), 0)
  const overallROI = totalSpend > 0 ? (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(1) : 0
  const overallROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : 0

  const platformData = campaigns.reduce((acc, c) => {
    const existing = acc.find(p => p.name === c.Platform)
    if (existing) existing.value += (c.TotalRevenue || 0)
    else acc.push({ name: c.Platform, value: (c.TotalRevenue || 0) })
    return acc
  }, []).filter(p => p.value > 0)

  if (loading && campaigns.length === 0) {
    return (
      <div className="p-6 text-text-dim flex items-center gap-3">
        <RefreshCw className="animate-spin" size={20} /> Loading campaigns...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-[999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-fade-in"
          style={{
            background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            backdropFilter: 'blur(12px)',
            minWidth: '280px',
          }}
        >
          {toast.type === 'success'
            ? <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />
            : <XCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />}
          <span className="text-sm font-medium" style={{ color: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
            {toast.message}
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="page-title text-text-bright">ADVERTISING MANAGER</h1>
          <p className="text-xs text-text-dim">Monitor ROI and optimize platform spend in real-time</p>
        </div>
        <button 
          onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }} 
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Megaphone size={16} /> Create Campaign
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Campaigns', value: campaigns.filter(c => c.Status === 'Active').length, icon: Megaphone, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
          { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}`, icon: DollarSign, bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' },
          { label: 'Overall ROI', value: `${overallROI}%`, icon: Target, bg: 'rgba(0,234,255,0.1)', color: '#00eaff' },
          { label: 'ROAS', value: `${overallROAS}x`, icon: TrendingUp, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="text-lg font-bold text-text-bright mt-0.5">
                {loading ? <span className="text-sm text-text-dim animate-pulse">...</span> : s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <div className="section-title mb-1">Performance Trend</div>
          <div className="section-subtitle mb-4">Last 30 days revenue vs spend history</div>
          <div className="h-56">
            <SalesAreaChart data={chartData} color="#10b981" dataKey="revenue" prefix="$" />
          </div>
        </div>
        <div className="card">
          <div className="section-title mb-1">Platform Distribution</div>
          <div className="section-subtitle mb-4">Revenue breakdown by channel</div>
          <div className="h-56">
            {platformData.length > 0 ? (
              <SimpleBarChart data={platformData} dataKey="value" color="#00eaff" />
            ) : (
              <div className="h-full flex items-center justify-center text-text-dim text-sm italic">No attribution data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              className="input pl-9 w-full"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="select w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Ended">Ended</option>
            <option value="Draft">Draft</option>
          </select>
          <button onClick={fetchCampaigns} className="btn-ghost !px-3 hover:bg-surface">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--border-color)' }}>
                <th className="table-header text-left">Campaign Name</th>
                <th className="table-header text-left">Platform</th>
                <th className="table-header text-right">Budget</th>
                <th className="table-header text-right">Spend</th>
                <th className="table-header text-right">Revenue</th>
                <th className="table-header text-right">ROI</th>
                <th className="table-header text-center">Status</th>
                <th className="table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-text-dim">
                    {loading ? 'Fetching campaign data...' : 'No campaigns matching your filters found.'}
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const spend = c.TotalSpend || 0;
                  const rev = c.TotalRevenue || 0;
                  const roi = spend > 0 ? (((rev - spend) / spend) * 100).toFixed(1) : 0
                  return (
                    <tr key={c.Id} className="table-row">
                      <td className="table-cell">
                        <div className="font-semibold text-text-bright text-sm">{c.Name}</div>
                        <div className="text-xs text-text-dim">{c.Product?.Name || 'All Inventory'}</div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${c.Platform === 'Facebook' ? 'badge-neo' : c.Platform === 'Google' ? 'badge-danger' : c.Platform === 'Instagram' ? 'badge-ember' : 'badge-royal'}`}>
                          {c.Platform}
                        </span>
                      </td>
                      <td className="table-cell text-right text-text-mid">${c.Budget?.toLocaleString() || 0}</td>
                      <td className="table-cell text-right text-danger font-medium">${spend.toLocaleString()}</td>
                      <td className="table-cell text-right text-bloom font-medium">${rev.toLocaleString()}</td>
                      <td className="table-cell text-right">
                        <span className={`font-bold ${+roi > 100 ? 'text-bloom' : +roi > 0 ? 'text-ember' : 'text-danger'}`}>
                          {roi}%
                        </span>
                      </td>
                      <td className="table-cell text-center"><CampaignStatusBadge status={c.Status} /></td>
                      <td className="table-cell text-center">
                        <div className="flex gap-2 justify-center">
                          {actionLoading === c.Id ? (
                            <RefreshCw size={14} className="animate-spin text-text-dim" />
                          ) : (
                            <>
                              {c.Status === 'Active' ? (
                                <button onClick={() => handleAction(c.Id, 'Pause')} title="Pause" className="p-1.5 hover:bg-surface rounded-lg text-text-mid"><Pause size={14} /></button>
                              ) : (
                                c.Status !== 'Ended' && <button onClick={() => handleAction(c.Id, 'Start')} title="Start" className="p-1.5 hover:bg-bloom/10 rounded-lg text-bloom"><Play size={14} /></button>
                              )}
                              <button onClick={(e) => handleEdit(c, e)} title="Edit" className="p-1.5 hover:bg-surface rounded-lg text-text-mid"><Edit2 size={14} /></button>
                              <button onClick={(e) => handleDelete(c.Id, e)} title="Delete" className="p-1.5 hover:bg-danger/10 rounded-lg text-danger"><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CampaignModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCampaign(null); }}
        onSuccess={fetchCampaigns}
        campaign={editingCampaign}
      />
    </div>
  )
}
