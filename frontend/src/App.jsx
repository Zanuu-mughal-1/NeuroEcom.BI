import { Suspense, lazy, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import ErrorBoundary from './components/ErrorBoundary'
import { useTheme } from './context/ThemeContext'

const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const Products = lazy(() => import('./pages/products/Products'))
const Customers = lazy(() => import('./pages/customers/Customers'))
const Orders = lazy(() => import('./pages/orders/Orders'))
const Returns = lazy(() => import('./pages/returns/Returns'))
const Ads = lazy(() => import('./pages/ads/Ads'))
const Decisions = lazy(() => import('./pages/decisions/Decisions'))
const Predictions = lazy(() => import('./pages/predictions/Predictions'))
const Logistics = lazy(() => import('./pages/logistics/Logistics'))
const CompetitorIntel = lazy(() => import('./pages/competitors/CompetitorIntel'))

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev)

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-500" style={{ background: 'var(--bg-primary)' }}>
      {/* Background effects — only visible in dark mode */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
             style={{ background: 'var(--body-bg)' }}>
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.09]" />
          <div className="absolute -top-24 left-1/5 w-[560px] h-[560px] rounded-full opacity-[0.35]"
            style={{ background: 'radial-gradient(circle, rgba(0,234,255,0.34), transparent 68%)', filter: 'blur(86px)' }} />
          <div className="absolute top-12 right-0 w-[520px] h-[520px] rounded-full opacity-[0.30]"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.28), transparent 70%)', filter: 'blur(92px)' }} />
          <div className="absolute bottom-[-18%] left-1/3 w-[640px] h-[340px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.16), transparent 70%)', filter: 'blur(80px)' }} />
        </div>
      )}

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
          <ErrorBoundary>
            <Suspense fallback={<div className="p-6 text-sm text-text-dim">Loading workspace...</div>}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/ads" element={<Ads />} />
                <Route path="/decisions" element={<Decisions />} />
                <Route path="/predictions" element={<Predictions />} />
                <Route path="/logistics" element={<Logistics />} />
                <Route path="/competitors" element={<CompetitorIntel />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
