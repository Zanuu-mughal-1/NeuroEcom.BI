import { useState, useEffect, useCallback, useMemo } from 'react'
import { Shield, RotateCcw, Search, CheckCircle, XCircle, Clock, DollarSign, Zap, Plus, RefreshCw, AlertTriangle, ArrowRight, History } from 'lucide-react'
import api from '../../utils/api'
import ReturnModal from '../../components/modals/ReturnModal'

export default function Returns() {
  const [activeTab, setActiveTab] = useState('returns')
  const [returns, setReturns] = useState([])
  const [rtoLogs, setRtoLogs] = useState([])
  const [rules, setRules] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [rtoInput, setRtoInput] = useState({ orderValue: 250, paymentMethod: 'COD', customerId: '' })
  const [rtoResult, setRtoResult] = useState(null)
  const [assessing, setAssessing] = useState(false)
  const [editingRule, setEditingRule] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [retRes, rtoRes, ruleRes, metRes] = await Promise.all([
        api.get('/returns').catch(() => ({ data: [] })),
        api.get('/rto/logs').catch(() => ({ data: [] })),
        api.get('/decisions/rules?category=RTO').catch(() => ({ data: [] })),
        api.get('/returns/analytics').catch(() => ({ data: null }))
      ])
      setReturns(retRes.data)
      setRtoLogs(rtoRes.data)
      setRules(ruleRes.data)
      setMetrics(metRes.data)
    } catch (err) {
      console.error('Failed to fetch returns data', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleReturnAction = async (id, action, refundAmount = null) => {
    try {
      await api.post(`/returns/${id}/action`, { action, refundAmount })
      fetchData()
    } catch (err) {
      console.error(`Failed to ${action} return`, err)
    }
  }

  const runRTOAssessment = async () => {
    setAssessing(true)
    try {
      const { data } = await api.post('/rto/test', {
        OrderId: null,
        CustomerId: rtoInput.customerId ? parseInt(rtoInput.customerId) : null,
        OrderValue: parseFloat(rtoInput.orderValue),
        PaymentMethod: rtoInput.paymentMethod
      })
      setRtoResult({
        score: data.Score ?? data.score ?? 0,
        decision: data.Decision ?? data.decision ?? 'Manual Review',
        triggeredRules: data.TriggeredRules ?? data.triggeredRules ?? [],
        recommendation: data.Recommendation ?? data.recommendation
      })
      fetchData()
    } catch (err) {
      console.error('RTO assessment failed', err)
      // Fallback local assessment if API fails
      let score = 0
      const triggered = []
      if (rtoInput.paymentMethod === 'COD') { score += 15; triggered.push('COD payment (+15 pts)') }
      if (+rtoInput.orderValue > 500) { score += 20; triggered.push('High value order >Rs500 (+20 pts)') }
      score = Math.min(100, score)
      const decision = score <= 20 ? 'Auto-Approved' : score <= 50 ? 'Manual Review' : 'Additional Verification'
      setRtoResult({ score, decision, triggeredRules: triggered })
    } finally {
      setAssessing(false)
    }
  }

  const updateRule = async (id, newValue) => {
    try {
      await api.put(`/decisions/rules/${id}`, { newValue })
      setEditingRule(null)
      fetchData()
    } catch (err) {
      console.error('Failed to update rule', err)
    }
  }

  const filteredReturns = useMemo(() => {
    return returns.filter(r => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = 
        r.ReturnNumber?.toLowerCase().includes(q) ||
        r.Customer?.FirstName?.toLowerCase().includes(q) ||
        r.Customer?.LastName?.toLowerCase().includes(q) ||
        r.OrderNumber?.toLowerCase().includes(q)
      
      const matchesStatus = statusFilter === 'All' || r.Status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [returns, searchQuery, statusFilter])

  const tabs = [
    { id: 'returns', label: 'Returns List', icon: RotateCcw },
    { id: 'rto', label: 'RTO Shield', icon: Shield },
    { id: 'rules', label: 'RTO Rules', icon: Zap },
  ]

  const statusStyles = {
    Pending: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
    Approved: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', color: '#34d399' },
    Rejected: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', color: '#f87171' },
    Refunded: { bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)', color: '#93c5fd' },
  }

  if (loading && returns.length === 0) {
    return <div className="p-6 flex items-center justify-center h-[60vh] text-text-dim"><RefreshCw className="animate-spin mr-2" /> Initializing Returns Module...</div>
  }

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      <ReturnModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchData} />

      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 p-1 rounded-xl bg-input-bg border border-border" style={{ width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-neo/20 text-neo-bright border border-neo/30 shadow-lg shadow-neo/5' : 'text-text-dim hover:text-text-mid'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-ghost !p-2 hover:bg-surface"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={14} /> New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Returns', value: metrics?.totalReturns ?? returns.length, icon: RotateCcw, bg: 'rgba(56,189,248,0.1)', color: '#38bdf8' },
          { label: 'Return Rate', value: `${metrics?.returnRate ?? 0}%`, icon: AlertTriangle, bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
          { label: 'Pending Review', value: returns.filter(r => r.Status === 'Pending').length, icon: Clock, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
          { label: 'Refund Amount', value: `Rs ${(metrics?.totalRefundAmount != null ? Number(metrics.totalRefundAmount) : returns.reduce((s, r) => s + (r.RefundAmount || 0), 0)).toLocaleString()}`, icon: DollarSign, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="text-xl font-bold text-text-bright mt-0.5">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Returns List Tab */}
      {activeTab === 'returns' && (
        <div className="card !p-0 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              <input className="input pl-9 w-full" placeholder="Search returns by ID or customer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <select className="select w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-abyss border-b border-border">
                  <th className="table-header text-left">Return ID</th>
                  <th className="table-header text-left">Customer</th>
                  <th className="table-header text-left">Product</th>
                  <th className="table-header text-center">Reason</th>
                  <th className="table-header text-right">Refund</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-right">Date</th>
                  <th className="table-header text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.length === 0 ? (
                  <tr><td colSpan="8" className="py-12 text-center text-text-dim">No matching returns found.</td></tr>
                ) : filteredReturns.map(r => {
                  const s = statusStyles[r.Status] || statusStyles.Pending
                  return (
                    <tr key={r.Id} className="table-row">
                      <td className="table-cell font-mono text-neo-bright text-xs">{r.ReturnNumber}</td>
                      <td className="table-cell">
                        <div className="text-sm font-semibold text-text-bright">{r.Customer?.FirstName} {r.Customer?.LastName}</div>
                        <div className="text-xs text-text-dim">Order: {r.OrderNumber}</div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-text-bright truncate max-w-[200px]">{r.Product?.Name}</div>
                        <div className="text-xs text-text-dim">{r.Product?.SKU}</div>
                      </td>
                      <td className="table-cell text-center">
                        <span className="badge-dim text-[10px] uppercase font-bold tracking-wider px-2 py-1">{r.ReturnReason}</span>
                      </td>
                      <td className="table-cell text-right font-semibold text-text-bright">
                        {r.RefundAmount != null && r.RefundAmount !== '' ? `Rs ${Number(r.RefundAmount).toLocaleString()}` : '—'}
                      </td>
                      <td className="table-cell text-center">
                        <span className="badge text-[10px] font-bold uppercase tracking-wider" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {r.Status}
                        </span>
                      </td>
                      <td className="table-cell text-right text-xs text-text-dim font-mono">
                        {new Date(r.RequestDate).toLocaleDateString()}
                      </td>
                      <td className="table-cell text-center">
                        <div className="flex gap-2 justify-center">
                          {r.Status === 'Pending' && (
                            <>
                              <button onClick={() => handleReturnAction(r.Id, 'Approve')} className="p-1.5 rounded-lg hover:bg-bloom/10 text-bloom transition-colors" title="Approve"><CheckCircle size={16} /></button>
                              <button onClick={() => handleReturnAction(r.Id, 'Reject')} className="p-1.5 rounded-lg hover:bg-danger/10 text-danger transition-colors" title="Reject"><XCircle size={16} /></button>
                            </>
                          )}
                          {r.Status === 'Approved' && (
                            <button onClick={() => handleReturnAction(r.Id, 'Refund')} className="btn-primary text-[10px] !py-1 !px-3">Process Refund</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RTO Shield Tab */}
      {activeTab === 'rto' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-neo/10 text-neo">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-bright tracking-tight">RTO Shield Intelligence</h3>
                <p className="text-xs text-text-dim">Predictive risk scoring engine</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Order Value (Rs)</label>
                  <input type="number" className="input w-full" value={rtoInput.orderValue}
                    onChange={e => setRtoInput(p => ({ ...p, orderValue: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Payment Method</label>
                  <select className="select w-full" value={rtoInput.paymentMethod}
                    onChange={e => setRtoInput(p => ({ ...p, paymentMethod: e.target.value }))}>
                    <option value="COD">COD (Riskier)</option>
                    <option value="Prepaid">Prepaid (Safe)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Customer Context (Optional)</label>
                <input className="input w-full" placeholder="Enter customer ID for historical analysis..." value={rtoInput.customerId}
                  onChange={e => setRtoInput(p => ({ ...p, customerId: e.target.value }))} />
              </div>
              <button onClick={runRTOAssessment} disabled={assessing} className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs">
                {assessing ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
                Execute Risk Analysis
              </button>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${!rtoResult ? 'bg-void/10 border-dashed border-white/5' : 'bg-surface border-white/10 shadow-xl shadow-black/20'}`}>
              {rtoResult ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.9" fill="none"
                            stroke={rtoResult.score <= 20 ? '#10b981' : rtoResult.score <= 50 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="3" strokeDasharray={`${rtoResult.score} 100`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-text-bright">{rtoResult.score}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Neural Outcome</div>
                        <div className={`text-xl font-black ${rtoResult.score <= 20 ? 'text-bloom' : rtoResult.score <= 50 ? 'text-ember' : 'text-danger'}`}>
                          {rtoResult.decision}
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-neo/10 border border-neo/30 rounded-lg flex items-center gap-2">
                      <Zap size={12} className="text-neo" />
                      <span className="text-[10px] font-black uppercase text-neo-bright">AI Score</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Recommended Action</div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                      <ArrowRight size={16} className="text-neo flex-shrink-0" />
                      <span className="text-xs font-medium text-text-mid leading-relaxed">
                        {rtoResult.score > 50 
                          ? "High risk detected. Recommend requesting prepayment or verifying shipping address via call." 
                          : "Low risk profile. Proceed with automated fulfillment and priority processing."}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Triggered Factors</div>
                    <div className="flex flex-wrap gap-2">
                      {rtoResult.triggeredRules?.map((rule, i) => (
                        <span key={i} className="px-3 py-1.5 bg-danger/10 text-danger border border-danger/20 rounded-lg text-[9px] font-black uppercase tracking-wider">
                          {rule}
                        </span>
                      )) || <span className="text-xs text-text-dim italic">Baseline profile (no high-risk triggers)</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-30 gap-3">
                  <Shield size={40} className="text-text-dim" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Neural engine idle</p>
                </div>
              )}
            </div>
          </div>

          <div className="card !p-0 flex flex-col border-white/5 bg-void/50">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <History size={16} className="text-text-mid" />
                <span className="font-bold text-text-bright uppercase text-xs tracking-widest">Intelligence Audit Trail</span>
              </div>
              <span className="text-[10px] text-text-dim font-black uppercase tracking-widest">Latest 10 Events</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-white/5">
              {rtoLogs.length === 0 ? (
                <div className="p-12 text-center text-text-dim text-xs italic">No neural events logged in audit trail</div>
              ) : rtoLogs.map(log => (
                <div key={log.Id} className="p-5 hover:bg-white/5 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black font-mono text-neo uppercase mb-1">TRK-{log.Id.toString().padStart(6, '0')}</span>
                      <span className="text-sm font-bold text-text-bright group-hover:text-neo transition-colors">{log.Customer?.FirstName} {log.Customer?.LastName}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.Status === 'Returned' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-ember/10 text-ember border border-ember/20'}`}>
                      {log.Status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-wider text-text-dim">
                    <div className="flex flex-col gap-1">
                      <span className="opacity-50">Delivery Attempts</span>
                      <span className="text-text-mid">{log.DeliveryAttempts || 0}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="opacity-50">Log Reason</span>
                      <span className="text-text-mid truncate">{log.FailureReason || 'Neural Log'}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-[9px] text-text-dim font-mono">{new Date(log.CreatedAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RTO Rules Tab */}
      {activeTab === 'rules' && (
        <div className="card !p-0 overflow-hidden border-white/5">
          <div className="p-5 border-b border-white/5 bg-void/30">
            <h3 className="text-xl font-bold text-text-bright tracking-tight">Neural Threshold Settings</h3>
            <p className="text-xs text-text-dim">Configure baseline weights for risk calculations</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-abyss border-b border-white/5">
                  <th className="table-header text-left">Parameter</th>
                  <th className="table-header text-left">Internal Logic Description</th>
                  <th className="table-header text-center">Neural Weight</th>
                  <th className="table-header text-center">Baseline</th>
                  <th className="table-header text-center">Mod</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rules.map(rule => (
                  <tr key={rule.Id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-5 px-5 font-bold text-text-bright text-sm">{rule.RuleName}</td>
                    <td className="py-5 px-5 text-text-mid text-xs leading-relaxed max-w-md">{rule.Description}</td>
                    <td className="py-5 px-5 text-center">
                      {editingRule === rule.Id ? (
                        <input className="input w-24 text-center text-sm font-black text-neo" defaultValue={rule.CurrentValue}
                          onBlur={e => updateRule(rule.Id, e.target.value)} autoFocus />
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg bg-neo/10 text-neo font-mono text-xs font-black cursor-pointer hover:bg-neo/20 transition-all" onClick={() => setEditingRule(rule.Id)}>
                          {rule.CurrentValue}
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-5 text-center font-mono text-xs text-text-dim">{rule.DefaultValue}</td>
                    <td className="py-5 px-5 text-center">
                      <button onClick={() => setEditingRule(rule.Id)} className="p-2 rounded-lg hover:bg-surface text-text-dim hover:text-neo transition-all">
                        <Plus size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
