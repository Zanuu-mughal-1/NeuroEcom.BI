import { useState } from 'react'
import { Activity, Settings, BarChart2, Package, Users, ShoppingCart, Megaphone, RotateCcw, Edit3, Save, X, RefreshCw } from 'lucide-react'
import { mockDashboard, mockRules } from '../../utils/api'

const allRules = [
  ...mockRules,
  { Id: 13, Category: 'Product', RuleName: 'Sales Decline Weekly', CurrentValue: '20', DefaultValue: '20', Description: 'Trigger review if drop > %', IsEditable: true },
  { Id: 14, Category: 'Product', RuleName: 'Health Score Healthy', CurrentValue: '80', DefaultValue: '80', Description: 'Green status above this score', IsEditable: true },
  { Id: 15, Category: 'Customer', RuleName: 'Silver Tier', CurrentValue: '500', DefaultValue: '500', Description: 'Auto Silver if total spent > $', IsEditable: true },
  { Id: 16, Category: 'Customer', RuleName: 'Churned Customer', CurrentValue: '90', DefaultValue: '90', Description: 'Mark as churned after X days inactive', IsEditable: true },
  { Id: 17, Category: 'RTO', RuleName: 'New Customer High Value', CurrentValue: '25', DefaultValue: '25', Description: 'Points for first order >$500', IsEditable: true },
  { Id: 18, Category: 'RTO', RuleName: 'Multiple Orders Same Day', CurrentValue: '35', DefaultValue: '35', Description: 'Points if >3 orders same day', IsEditable: true },
  { Id: 19, Category: 'Ads', RuleName: 'Budget Boost Threshold', CurrentValue: '50', DefaultValue: '50', Description: 'Suggest boost if ROI > %', IsEditable: true },
  { Id: 20, Category: 'Ads', RuleName: 'ROAS Warning', CurrentValue: '1.5', DefaultValue: '1.5', Description: 'Yellow if ROAS > X', IsEditable: true },
]

