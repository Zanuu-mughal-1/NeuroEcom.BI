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
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-text-dim transition-all focus-within:border-neo/50 focus-within:bg-surface border border-border bg-void min-w-[240px]">
          <Search size={14} className={searchQuery ? 'text-neo-bright' : ''} />
          <input 
            type="text"
            placeholder="Quick search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-text-bright w-full placeholder:text-text-dim/50"
          />
          {!searchQuery && (
            <kbd className="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-abyss border border-border">Ctrl+K</kbd>
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
    </header>
  )
}
