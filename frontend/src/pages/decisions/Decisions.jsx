import { useState } from 'react'
import { Activity, Settings, BarChart2, Package, Users, ShoppingCart, Megaphone, RotateCcw, Edit3, Save, X, RefreshCw } from 'lucide-react'
import { mockDashboard, mockRules } from '../../utils/api'

const allRules = [
  { Id: 1, Category: 'Product', RuleName: 'Low Stock Trigger', Condition: 'Inventory < {v} units', Action: 'Alert Reorder', CurrentValue: '15', DefaultValue: '15' },
  { Id: 2, Category: 'Product', RuleName: 'Price Elasticity', Condition: 'Sales Drop > {v}%', Action: 'Suggest Price Cut', CurrentValue: '20', DefaultValue: '20' },
  { Id: 9, Category: 'Product', RuleName: 'Dynamic Pricing', Condition: 'Profit Margin > {v}%', Action: 'Enable Aggressive Sale', CurrentValue: '45', DefaultValue: '40' },
  { Id: 10, Category: 'Product', RuleName: 'Overstock Alert', Condition: 'Stock > {v} units', Action: 'Bundle with Bestseller', CurrentValue: '300', DefaultValue: '500' },

  { Id: 3, Category: 'Customer', RuleName: 'VIP Progression', Condition: 'Spend > ${v}', Action: 'Upgrade to Gold', CurrentValue: '2500', DefaultValue: '2000' },
  { Id: 4, Category: 'Customer', RuleName: 'Churn Prevention', Condition: 'Inactive > {v} days', Action: 'Send "Miss You" Email', CurrentValue: '60', DefaultValue: '90' },
  { Id: 11, Category: 'Customer', RuleName: 'Loyalty Referral', Condition: 'Total Orders > {v}', Action: 'Invite to Affiliate', CurrentValue: '25', DefaultValue: '20' },
  { Id: 12, Category: 'Customer', RuleName: 'High-Return Risk', Condition: 'Return Rate > {v}%', Action: 'Audit Purchases', CurrentValue: '20', DefaultValue: '25' },

  { Id: 5, Category: 'Ads', RuleName: 'Budget Kill-Switch', Condition: 'ROI < {v}%', Action: 'Pause Campaign', CurrentValue: '5', DefaultValue: '10' },
  { Id: 6, Category: 'Ads', RuleName: 'High Performance', Condition: 'ROAS > {v}x', Action: 'Boost Budget 20%', CurrentValue: '4.5', DefaultValue: '3.0' },
  { Id: 13, Category: 'Ads', RuleName: 'CPC Efficiency', Condition: 'CPC < ${v}', Action: 'Scale Daily Spend', CurrentValue: '0.15', DefaultValue: '0.20' },
  { Id: 14, Category: 'Ads', RuleName: 'Creative Fatigue', Condition: 'CTR Drop > {v}%', Action: 'Rotate Creatives', CurrentValue: '35', DefaultValue: '30' },

  { Id: 7, Category: 'RTO', RuleName: 'Fraud Shield', Condition: 'RTO Score > {v}', Action: 'Force Prepaid Only', CurrentValue: '75', DefaultValue: '80' },
  { Id: 8, Category: 'RTO', RuleName: 'Address Risk', Condition: 'Incomplete Match', Action: 'Flag for Call', CurrentValue: 'Yes', DefaultValue: 'Yes' },
  { Id: 15, Category: 'RTO', RuleName: 'High Value Check', Condition: 'Order Value > ${v}', Action: 'Admin Review Required', CurrentValue: '1500', DefaultValue: '2000' },
  { Id: 16, Category: 'RTO', RuleName: 'Shipment Delay', Condition: 'Unshipped > {v} hrs', Action: 'Notify Customer', CurrentValue: '48', DefaultValue: '48' },
]