export default function Decisions() {
  const [activeTab, setActiveTab] = useState('decisions')
  const [rules, setRules] = useState(allRules)
  const [categoryFilter, setCategoryFilter] = useState('')
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
                <button key={f} className="btn-ghost text-xs !py-1 !px-2">{f}</button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {[
              ...decisions,
              { Id: 6, Section: 'Products', DecisionType: 'StopSelling', ItemName: 'Noise Canceling Headphones', DecisionDetails: 'Product stopped — out of stock 14 days', CreatedAt: new Date(Date.now()-18000000).toISOString(), Status: 'Applied' },
              { Id: 7, Section: 'Customers', DecisionType: 'ChangeTier', ItemName: 'James Anderson', DecisionDetails: 'Tier upgraded to VIP (spent > $5000)', CreatedAt: new Date(Date.now()-25200000).toISOString(), Status: 'Applied' },
              { Id: 8, Section: 'Orders', DecisionType: 'RTOReject', ItemName: 'ORD-00238', DecisionDetails: 'Auto-rejected — RTO score 88/100', CreatedAt: new Date(Date.now()-32400000).toISOString(), Status: 'Applied' },
            ].map(d => {
              const Icon = sectionIcons[d.Section] || Activity
              const color = sectionColors[d.Section] || '#9ca3af'
              const typeColor = decisionTypeColors[d.DecisionType] || 'text-text-mid'
              return (
                <div key={d.Id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
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
            })}
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
                      <th className="table-header text-left">Description</th>
                      <th className="table-header text-center">Current Value</th>
                      <th className="table-header text-center">Default</th>
                      <th className="table-header text-center">Changed</th>
                      <th className="table-header text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catRules.map(rule => {
                      const isEditing = editingId === rule.Id
                      const isChanged = rule.CurrentValue !== rule.DefaultValue
                      return (
                        <tr key={rule.Id} className="table-row">
                          <td className="table-cell font-medium text-text-bright">{rule.RuleName}</td>
                          <td className="table-cell text-text-dim text-xs max-w-xs">{rule.Description}</td>
                          <td className="table-cell text-center">
                            {isEditing ? (
                              <input
                                className="input w-24 text-center text-sm !py-1"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveEdit(rule.Id)}
                                autoFocus
                              />
                            ) : (
                              <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded ${isChanged ? 'text-ember' : 'text-neo-bright'}`}
                                style={{ background: isChanged ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)' }}>
                                {rule.CurrentValue}
                              </span>
                            )}
                          </td>
                          <td className="table-cell text-center text-xs text-text-dim font-mono">{rule.DefaultValue}</td>
                          <td className="table-cell text-center">
                            {isChanged
                              ? <span className="badge-ember text-xs">Modified</span>
                              : <span className="text-xs text-text-dim">—</span>}
                          </td>
                          <td className="table-cell text-center">
                            <div className="flex gap-1 justify-center">
                              {isEditing ? (
                                <>
                                  <button onClick={() => saveEdit(rule.Id)} className="btn-success text-xs !py-1 !px-2 flex items-center gap-1">
                                    <Save size={11} /> Save
                                  </button>
                                  <button onClick={() => setEditingId(null)} className="btn-ghost text-xs !py-1 !px-2">
                                    <X size={11} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEdit(rule)} className="btn-ghost text-xs !py-1 !px-2 flex items-center gap-1">
                                    <Edit3 size={11} /> Edit
                                  </button>
                                  {isChanged && (
                                    <button onClick={() => resetRule(rule.Id)} className="btn-ghost text-xs !py-1 !px-2 flex items-center gap-1 text-text-dim">
                                      <RefreshCw size={11} />
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
            )
          })}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card">
            <div className="section-title mb-4">Decisions by Section</div>
            <div className="space-y-3">
              {[
                { section: 'Products', count: 487, pct: 38, color: '#818cf8' },
                { section: 'Customers', count: 312, pct: 24, color: '#22d3ee' },
                { section: 'Orders', count: 289, pct: 22, color: '#fbbf24' },
                { section: 'Ads', count: 196, pct: 16, color: '#34d399' },
              ].map(s => (
                <div key={s.section}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-dim">{s.section}</span>
                    <span className="font-bold" style={{ color: s.color }}>{s.count} decisions</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title mb-4">Decision Success Rate</div>
            <div className="space-y-3">
              {[
                { type: 'Price Change', success: 94, total: 128, color: '#10b981' },
                { type: 'Inventory Restock', success: 98, total: 89, color: '#10b981' },
                { type: 'Customer Flag', success: 87, total: 156, color: '#f59e0b' },
                { type: 'Ad Pause/Resume', success: 82, total: 73, color: '#f59e0b' },
                { type: 'Stop Selling', success: 91, total: 44, color: '#10b981' },
              ].map(s => (
                <div key={s.type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-dim">{s.type}</span>
                    <span className="font-bold" style={{ color: s.color }}>{s.success}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${s.success}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title mb-4">Most Triggered Rules</div>
            <div className="space-y-2">
              {[
                { rule: 'Low Stock Alert', triggers: 342, color: '#f59e0b' },
                { rule: 'High Return Flag', triggers: 218, color: '#ef4444' },
                { rule: 'COD Penalty (RTO)', triggers: 189, color: '#a78bfa' },
                { rule: 'VIP Tier Upgrade', triggers: 134, color: '#818cf8' },
                { rule: 'Pause Ad ROI', triggers: 97, color: '#10b981' },
              ].map(r => (
                <div key={r.rule} className="flex items-center justify-between p-2.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-sm text-text-mid">{r.rule}</span>
                  <span className="text-sm font-bold font-mono" style={{ color: r.color }}>{r.triggers}×</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title mb-4">Impact Analysis</div>
            <div className="space-y-3">
              {[
                { decision: 'Price Decrease — Wireless Mouse', impact: '+150% sales', positive: true },
                { decision: 'Stock Restock — Gaming KB', impact: '+89 units sold', positive: true },
                { decision: 'RTO Reject — ORD-00238', impact: 'Fraud prevented', positive: true },
                { decision: 'Ad Pause — Back to School', impact: '$900 spend saved', positive: true },
                { decision: 'Customer Flag — R. Martinez', impact: 'Order blocked', positive: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-text-dim truncate flex-1 mr-3">{item.decision}</span>
                  <span className={`text-xs font-semibold flex-shrink-0 ${item.positive ? 'text-bloom' : 'text-danger'}`}>
                    {item.positive ? '✓' : '✗'} {item.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
