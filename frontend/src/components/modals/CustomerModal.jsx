import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../../utils/api'

export default function CustomerModal({ isOpen, onClose, onSuccess, customer = null }) {
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    City: '',
    LoyaltyTier: 'New',
    ShippingAddress: '',
    BillingAddress: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (customer) {
      setFormData({
        FirstName: customer.FirstName || '',
        LastName: customer.LastName || '',
        Email: customer.Email || '',
        Phone: customer.Phone || '',
        City: customer.City || '',
        LoyaltyTier: customer.LoyaltyTier || 'New',
        ShippingAddress: customer.ShippingAddress || '',
        BillingAddress: customer.BillingAddress || ''
      })
    } else {
      setFormData({
        FirstName: '', LastName: '', Email: '', Phone: '',
        City: '', LoyaltyTier: 'New', ShippingAddress: '', BillingAddress: ''
      })
    }
  }, [customer, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (customer) {
        await api.put(`/customers/${customer.Id}`, formData)
      } else {
        await api.post('/customers', formData)
      }
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to save customer', err)
      setError(err?.response?.data?.message || 'Error saving customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg animate-scale-up">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-text-bright">{customer ? 'Edit Customer' : 'New Customer'}</h2>
          <button onClick={onClose} className="text-text-dim hover:text-text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            ⚠ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">First Name</label>
              <input required className="input w-full" value={formData.FirstName} onChange={e => setFormData({...formData, FirstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Last Name</label>
              <input required className="input w-full" value={formData.LastName} onChange={e => setFormData({...formData, LastName: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Email</label>
              <input required type="email" className="input w-full" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Phone</label>
              <input required className="input w-full" value={formData.Phone} onChange={e => setFormData({...formData, Phone: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">City</label>
              <input required className="input w-full" value={formData.City} onChange={e => setFormData({...formData, City: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Loyalty Tier</label>
              <select className="select w-full" value={formData.LoyaltyTier} onChange={e => setFormData({...formData, LoyaltyTier: e.target.value})}>
                <option value="New">New</option>
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-mid mb-1">Shipping Address</label>
            <textarea className="input w-full h-16 resize-none py-2" value={formData.ShippingAddress} onChange={e => setFormData({...formData, ShippingAddress: e.target.value})} />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
