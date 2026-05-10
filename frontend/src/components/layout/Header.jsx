import { useState } from 'react'
import { Bell, Search, RefreshCw, Calendar } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import NotificationPanel from '../ui/NotificationPanel'

const pageTitles = {
  '/': 'Main Dashboard',
  '/products': 'Products',
  '/customers': 'Customers',
  '/orders': 'Orders',
  '/returns': 'Returns & RTO Shield',
  '/ads': 'Ads Manager',
  '/decisions': 'Decision Engine',
  '/predictions': 'AI Predictions',
}

export default function Header() {
  const location = useLocation()
  const [hasAlerts] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showHeaderNotifications, setShowHeaderNotifications] = useState(false)

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

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate a brief reboot delay before reloading the entire page
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }
  const title = pageTitles[location.pathname] || pageTitles[Object.keys(pageTitles).find(k => location.pathname.startsWith(k) && k !== '/') || '/']

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-border bg-abyss/80 backdrop-blur-xl sticky top-0 z-40">

      <div className="flex items-center gap-4">
        <h1 className="page-title text-2xl">{title}</h1>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-text-dim bg-surface border border-border">
          <Calendar size={11} />
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          onClick={() => alert('Search feature coming soon!')}
          className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-dim cursor-pointer hover:bg-white/5 transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', minWidth: '240px' }}>
          <Search size={14} />
          <span className="text-xs">Quick search...</span>
          <kbd className="ml-auto px-1.5 py-0.5 rounded text-xs font-mono"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Ctrl+K</kbd>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-ghost p-2 !px-2 transition-all hover:bg-white/10 active:scale-95"
          title="Refresh Page"
        >
          <RefreshCw size={15} />
        </button>
        <button
          onClick={() => alert('You have 3 new notifications')}
          className="relative btn-ghost p-2 !px-2 transition-all hover:bg-white/10 active:scale-95"
        >
          <Bell size={15} />
          {hasAlerts && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger"
              style={{ boxShadow: '0 0 6px rgba(239,68,68,0.8)' }} />
          )}
      </div>
      <button
        onClick={handleRefresh}
        className={`btn-ghost p-2 !px-2 transition-all ${isRefreshing ? 'text-neo-bright' : ''}`}
      >
        <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
      </button>
      <div className="relative">
        <button
          onClick={() => setShowHeaderNotifications(!showHeaderNotifications)}
          className="relative btn-ghost p-2 !px-2"
        >
          <Bell size={15} />
          {hasAlerts && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
          )}
        </button>
        {showHeaderNotifications && (
          <NotificationPanel
            notifications={sampleNotifications}
            onClose={() => setShowHeaderNotifications(false)}
            position="header"
          />
        )}
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-bloom bg-bloom/10 border border-bloom/20">
        <span className="w-1.5 h-1.5 rounded-full bg-bloom animate-pulse" />
        LIVE
      </div>
    </div>
    </header >
  )
}
