import { useState, useEffect } from 'react'
import { Activity, Settings, BarChart2, Package, Users, ShoppingCart, Megaphone, RotateCcw, Edit3, Save, X, RefreshCw } from 'lucide-react'
import api from '../../utils/api'

export default function Decisions() {
  const [activeTab, setActiveTab] = useState('decisions')
  const [rules, setRules] = useState([])
  const [decisions, setDecisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [decisionFilter, setDecisionFilter] = useState('All')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [decRes, rulesRes] = await Promise.all([
        api.get('/decisions'),
        api.get('/decisions/rules')
      ])
      setDecisions(decRes.data)
      setRules(rulesRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredRules = rules.filter(r => !categoryFilter || r.Category === categoryFilter)

  const categories = ['Product', 'Customer', 'RTO', 'Ads']
  const catColors = { Product: { bg: 'rgba(0,234,255,0.1)', text: '#67f4ff', border: 'rgba(0,234,255,0.2)' }, Customer: { bg: 'rgba(6,182,212,0.1)', text: '#22d3ee', border: 'rgba(6,182,212,0.2)' }, RTO: { bg: 'rgba(56,189,248,0.1)', text: '#93c5fd', border: 'rgba(56,189,248,0.2)' }, Ads: { bg: 'rgba(16,185,129,0.1)', text: '#34d399', border: 'rgba(16,185,129,0.2)' } }
  const sectionIcons = { Products: Package, Product: Package, Customers: Users, Customer: Users, Orders: ShoppingCart, Ads: Megaphone, Returns: RotateCcw }
  const sectionColors = { Products: '#67f4ff', Product: '#67f4ff', Customers: '#22d3ee', Customer: '#22d3ee', Orders: '#fbbf24', Ads: '#34d399', Returns: '#93c5fd' }
  const decisionSections = ['All', ...Array.from(new Set(decisions.map(d => d.Section).filter(Boolean)))]
  const filteredAnalyticsDecisions = decisionFilter === 'All' ? decisions : decisions.filter(d => d.Section === decisionFilter)
  const appliedStatuses = new Set(['Applied', 'Executed', 'Completed', 'Confirmed', 'Approved'])
  const appliedDecisionCount = decisions.filter(d => appliedStatuses.has(d.Status || 'Applied')).length
  const appliedRate = decisions.length ? Math.round((appliedDecisionCount / decisions.length) * 100) : 0
  const thisWeekCount = decisions.filter(d => new Date(d.CreatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  const latestDecision = decisions
    .filter(d => d.CreatedAt)
    .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))[0]
  const optimizedRulesCount = rules.filter(r => r.CurrentValue !== r.DefaultValue).length
  const volumeBySection = Object.entries(
    decisions.reduce((acc, d) => {
      const section = d.Section || 'Uncategorized'
      acc[section] = (acc[section] || 0) + 1
      return acc
    }, {})
  ).map(([section, count]) => ({ section, count, color: sectionColors[section] || '#9ca3af' }))
  const decisionTypeVolume = Object.entries(
    filteredAnalyticsDecisions.reduce((acc, d) => {
      const type = d.DecisionType || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
  )
    .map(([rule, triggers]) => ({ rule, triggers }))
    .sort((a, b) => b.triggers - a.triggers)
    .slice(0, 6)
  const successByType = Object.values(
    filteredAnalyticsDecisions.reduce((acc, d) => {
      const type = d.DecisionType || 'Unknown'
      if (!acc[type]) acc[type] = { type, section: d.Section || 'General', success: 0, total: 0, color: sectionColors[d.Section] || '#10b981' }
      acc[type].total += 1
      if (appliedStatuses.has(d.Status || 'Applied')) acc[type].success += 1
      return acc
    }, {})
  ).sort((a, b) => b.total - a.total)
  const liveImpactData = filteredAnalyticsDecisions.slice(0, 8).map(d => {
    const score = appliedStatuses.has(d.Status || 'Applied') ? 100 : 65
    return {
      id: d.Id,
      section: d.Section || 'General',
      decision: d.ItemName ? `${d.DecisionType}: ${d.ItemName}` : d.DecisionType || 'Decision',
      impact: d.Status || 'Applied',
      metric: d.AppliedBy ? `By ${d.AppliedBy}` : 'Live DB',
      score,
      status: appliedStatuses.has(d.Status || 'Applied') ? 'positive' : 'neutral'
    }
  })

  const startEdit = (rule) => { setEditingId(rule.Id); setEditValue(rule.CurrentValue) }
  const saveEdit = async (id) => {
    try {
      await api.put(`/decisions/rules/${id}`, { newValue: editValue })
      setRules(prev => prev.map(r => r.Id === id ? { ...r, CurrentValue: editValue } : r))
      setEditingId(null)
    } catch (err) {
      console.error(err)
    }
  }
  const resetRule = async (id) => {
    try {
      await api.post(`/decisions/rules/${id}/reset`)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

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
    <div className="p-6 space-y-5 animate-fade-up">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-surface border border-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-neo/20 text-neo-bright border border-neo/30' : 'text-text-dim hover:text-text-mid'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[ 
          { label: 'Total Decisions', value: loading ? '...' : decisions.length.toLocaleString(), color: '#00eaff', bg: 'rgba(0,234,255,0.1)' },
          { label: 'This Week', value: loading ? '...' : thisWeekCount.toLocaleString(), color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Active Rules', value: loading ? '...' : rules.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Applied Rate', value: loading ? '...' : `${appliedRate}%`, color: '#22d3ee', bg: 'rgba(6,182,212,0.1)' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="stat-label">{s.label}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: s.color, fontFamily: 'Bebas Neue', fontSize: '28px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Decisions Log Tab */}
      {activeTab === 'decisions' && (
        <div className="card !p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="section-title">All Decisions</div>
            <div className="flex gap-2">
              {decisionSections.map(f => (
                <button
                  key={f}
                  onClick={() => setDecisionFilter(f)}
                  className={`btn-ghost text-xs !py-1 !px-2 transition-all ${decisionFilter === f ? 'bg-neo/20 text-neo-bright border border-neo/30' : ''}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {(() => {
              if (loading) return <div className="py-12 text-center text-text-dim"><RefreshCw className="animate-spin inline-block mr-2" size={16}/> Loading decisions...</div>
              
              const filteredDecisions = decisionFilter === 'All'
                ? decisions
                : decisions.filter(d => d.Section === decisionFilter);

              if (filteredDecisions.length === 0) return <div className="py-12 text-center text-text-dim">No decisions logged.</div>

              return filteredDecisions.map(d => {
                const Icon = sectionIcons[d.Section] || Activity
                const color = sectionColors[d.Section] || '#9ca3af'
                const typeColor = decisionTypeColors[d.DecisionType] || 'text-text-mid'
                return (
                  <div key={d.Id} className="flex items-center gap-4 px-5 py-4 hover:bg-abyss transition-colors animate-fade-in">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
                      <Icon size={15} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${typeColor}`}>{d.DecisionType}</span>
                        <span className="text-text-dim text-xs">·</span>
                        <span className="text-xs text-text-dim">{d.Section}</span>
                      </div>
                      <div className="text-sm font-medium text-text-bright mt-0.5">{d.ItemName}</div>
                      <div className="text-xs text-text-dim truncate mt-0.5">{d.DecisionDetails}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="badge-bloom text-xs">{d.Status}</span>
                      <span className="text-xs text-text-dim">
                        {new Date(d.CreatedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

      {/* Rules Config Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-5">
          {/* Category Filter */}
          <div className="flex gap-2">
            <button onClick={() => setCategoryFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!categoryFilter ? 'bg-neo/20 text-neo-bright border border-neo/30' : 'btn-ghost'}`}>
              All Rules
            </button>
            {categories.map(cat => {
              const c = catColors[cat]
              return (
                <button key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={categoryFilter === cat
                    ? { background: c.bg, color: c.text, border: `1px solid ${c.border}` }
                    : { background: 'var(--surface)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
                  {cat}
                </button>
              )
            })}
          </div>

          {categories.filter(cat => !categoryFilter || cat === categoryFilter).map(cat => {
            const catRules = filteredRules.filter(r => r.Category === cat)
            if (!catRules.length) return null
            const c = catColors[cat]
            return (
              <div key={cat} className="card !p-0 overflow-hidden">
                <div className="px-5 py-3 flex items-center gap-3 border-b border-border"
                  style={{ background: c.bg }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: c.text, boxShadow: `0 0 6px ${c.text}` }} />
                  <span className="font-semibold text-sm" style={{ color: c.text }}>{cat} Rules</span>
                  <span className="badge text-xs ml-auto" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                    {catRules.length} rules
                  </span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-abyss border-b border-border">
                      <th className="table-header text-left">Rule Name</th>
                      <th className="table-header text-left">Rule Description</th>
                      <th className="table-header text-left">Active Threshold</th>
                      <th className="table-header text-center">Default</th>
                      <th className="table-header text-center">Status</th>
                      <th className="table-header text-center">Edit Logic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catRules.map(rule => {
                      const isEditing = editingId === rule.Id
                      const isChanged = rule.CurrentValue !== rule.DefaultValue
                      return (
                        <tr key={rule.Id} className="table-row">
                          <td className="table-cell font-medium text-text-bright">{rule.RuleName}</td>
                          <td className="table-cell">
                            <span className="text-xs text-text-mid italic">{rule.Description}</span>
                          </td>
                          <td className="table-cell">
                            {isEditing ? (
                              <input
                                className="input w-24 text-center text-xs !py-1 inline-block border-neo/40 focus:border-neo bg-neo/5"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveEdit(rule.Id)}
                                autoFocus
                              />
                            ) : (
                              <span className={`font-bold px-2 py-1 rounded ${isChanged ? 'text-ember bg-ember/10' : 'text-neo-bright bg-neo/10'}`}>
                                {rule.CurrentValue}
                              </span>
                            )}
                          </td>
                          <td className="table-cell text-center text-[10px] text-text-dim font-mono">{rule.DefaultValue}</td>
                          <td className="table-cell text-center">
                            {isChanged
                              ? <span className="badge-ember text-[10px]">Optimized</span>
                              : <span className="text-[10px] text-text-dim">Standard</span>}
                          </td>
                          <td className="table-cell text-center">
                            <div className="flex gap-1 justify-center">
                              {isEditing ? (
                                <>
                                  <button onClick={() => saveEdit(rule.Id)} className="btn-success text-[10px] !py-1 !px-2">
                                    <Save size={10} />
                                  </button>
                                  <button onClick={() => setEditingId(null)} className="btn-ghost text-[10px] !py-1 !px-2">
                                    <X size={10} />
                                  </button>
                                </>
                              ) : (
                                <button onClick={() => startEdit(rule)} className="btn-ghost text-[10px] !py-1 !px-2 flex items-center gap-1">
                                  <Edit3 size={10} /> Modify
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
            )
          })}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Row: Compact Breakdown & Most Triggered */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:col-span-2">
            <div className="card">
              <div className="section-title mb-4">Volume by Section</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { section: 'Products', count: 487, color: '#67f4ff' },
                  { section: 'Customers', count: 312, color: '#22d3ee' },
                  { section: 'Orders', count: 289, color: '#fbbf24' },
                  { section: 'Ads', count: 196, color: '#34d399' },
                ].map(s => (
                  <div key={s.section} className="p-2 rounded-lg bg-abyss border border-border">
                    <div className="text-[10px] text-text-dim uppercase font-bold">{s.section}</div>
                    <div className="text-lg font-bold" style={{ color: s.color }}>{s.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card lg:col-span-2">
              <div className="section-title mb-4">Most Triggered Rules</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { rule: 'Low Stock Alert', triggers: 342, color: '#f59e0b' },
                  { rule: 'High Return Flag', triggers: 218, color: '#ef4444' },
                  { rule: 'COD Penalty (RTO)', triggers: 189, color: '#93c5fd' },
                  { rule: 'VIP Tier Upgrade', triggers: 134, color: '#67f4ff' },
                  { rule: 'Pause Ad ROI', triggers: 97, color: '#10b981' },
                  { rule: 'Price Drop Rule', triggers: 84, color: '#34d399' },
                ].map(r => (
                  <div key={r.rule} className="flex items-center justify-between p-2 rounded-lg bg-abyss">
                    <span className="text-xs text-text-mid truncate">{r.rule}</span>
                    <span className="text-xs font-bold" style={{ color: r.color }}>{r.triggers}×</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Row: Success Rate & AI Health */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="section-title">Decision Success Rate</div>
              <div className="text-[10px] text-bloom font-bold bg-bloom/10 px-2 py-0.5 rounded">91.2% Avg</div>
            </div>
            <div className="space-y-4">
              {(() => {
                const successData = [
                  { type: 'Price Change', section: 'Products', success: 94, total: 128, color: '#10b981' },
                  { type: 'Inventory Restock', section: 'Products', success: 98, total: 89, color: '#10b981' },
                  { type: 'Customer Flag', section: 'Customers', success: 87, total: 156, color: '#f59e0b' },
                  { type: 'Ad Pause/Resume', section: 'Ads', success: 82, total: 73, color: '#f59e0b' },
                  { type: 'Stop Selling', section: 'Products', success: 91, total: 44, color: '#10b981' },
                ];

                const filtered = decisionFilter === 'All'
                  ? successData
                  : successData.filter(d => d.section === decisionFilter);

                if (filtered.length === 0) return <div className="py-10 text-center text-text-dim text-xs italic">No data for this category.</div>;

                return filtered.map(s => {
                  const rate = Math.round((s.success / s.total) * 100);
                  return (
                    <div key={s.type} className="group">
                      <div className="flex justify-between items-end mb-1">
                        <div className="text-xs font-semibold text-text-bright">{s.type}</div>
                        <div className="text-right">
                          <span className="text-xs font-black text-text-bright">{rate}% </span>
                          <span className="text-[9px] text-text-dim font-mono">({s.success}/{s.total})</span>
                        </div>
                      </div>
                      <div className="h-1 bg-abyss rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${rate}%`, background: s.color, boxShadow: `0 0 8px ${s.color}40` }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="card">
            <div className="section-title mb-4">AI Model Health</div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-neo/5 border border-neo/20">
                <div className="flex items-center gap-3">
                  <Activity size={18} className="text-neo-bright animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-text-bright">Real-time Processing</div>
                    <div className="text-[10px] text-text-dim">Latency: 124ms</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-bloom">Operational</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-abyss border border-border">
                  <div className="text-[10px] text-text-dim uppercase font-bold mb-1">Drift Score</div>
                  <div className="text-lg font-bold text-text-bright">0.02</div>
                  <div className="text-[9px] text-bloom font-medium">Stable</div>
                </div>
                <div className="p-3 rounded-xl bg-abyss border border-border">
                  <div className="text-[10px] text-text-dim uppercase font-bold mb-1">Re-train Due</div>
                  <div className="text-lg font-bold text-text-bright">14d</div>
                  <div className="text-[9px] text-text-dim font-medium">12 May 2026</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="section-title">Impact Analysis (Deep Dive)</div>
              <div className="text-[10px] text-text-dim bg-abyss border border-border px-2 py-1 rounded">Last 30 Days Data</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const impactData = [
                  { section: 'Products', decision: 'Price Drop: Wireless Mouse', impact: '+150%', metric: 'Sales Vol.', score: 92, status: 'positive' },
                  { section: 'Products', decision: 'Inventory: Gaming KB', impact: '+Rs 4.2k', metric: 'Est. Revenue', score: 85, status: 'positive' },
                  { section: 'Customers', decision: 'VIP Upgrade: R. Martinez', impact: '+22%', metric: 'LTV Growth', score: 78, status: 'positive' },
                  { section: 'Orders', decision: 'RTO Block: ORD-00238', impact: 'Rs 120', metric: 'Loss Saved', score: 95, status: 'positive' },
                  { section: 'Ads', decision: 'Pause: Low ROI Social', impact: 'Rs 900', metric: 'Spend Saved', score: 88, status: 'positive' },
                  { section: 'Customers', decision: 'Flag: High Returner', impact: 'Review', metric: 'Risk Control', score: 70, status: 'neutral' },
                  { section: 'Ads', decision: 'Scale: Search Bestseller', impact: '+35%', metric: 'ROI Boost', score: 82, status: 'positive' },
                ];

                const filtered = decisionFilter === 'All'
                  ? impactData
                  : impactData.filter(d => d.section === decisionFilter);

                if (filtered.length === 0) return <div className="col-span-2 py-10 text-center text-text-dim text-xs italic">No impact data for this section yet.</div>;

                return filtered.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface/30 border border-border/10 flex items-center gap-4 hover:border-neo/30 transition-all group">
                    <div className="flex-shrink-0 relative">
                      <svg className="w-12 h-12 rotate-[-90deg]">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="4" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke={item.status === 'positive' ? '#10b981' : '#f59e0b'} strokeWidth="4"
                          strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * item.score / 100)} className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-text-bright">{item.score}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-text-bright truncate">{item.decision}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-text-dim uppercase tracking-wider">{item.metric}:</span>
                        <span className={`text-[10px] font-black ${item.status === 'positive' ? 'text-bloom' : 'text-ember'}`}>
                          {item.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