export default function Decisions() {
  const [activeTab, setActiveTab] = useState('decisions')
  const [rules, setRules] = useState(allRules)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [decisionFilter, setDecisionFilter] = useState('All')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const decisions = mockDashboard.RecentDecisions
  const filteredRules = rules.filter(r => !categoryFilter || r.Category === categoryFilter)

  const categories = ['Product', 'Customer', 'RTO', 'Ads']
  const catColors = { Product: { bg: 'rgba(99,102,241,0.1)', text: '#818cf8', border: 'rgba(99,102,241,0.2)' }, Customer: { bg: 'rgba(6,182,212,0.1)', text: '#22d3ee', border: 'rgba(6,182,212,0.2)' }, RTO: { bg: 'rgba(139,92,246,0.1)', text: '#a78bfa', border: 'rgba(139,92,246,0.2)' }, Ads: { bg: 'rgba(16,185,129,0.1)', text: '#34d399', border: 'rgba(16,185,129,0.2)' } }
  const sectionIcons = { Products: Package, Customers: Users, Orders: ShoppingCart, Ads: Megaphone, Returns: RotateCcw }
  const sectionColors = { Products: '#818cf8', Customers: '#22d3ee', Orders: '#fbbf24', Ads: '#34d399', Returns: '#a78bfa' }

  const startEdit = (rule) => { setEditingId(rule.Id); setEditValue(rule.CurrentValue) }
  const saveEdit = (id) => {
    setRules(prev => prev.map(r => r.Id === id ? { ...r, CurrentValue: editValue } : r))
    setEditingId(null)
  }
  const resetRule = (id) => {
    setRules(prev => prev.map(r => r.Id === id ? { ...r, CurrentValue: r.DefaultValue } : r))
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
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
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
          { label: 'Total Decisions', value: '1,284', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'This Week', value: '47', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Active Rules', value: rules.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Success Rate', value: '91%', color: '#22d3ee', bg: 'rgba(6,182,212,0.1)' },
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
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="section-title">All Decisions</div>
            <div className="flex gap-2">
              {['All', 'Products', 'Customers', 'Orders', 'Ads'].map(f => (
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
              const baseDecisions = [
                ...decisions,
                { Id: 6, Section: 'Products', DecisionType: 'StopSelling', ItemName: 'Noise Canceling Headphones', DecisionDetails: 'Product stopped — out of stock 14 days', CreatedAt: new Date(Date.now() - 18000000).toISOString(), Status: 'Applied' },
                { Id: 7, Section: 'Customers', DecisionType: 'ChangeTier', ItemName: 'James Anderson', DecisionDetails: 'Tier upgraded to VIP (spent > $5000)', CreatedAt: new Date(Date.now() - 25200000).toISOString(), Status: 'Applied' },
                { Id: 8, Section: 'Orders', DecisionType: 'RTOReject', ItemName: 'ORD-00238', DecisionDetails: 'Auto-rejected — RTO score 88/100', CreatedAt: new Date(Date.now() - 32400000).toISOString(), Status: 'Applied' },
              ];

              const filteredDecisions = decisionFilter === 'All'
                ? baseDecisions
                : baseDecisions.filter(d => d.Section === decisionFilter);

              return filteredDecisions.map(d => {
                const Icon = sectionIcons[d.Section] || Activity
                const color = sectionColors[d.Section] || '#9ca3af'
                const typeColor = decisionTypeColors[d.DecisionType] || 'text-text-mid'
                return (
                  <div key={d.Id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors animate-fade-in">
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
                    : { background: 'rgba(255,255,255,0.03)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.06)' }}>
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
                <div className="px-5 py-3 flex items-center gap-3 border-b border-border/50"
                  style={{ background: c.bg }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: c.text, boxShadow: `0 0 6px ${c.text}` }} />
                  <span className="font-semibold text-sm" style={{ color: c.text }}>{cat} Rules</span>
                  <span className="badge text-xs ml-auto" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                    {catRules.length} rules
                  </span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <th className="table-header text-left">Rule Name</th>
                      <th className="table-header text-left">If This Happens (Condition)</th>
                      <th className="table-header text-left">Then AI Does This (Action)</th>
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
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-neo-bright bg-neo/10 px-1.5 py-0.5 rounded">IF</span>
                              <span className="text-xs text-text-mid italic">
                                {rule.Condition.split('{v}')[0]}
                                {isEditing ? (
                                  <input
                                    className="input w-16 text-center text-xs !py-0.5 inline-block border-neo/40 focus:border-neo bg-neo/5"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && saveEdit(rule.Id)}
                                    autoFocus
                                  />
                                ) : (
                                  <span className={`font-bold px-1 rounded ${isChanged ? 'text-ember bg-ember/10' : 'text-neo-bright bg-neo/10'}`}>
                                    {rule.CurrentValue}
                                  </span>
                                )}
                                {rule.Condition.split('{v}')[1]}
                              </span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-bloom bg-bloom/10 px-1.5 py-0.5 rounded">THEN</span>
                              <span className="text-xs font-semibold text-text-bright">{rule.Action}</span>
                            </div>
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
                  { section: 'Products', count: 487, color: '#818cf8' },
                  { section: 'Customers', count: 312, color: '#22d3ee' },
                  { section: 'Orders', count: 289, color: '#fbbf24' },
                  { section: 'Ads', count: 196, color: '#34d399' },
                ].map(s => (
                  <div key={s.section} className="p-2 rounded-lg bg-white/5 border border-white/5">
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
                  { rule: 'COD Penalty (RTO)', triggers: 189, color: '#a78bfa' },
                  { rule: 'VIP Tier Upgrade', triggers: 134, color: '#818cf8' },
                  { rule: 'Pause Ad ROI', triggers: 97, color: '#10b981' },
                  { rule: 'Price Drop Rule', triggers: 84, color: '#34d399' },
                ].map(r => (
                  <div key={r.rule} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
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
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
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
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-text-dim uppercase font-bold mb-1">Drift Score</div>
                  <div className="text-lg font-bold text-text-bright">0.02</div>
                  <div className="text-[9px] text-bloom font-medium">Stable</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
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
              <div className="text-[10px] text-text-dim bg-white/5 px-2 py-1 rounded">Last 30 Days Data</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const impactData = [
                  { section: 'Products', decision: 'Price Drop: Wireless Mouse', impact: '+150%', metric: 'Sales Vol.', score: 92, status: 'positive' },
                  { section: 'Products', decision: 'Inventory: Gaming KB', impact: '+$4.2k', metric: 'Est. Revenue', score: 85, status: 'positive' },
                  { section: 'Customers', decision: 'VIP Upgrade: R. Martinez', impact: '+22%', metric: 'LTV Growth', score: 78, status: 'positive' },
                  { section: 'Orders', decision: 'RTO Block: ORD-00238', impact: '$120', metric: 'Loss Saved', score: 95, status: 'positive' },
                  { section: 'Ads', decision: 'Pause: Low ROI Social', impact: '$900', metric: 'Spend Saved', score: 88, status: 'positive' },
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
                        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
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
