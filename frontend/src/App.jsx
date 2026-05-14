import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/dashboard/Dashboard'
import Products from './pages/products/Products'
import Customers from './pages/customers/Customers'
import Orders from './pages/orders/Orders'
import Returns from './pages/returns/Returns'
import Ads from './pages/ads/Ads'
import Decisions from './pages/decisions/Decisions'
import Predictions from './pages/predictions/Predictions'

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${isDark ? 'dark' : ''}`} 
         style={{ background: 'var(--void)', color: 'var(--text-bright)' }}>
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0 transition-colors duration-500"
           style={{ background: 'var(--void)' }}>
        {/* Grid */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.02] dark:opacity-[0.08]" />
        {/* Top glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-10 dark:opacity-20 transition-opacity duration-700"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 dark:opacity-15 transition-opacity duration-700"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Sidebar - Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar toggleTheme={toggleTheme} isDark={isDark} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/ads" element={<Ads />} />
            <Route path="/decisions" element={<Decisions />} />
            <Route path="/predictions" element={<Predictions />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
