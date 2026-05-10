import React, { useState } from 'react';
import { 
  Globe, TrendingUp, TrendingDown, AlertCircle, 
  Search, Filter, ExternalLink, BarChart3, 
  Tag, Target, ShieldCheck, Zap, ArrowUpRight,
  History, Settings2, Info, ChevronRight, ShoppingBag
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Bar, Scatter
} from 'recharts';
import { mockProducts, mockDashboard } from '../../utils/api';

const CompetitorIntel = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const priceHistory = [
    { date: 'May 01', mine: 1299, compA: 1350, compB: 1299 },
    { date: 'May 02', mine: 1299, compA: 1320, compB: 1299 },
    { date: 'May 03', mine: 1299, compA: 1320, compB: 1250 },
    { date: 'May 04', mine: 1249, compA: 1299, compB: 1250 },
    { date: 'May 05', mine: 1249, compA: 1299, compB: 1250 },
    { date: 'May 06', mine: 1249, compA: 1249, compB: 1250 },
    { date: 'May 07', mine: 1249, compA: 1249, compB: 1199 },
  ];

  const competitors = [
    { id: 1, name: 'Amazon', url: 'amazon.in', status: 'Tracking', matchRate: '94%', lastSeen: '2m ago' },
    { id: 2, name: 'Flipkart', url: 'flipkart.com', status: 'Tracking', matchRate: '88%', lastSeen: '15m ago' },
    { id: 3, name: 'Myntra', url: 'myntra.com', status: 'Paused', matchRate: '72%', lastSeen: '1h ago' },
    { id: 4, name: 'Direct Competitor', url: 'competitor.com', status: 'Tracking', matchRate: '100%', lastSeen: '5m ago' },
  ];

  const trackedProducts = [
    { 
      id: 1, 
      name: 'Wireless Noise Cancelling Headphones', 
      sku: 'WNC-001',
      myPrice: 1249, 
      marketMin: 1199, 
      marketMax: 1350, 
      position: 'Overpriced',
      gap: '+4.2%',
      health: 'warning'
    },
    { 
      id: 2, 
      name: 'Smart Watch Series 7 (Classic)', 
      sku: 'SW7-CLR',
      myPrice: 3499, 
      marketMin: 3499, 
      marketMax: 3800, 
      position: 'Market Leader',
      gap: '0%',
      health: 'healthy'
    },
    { 
      id: 3, 
      name: 'Mechanical Gaming Keyboard', 
      sku: 'MK-RGB-80',
      myPrice: 899, 
      marketMin: 999, 
      marketMax: 1100, 
      position: 'Under-cut',
      gap: '-11.1%',
      health: 'healthy'
    }
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Competitor Intelligence</h1>
          <p className="text-text-dim text-sm mt-1">Real-time price monitoring, gap analysis, and automated responses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost flex items-center gap-2">
            <Globe size={16} /> Scan Market
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Target size={16} /> Match Products
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Market Price Position</p>
              <h3 className="stat-value">Parity (64%)</h3>
              <p className="stat-change-up">
                <TrendingUp size={12} /> +5% vs LW
              </p>
            </div>
            <div className="p-3 rounded-xl bg-neo/10 text-neo group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Price Violations</p>
              <h3 className="stat-value">12 Alerts</h3>
              <p className="stat-change-down text-danger">
                <AlertCircle size={12} /> 4 Critical
              </p>
            </div>
            <div className="p-3 rounded-xl bg-danger/10 text-danger group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Avg. Market Gap</p>
              <h3 className="stat-value">+2.4%</h3>
              <p className="stat-change-up text-bloom">
                <TrendingDown size={12} /> -0.8%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-bloom/10 text-bloom group-hover:scale-110 transition-transform">
              <Tag size={24} />
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Opportunity Gain</p>
              <h3 className="stat-value">Rs 42,800</h3>
              <p className="stat-change-up">
                <TrendingUp size={12} /> AI Suggested
              </p>
            </div>
            <div className="p-3 rounded-xl bg-pulse/10 text-pulse group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 glass rounded-2xl w-fit">
        {[
          { id: 'overview', label: 'Market Overview', icon: Globe },
          { id: 'catalog', label: 'Competitor Catalog', icon: ShoppingBag },
          { id: 'history', label: 'Price History', icon: History },
          { id: 'actions', label: 'Decision Log', icon: ShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-surface text-neo shadow-sm' 
                : 'text-text-dim hover:text-text-mid'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="section-title">Price Trends vs Market</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-neo" /> Your Price</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-bloom" /> Amazon</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-ember" /> Flipkart</div>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistory}>
                      <defs>
                        <linearGradient id="colorMine" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} />
                      <Tooltip />
                      <Area type="monotone" dataKey="mine" stroke="#6366f1" strokeWidth={3} fill="url(#colorMine)" />
                      <Line type="monotone" dataKey="compA" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="compB" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <h3 className="section-title mb-6">Tracked Sources</h3>
                <div className="space-y-4">
                  {competitors.map(comp => (
                    <div key={comp.id} className="p-4 rounded-xl border border-border bg-void/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border">
                          <Globe size={16} className="text-text-dim" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text-bright">{comp.name}</div>
                          <div className="text-[10px] text-text-dim">{comp.url}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-neo">{comp.matchRate}</div>
                        <div className="text-[10px] text-text-dim">Match</div>
                      </div>
                    </div>
                  ))}
                  <button className="btn-ghost w-full py-2 text-xs border-dashed border-2">+ Add Competitor</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="section-title">Critical Price Gaps</h3>
                <div className="flex gap-2">
                  <span className="badge-neo">Overpriced (8)</span>
                  <span className="badge-bloom">Competitive (42)</span>
                  <span className="badge-ember">Undercut (12)</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Product / SKU</th>
                      <th className="table-header text-right">My Price</th>
                      <th className="table-header text-right">Market Min</th>
                      <th className="table-header text-right">Market Max</th>
                      <th className="table-header">Position</th>
                      <th className="table-header">Gap</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProducts.slice(0, 5).map(p => {
                      const marketMin = p.Price * 0.95;
                      const marketMax = p.Price * 1.1;
                      const position = p.HealthScore > 80 ? 'Market Leader' : p.HealthScore < 30 ? 'Overpriced' : 'Parity';
                      const gap = position === 'Market Leader' ? '0%' : position === 'Overpriced' ? '+4.2%' : '-2.1%';

                      return (
                        <tr key={p.Id} className="table-row">
                          <td className="table-cell">
                            <div className="font-bold text-text-bright">{p.Name}</div>
                            <div className="text-[10px] font-mono text-text-dim">{p.SKU}</div>
                          </td>
                          <td className="table-cell text-right font-bold">Rs {p.Price}</td>
                          <td className="table-cell text-right text-bloom font-medium">Rs {marketMin.toFixed(2)}</td>
                          <td className="table-cell text-right text-text-dim">Rs {marketMax.toFixed(2)}</td>
                          <td className="table-cell">
                            <span className={`badge ${
                              position === 'Market Leader' ? 'badge-bloom' : 
                              position === 'Overpriced' ? 'badge-danger' : 'badge-neo'
                            }`}>
                              {position}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className={`flex items-center gap-1 font-bold ${
                              gap.startsWith('+') ? 'text-danger' : gap === '0%' ? 'text-bloom' : 'text-neo'
                            }`}>
                              {gap} {gap !== '0%' && (gap.startsWith('+') ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />)}
                            </div>
                          </td>
                          <td className="table-cell text-right">
                            <button className="btn-ghost p-1.5"><TrendingUp size={14} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'actions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="section-title">AI Suggested Actions</h3>
                  <div className="text-xs text-text-dim">Based on <span className="text-neo font-bold">Price Elasticity</span></div>
                </div>
                <div className="space-y-4">
                  {mockDashboard.RecentDecisions.filter(d => d.Section === 'Products').map((decision, i) => (
                    <div key={decision.Id} className="p-6 rounded-2xl border border-border bg-void/30 flex items-center justify-between group hover:border-neo/30 transition-all">
                      <div className="flex gap-4">
                        <div className="p-3 rounded-xl bg-neo/10 text-neo">
                          <Zap size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-text-bright mb-1">{decision.DecisionType} for {decision.ItemName}</div>
                          <div className="text-xs text-text-mid mb-3">{decision.DecisionDetails}</div>
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-bloom/10 text-bloom text-[10px] font-bold uppercase">
                            <TrendingUp size={10} /> ROI Impact: +12%
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="btn-primary text-[10px] py-1.5 px-3">Execute</button>
                        <button className="btn-ghost text-[10px] py-1.5 px-3">Ignore</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="section-title mb-6">Price Rules</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-void/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-text-bright">Floor Margin Protection</span>
                      <Settings2 size={14} className="text-text-dim" />
                    </div>
                    <div className="text-xs text-text-mid mb-3">Never drop price if margin falls below 15%.</div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-danger w-[15%]" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-void/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-text-bright">Competitor Matching</span>
                      <Settings2 size={14} className="text-text-dim" />
                    </div>
                    <div className="text-xs text-text-mid">Auto-match top 3 competitors within 2% threshold.</div>
                  </div>
                  <button className="btn-ghost w-full py-2 text-xs">Configure All Rules</button>
                </div>
              </div>

              <div className="card bg-ember/5 border-ember/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-ember text-white">
                    <Info size={18} />
                  </div>
                  <h3 className="font-bold text-text-bright">Market Insight</h3>
                </div>
                <p className="text-xs text-text-mid leading-relaxed">
                  Competitors are running <span className="font-bold text-ember">Weekend Flash Sales</span> on Electronics. 84% of your catalog in this category is currently being undercut.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorIntel;
