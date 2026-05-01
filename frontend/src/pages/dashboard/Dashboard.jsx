import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign, ShoppingCart, Users, RotateCcw, TrendingUp,
  AlertTriangle, CheckCircle, Clock, XCircle, Package,
  Plus, FlaskConical, Megaphone, Upload, Activity, Zap
} from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import { SalesAreaChart, DonutChart } from '../../components/charts/MiniChart'
import { mockDashboard, generateSalesData } from '../../utils/api'

export default function Dashboard() {
  const [data] = useState(mockDashboard)
  const [salesData] = useState(generateSalesData(30))

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
    Critical: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: XCircle, color: '#f87171' },
    Warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: AlertTriangle, color: '#fbbf24' },
    Info: { bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)', icon: CheckCircle, color: '#22d3ee' },
  }

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Monthly Revenue" value={`$${(data.Revenue.ThisMonth/1000).toFixed(1)}K`} change={12} changeLabel="vs last month" icon={DollarSign} color="neo" />
        <KpiCard label="Total Orders" value={data.Orders.Total.toLocaleString()} change={5} changeLabel="vs last month" icon={ShoppingCart} color="pulse" />
        <KpiCard label="Customers" value={data.Customers.Total.toLocaleString()} change={8} changeLabel="vs last month" icon={Users} color="bloom" />
        <KpiCard label="Return Rate" value={`${data.ReturnRate}%`} change={-2} changeLabel="vs last month" icon={RotateCcw} color="ember" />
        <KpiCard label="Ad ROI" value={`${data.ROI}%`} change={15} changeLabel="vs last month" icon={TrendingUp} color="royal" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Trend */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title">Revenue Trend</div>
              <div className="section-subtitle">Last 30 days performance</div>
            </div>
            <div className="flex gap-2">
              {['7D','30D','90D'].map((d,i) => (
                <button key={d} className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${i===1 ? 'bg-neo/20 text-neo-bright border border-neo/30' : 'text-text-dim hover:text-text-mid'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="h-52">
            <SalesAreaChart data={salesData} color="#6366f1" dataKey="revenue" prefix="$" />
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
        {/* Customer Loyalty */}
        <div className="card">
          <div className="section-title mb-1">Customer Loyalty</div>
          <div className="section-subtitle mb-4">Tier distribution</div>
          <div className="h-32">
            <DonutChart data={loyaltyData} colors={loyaltyColors} />
          </div>
          <div className="space-y-1.5 mt-2">
            {[
              { tier: 'VIP', val: data.CustomerLoyalty.VIP, icon: '💎', color: '#818cf8' },
              { tier: 'Gold', val: data.CustomerLoyalty.Gold, icon: '⭐', color: '#fbbf24' },
              { tier: 'Silver', val: data.CustomerLoyalty.Silver, icon: '🥈', color: '#9ca3af' },
            ].map(t => (
              <div key={t.tier} className="flex items-center justify-between text-xs">
                <span className="text-text-dim">{t.icon} {t.tier}</span>
                <span className="font-bold" style={{ color: t.color }}>{t.val.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RTO Shield */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)' }}>
              <Activity size={14} className="text-neo" />
            </div>
            <div>
              <div className="section-title">RTO Shield</div>
              <div className="section-subtitle">Today</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-bloom" />
                <span className="text-xs text-text-mid">Auto-approved</span>
              </div>
              <span className="text-lg font-bold text-bloom">{data.RTOToday.AutoApproved}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-ember" />
                <span className="text-xs text-text-mid">Manual review</span>
              </div>
              <span className="text-lg font-bold text-ember">{data.RTOToday.ManualReview}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div className="flex items-center gap-2">
                <XCircle size={14} className="text-danger" />
                <span className="text-xs text-text-mid">Auto-rejected</span>
              </div>
              <span className="text-lg font-bold text-danger">{data.RTOToday.AutoRejected}</span>
            </div>
          </div>
        </div>

        {/* Active Ads */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)' }}>
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
                <div className="text-lg font-bold text-ember mt-0.5">${data.ActiveAds.TotalSpend.toLocaleString()}</div>
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
            ${data.Revenue.Today.toLocaleString()}
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
              <span className="font-bold text-text-bright">$264.89</span>
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
                <div key={d.Id} className="flex items-start gap-3 p-2.5 rounded-lg table-row border-none"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Icon size={13} className={decisionColors[d.Section] || 'text-text-dim'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-text-bright truncate">{d.ItemName}</div>
                    <div className="text-xs text-text-dim truncate">{d.DecisionDetails}</div>
                  </div>
                  <span className="text-xs text-text-dim flex-shrink-0">
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
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                  <Icon size={14} style={{ color: style.color }} className="flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-text-mid leading-relaxed">{alert.Message}</div>
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
              { to: '/products', icon: Plus, label: 'Add Product', color: 'neo' },
              { to: '/returns', icon: FlaskConical, label: 'Test RTO', color: 'ember' },
              { to: '/ads', icon: Megaphone, label: 'Create Ad', color: 'bloom' },
              { to: '/decisions', icon: Activity, label: 'View Rules', color: 'royal' },
            ].map(action => {
              const colorBg = { neo: 'rgba(99,102,241,0.1)', ember: 'rgba(245,158,11,0.1)', bloom: 'rgba(16,185,129,0.1)', royal: 'rgba(139,92,246,0.1)' }
              const colorBorder = { neo: 'rgba(99,102,241,0.2)', ember: 'rgba(245,158,11,0.2)', bloom: 'rgba(16,185,129,0.2)', royal: 'rgba(139,92,246,0.2)' }
              const colorText = { neo: '#818cf8', ember: '#fbbf24', bloom: '#34d399', royal: '#a78bfa' }
              return (
                <Link key={action.label} to={action.to}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 cursor-pointer"
                  style={{ background: colorBg[action.color], border: `1px solid ${colorBorder[action.color]}` }}>
                  <action.icon size={20} style={{ color: colorText[action.color] }} />
                  <span className="text-xs font-medium text-text-mid text-center">{action.label}</span>
                </Link>
              )
            })}
          </div>
          <div className="mt-4 p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Zap size={16} className="text-neo-bright" />
            <div>
              <div className="text-xs font-semibold text-neo-bright">AI Insights Ready</div>
              <div className="text-xs text-text-dim">3 recommendations available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
