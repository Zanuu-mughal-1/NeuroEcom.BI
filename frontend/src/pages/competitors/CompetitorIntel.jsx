import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle, ArrowUpRight, BarChart3, CheckCircle2, ExternalLink, Filter,
  Globe, History, PauseCircle, PlayCircle, Plus, RefreshCw, Search, ShieldCheck,
  ShoppingBag, Sparkles, Tag, Target, TrendingDown, TrendingUp, Zap
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart,
  Line, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import api from '../../utils/api'

const currency = value => `Rs ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`

const positionStyles = {
  Overpriced: 'badge-danger',
  Parity: 'badge-neo',
  Undercut: 'badge-bloom'
}

const toneClasses = {
  neo: 'bg-neo/10 text-neo',
  danger: 'bg-danger/10 text-danger',
  bloom: 'bg-bloom/10 text-bloom',
  pulse: 'bg-pulse/10 text-pulse'
}

export default function CompetitorIntel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState(null)
  const [decisions, setDecisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')
  const [query, setQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('All')
  const [message, setMessage] = useState('')
  const [newCompetitor, setNewCompetitor] = useState({ name: '', websiteUrl: '' })

  const loadData = async () => {
    setLoading(true)
    try {
      const [overview, decisionRes] = await Promise.all([
        api.get('/competitors'),
        api.get('/competitors/decisions').catch(() => ({ data: [] }))
      ])
      setData(overview.data)
      setDecisions(decisionRes.data)
    } catch (error) {
      console.error('Failed to load competitor intelligence', error)
      setMessage('Competitor Intelligence API is not reachable.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const runAction = async (label, action) => {
    setWorking(label)
    setMessage('')
    try {
      const result = await action()
      setMessage(result?.data?.message || 'Action completed')
      await loadData()
    } catch (error) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Action failed')
    } finally {
      setWorking('')
    }
  }

  const addCompetitor = async e => {
    e.preventDefault()
    await runAction('add', async () => {
      const res = await api.post('/competitors', {
        Name: newCompetitor.name,
        WebsiteUrl: newCompetitor.websiteUrl
      })
      setNewCompetitor({ name: '', websiteUrl: '' })
      return res
    })
  }

  const applySuggestion = product => runAction(`apply-${product.Id}`, () =>
    api.post(`/competitors/actions/${product.Id}/apply`, {
      NewPrice: product.SuggestedPrice,
      Reason: `Competitor Intelligence recommendation. Market min ${currency(product.MarketMin)}, gap ${product.Gap}%.`
    })
  )

  const products = data?.TrackedProducts || []
  const filteredProducts = useMemo(() => {
    const text = query.toLowerCase()
    return products.filter(product => {
      const matchesText = product.Name?.toLowerCase().includes(text) || product.SKU?.toLowerCase().includes(text)
      const matchesPosition = positionFilter === 'All' || product.Position === positionFilter
      return matchesText && matchesPosition
    })
  }, [products, query, positionFilter])

  const metrics = data?.Metrics || {}
  const distribution = data?.Distribution || { Overpriced: 0, Parity: 0, Undercut: 0 }
  const chartDistribution = [
    { name: 'Overpriced', value: distribution.Overpriced, color: '#ef4444' },
    { name: 'Parity', value: distribution.Parity, color: '#00eaff' },
    { name: 'Undercut', value: distribution.Undercut, color: '#10b981' }
  ]

  if (loading && !data) {
    return (
      <div className="p-8 min-h-[60vh] flex items-center justify-center text-text-dim">
        <RefreshCw className="animate-spin mr-2" size={18} /> Loading live competitor intelligence...
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Competitor Intelligence</h1>
          <p className="text-text-dim text-sm mt-1">Live database-backed market scans, price gaps, product matches, and action logging.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => runAction('scan', () => api.post('/competitors/scan'))}
            disabled={!!working}
            className="btn-ghost flex items-center gap-2"
          >
            <Globe size={16} className={working === 'scan' ? 'animate-spin' : ''} /> Scan Market
          </button>
          <button
            onClick={() => runAction('match', () => api.post('/competitors/match'))}
            disabled={!!working}
            className="btn-primary flex items-center gap-2"
          >
            <Target size={16} /> Match Products
          </button>
        </div>
      </div>

      {message && (
        <div className="card py-3 px-4 flex items-center gap-2 text-sm text-text-mid border-neo/20 bg-neo/5">
          <CheckCircle2 size={16} className="text-neo" /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Market Position', value: metrics.MarketPosition || '0% Parity', sub: `${metrics.TrackedProducts || 0} tracked products`, icon: BarChart3, tone: 'neo' },
          { label: 'Price Violations', value: metrics.PriceViolations || 0, sub: `${metrics.CriticalViolations || 0} critical gaps`, icon: AlertCircle, tone: 'danger' },
          { label: 'Avg. Market Gap', value: `${metrics.AvgMarketGap || 0}%`, sub: 'vs lowest competitor', icon: Tag, tone: 'bloom' },
          { label: 'Opportunity Gain', value: currency(metrics.OpportunityGain), sub: `${metrics.ActiveCompetitors || 0} active sources`, icon: Zap, tone: 'pulse' }
        ].map(card => (
          <div key={card.label} className="kpi-card group">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="stat-label">{card.label}</p>
                <h3 className="stat-value">{card.value}</h3>
                <p className="text-xs text-text-dim mt-1">{card.sub}</p>
              </div>
              <div className={`p-3 rounded-xl ${toneClasses[card.tone]} group-hover:scale-110 transition-transform`}>
                <card.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1 p-1 glass rounded-2xl w-fit">
        {[
          { id: 'overview', label: 'Market Overview', icon: Globe },
          { id: 'catalog', label: 'Live Catalog', icon: ShoppingBag },
          { id: 'history', label: 'Price History', icon: History },
          { id: 'actions', label: 'Actions', icon: ShieldCheck }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-surface text-neo shadow-sm' : 'text-text-dim hover:text-text-mid'
            }`}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 card">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h3 className="section-title">Market Price Trend</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-dim">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-neo" /> Your avg</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-bloom" /> Daraz</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-ember" /> PriceOye</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pulse" /> Telemart</span>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.PriceHistory || []}>
                    <defs>
                      <linearGradient id="mineFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00eaff" stopOpacity={0.16} />
                        <stop offset="95%" stopColor="#00eaff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="Date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="Mine" stroke="#00eaff" strokeWidth={3} fill="url(#mineFill)" />
                    <Line type="monotone" dataKey="Daraz" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="PriceOye" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Telemart" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="section-title mb-5">Tracked Sources</h3>
              <div className="space-y-3">
                {(data?.Competitors || []).map(comp => (
                  <div key={comp.Id} className="p-4 rounded-xl border border-border bg-void/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center border border-border">
                          <Globe size={16} className="text-neo" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-text-bright truncate">{comp.Name}</div>
                          <div className="text-[10px] text-text-dim truncate">{comp.WebsiteUrl}</div>
                        </div>
                      </div>
                      <button onClick={() => runAction(`toggle-${comp.Id}`, () => api.post(`/competitors/${comp.Id}/toggle`))} className="p-1.5 rounded-lg hover:bg-surface">
                        {comp.Status === 'Tracking' ? <PauseCircle size={16} className="text-ember" /> : <PlayCircle size={16} className="text-bloom" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className={comp.Status === 'Tracking' ? 'text-bloom' : 'text-text-dim'}>{comp.Status}</span>
                      <span className="font-bold text-neo">{Number(comp.MatchRate || 0).toFixed(0)}% match</span>
                      <span className="text-text-dim">{comp.LastSeen}</span>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={addCompetitor} className="mt-4 p-4 rounded-xl border border-dashed border-border space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <input className="input" placeholder="Competitor name" value={newCompetitor.name} onChange={e => setNewCompetitor(p => ({ ...p, name: e.target.value }))} />
                  <input className="input" placeholder="domain.com" value={newCompetitor.websiteUrl} onChange={e => setNewCompetitor(p => ({ ...p, websiteUrl: e.target.value }))} />
                </div>
                <button disabled={working === 'add'} className="btn-ghost w-full py-2 text-xs flex items-center justify-center gap-2">
                  <Plus size={14} /> Add Source
                </button>
              </form>
            </div>
          </div>

          <ProductTable products={filteredProducts.slice(0, 8)} onApply={applySuggestion} working={working} />
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="space-y-5">
          <div className="card flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <input className="input pl-9 w-full" placeholder="Search product or SKU..." value={query} onChange={e => setQuery(e.target.value)} />
              </div>
              <select className="select w-full sm:w-48" value={positionFilter} onChange={e => setPositionFilter(e.target.value)}>
                <option value="All">All Positions</option>
                <option value="Overpriced">Overpriced</option>
                <option value="Parity">Parity</option>
                <option value="Undercut">Undercut</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-dim">
              <Filter size={14} /> {filteredProducts.length} live matches
            </div>
          </div>
          <ProductTable products={filteredProducts} onApply={applySuggestion} working={working} />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 card">
            <h3 className="section-title mb-5">Daily Market Movement</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.PriceHistory || []}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="Date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="Mine" fill="#00eaff" radius={[4, 4, 0, 0]} opacity={0.22} />
                  <Line type="monotone" dataKey="Daraz" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="PriceOye" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="Telemart" stroke="#06b6d4" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <h3 className="section-title mb-5">Position Mix</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDistribution}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartDistribution.map(item => <Cell key={item.name} fill={item.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="section-title">AI Suggested Actions</h3>
              <span className="badge-neo">Database driven</span>
            </div>
            <div className="space-y-4">
              {(data?.SuggestedActions || []).length === 0 ? (
                <div className="text-center py-12 text-text-dim">No pricing action needed. Catalog is at market parity.</div>
              ) : data.SuggestedActions.map(action => (
                <div key={action.ProductId} className="p-5 rounded-2xl border border-border bg-void/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="p-3 rounded-xl bg-neo/10 text-neo h-fit"><Sparkles size={20} /></div>
                    <div>
                      <div className="font-bold text-text-bright">{action.Action} for {action.Name}</div>
                      <div className="text-xs text-text-mid mt-1">{action.Rationale}</div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="badge-dim">Current {currency(action.MyPrice)}</span>
                        <span className="badge-neo">Suggested {currency(action.SuggestedPrice)}</span>
                        <span className="badge-bloom">Impact {currency(action.EstimatedGain)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => applySuggestion({ Id: action.ProductId, SuggestedPrice: action.SuggestedPrice, MarketMin: action.MarketMin, Gap: action.Gap })}
                    disabled={!!working}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    Apply Price
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="section-title mb-5">Decision Log</h3>
              <div className="space-y-3 max-h-[460px] overflow-y-auto">
                {decisions.length === 0 ? (
                  <div className="text-xs text-text-dim py-8 text-center">No competitor actions applied yet.</div>
                ) : decisions.map(decision => (
                  <div key={decision.Id} className="p-4 rounded-xl border border-border bg-void/30">
                    <div className="text-sm font-bold text-text-bright">{decision.ItemName}</div>
                    <div className="text-xs text-text-mid mt-1">{decision.DecisionDetails}</div>
                    <div className="text-[10px] text-text-dim mt-2">{new Date(decision.CreatedAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card bg-ember/5 border-ember/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-ember text-white"><ShieldCheck size={18} /></div>
                <h3 className="font-bold text-text-bright">Pricing Guardrails</h3>
              </div>
              <p className="text-xs text-text-mid leading-relaxed">
                Recommendations never go below a 15% cost margin floor. Applied actions update the live product price and write an audit entry to the Decisions table.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductTable({ products, onApply, working }) {
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h3 className="section-title">Critical Price Gaps</h3>
        <div className="flex gap-2">
          <span className="badge-danger">Overpriced</span>
          <span className="badge-neo">Parity</span>
          <span className="badge-bloom">Undercut</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-abyss border-b border-border">
              <th className="table-header text-left">Product / SKU</th>
              <th className="table-header text-right">My Price</th>
              <th className="table-header text-right">Market Min</th>
              <th className="table-header text-right">Market Avg</th>
              <th className="table-header text-center">Position</th>
              <th className="table-header text-center">Gap</th>
              <th className="table-header text-right">Suggested</th>
              <th className="table-header text-center">Sources</th>
              <th className="table-header text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="9" className="py-12 text-center text-text-dim">No matched products found.</td></tr>
            ) : products.map(product => (
              <tr key={product.Id} className="table-row">
                <td className="table-cell">
                  <div className="font-bold text-text-bright">{product.Name}</div>
                  <div className="text-[10px] font-mono text-text-dim">{product.SKU} · {product.Category}</div>
                </td>
                <td className="table-cell text-right font-bold">{currency(product.MyPrice)}</td>
                <td className="table-cell text-right text-bloom font-medium">{currency(product.MarketMin)}</td>
                <td className="table-cell text-right text-text-mid">{currency(product.MarketAvg)}</td>
                <td className="table-cell text-center">
                  <span className={`badge ${positionStyles[product.Position] || 'badge-dim'}`}>{product.Position}</span>
                </td>
                <td className="table-cell text-center">
                  <div className={`inline-flex items-center gap-1 font-bold ${product.Gap > 2 ? 'text-danger' : product.Gap < -2 ? 'text-bloom' : 'text-neo'}`}>
                    {product.Gap}% {product.Gap > 2 ? <ArrowUpRight size={14} /> : product.Gap < -2 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                  </div>
                </td>
                <td className="table-cell text-right font-bold text-neo">{currency(product.SuggestedPrice)}</td>
                <td className="table-cell text-center">
                  <div className="flex justify-center -space-x-2">
                    {(product.Matches || []).slice(0, 4).map(match => (
                      <a
                        key={`${product.Id}-${match.CompetitorId}`}
                        href={match.WebsiteUrl?.startsWith('http') ? match.WebsiteUrl : `https://${match.WebsiteUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        title={`${match.Competitor}: ${currency(match.Price + match.ShippingCost)}`}
                        className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center hover:text-neo"
                      >
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </td>
                <td className="table-cell text-right">
                  <button
                    onClick={() => onApply(product)}
                    disabled={product.Position === 'Parity' || !!working}
                    className="btn-ghost text-[10px] px-3 py-1.5 disabled:opacity-40"
                  >
                    Apply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
