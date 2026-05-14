import { useState, useEffect } from 'react'
import { X, Search, RotateCcw, Package, Users, ShoppingBag, RefreshCw } from 'lucide-react'
import api from '../../utils/api'

export default function ReturnModal({ isOpen, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  
  const [formData, setFormData] = useState({
    OrderId: '',
    CustomerId: '',
    ProductId: '',
    Quantity: 1,
    ReturnReason: 'Wrong Size',
    AdditionalComments: '',
    Status: 'Pending'
  })

  const [error, setError] = useState(null)
  
  useEffect(() => {
    if (isOpen) {
      setError(null)
      api.get('/products').then(res => setProducts(res.data)).catch(e => console.error(e))
      api.get('/customers').then(res => setCustomers(res.data)).catch(e => console.error(e))
      api.get('/orders').then(res => setOrders(res.data)).catch(e => console.error(e))
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.OrderId || !formData.CustomerId || !formData.ProductId) {
      setError('Please select an Order, Customer, and Product.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await api.post('/returns', {
        OrderId: parseInt(formData.OrderId),
        CustomerId: parseInt(formData.CustomerId),
        ProductId: parseInt(formData.ProductId),
        Quantity: parseInt(formData.Quantity),
        ReturnReason: formData.ReturnReason,
        AdditionalComments: formData.AdditionalComments,
        Status: 'Pending'
      })
      onSave()
      onClose()
    } catch (err) {
      console.error('Failed to create return', err)
      const errorMsg = err.response?.data?.message 
        || err.response?.data?.title 
        || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : null)
        || 'Failed to create return request. Please check your inputs.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
      <div className="card w-full max-w-lg shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors">
          <X size={20} className="text-text-dim" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-royal/10 border border-royal/20">
            <RotateCcw size={20} className="text-royal" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-white">Create Return Request</h2>
            <p className="text-xs text-text-dim mt-0.5">Initialize a new product return workflow</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg text-xs font-medium animate-shake" 
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="stat-label mb-1.5 block">Select Order</label>
              <div className="relative">
                <ShoppingBag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <select className="select pl-9 w-full" value={formData.OrderId} 
                  onChange={e => setFormData({...formData, OrderId: e.target.value})} required>
                  <option value="">Choose Order...</option>
                  {orders.map(o => (
                    <option key={o.Id} value={o.Id}>{o.OrderNumber} (${o.TotalAmount})</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="stat-label mb-1.5 block">Select Customer</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <select className="select pl-9 w-full" value={formData.CustomerId} 
                  onChange={e => setFormData({...formData, CustomerId: e.target.value})} required>
                  <option value="">Choose Customer...</option>
                  {customers.map(c => (
                    <option key={c.Id} value={c.Id}>{c.FirstName} {c.LastName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="stat-label mb-1.5 block">Product</label>
              <div className="relative">
                <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <select className="select pl-9 w-full" value={formData.ProductId} 
                  onChange={e => setFormData({...formData, ProductId: e.target.value})} required>
                  <option value="">Select Product...</option>
                  {products.map(p => (
                    <option key={p.Id} value={p.Id}>{p.Name} ({p.SKU})</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="stat-label mb-1.5 block">Quantity</label>
              <input type="number" className="input w-full" value={formData.Quantity} min="1"
                onChange={e => setFormData({...formData, Quantity: e.target.value})} required />
            </div>
          </div>

          <div>
            <label className="stat-label mb-1.5 block">Return Reason</label>
            <select className="select w-full" value={formData.ReturnReason} 
              onChange={e => setFormData({...formData, ReturnReason: e.target.value})}>
              <option value="Wrong Size">Wrong Size</option>
              <option value="Defective">Defective / Damaged</option>
              <option value="Not as Described">Not as Described</option>
              <option value="Wrong Item">Wrong Item Received</option>
              <option value="No Longer Needed">No Longer Needed</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="stat-label mb-1.5 block">Additional Comments</label>
            <textarea className="input w-full h-20 py-2 resize-none" placeholder="Provide more details for the warehouse team..."
              value={formData.AdditionalComments} onChange={e => setFormData({...formData, AdditionalComments: e.target.value})} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <RotateCcw size={16} />}
              Create Return
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
