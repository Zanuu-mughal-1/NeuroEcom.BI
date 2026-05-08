import { useState, useEffect } from 'react'
import { Activity, Settings, BarChart2, Package, Users, ShoppingCart, Megaphone, RotateCcw, Edit3, Save, X, RefreshCw, Target, Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react'
import { decisionsApi, mockRules } from '../../utils/api'
import { useData } from '../../context/DataContext'
import { toast } from 'react-hot-toast'

export default function Decisions() {
  const { isOnline, dbStatus } = useData()
  const [activeTab, setActiveTab] = useState('decisions')
  const [rules, setRules] = useState(mockRules)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [decisions, setDecisions] = useState([])
  const [actionMsg, setActionMsg] = useState(null)

  useEffect(() => {
    fetchData()
  }, [isOnline, categoryFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (isOnline) {
        const [rulesRes, logRes] = await Promise.all([
          decisionsApi.getRules(categoryFilter || undefined),
          decisionsApi.getAll()
        ])
        if (rulesRes.data) setRules(rulesRes.data)
        if (logRes.data) setDecisions(logRes.data)
      } else {
        setRules(mockRules)
        setDecisions([]) 
      }
    } catch (err) {
      console.error('Failed to fetch decision data:', err)
      toast.error('Data synchronization failed.')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (rule) => { setEditingId(rule.Id); setEditValue(rule.CurrentValue) }
  
  const saveEdit = async (id) => {
    if (!isOnline) {
      toast.error('Cannot update rules in simulation mode.')
      return
    }

    setActionLoading(true)
    try {
      await decisionsApi.updateRule(id, { newValue: editValue })
      toast.success('Core system rule updated!')
      fetchData()
      setEditingId(null)
    } catch (err) {
      toast.error('Sync failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const resetRule = async (id) => {
    if (!isOnline) {
      toast.error('Action restricted to live mode.')
      return
    }

    setActionLoading(true)
    try {
      await decisionsApi.resetRule(id)
      toast.success('Rule restored to factory defaults.')
      fetchData()
    } catch (err) {
      toast.error('Reset protocol failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredRules = rules.filter(r => !categoryFilter || r.Category === categoryFilter)
  const categories = ['Product', 'Customer', 'RTO', 'Ads']
  const catColors = { 
    Product: { bg: 'rgba(99,102,241,0.05)', text: '#818cf8', border: 'rgba(99,102,241,0.2)' }, 
    Customer: { bg: 'rgba(6,182,212,0.05)', text: '#22d3ee', border: 'rgba(6,182,212,0.2)' }, 
    RTO: { bg: 'rgba(139,92,246,0.05)', text: '#a78bfa', border: 'rgba(139,92,246,0.2)' }, 
    Ads: { bg: 'rgba(16,185,129,0.05)', text: '#34d399', border: 'rgba(16,185,129,0.2)' } 
  }
  const sectionIcons = { Products: Package, Customers: Users, Orders: ShoppingCart, Ads: Megaphone, Returns: RotateCcw }
  const sectionColors = { Products: '#818cf8', Customers: '#22d3ee', Orders: '#fbbf24', Ads: '#34d399', Returns: '#a78bfa' }

  const tabs = [
    { id: 'decisions', label: 'Decisions Log', icon: Activity },
    { id: 'rules', label: 'Rules Config', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ]

  const decisionTypeColors = {
    PriceDecrease: 'text-bloom', Flag: 'text-danger', Pause: 'text-ember',
    IncreaseInventory: 'text-pulse', Approve: 'text-bloom', StopSelling: 'text-danger',
  }

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-bloom animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-ember shadow-[0_0_10px_rgba(239,68,68,0.3)]'}`}></div>
          <div>
            <h1 className="text-xl font-black text-text-bright uppercase tracking-tighter">System Decision Core</h1>
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest opacity-60">
              {isOnline ? `Centralized Logic Node: ${dbStatus}` : 'Neural Simulation: Offline Mode'}
            </p>
          </div>
        </div>
        {(loading || actionLoading) && <RefreshCw size={14} className="animate-spin text-neo-bright" />}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-neo/20 text-neo-bright border border-neo/30 shadow-lg shadow-neo/5' : 'text-text-dim hover:text-text-mid'}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Decisions', value: decisions.length || '1,284', color: '#6366f1', bg: 'rgba(99,102,241,0.05)' },
          { label: 'System Uptime', value: '99.98%', color: '#10b981', bg: 'rgba(16,185,129,0.05)' },
          { label: 'Active Rules', value: rules.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.05)' },
          { label: 'Efficiency', value: '94.2%', color: '#22d3ee', bg: 'rgba(6,182,212,0.05)' },
        ].map(s => (
          <div key={s.label} className="card border border-border/50 bg-card/20 backdrop-blur-sm transition-transform hover:scale-[1.02]">
            <div className="stat-label text-[10px] uppercase font-black opacity-50 tracking-widest">{s.label}</div>
            <div className="text-xl font-bold mt-1" style={{ color: s.color, fontFamily: 'Bebas Neue', fontSize: '28px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Decisions Log Tab */}
      {activeTab === 'decisions' && (
        <div className="card !p-0 overflow-hidden border border-border/50 shadow-2xl bg-card/40">
          <div className="p-5 border-b border-border/50 flex items-center justify-between bg-white/[0.01]">
            <h3 className="text-sm font-bold text-text-bright uppercase tracking-tighter">Operational Protocol Log</h3>
            <div className="flex gap-2">
               {['Products', 'Customers', 'Ads'].map(f => (
                 <button key={f} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/50 text-text-dim hover:text-text-mid transition-all hover:bg-white/5">{f}</button>
               ))}
            </div>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
            {decisions.length > 0 ? decisions.map(d => {
              const Icon = sectionIcons[d.Section] || Activity
              const color = sectionColors[d.Section] || '#9ca3af'
              const typeColor = decisionTypeColors[d.DecisionType] || 'text-text-mid'
              return (
                <div key={d.Id} className="flex items-center gap-5 px-6 py-5 hover:bg-white/[0.02] transition-colors group">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-lg shadow-black/20"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${typeColor}`}>{d.DecisionType}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10"></span>
                      <span className="text-[9px] uppercase font-black text-text-dim tracking-[0.2em] opacity-40">{d.Section}</span>
                    </div>
                    <div className="text-sm font-bold text-text-bright mt-1 uppercase tracking-tight">{d.ItemName}</div>
                    <div className="text-[11px] text-text-dim mt-1 font-medium opacity-70 leading-relaxed">{d.DecisionDetails}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="badge text-[9px] font-black uppercase tracking-widest bg-bloom/10 text-bloom border border-bloom/20 px-2 py-1">SYNCHRONIZED</span>
                    <span className="text-[10px] font-mono text-text-dim opacity-50 uppercase">
                      {new Date(d.CreatedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            }) : (
              <div className="py-20 flex flex-col items-center justify-center opacity-20">
                <Activity size={48} className="text-text-dim mb-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Decision Records Detected</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rules Config Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button onClick={() => setCategoryFilter('')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${!categoryFilter ? 'bg-neo/20 text-neo-bright border border-neo/30 shadow-lg shadow-neo/5' : 'btn-ghost border border-border/50'}`}>
              Global Parameters
            </button>
            {categories.map(cat => {
              const c = catColors[cat]
              return (
                <button key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                  className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                  style={categoryFilter === cat
                    ? { background: c.bg, color: c.text, border: `1px solid ${c.border}`, boxShadow: `0 8px 16px ${c.text}10` }
                    : { background: 'rgba(255,255,255,0.02)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {cat} Protocol
                </button>
              )
            })}
          </div>

          {categories.filter(cat => !categoryFilter || cat === categoryFilter).map(cat => {
            const catRules = filteredRules.filter(r => r.Category === cat)
            if (!catRules.length) return null
            const c = catColors[cat]
            return (
              <div key={cat} className="card !p-0 overflow-hidden border border-border/50 shadow-xl bg-card/40">
                <div className="px-6 py-4 flex items-center gap-4 border-b border-border/50"
                  style={{ background: `${c.text}08` }}>
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.2)]" style={{ background: c.text, boxShadow: `0 0 15px ${c.text}60` }} />
                  <h3 className="font-bold text-sm uppercase tracking-[0.15em]" style={{ color: c.text }}>{cat} Optimization Matrix</h3>
                  <div className="ml-auto flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Operational Status:</span>
                     <span className="badge text-[9px] font-black uppercase tracking-widest" style={{ background: `${c.text}15`, color: c.text, border: `1px solid ${c.text}30` }}>
                        ACTIVE
                     </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <th className="table-header text-left">Neural Node</th>
                        <th className="table-header text-left">Heuristic Logic</th>
                        <th className="table-header text-center">Variable Score</th>
                        <th className="table-header text-center">Base Baseline</th>
                        <th className="table-header text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {catRules.map(rule => {
                        const isEditing = editingId === rule.Id
                        const isChanged = rule.CurrentValue !== rule.DefaultValue
                        return (
                          <tr key={rule.Id} className="table-row group hover:bg-white/[0.015] transition-colors">
                            <td className="table-cell">
                               <div className="font-bold text-text-bright text-xs uppercase tracking-tighter">{rule.RuleName}</div>
                               <div className="text-[8px] font-black text-text-dim opacity-30 mt-1 uppercase tracking-[0.2em]">NODE_ID: {rule.Id}</div>
                            </td>
                            <td className="table-cell text-text-dim text-[10px] font-medium leading-relaxed max-w-xs">{rule.Description}</td>
                            <td className="table-cell text-center">
                              {isEditing ? (
                                <div className="flex items-center justify-center">
                                  <input
                                    className="input w-24 text-center text-xs font-mono border-neo/50 !py-1.5 shadow-xl shadow-neo/10"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && saveEdit(rule.Id)}
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2 group/val">
                                   <span className={`font-mono font-bold text-sm px-4 py-1.5 rounded-xl cursor-pointer transition-all hover:scale-105 inline-block shadow-lg ${isChanged ? 'text-ember bg-ember/10 border border-ember/20 shadow-ember/5' : 'text-neo-bright bg-neo/10 border border-neo/20 shadow-neo/5'}`} onClick={() => startEdit(rule)}>
                                      {rule.CurrentValue}
                                   </span>
                                </div>
                              )}
                            </td>
                            <td className="table-cell text-center text-[10px] text-text-dim font-mono opacity-50 uppercase tracking-widest">{rule.DefaultValue}</td>
                            <td className="table-cell text-center">
                              <div className="flex gap-2 justify-center">
                                {isEditing ? (
                                  <>
                                    <button onClick={() => saveEdit(rule.Id)} className="btn-success text-[10px] font-black uppercase tracking-widest !py-1.5 !px-4 flex items-center gap-2 rounded-xl shadow-xl shadow-bloom/10">
                                      <Save size={12} /> SYNC
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="btn-ghost text-[10px] font-bold !py-1.5 !px-2.5 flex items-center justify-center rounded-xl border border-border/50">
                                      <X size={12} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => startEdit(rule)} className="w-8 h-8 flex items-center justify-center rounded-xl border border-border/50 text-text-dim hover:text-neo-bright hover:border-neo/40 transition-all hover:bg-neo/5">
                                      <Edit3 size={13} />
                                    </button>
                                    {isChanged && (
                                      <button onClick={() => resetRule(rule.Id)} className="w-8 h-8 flex items-center justify-center rounded-xl border border-border/50 text-ember/50 hover:text-ember hover:border-ember/40 transition-all hover:bg-ember/5">
                                        <RefreshCw size={13} className={actionLoading ? 'animate-spin' : ''} />
                                      </button>
                                    )}
                                  </>
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
            )
          })}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card border border-border/50 shadow-2xl bg-card/40">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-sm font-bold text-text-bright uppercase tracking-tighter">Logic Distribution</h3>
                  <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest opacity-50">Decision weighting by module</p>
               </div>
               <Activity size={18} className="text-neo-bright opacity-50" />
            </div>
            <div className="space-y-6">
              {[
                { section: 'Products', count: 487, pct: 38, color: '#818cf8' },
                { section: 'Customers', count: 312, pct: 24, color: '#22d3ee' },
                { section: 'Orders', count: 289, pct: 22, color: '#fbbf24' },
                { section: 'Ads', count: 196, pct: 16, color: '#34d399' },
              ].map(s => (
                <div key={s.section} className="group">
                  <div className="flex justify-between text-[10px] mb-2 font-black tracking-widest uppercase">
                    <span className="text-text-dim">{s.section} Core</span>
                    <span style={{ color: s.color }}>{s.count} VECTORS</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-white/[0.02] border border-white/[0.05] p-[1px]">
                    <div className="h-full rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.color}66, ${s.color})` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card border border-border/50 shadow-2xl bg-card/40">
             <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-sm font-bold text-text-bright uppercase tracking-tighter">Heuristic Performance</h3>
                  <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest opacity-50">Agent success rate monitoring</p>
               </div>
               <Target size={18} className="text-bloom opacity-50" />
            </div>
            <div className="space-y-6">
              {[
                { type: 'Price Optimization', success: 94, total: 128, color: '#10b981' },
                { type: 'Inventory Automation', success: 98, total: 89, color: '#10b981' },
                { type: 'Fraud Mitigation', success: 87, total: 156, color: '#f59e0b' },
                { type: 'Budget Allocation', success: 82, total: 73, color: '#f59e0b' },
                { type: 'Product Termination', success: 91, total: 44, color: '#10b981' },
              ].map(s => (
                <div key={s.type}>
                  <div className="flex justify-between text-[10px] mb-2 font-black tracking-widest uppercase">
                    <span className="text-text-dim">{s.type}</span>
                    <span style={{ color: s.color }}>{s.success}% ACCURACY</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-white/[0.02]">
                    <div className="h-full rounded-full transition-all duration-[2000ms] ease-in-out" style={{ width: `${s.success}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
