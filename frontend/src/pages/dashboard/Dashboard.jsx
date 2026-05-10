import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign, ShoppingCart, Users, RotateCcw, TrendingUp,
  AlertTriangle, CheckCircle, Clock, XCircle, Package,
  Plus, FlaskConical, Megaphone, Upload, Activity, Zap, Download
} from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import { SalesAreaChart, DonutChart } from '../../components/charts/MiniChart'
import api from '../../utils/api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('30D')
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboard = async (isRefresh = false) => {
    try {
      setError(null)
      if (!isRefresh) setLoading(true)
      else setRefreshing(true)

      const days = timeRange === '7D' ? 7 : timeRange === '90D' ? 90 : 30
      const res = await api.get(`/dashboard?days=${days}`)
      setData(res.data)
    } catch (err) {
      console.error('Failed to fetch dashboard', err)
      setError('Connection failed. Please ensure the backend and SQL Server are running.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [timeRange])

  if (loading) return <div className="p-6 text-text-dim animate-pulse">Loading Neuro-Dashboard...</div>
  
  if (error) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-center max-w-md">
        <h3 className="font-bold mb-1">Database Connection Error</h3>
        <p className="text-sm opacity-80">{error}</p>
      </div>
      <button onClick={() => fetchDashboard()} className="btn-primary">Retry Connection</button>
    </div>
  )

  if (!data) return null

  const healthData = [
    { name: 'Healthy', value: data.ProductHealth.Healthy },
    { name: 'Warning', value: data.ProductHealth.Warning },
    { name: 'Critical', value: data.ProductHealth.Critical },
    { name: 'Discontinued', value: data.ProductHealth.Discontinued },
  ]
  const healthColors = ['#10b981', '#f59e0b', '#ef4444', '#6b7280']

  const loyaltyData = [
    { name: 'VIP', value: data.CustomerLoyalty.VIP },
    { name: 'Gold', value: data.CustomerLoyalty.Gold },
    { name: 'Silver', value: data.CustomerLoyalty.Silver },
    { name: 'Bronze', value: data.CustomerLoyalty.Bronze },
  ]
  const loyaltyColors = ['#6366f1', '#f59e0b', '#9ca3af', '#f97316']

  const decisionIcons = { Products: Package, Customers: Users, Orders: ShoppingCart, Ads: Megaphone, Returns: RotateCcw }
  const decisionColors = { Products: 'text-neo', Customers: 'text-pulse', Orders: 'text-ember', Ads: 'text-bloom', Returns: 'text-royal' }

  const alertStyles = {
    Critical: { className: 'bg-danger/10 border-danger/20 text-danger dark:text-danger-bright', icon: XCircle },
    Warning: { className: 'bg-ember/10 border-ember/20 text-ember dark:text-ember-bright', icon: AlertTriangle },
    Info: { className: 'bg-pulse/10 border-pulse/20 text-pulse dark:text-pulse-bright', icon: CheckCircle },
  }

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Executive Overview</h1>
          <p className="text-sm text-text-dim">Real-time business intelligence & analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-xs text-text-dim uppercase tracking-wider font-semibold">Last Updated</div>
            <div className="text-xs text-bloom font-mono">{new Date().toLocaleTimeString()}</div>
          </div>
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className={`p-2.5 rounded-xl border border-white/10 transition-all ${refreshing ? 'animate-spin opacity-50' : 'hover:bg-white/5 active:scale-95'}`}
          >
            <RotateCcw size={18} className="text-text-mid" />
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download size={14} />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/orders" className="block hover:no-underline">
          <KpiCard label="Monthly Revenue" value={`Rs ${(data.Revenue.ThisMonth / 1000).toFixed(1)}K`} change={12} changeLabel="vs last month" icon={DollarSign} color="neo" />
        </Link>
        <Link to="/orders" className="block hover:no-underline">
          <KpiCard label="Total Orders" value={data.Orders.Total.toLocaleString()} change={5} changeLabel="vs last month" icon={ShoppingCart} color="pulse" />
        </Link>
        <Link to="/customers" className="block hover:no-underline">
          <KpiCard label="Customers" value={data.Customers.Total.toLocaleString()} change={8} changeLabel="vs last month" icon={Users} color="bloom" />
        </Link>
        <Link to="/returns" className="block hover:no-underline">
          <KpiCard label="Return Rate" value={`${data.ReturnRate}%`} change={-2} changeLabel="vs last month" icon={RotateCcw} color="ember" />
        </Link>
        <Link to="/ads" className="block hover:no-underline">
          <KpiCard label="Ad ROI" value={`${data.ROI}%`} change={15} changeLabel="vs last month" icon={TrendingUp} color="royal" />
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Trend */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title">Revenue Trend</div>
              <div className="section-subtitle">Last {timeRange === '7D' ? '7 days' : timeRange === '90D' ? '90 days' : '30 days'} performance</div>
            </div>
            <div className="flex gap-2">
              {['7D', '30D', '90D'].map((d) => (
                <button
                  key={d}
                  onClick={() => setTimeRange(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${timeRange === d ? 'bg-neo text-white shadow-lg shadow-neo/20' : 'bg-white/5 text-text-dim hover:bg-white/10 hover:text-text-mid'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="h-52">
            <SalesAreaChart data={data.SalesData} color="#6366f1" dataKey="revenue" prefix="Rs" />
          </div>
        </div>

        {/* Product Health */}
        <div className="card">
          <div className="section-title mb-1">Product Health</div>
          <div className="section-subtitle mb-4">Distribution overview</div>
          <div className="h-40">
            <DonutChart data={healthData} colors={healthColors} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {healthData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: healthColors[i] }} />
                <span className="text-xs text-text-dim">{item.name}</span>
                <span className="text-xs font-bold text-text-bright ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Revenue Goal Tracking */}
        <div className="card">
          <div className="flex items-center justify-between mb-1">
            <div className="section-title">Revenue Goal</div>
            <span className="text-xs font-bold text-bloom">85%</span>
          </div>
          <div className="section-subtitle mb-4">Monthly target: Rs 1,000,000</div>

          <div className="space-y-4">
            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-neo to-pulse transition-all duration-1000 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                style={{ width: '85%' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Rs 850,240 reached</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-text-dim uppercase tracking-wider">Remaining</div>
                <div className="text-sm font-bold text-text-bright">Rs 149,760</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-text-dim uppercase tracking-wider">Avg/Day Needed</div>
                <div className="text-sm font-bold text-ember">Rs 12,480</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-bloom bg-bloom/5 p-2 rounded-lg border border-bloom/10">
              <TrendingUp size={12} />
              <span>On track to exceed target by 12%</span>
            </div>
          </div>
        </div>

        {/* RTO Shield */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-neo/10">
              <Activity size={14} className="text-neo" />
            </div>
            <div>
              <div className="section-title">RTO Shield</div>
              <div className="section-subtitle">Today</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-bloom/5 border border-bloom/20 transition-all hover:bg-bloom/10">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-bloom" />
                <span className="text-xs text-text-mid font-medium">Auto-approved</span>
              </div>
              <span className="text-lg font-bold text-bloom">{data.RTOToday.AutoApproved}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-ember/5 border border-ember/20 transition-all hover:bg-ember/10">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-ember" />
                <span className="text-xs text-text-mid font-medium">Manual review</span>
              </div>
              <span className="text-lg font-bold text-ember">{data.RTOToday.ManualReview}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-danger/5 border border-danger/20 transition-all hover:bg-danger/10">
              <div className="flex items-center gap-2">
                <XCircle size={14} className="text-danger" />
                <span className="text-xs text-text-mid font-medium">Auto-rejected</span>
              </div>
              <span className="text-lg font-bold text-danger">{data.RTOToday.AutoRejected}</span>
            </div>
          </div>
        </div>

        {/* Active Ads */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-bloom/10">
              <Megaphone size={14} className="text-bloom" />
            </div>
            <div>
              <div className="section-title">Active Ads</div>
              <div className="section-subtitle">Campaign overview</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="stat-label">Active Campaigns</div>
              <div className="text-3xl font-bold text-text-white mt-1" style={{ fontFamily: 'Bebas Neue' }}>{data.ActiveAds.Count}</div>
            </div>
            <div className="divider" />
            <div className="flex justify-between">
              <div>
                <div className="stat-label">Total Spend</div>
                <div className="text-lg font-bold text-ember mt-0.5">Rs {data.ActiveAds.TotalSpend.toLocaleString()}</div>
              </div>
              <div>
                <div className="stat-label">Avg ROI</div>
                <div className="text-lg font-bold text-bloom mt-0.5">{data.ActiveAds.AvgROI}%</div>
              </div>
            </div>
            <Link to="/ads" className="btn-primary w-full text-center block text-xs">View Campaigns →</Link>
          </div>
        </div>

        {/* Today Revenue */}
        <div className="card">
          <div className="section-title mb-1">Today's Revenue</div>
          <div className="section-subtitle mb-4">vs. yesterday</div>
          <div className="text-4xl font-bold text-text-white mb-2" style={{ fontFamily: 'Bebas Neue' }}>
            Rs {data.Revenue.Today.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            <TrendingUp size={13} className="text-bloom" />
            <span className="text-xs text-bloom font-semibold">+8.3% from yesterday</span>
          </div>
          <div className="divider mb-4" />
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-dim">Orders today</span>
              <span className="font-bold text-text-bright">47</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-dim">Avg order value</span>
              <span className="font-bold text-text-bright">Rs 264.89</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-dim">Pending fulfillment</span>
              <span className="font-bold text-ember">{data.Orders.Pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Decisions + Alerts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Decisions */}
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title">Recent Decisions</div>
            <Link to="/decisions" className="text-xs text-neo hover:text-neo-bright transition-colors">View all →</Link>
          </div>
          <div className="space-y-2">
            {data.RecentDecisions.map(d => {
              const Icon = decisionIcons[d.Section] || Activity
              return (
                <div key={d.Id} className="flex items-start gap-3 p-2.5 rounded-lg bg-surface/50 border border-border hover:bg-surface transition-all">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-void">
                    <Icon size={13} className={decisionColors[d.Section] || 'text-text-dim'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-text-bright truncate">{d.ItemName}</div>
                    <div className="text-xs text-text-dim truncate">{d.DecisionDetails}</div>
                  </div>
                  <span className="text-xs text-text-dim flex-shrink-0 font-mono">
                    {new Date(d.CreatedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title">Active Alerts</div>
            <span className="badge-danger">{data.Alerts.length} alerts</span>
          </div>
          <div className="space-y-2.5">
            {data.Alerts.map((alert, i) => {
              const style = alertStyles[alert.Level] || alertStyles.Info
              const Icon = style.icon
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${style.className}`}>
                  <Icon size={14} className="flex-shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">{alert.Message}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="section-title mb-1">Quick Actions</div>
          <div className="section-subtitle mb-4">Common tasks</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/products', icon: Plus, label: 'Add Product', color: 'neo', classes: 'bg-neo/10 border-neo/20 text-neo dark:text-neo-bright' },
              { to: '/returns', icon: FlaskConical, label: 'Test RTO', color: 'ember', classes: 'bg-ember/10 border-ember/20 text-ember dark:text-ember-bright' },
              { to: '/ads', icon: Megaphone, label: 'Create Ad', color: 'bloom', classes: 'bg-bloom/10 border-bloom/20 text-bloom dark:text-bloom-bright' },
              { to: '/decisions', icon: Activity, label: 'View Rules', color: 'royal', classes: 'bg-royal/10 border-royal/20 text-royal dark:text-royal-bright' },
            ].map(action => {
              return (
                <Link key={action.label} to={action.to}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 cursor-pointer border ${action.classes}`}>
                  <action.icon size={20} />
                  <span className="text-xs font-medium text-center opacity-80">{action.label}</span>
                </Link>
              )
            })}
          </div>
          <div className="mt-4 p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all hover:bg-surface border border-neo/20 bg-gradient-to-br from-neo/5 to-royal/5">
            <Zap size={16} className="text-neo dark:text-neo-bright" />
            <div>
              <div className="text-xs font-bold text-neo dark:text-neo-bright">AI Insights Ready</div>
              <div className="text-[10px] text-text-dim uppercase font-bold tracking-tighter">3 recommendations available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
