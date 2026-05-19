/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';
import AdminDiscounts from './pages/AdminDiscounts';
import AdminSettings from './pages/AdminSettings';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-zinc-950 text-white selection:bg-electric-blue selection:text-zinc-950">
              <Toaster position="top-center" expand={false} richColors closeButton />
              
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<><Navbar /><CartDrawer /><main><Home /></main><Footer /></>} />
                <Route path="/shop" element={<><Navbar /><CartDrawer /><main><Shop /></main><Footer /></>} />
                <Route path="/product/:id" element={<><Navbar /><CartDrawer /><main><ProductDetail /></main><Footer /></>} />
                <Route path="/checkout" element={<><Navbar /><CartDrawer /><main><Checkout /></main><Footer /></>} />
                <Route path="/profile" element={<><Navbar /><CartDrawer /><main><Profile /></main><Footer /></>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="discounts" element={<AdminDiscounts />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Routes>
            </div>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
