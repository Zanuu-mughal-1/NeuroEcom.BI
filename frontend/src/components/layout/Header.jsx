import React, { useState, useEffect } from 'react'
import { Bell, Search, RefreshCw, Calendar } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'
import NotificationPanel from '../ui/NotificationPanel'
import SearchModal from '../ui/SearchModal'
import api from '../../utils/api'

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

export default function Header({ toggleSidebar }) {
  const location = useLocation()
  const [notifications, setNotifications] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showHeaderNotifications, setShowHeaderNotifications] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/dashboard')
      const data = res.data
      if (data.Alerts) {
        setNotifications(data.Alerts.map((a, i) => ({
          id: i,
          type: a.Level === 'Critical' ? 'error' : 'info',
          title: a.Level,
          message: a.Message,
          time: 'Active Now'
        })))
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    }
  }

  useEffect(() => {
    fetchAlerts()

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }

  const title = pageTitles[location.pathname] || pageTitles[Object.keys(pageTitles).find(k => location.pathname.startsWith(k) && k !== '/') || '/']

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-border bg-abyss/80 backdrop-blur-xl sticky top-0 z-40">
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-all flex flex-col gap-1"
        >
          <div className="w-5 h-0.5 bg-text-bright" />
          <div className="w-5 h-0.5 bg-text-bright" />
          <div className="w-5 h-0.5 bg-text-bright" />
        </button>
        <h1 className="page-title text-xl md:text-2xl truncate max-w-[150px] md:max-w-none text-text-bright">{title}</h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold text-text-dim bg-surface border border-border">
          <Calendar size={11} />
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div 
          onClick={() => setIsSearchOpen(true)}
          className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-dim cursor-pointer hover:bg-white/5 transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', minWidth: '240px' }}>
          <Search size={14} />
          <span className="text-xs">Quick search...</span>
          <kbd className="ml-auto px-1.5 py-0.5 rounded text-xs font-mono"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Ctrl+K</kbd>
        </div>

        <ThemeToggle />

        <button 
          onClick={handleRefresh}
          className={`p-2 rounded-lg hover:bg-white/5 transition-all ${isRefreshing ? 'text-neo' : 'text-text-dim'}`}
          title="Refresh Page"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowHeaderNotifications(!showHeaderNotifications)}
            className="relative p-2 rounded-lg hover:bg-white/5 text-text-dim transition-all"
          >
            <Bell size={15} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            )}
          </button>
          {showHeaderNotifications && (
            <NotificationPanel 
              notifications={notifications}
              onClose={() => setShowHeaderNotifications(false)}
              position="header"
            />
          )}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-bloom bg-bloom/10 border border-bloom/20">
          <span className="w-1.5 h-1.5 rounded-full bg-bloom animate-pulse" />
          LIVE
        </div>
      </div>
    </header>
  )
}
