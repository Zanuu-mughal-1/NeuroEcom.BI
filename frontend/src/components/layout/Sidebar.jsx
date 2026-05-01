import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, ShoppingCart, RotateCcw,
  Megaphone, Settings, Brain, ChevronRight, Zap, Activity
} from 'lucide-react'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    ]
  },
  {
    label: 'Commerce',
    items: [
      { to: '/products', icon: Package, label: 'Products' },
      { to: '/customers', icon: Users, label: 'Customers' },
      { to: '/orders', icon: ShoppingCart, label: 'Orders' },
      { to: '/returns', icon: RotateCcw, label: 'Returns & RTO' },
    ]
  },
  {
    label: 'Growth',
    items: [
      { to: '/ads', icon: Megaphone, label: 'Ads Manager' },
      { to: '/predictions', icon: Brain, label: 'AI Predictions' },
    ]
  },
  {
    label: 'System',
    items: [
      { to: '/decisions', icon: Activity, label: 'Decision Engine' },
    ]
  }
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen overflow-y-auto"
      style={{ background: 'rgba(10,10,18,0.95)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-bloom"
            style={{ boxShadow: '0 0 8px rgba(16,185,129,0.8)' }} />
        </div>
        <div>
          <div className="text-text-white font-bold text-base leading-none" style={{ fontFamily: 'Bebas Neue', letterSpacing: '1px', fontSize: '20px' }}>
            NeuroEcom
          </div>
          <div className="text-text-dim text-xs leading-none mt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>.BI v2.0</div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mx-4 mb-5 px-3 py-2 rounded-lg flex items-center gap-2"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <div className="glow-dot bg-bloom text-bloom" />
        <span className="text-xs text-bloom font-medium">All Systems Operational</span>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 space-y-6">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-xs font-semibold text-text-dim uppercase tracking-widest">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`nav-item group ${isActive ? 'active' : ''}`}
                  >
                    <item.icon size={16} className={isActive ? 'text-neo' : 'text-text-dim group-hover:text-text-mid'} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={12} className="text-neo opacity-60" />}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom user panel */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>A</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-bright truncate">Admin</div>
            <div className="text-xs text-text-dim">Super Admin</div>
          </div>
          <Settings size={14} className="text-text-dim" />
        </div>
      </div>
    </aside>
  )
}
