import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign, ShoppingCart, Users, RotateCcw, TrendingUp,
  AlertTriangle, CheckCircle, Clock, XCircle, Package,
  Plus, FlaskConical, Megaphone, Activity, Zap, Download,
  ChevronRight, ArrowUpRight, ArrowDownRight, Target
} from 'lucide-react'
import { SalesAreaChart, DonutChart } from '../../components/charts/MiniChart'
import api from '../../utils/api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30D')
  const [refreshing, setRefreshing] = useState(false)
  const [revenueGoal, setRevenueGoal] = useState(1000000)
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false)

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true)
      else setRefreshing(true)

      const days = timeRange === '7D' ? 7 : timeRange === '90D' ? 90 : 30
      const [dashRes, rulesRes] = await Promise.all([
        api.get(`/dashboard?days=${days}`),
        api.get('/decisions/rules?category=Dashboard')
      ])

      setData(dashRes.data)
      const goalRule = rulesRes.data.find(r => r.RuleName === 'Monthly Revenue Goal')
      if (goalRule) setRevenueGoal(parseFloat(goalRule.CurrentValue))
    } catch (err) {
      console.error('Failed to fetch dashboard', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [timeRange])

  if (loading || !data) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <div className="w-12 h-12 border-4 border-neo/20 border-t-neo rounded-full animate-spin" />
      <div className="text-sm font-medium text-text-dim animate-pulse">Initializing Neural Intelligence...</div>
    </div>
  )

  const healthData = [
    { name: 'Healthy', value: data.ProductHealth.Healthy },
    { name: 'Warning', value: data.ProductHealth.Warning },
    { name: 'Critical', value: data.ProductHealth.Critical },
    { name: 'Discontinued', value: data.ProductHealth.Discontinued },
  ]
  const healthColors = ['#10b981', '#f59e0b', '#ef4444', '#6b7280']

  const handleExport = () => {
    if (!data) return
    const sections = [
      ['Metric', 'Value'],
      ['Monthly Revenue', `Rs ${data.Revenue.ThisMonth}`],
      ['Today Revenue', `Rs ${data.Revenue.Today}`],
      ['Pending Orders', data.Orders.Pending],
      ['Total Customers', data.Customers.Total],
      ['Return Rate', `${data.ReturnRate}%`]
    ]
    const csvContent = sections.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `NeuroEcom_Report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="w-full mx-auto p-4 md:p-8 space-y-8 animate-fade-up">
      {/* Alerts Modal */}
      {isAlertsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-abyss/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-danger/10 text-danger">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-bright">System Intelligence Alerts</h2>
                  <p className="text-xs text-text-dim">{data.Alerts.length} issues requiring attention</p>
                </div>
              </div>
              <button onClick={() => setIsAlertsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <XCircle size={24} className="text-text-dim" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {data.Alerts.map((alert, i) => {
                const target = alert.Section === 'Products' ? `/products?search=${alert.Message.split("'")[1] || ''}` : '/';
                return (
                  <Link
                    key={i}
                    to={target}
                    onClick={() => setIsAlertsModalOpen(false)}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-neo/30 hover:bg-neo/5 transition-all group"
                  >
                    <div className={`p-2 rounded-lg ${alert.Level === 'Critical' ? 'bg-danger/10 text-danger' : 'bg-ember/10 text-ember'}`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-text-bright mb-1 uppercase tracking-widest">{alert.Section}</div>
                      <div className="text-sm text-text-mid leading-relaxed group-hover:text-text-bright">{alert.Message}</div>
                    </div>
                    <ChevronRight size={18} className="text-text-dim opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                )
              })}
              {data.Alerts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-16 h-16 rounded-full bg-bloom/10 flex items-center justify-center text-bloom">
                    <CheckCircle size={32} />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-text-bright">All Systems Optimal</div>
                    <div className="text-sm text-text-dim text-center px-8">No critical alerts detected by neural monitoring.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-bloom animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Live Analysis Active</span>
          </div>
          <h1 className="text-4xl font-black text-text-bright tracking-tight leading-none uppercase" style={{ fontFamily: 'Bebas Neue' }}>
            Executive <span className="text-neo">Intelligence</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-surface/50 border border-white/5 rounded-2xl">
            <div>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-0.5">ROI Status</div>
              <div className="flex items-center gap-1.5 font-bold text-bloom">
                <TrendingUp size={14} />
                <span>{data.ROI}%</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-0.5">Return Rate</div>
              <div className="flex items-center gap-1.5 font-bold text-ember">
                <RotateCcw size={14} />
                <span>{data.ReturnRate}%</span>
              </div>
            </div>
          </div>
          <button onClick={() => fetchDashboard(true)} className="p-3 rounded-xl bg-surface/50 border border-white/5 hover:bg-neo/10 hover:border-neo/30 transition-all active:scale-95 group">
            <RotateCcw size={18} className={`text-text-dim group-hover:text-neo ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2 px-6 py-3">
            <Download size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Export Report</span>
          </button>
        </div>
      </header>

      {/* --- HERO KPI GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {[
          { label: 'Monthly Revenue', value: `Rs ${((data?.Revenue?.ThisMonth || 0) / 1000).toFixed(1)}K`, icon: DollarSign, color: 'neo', change: '+12.5%', detail: 'vs target', to: '/orders' },
          { label: 'Total Revenue', value: `Rs ${((data?.Revenue?.Total || 0) / 1000).toFixed(1)}K`, icon: Zap, color: 'royal', change: 'Lifetime', detail: 'gross sales', to: '/orders' },
          { label: 'Today Revenue', value: `Rs ${(data?.Revenue?.Today || 0).toLocaleString()}`, icon: TrendingUp, color: 'pulse', change: '+8.3%', detail: 'vs yesterday', to: '/orders' },
          { label: 'Active Customers', value: (data?.Customers?.Total || 0).toLocaleString(), icon: Users, color: 'bloom', change: '+142', detail: 'this month', to: '/customers' },
          { label: 'Pending Orders', value: (data?.Orders?.Pending || 0).toLocaleString(), icon: ShoppingCart, color: 'ember', change: 'Needs Action', detail: 'pending fulfillment', to: '/orders?status=Pending' },
        ].map((kpi) => (
          <Link to={kpi.to} key={kpi.label} className="group relative overflow-hidden card p-0 border-white/5 hover:border-neo/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all">
            <div className={`absolute top-0 left-0 w-1 h-full bg-${kpi.color}`} />
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-${kpi.color}/10 text-${kpi.color}`}>
                  <kpi.icon size={20} />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-bloom flex items-center gap-1">
                    <ArrowUpRight size={12} />
                    {kpi.change}
                  </div>
                  <div className="text-[9px] text-text-dim uppercase font-bold tracking-tighter">{kpi.detail}</div>
                </div>
              </div>
              <div className="text-2xl font-black text-text-bright tracking-tight mb-1">{kpi.value}</div>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{kpi.label}</div>
            </div>
            <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
              <ChevronRight size={16} className={`text-${kpi.color}`} />
            </div>
          </Link>
        ))}
      </div>

      {/* --- CORE INSIGHTS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Main Revenue Trend Chart (8 cols) */}
        <div className="lg:col-span-8 card border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-text-bright tracking-tight">Revenue Dynamics</h3>
              <p className="text-xs text-text-dim">Neural forecast and historical performance analysis</p>
            </div>
            <div className="flex p-1 bg-void/50 rounded-xl border border-white/5">
              {['7D', '30D', '90D'].map((d) => (
                <button
                  key={d}
                  onClick={() => setTimeRange(d)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${timeRange === d ? 'bg-neo text-white shadow-lg' : 'text-text-dim hover:text-text-bright'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <SalesAreaChart data={data.SalesData} color="#6366f1" dataKey="Revenue" prefix="Rs" />
          </div>
        </div>

        {/* Goal Tracking (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="card border-neo/20 bg-neo/5 flex-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 transition-transform group-hover:rotate-45">
              <Target size={80} className="text-neo" />
            </div>
            <h3 className="text-sm font-bold text-text-bright uppercase tracking-widest mb-1">Monthly Goal</h3>
            <p className="text-xs text-text-dim mb-6">Target: Rs {revenueGoal.toLocaleString()}</p>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-2xl font-black text-text-bright mb-2">
                  <span>{Math.min(100, (data.Revenue.ThisMonth / revenueGoal) * 100).toFixed(1)}%</span>
                  <div className="flex items-center gap-1 text-sm font-bold text-bloom">
                    <ArrowUpRight size={16} />
                    <span>On Track</span>
                  </div>
                </div>
                <div className="h-3 bg-void rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neo to-pulse shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all duration-1000"
                    style={{ width: `${Math.min(100, (data.Revenue.ThisMonth / revenueGoal) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-text-dim uppercase font-bold tracking-widest mb-1">Reached</div>
                  <div className="text-sm font-black text-text-bright">Rs {data.Revenue.ThisMonth.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-text-dim uppercase font-bold tracking-widest mb-1">Remaining</div>
                  <div className="text-sm font-black text-text-bright">Rs {Math.max(0, revenueGoal - data.Revenue.ThisMonth).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-bloom/5 border-bloom/20 group hover:border-bloom/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-bloom/10 text-bloom">
                <Zap size={18} />
              </div>
              <h3 className="text-sm font-bold text-text-bright uppercase tracking-widest">Neural Insight</h3>
            </div>
            <p className="text-xs text-text-dim leading-relaxed mb-4">
              Revenue is <span className="text-bloom font-bold">trending up 12%</span> compared to previous period. High-velocity items in <span className="text-text-bright font-bold">Electronics</span> are driving growth.
            </p>
            <Link to="/predictions" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-bloom hover:gap-3 transition-all">
              Full Prediction Report <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* --- SECONDARY METRICS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Health Card (Redesigned) */}
        <div className="card relative group hover:border-neo/30 transition-all cursor-pointer">
          <Link to="/products" className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-text-dim group-hover:text-neo transition-colors">
            <ChevronRight size={18} />
          </Link>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-text-bright tracking-tight">Product Health</h3>
            <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest">DISTRIBUTION OVERVIEW</p>
          </div>

          <div className="flex flex-col items-center gap-6 py-2">
            <div className="w-40 h-40">
              <DonutChart data={healthData} colors={healthColors} />
            </div>

            {/* Horizontal Legend (Refined) */}
            <div className="flex justify-center gap-4 w-full">
              {healthData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: healthColors[i] }} />
                  <span className="text-[8px] font-black uppercase text-text-dim tracking-tighter whitespace-nowrap">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Bottom Grid Stats */}
            <div className="w-full grid grid-cols-2 gap-x-12 gap-y-3 pt-6 border-t border-white/5">
              {healthData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: healthColors[i] }} />
                    <span className="text-[11px] font-bold text-text-mid">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-text-bright">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Critical Alerts */}
        <div className="card border-ember/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-text-bright uppercase tracking-widest">System Alerts</h3>
            <button
              onClick={() => setIsAlertsModalOpen(true)}
              className="badge-danger hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              {data.Alerts.length} Active
            </button>
          </div>
          <div className="space-y-3">
            {data.Alerts.slice(0, 3).map((alert, i) => {
              const target = alert.Section === 'Products' ? `/products?search=${alert.Message.split("'")[1] || ''}` : '/';
              return (
                <Link to={target} key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-neo/30 hover:bg-neo/5 transition-all group">
                  <AlertTriangle size={14} className={`flex-shrink-0 mt-0.5 ${alert.Level === 'Critical' ? 'text-danger' : 'text-ember'}`} />
                  <div className="text-[10px] leading-tight text-text-mid font-medium group-hover:text-text-bright transition-colors">{alert.Message}</div>
                  <ChevronRight size={12} className="ml-auto text-text-dim opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              )
            })}
            {data.Alerts.length === 0 && <div className="text-xs text-text-dim text-center py-8">All systems optimal.</div>}
            {data.Alerts.length > 3 && (
              <button
                onClick={() => setIsAlertsModalOpen(true)}
                className="w-full py-2 text-[10px] font-black uppercase text-text-dim hover:text-neo transition-colors"
              >
                + View all {data.Alerts.length} alerts
              </button>
            )}
          </div>
        </div>

        {/* AI Action Hub */}
        <div className="card bg-void/50 border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={16} className="text-neo" />
            <h3 className="text-sm font-bold text-text-bright uppercase tracking-widest">Action Hub</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/products', icon: Plus, label: 'New Product' },
              { to: '/ads', icon: Megaphone, label: 'Run Campaign' },
              { to: '/orders', icon: ShoppingCart, label: 'Review Orders' },
              { to: '/decisions', icon: Activity, label: 'Update Rules' },
            ].map(action => (
              <Link key={action.label} to={action.to} className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface border border-white/5 hover:border-neo/30 hover:bg-neo/5 transition-all gap-2 group">
                <action.icon size={18} className="text-text-dim group-hover:text-neo transition-colors" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-dim text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* --- BOTTOM ROW: Recent Decisions (Streamlined) --- */}
      <div className="card border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-text-bright uppercase tracking-widest">Recent Neural Decisions</h3>
          <Link to="/decisions" className="btn-ghost px-4 py-2 text-[10px] font-bold uppercase tracking-widest">View History</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="pb-4 text-[10px] uppercase tracking-widest text-text-dim font-bold">Category</th>
                <th className="pb-4 text-[10px] uppercase tracking-widest text-text-dim font-bold">Item</th>
                <th className="pb-4 text-[10px] uppercase tracking-widest text-text-dim font-bold">Neural Action</th>
                <th className="pb-4 text-[10px] uppercase tracking-widest text-text-dim font-bold">Time</th>
                <th className="pb-4 text-[10px] uppercase tracking-widest text-text-dim font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.RecentDecisions.slice(0, 5).map((d) => (
                <tr key={d.Id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <span className="px-2 py-1 rounded-md bg-white/5 text-[9px] font-bold uppercase tracking-widest text-text-dim">{d.Section}</span>
                  </td>
                  <td className="py-4 text-xs font-bold text-text-bright">{d.ItemName}</td>
                  <td className="py-4 text-xs text-text-mid">{d.DecisionDetails}</td>
                  <td className="py-4 text-xs text-text-dim font-mono">{new Date(d.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bloom/10 text-bloom text-[9px] font-black uppercase">
                      <div className="w-1 h-1 rounded-full bg-bloom" />
                      Executed
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
