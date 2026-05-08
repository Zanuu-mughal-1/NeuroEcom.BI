import { useState } from 'react'
import { Bell, Search, RefreshCw, Calendar } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'

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
  const title = pageTitles[location.pathname] || pageTitles[Object.keys(pageTitles).find(k => location.pathname.startsWith(k) && k !== '/') || '/']

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b"
      style={{ background: 'var(--bg-secondary)', backdropFilter: 'blur(20px)', borderColor: 'var(--border-color)', opacity: 0.95 }}>
      
      <div className="flex items-center gap-4">
        <h1 className="page-title text-2xl" style={{ color: 'var(--text-white)' }}>{title}</h1>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-text-dim"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
          <Calendar size={11} />
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-dim"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', minWidth: '200px' }}>
          <Search size={14} />
          <span className="text-xs">Quick search...</span>
          <kbd className="ml-auto px-1.5 py-0.5 rounded text-xs"
            style={{ background: 'var(--glass-border)', border: '1px solid var(--border-color)' }}>Ctrl+K</kbd>
        </div>
        
        <ThemeToggle />

        <button className="btn-ghost p-2 !px-2">
          <RefreshCw size={15} />
        </button>
        
        <button className="relative btn-ghost p-2 !px-2">
          <Bell size={15} />
          {hasAlerts && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: 'var(--color-danger)', boxShadow: '0 0 6px var(--color-danger)' }} />
          )}
        </button>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-bloom"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-bloom animate-pulse" />
          LIVE
        </div>
      </div>
    </header>
  )
}
