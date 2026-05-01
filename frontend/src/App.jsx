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
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050508' }}>
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Grid */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100" />
        {/* Top glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.3), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Sidebar */}
      <div className="relative z-10">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header />
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
