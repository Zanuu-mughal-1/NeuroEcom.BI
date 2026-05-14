import { useState, useEffect, useRef } from 'react'
import { Shield, RotateCcw, Search, CheckCircle, XCircle, Clock, DollarSign, Zap, AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { returnApi, rtoApi, decisionsApi, mockReturns, mockRules } from '../../utils/api'
import { useData } from '../../context/DataContext'

export default function Returns() {
  const { isOnline } = useData()
  const [activeTab, setActiveTab] = useState('returns')
  const [returns, setReturns] = useState(mockReturns)
  const [rules, setRules] = useState(mockRules.filter(r => r.Category === 'RTO'))
  const [rtoInput, setRtoInput] = useState({ orderValue: 250, paymentMethod: 'COD', customerId: '' })
  const [rtoResult, setRtoResult] = useState(null)
  const [editingRule, setEditingRule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState(null)
  const msgTimer = useRef(null)

  const showMsg = (type, text) => {
    if (msgTimer.current) clearTimeout(msgTimer.current)
    setActionMsg({ type, text })
    msgTimer.current = setTimeout(() => setActionMsg(null), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (isOnline) {
        const [retRes, ruleRes] = await Promise.all([
          returnApi.getAll(),
          decisionsApi.getRules('RTO')
        ])
        if (retRes.data) setReturns(retRes.data)
        if (ruleRes.data) setRules(ruleRes.data)
      } else {
        setReturns(mockReturns)
        setRules(mockRules.filter(r => r.Category === 'RTO'))
      }
    } catch (err) {
      console.error("Fetch returns/rules failed:", err)
      showMsg('error', 'Failed to sync with database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [isOnline])

  const testRTO = async () => {
    if (!isOnline) {
      let score = 0
      const triggered = []
      if (rtoInput.paymentMethod === 'COD') { score += 15; triggered.push('COD payment (+15 pts)') }
      if (+rtoInput.orderValue > 500) { score += 20; triggered.push('High value order >Rs500 (+20 pts)') }
      if (new Date().getDay() === 5 || new Date().getDay() === 6) { score += 10; triggered.push('Weekend order (+10 pts)') }
      score = Math.min(100, score)
      const decision = score <= 20 ? 'Auto-Approved' : score <= 50 ? 'Manual Review' : score <= 80 ? 'Additional Verification' : 'Auto-Rejected'
      setRtoResult({ score, decision, triggered })
      return
    }

    setLoading(true)
    try {
      const res = await rtoApi.testOrder({
        orderValue: parseFloat(rtoInput.orderValue),
        paymentMethod: rtoInput.paymentMethod,
        customerId: rtoInput.customerId ? parseInt(rtoInput.customerId) : null
      })
      setRtoResult(res.data)
    } catch (err) {
      showMsg('error', 'RTO assessment failed')
    } finally {
      setLoading(false)
    }
  }

  const updateRuleValue = async (id, value) => {
    if (!isOnline) {
      setRules(prev => prev.map(r => r.Id === id ? { ...r, CurrentValue: value } : r))
      return
    }
    try {
      await decisionsApi.updateRule(id, { newValue: value })
      setRules(prev => prev.map(r => r.Id === id ? { ...r, CurrentValue: value } : r))
      showMsg('success', 'Rule updated')
    } catch (err) {
      showMsg('error', 'Failed to update rule')
    }
  }

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

      <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-neo/20 text-neo-bright border border-neo/30' : 'text-text-dim hover:text-text-mid'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Returns', value: returns.length, icon: RotateCcw, bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
          { label: 'Return Rate', value: '12.4%', icon: XCircle, bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
          { label: 'Pending Review', value: returns.filter(r => r.Status === 'Pending').length, icon: Clock, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
          { label: 'Refund Amount', value: `Rs${returns.reduce((s, r) => s + (r.RefundAmount || 0), 0).toFixed(2)}`, icon: DollarSign, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="stat-label text-xs text-text-dim uppercase tracking-wider font-bold">{s.label}</div>
              <div className="text-xl font-bold text-text-white mt-0.5">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {activeTab === 'returns' && (
        <div className="card !p-0 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border/50">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              <input className="input pl-9" placeholder="Search returns..." />
            </div>
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
                {returns.map(r => {
                  const s = statusStyles[r.Status] || statusStyles.Pending
                  return (
                    <tr key={r.Id} className="table-row">
                      <td className="table-cell font-mono text-neo-bright text-sm">{r.ReturnNumber}</td>
                      <td className="table-cell text-sm text-text-bright">{r.Customer?.FirstName} {r.Customer?.LastName}</td>
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
                          <button className="btn-success text-xs !py-1 !px-2">✓</button>
                          <button className="btn-danger text-xs !py-1 !px-2">✗</button>
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

      {activeTab === 'rto' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
                <Shield size={16} className="text-neo" />
              </div>
              <div>
                <div className="section-title text-text-bright font-bold">RTO Shield — Test Order</div>
                <div className="section-subtitle text-xs text-text-dim">Assess risk before fulfillment</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="stat-label mb-1 block text-xs font-bold uppercase text-text-dim">Order Value (Rs)</label>
                <input type="number" className="input w-full bg-void border-border text-text-bright" value={rtoInput.orderValue}
                  onChange={e => setRtoInput(p => ({ ...p, orderValue: e.target.value }))} />
              </div>
              <div>
                <label className="stat-label mb-1 block text-xs font-bold uppercase text-text-dim">Payment Method</label>
                <select className="select w-full bg-void border-border text-text-bright" value={rtoInput.paymentMethod}
                  onChange={e => setRtoInput(p => ({ ...p, paymentMethod: e.target.value }))}>
                  <option value="COD">COD</option>
                  <option value="UPI">UPI</option>
                  <option value="CreditCard">Credit Card</option>
                  <option value="NetBanking">Net Banking</option>
                </select>
              </div>
              <div>
                <label className="stat-label mb-1 block text-xs font-bold uppercase text-text-dim">Customer ID (optional)</label>
                <input className="input w-full bg-void border-border text-text-bright" placeholder="Enter customer ID..." value={rtoInput.customerId}
                  onChange={e => setRtoInput(p => ({ ...p, customerId: e.target.value }))} />
              </div>
              <button onClick={testRTO} className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase tracking-widest">
                <Shield size={15} /> Run RTO Assessment
              </button>
            </div>
          </div>

          <div className="card flex flex-col">
            <div className="section-title mb-5 text-text-bright font-bold">Assessment Result</div>
            {rtoResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-5 p-4 rounded-xl" style={{
                  background: rtoResult.score <= 20 ? 'rgba(16,185,129,0.08)' : rtoResult.score <= 50 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${rtoResult.score <= 20 ? 'rgba(16,185,129,0.2)' : rtoResult.score <= 50 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`
                }}>
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke={rtoResult.score <= 20 ? '#10b981' : rtoResult.score <= 50 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="2.5" strokeDasharray={`${rtoResult.score} 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-text-white">{rtoResult.score}</span>
                    </div>
                  </div>
                  <div>
                    <div className="stat-label text-xs text-text-dim uppercase font-bold">Risk Decision</div>
                    <div className={`text-xl font-bold mt-1 ${rtoResult.score <= 20 ? 'text-bloom' : rtoResult.score <= 50 ? 'text-ember' : 'text-danger'}`}>
                      {rtoResult.decision}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="stat-label mb-2 text-xs text-text-dim uppercase font-bold">Triggered Rules</div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {rtoResult.triggered && rtoResult.triggered.length > 0 ? rtoResult.triggered.map((rule, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-ember"
                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', borderLeft: '3px solid #f59e0b' }}>
                        <AlertTriangle size={13} className="flex-shrink-0" /> {rule}
                      </div>
                    )) : (
                      <div className="flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-bloom"
                        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderLeft: '3px solid #10b981' }}>
                        <CheckCircle size={13} className="flex-shrink-0" /> ALL RISK PROTOCOLS PASSED
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="btn-success flex-1 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest py-3 rounded-xl">
                    <CheckCircle size={14} /> Override Approve
                  </button>
                  <button className="btn-danger flex-1 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest py-3 rounded-xl">
                    <XCircle size={14} /> Hold Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 h-48 text-center opacity-20">
                <Shield size={48} className="text-text-dim mb-3" />
                <div className="text-xs font-black uppercase tracking-widest text-text-dim">
                  Awaiting system input to initiate assessment protocol
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="card !p-0 overflow-hidden border border-border/50 shadow-lg">
          <div className="p-5 border-b border-border/50 bg-abyss/50">
            <div className="section-title text-text-bright font-bold">System Risk Parameters</div>
            <div className="section-subtitle mt-0.5 text-xs text-text-dim uppercase tracking-widest">Global tuning for automated risk assessment</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-abyss border-b border-border">
                  <th className="table-header text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim">Rule Name</th>
                  <th className="table-header text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim">Description</th>
                  <th className="table-header text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim">Current Value</th>
                  <th className="table-header text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim">Default</th>
                  <th className="table-header text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rules.map(rule => (
                  <tr key={rule.Id} className="table-row">
                    <td className="table-cell px-4 py-3 font-bold text-text-bright text-xs uppercase tracking-tighter">{rule.RuleName}</td>
                    <td className="table-cell px-4 py-3 text-text-dim text-xs leading-relaxed max-w-xs">{rule.Description}</td>
                    <td className="table-cell text-center px-4 py-3">
                      {editingRule === rule.Id ? (
                        <input
                          className="input w-20 text-center text-xs font-mono !py-1 bg-void border-border text-text-bright"
                          defaultValue={rule.CurrentValue}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { updateRuleValue(rule.Id, e.target.value); setEditingRule(null) }
                          }}
                          onBlur={e => { updateRuleValue(rule.Id, e.target.value); setEditingRule(null) }}
                          autoFocus
                        />
                      ) : (
                        <span className="badge-neo font-mono cursor-pointer" onClick={() => setEditingRule(rule.Id)}>
                          {rule.CurrentValue}
                        </span>
                      )}
                    </td>
                    <td className="table-cell text-center px-4 py-3">
                      <span className="text-xs text-text-dim font-mono">{rule.DefaultValue}</span>
                    </td>
                    <td className="table-cell text-center px-4 py-3">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => setEditingRule(rule.Id)} className="btn-ghost text-[10px] font-bold uppercase tracking-widest !py-1 !px-2">Edit</button>
                        <button onClick={() => updateRuleValue(rule.Id, rule.DefaultValue)} className="btn-ghost text-[10px] font-bold uppercase tracking-widest !py-1 !px-2">Reset</button>
                      </div>
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
