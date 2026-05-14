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
        api.get('/returns'),
        api.get('/rto/logs'),
        api.get('/decisions/rules?category=RTO'),
        api.get('/returns/analytics')
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
      setRtoResult(data)
      fetchData()
    } catch (err) {
      console.error('RTO assessment failed', err)
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
    Refunded: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', color: '#a78bfa' },
  }

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      <ReturnModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchData} />

      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-neo/20 text-neo-bright border border-neo/30' : 'text-text-dim hover:text-text-mid'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
        <button onClick={fetchData} className="btn-ghost !p-2"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Returns', value: returns.length, icon: RotateCcw, bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
          { label: 'Return Rate', value: `${metrics?.returnRate || 0}%`, icon: AlertTriangle, bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
          { label: 'Pending Review', value: returns.filter(r => r.Status === 'Pending').length, icon: Clock, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
          { label: 'Refund Amount', value: `Rs ${returns.reduce((s, r) => s + (r.RefundAmount || 0), 0).toFixed(0)}`, icon: DollarSign, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
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

      {/* Returns List Tab */}
      {activeTab === 'returns' && (
        <div className="card !p-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between p-4 border-b border-border gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[300px]">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <input className="input pl-9 w-full" placeholder="Search returns by ID or Customer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <select className="select w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 text-xs">
              <Plus size={14} /> New Return Request
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--border-color)' }}>
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
                  <tr><td colSpan="8" className="py-10 text-center text-text-dim">No matching returns found</td></tr>
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
                        <div className="text-sm text-text-bright">{r.Product?.Name}</div>
                        <div className="text-xs text-text-dim">{r.Product?.SKU}</div>
                      </td>
                      <td className="table-cell text-center">
                        <span className="badge-dim text-xs">{r.ReturnReason}</span>
                      </td>
                      <td className="table-cell text-right font-semibold text-text-white">
                        Rs {r.RefundAmount?.toFixed(2) || '—'}
                      </td>
                      <td className="table-cell text-center">
                        <span className="badge text-xs font-medium" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {r.Status}
                        </span>
                      </td>
                      <td className="table-cell text-right text-xs text-text-dim">
                        {new Date(r.RequestDate).toLocaleDateString()}
                      </td>
                      <td className="table-cell text-center">
                        <div className="flex gap-1 justify-center">
                          {r.Status === 'Pending' && (
                            <>
                              <button onClick={() => handleReturnAction(r.Id, 'Approve')} className="btn-success !p-1.5" title="Approve"><CheckCircle size={14} /></button>
                              <button onClick={() => handleReturnAction(r.Id, 'Reject', 'Policy Violation')} className="btn-danger !p-1.5" title="Reject"><XCircle size={14} /></button>
                            </>
                          )}
                          {r.Status === 'Approved' && (
                            <button onClick={() => handleReturnAction(r.Id, 'Refund', 50)} className="btn-primary text-xs !py-1">Process Refund</button>
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Risk Assessment Engine */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Shield size={16} className="text-neo" />
                </div>
                <div>
                  <div className="section-title">RTO Shield — Test Order</div>
                  <div className="section-subtitle">Assess risk before fulfillment</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="stat-label mb-1.5 block">Order Value (Rs)</label>
                    <input type="number" className="input w-full" value={rtoInput.orderValue}
                      onChange={e => setRtoInput(p => ({ ...p, orderValue: e.target.value }))} />
                  </div>
                  <div>
                    <label className="stat-label mb-1.5 block">Customer ID (optional)</label>
                    <input className="input w-full" placeholder="Existing user ID..." value={rtoInput.customerId}
                      onChange={e => setRtoInput(p => ({ ...p, customerId: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="stat-label mb-1.5 block">Payment Method</label>
                    <select className="select w-full" value={rtoInput.paymentMethod}
                      onChange={e => setRtoInput(p => ({ ...p, paymentMethod: e.target.value }))}>
                      <option value="COD">COD (Cash on Delivery)</option>
                      <option value="UPI">UPI</option>
                      <option value="CreditCard">Credit Card</option>
                      <option value="NetBanking">Net Banking</option>
                    </select>
                  </div>
                  <div className="pt-6">
                    <button onClick={runRTOAssessment} disabled={assessing} className="btn-primary w-full flex items-center justify-center gap-2">
                      {assessing ? <RefreshCw size={15} className="animate-spin" /> : <Shield size={15} />}
                      Assess Order Risk
                    </button>
                  </div>
                </div>
              </div>

              {/* Assessment Results */}
              <div className={`p-5 rounded-xl border transition-all ${!rtoResult ? 'bg-void/10 border-dashed border-border' : 'bg-bg-secondary shadow-card border-border'}`}>
                {rtoResult ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.9" fill="none"
                              stroke={rtoResult.score <= 20 ? '#10b981' : rtoResult.score <= 50 ? '#f59e0b' : '#ef4444'}
                              strokeWidth="3" strokeDasharray={`${rtoResult.score} 100`} strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text-white">{rtoResult.score}</div>
                        </div>
                        <div>
                          <div className="stat-label">Decision Recommendation</div>
                          <div className={`text-xl font-bold ${rtoResult.score <= 20 ? 'text-bloom' : rtoResult.score <= 50 ? 'text-ember' : 'text-danger'}`}>
                            {rtoResult.decision}
                          </div>
                        </div>
                      </div>
                      <div className="badge-dim px-3 py-1 flex items-center gap-1">
                        <Zap size={12} className="text-neo" /> AI Powered
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="stat-label">Next Best Action (Decision Engine)</div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-neo/5 border border-neo/20">
                        <ArrowRight size={14} className="text-neo" />
                        <span className="text-sm font-medium text-text-bright">
                          {rtoResult.score > 50 ? "Recommend blocking COD for this customer and flagging the account." : "Safe to fulfill immediately with priority shipping."}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="stat-label">Triggered Risk Rules</div>
                      <div className="flex flex-wrap gap-2">
                        {rtoResult.triggeredRules?.map((rule, i) => (
                          <span key={i} className="px-2 py-1 bg-danger/5 text-danger border border-danger/20 rounded-md text-[10px] font-semibold">
                            {rule}
                          </span>
                        )) || <span className="text-xs text-text-dim italic">No rules triggered</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-30">
                    <Shield size={32} className="mb-2" />
                    <p className="text-xs">Input order details to run AI assessment</p>
                  </div>
                )}
              </div>
            </div>

            {/* RTO History Logs */}
            <div className="card !p-0 flex flex-col">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-text-mid" />
                  <span className="font-bold text-text-white">RTO Audit Trail</span>
                </div>
                <span className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Latest Logs</span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[480px]">
                {rtoLogs.length === 0 ? (
                  <div className="p-10 text-center text-text-dim text-xs">No RTO logs available</div>
                ) : rtoLogs.map(log => (
                  <div key={log.Id} className="p-4 border-b border-border/40 hover:bg-white/5 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-mono text-neo">ORD-{log.OrderId || '???'}</div>
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.Status === 'Returned' ? 'bg-danger/10 text-danger' : 'bg-ember/10 text-ember'}`}>
                        {log.Status}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-text-bright mb-1">{log.Customer?.FirstName} {log.Customer?.LastName}</div>
                    <div className="text-xs text-text-dim flex items-center gap-4">
                      <span>Attempts: <b className="text-text-mid">{log.DeliveryAttempts}</b></span>
                      <span>Reason: <b className="text-text-mid truncate">{log.FailureReason || 'N/A'}</b></span>
                    </div>
                    <div className="mt-2 text-[10px] text-text-dim italic">{new Date(log.CreatedAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RTO Rules Tab */}
      {activeTab === 'rules' && (
        <div className="card !p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="section-title">Risk Scoring Parameters</div>
            <div className="section-subtitle mt-0.5">Control how the Shield system calculates fraud scores</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--border-color)' }}>
                  <th className="table-header text-left">Rule Context</th>
                  <th className="table-header text-left">Rule Logic</th>
                  <th className="table-header text-center">Weight/Value</th>
                  <th className="table-header text-center">Baseline</th>
                  <th className="table-header text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.Id} className="table-row">
                    <td className="table-cell font-bold text-text-bright">{rule.RuleName}</td>
                    <td className="table-cell text-text-dim text-xs leading-relaxed">{rule.Description}</td>
                    <td className="table-cell text-center">
                      {editingRule === rule.Id ? (
                        <input className="input w-24 text-center text-sm font-bold" defaultValue={rule.CurrentValue}
                          onBlur={e => updateRule(rule.Id, e.target.value)} autoFocus />
                      ) : (
                        <span className="badge-neo font-mono cursor-pointer hover:scale-105 transition-transform" onClick={() => setEditingRule(rule.Id)}>
                          {rule.CurrentValue}
                        </span>
                      )}
                    </td>
                    <td className="table-cell text-center font-mono text-xs text-text-dim">{rule.DefaultValue}</td>
                    <td className="table-cell text-center">
                      <button onClick={() => setEditingRule(rule.Id)} className="text-neo hover:text-neo-bright transition-colors">
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
