import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, ShoppingCart, RotateCcw,
  Megaphone, Settings, Brain, ChevronRight, Zap, Activity,
  Moon, Sun, LogOut, Bell
} from 'lucide-react'
import NotificationPanel from '../ui/NotificationPanel'

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

export default function Sidebar({ toggleTheme, isDark }) {
  const location = useLocation()
  const [showSettings, setShowSettings] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  
  const sampleNotifications = [
    {
      type: 'info',
      title: 'New Order Received',
      message: 'Order #12345 from John Doe',
      time: '2 minutes ago'
    },
    {
      type: 'success',
      title: 'Prediction Complete',
      message: 'AI model has finished analyzing customer trends',
      time: '15 minutes ago'
    },
    {
      type: 'error',
      title: 'Low Stock Alert',
      message: 'Product SKU-789 is running low',
      time: '1 hour ago'
    },
    {
      type: 'info',
      title: 'System Maintenance',
      message: 'Database backup completed successfully',
      time: '3 hours ago'
    }
  ]

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen overflow-y-auto bg-abyss border-r border-border relative z-50">
      
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
          <div className="text-text-white dark:text-text-white font-bold text-base leading-none" style={{ fontFamily: 'Bebas Neue', letterSpacing: '1px', fontSize: '20px' }}>
            NeuroEcom
          </div>
          <div className="text-text-dim text-xs leading-none mt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>.BI v1.0</div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mx-4 mb-5 px-3 py-2 rounded-lg flex items-center gap-2 bg-bloom/10 border border-bloom/20">
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

      {/* Settings Dropdown/Popover */}
      {showSettings && (
        <div className="absolute bottom-20 left-4 right-4 glass rounded-xl border border-border p-2 animate-fade-up shadow-xl z-50">
          <div className="p-2 border-b border-border mb-1">
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider opacity-70">Quick Settings</div>
          </div>
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-void text-sm text-text-bright transition-colors"
          >
            {isDark ? <Sun size={14} className="text-ember" /> : <Moon size={14} className="text-neo" />}
            <span className="flex-1 text-left">{isDark ? 'Light' : 'Dark'} Mode</span>
          </button>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-void text-sm text-text-bright transition-colors relative"
          >
            <Bell size={14} className="text-pulse" />
            <span className="flex-1 text-left">Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-danger/10 text-sm text-danger transition-colors mt-1">
            <LogOut size={14} />
            <span className="flex-1 text-left">Logout</span>
          </button>
        </div>
      )}

      {/* Notification Panel for Settings */}
      {showNotifications && (
        <div className="absolute bottom-48 left-4 right-4 z-50">
          <NotificationPanel 
            notifications={sampleNotifications}
            onClose={() => setShowNotifications(false)}
            position="sidebar"
          />
        </div>
      )}

      {/* Bottom user panel */}
      <div className="p-3 border-t border-border">
        <div 
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-void ${showSettings ? 'bg-void ring-1 ring-border' : ''}`}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>A</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-bright truncate">Admin</div>
            <div className="text-[10px] text-text-dim font-medium uppercase tracking-tighter">Super Admin</div>
          </div>
          <Settings size={14} className={`text-text-dim transition-transform duration-300 ${showSettings ? 'rotate-90 text-neo' : ''}`} />
        </div>
      </div>
    </aside>
  )
}
