import React, { useState, useEffect, useRef } from 'react'
import { Search, Package, User, ShoppingCart, X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ products: [], orders: [], customers: [] })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults({ products: [], orders: [], customers: [] })
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], orders: [], customers: [] })
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const [prodRes, orderRes, custRes] = await Promise.all([
          api.get(`/products?search=${query}`),
          api.get(`/orders?search=${query}`),
          api.get(`/customers?search=${query}`)
        ])

        setResults({
          products: prodRes.data.slice(0, 3),
          orders: orderRes.data.slice(0, 3),
          customers: custRes.data.slice(0, 3)
        })
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  const handleNavigate = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl glass rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Input Area */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-surface/50">
          <Search className="text-neo" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, or customers..."
            className="flex-1 bg-transparent border-none outline-none text-text-bright placeholder:text-text-dim text-lg"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-text-dim" onMouseEnter={e => e.currentTarget.style.background = 'var(--subtle-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={18} />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {!query ? (
            <div className="py-8 text-center">
              <p className="text-text-dim text-sm">Start typing to search across your BI system...</p>
              <div className="flex justify-center gap-4 mt-6 text-xs text-text-dim">
                <span className="flex items-center gap-1"><Package size={12}/> Products</span>
                <span className="flex items-center gap-1"><ShoppingCart size={12}/> Orders</span>
                <span className="flex items-center gap-1"><User size={12}/> Customers</span>
              </div>
            </div>
          ) : isLoading ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-8 h-8 border-2 border-neo border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-text-dim text-sm">Searching the neural networks...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Products Section */}
              {results.products.length > 0 && (
                <section>
                  <h3 className="text-[10px] uppercase tracking-widest text-text-dim font-bold mb-3 flex items-center gap-2">
                    <Package size={12} className="text-neo" />
                    Products
                  </h3>
                  <div className="space-y-1">
                    {results.products.map(p => (
                      <button 
                        key={p.Id}
                        onClick={() => handleNavigate(`/products?id=${p.Id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl group transition-colors text-left"
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--subtle-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border">
                            <Package size={16} className="text-text-mid" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-bright group-hover:text-neo transition-colors">{p.Name}</p>
                            <p className="text-xs text-text-dim">SKU: {p.SKU} • Stock: {p.Stock}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-text-dim opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Customers Section */}
              {results.customers.length > 0 && (
                <section>
                  <h3 className="text-[10px] uppercase tracking-widest text-text-dim font-bold mb-3 flex items-center gap-2">
                    <User size={12} className="text-bloom" />
                    Customers
                  </h3>
                  <div className="space-y-1">
                    {results.customers.map(c => (
                      <button 
                        key={c.Id}
                        onClick={() => handleNavigate(`/customers?id=${c.Id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl group transition-colors text-left"
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--subtle-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border">
                            <User size={16} className="text-text-mid" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-bright group-hover:text-bloom transition-colors">{c.FirstName} {c.LastName}</p>
                            <p className="text-xs text-text-dim">{c.Email} • {c.LoyaltyTier}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-text-dim opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Orders Section */}
              {results.orders.length > 0 && (
                <section>
                  <h3 className="text-[10px] uppercase tracking-widest text-text-dim font-bold mb-3 flex items-center gap-2">
                    <ShoppingCart size={12} className="text-danger" />
                    Orders
                  </h3>
                  <div className="space-y-1">
                    {results.orders.map(o => (
                      <button 
                        key={o.Id}
                        onClick={() => handleNavigate(`/orders?id=${o.Id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl group transition-colors text-left"
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--subtle-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border">
                            <ShoppingCart size={16} className="text-text-mid" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-bright group-hover:text-danger transition-colors">{o.OrderNumber}</p>
                            <p className="text-xs text-text-dim">Rs {o.TotalAmount} • {o.FulfillmentStatus}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-text-dim opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {results.products.length === 0 && results.orders.length === 0 && results.customers.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-text-dim">No results found for "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shortcut Footer */}
        <div className="px-4 py-3 border-t border-border bg-surface/30 flex items-center justify-between text-[10px] font-medium text-text-dim">
          <div className="flex gap-4">
            <span><kbd className="px-1.5 py-0.5 rounded text-text-mid" style={{ background: 'var(--subtle-kbd-bg)', border: '1px solid var(--subtle-kbd-border)' }}>↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded text-text-mid" style={{ background: 'var(--subtle-kbd-bg)', border: '1px solid var(--subtle-kbd-border)' }}>Enter</kbd> Select</span>
          </div>
          <span><kbd className="px-1.5 py-0.5 rounded text-text-mid" style={{ background: 'var(--subtle-kbd-bg)', border: '1px solid var(--subtle-kbd-border)' }}>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  )
}
