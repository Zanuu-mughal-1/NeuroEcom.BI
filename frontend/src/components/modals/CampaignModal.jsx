import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../../utils/api'

export default function CampaignModal({ isOpen, onClose, onSuccess, campaign = null }) {
  const [formData, setFormData] = useState({
    Name: '',
    Platform: 'Facebook',
    Budget: '',
    Status: 'Draft',
    ProductId: '',
    InitialSpend: '',
    InitialRevenue: '',
    InitialClicks: ''
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products')
        setProducts(data)
      } catch (err) {
        console.error('Failed to fetch products', err)
      }
    }
    if (isOpen) fetchProducts()
  }, [isOpen])

  useEffect(() => {
    if (campaign) {
      setFormData({
        Name: campaign.Name || '',
        Platform: campaign.Platform || 'Facebook',
        Budget: campaign.Budget || '',
        Status: campaign.Status || 'Draft',
        ProductId: campaign.ProductId || '',
        InitialSpend: '',
        InitialRevenue: '',
        InitialClicks: ''
      })
    } else {
      setFormData({ 
        Name: '', 
        Platform: 'Facebook', 
        Budget: '', 
        Status: 'Draft', 
        ProductId: '',
        InitialSpend: '',
        InitialRevenue: '',
        InitialClicks: ''
      })
    }
  }, [campaign, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        Name: formData.Name,
        Platform: formData.Platform,
        Budget: parseFloat(formData.Budget),
        Status: formData.Status,
        ProductId: formData.ProductId ? parseInt(formData.ProductId) : null,
        InitialSpend: formData.InitialSpend ? parseFloat(formData.InitialSpend) : 0,
        InitialRevenue: formData.InitialRevenue ? parseFloat(formData.InitialRevenue) : 0,
        InitialClicks: formData.InitialClicks ? parseInt(formData.InitialClicks) : 0
      }

      if (campaign) {
        await api.put(`/ads/${campaign.Id}`, payload)
      } else {
        await api.post('/ads', payload)
      }
      
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to save campaign', err)
      setError(err?.response?.data?.message || 'Error saving campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md animate-scale-up">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-text-bright">{campaign ? 'Edit Campaign' : 'New Campaign'}</h2>
          <button onClick={handleClose} className="text-text-dim hover:text-text-white transition-colors">
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
          <div>
            <label className="block text-sm font-medium text-text-mid mb-1">Campaign Name</label>
            <input 
              required 
              type="text" 
              className="input w-full" 
              placeholder="e.g. Holiday Special"
              value={formData.Name}
              onChange={e => setFormData({...formData, Name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Platform</label>
              <select 
                className="select w-full"
                value={formData.Platform}
                onChange={e => setFormData({...formData, Platform: e.target.value})}
              >
                <option value="Facebook">Facebook</option>
                <option value="Google">Google</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Status</label>
              <select 
                className="select w-full"
                value={formData.Status}
                onChange={e => setFormData({...formData, Status: e.target.value})}
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-mid mb-1">Budget ($)</label>
            <input 
              required 
              type="number" 
              min="0" 
              step="0.01" 
              className="input w-full" 
              placeholder="e.g. 5000"
              value={formData.Budget}
              onChange={e => setFormData({...formData, Budget: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-mid mb-1">Linked Product</label>
            <select 
              className="select w-full"
              value={formData.ProductId}
              onChange={e => setFormData({...formData, ProductId: e.target.value})}
            >
              <option value="">No Product Linked</option>
              {products.map(p => (
                <option key={p.Id} value={p.Id}>{p.Name}</option>
              ))}
            </select>
          </div>

          {!campaign && (
            <div className="space-y-4 pt-2">
              <div className="text-xs font-bold text-text-dim uppercase tracking-wider">Initial Performance Seeding</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase">Spend ($)</label>
                  <input 
                    type="number" 
                    className="input w-full !py-1.5 !text-xs" 
                    placeholder="0"
                    value={formData.InitialSpend}
                    onChange={e => setFormData({...formData, InitialSpend: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase">Revenue ($)</label>
                  <input 
                    type="number" 
                    className="input w-full !py-1.5 !text-xs" 
                    placeholder="0"
                    value={formData.InitialRevenue}
                    onChange={e => setFormData({...formData, InitialRevenue: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase">Clicks</label>
                  <input 
                    type="number" 
                    className="input w-full !py-1.5 !text-xs" 
                    placeholder="0"
                    value={formData.InitialClicks}
                    onChange={e => setFormData({...formData, InitialClicks: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button type="button" onClick={handleClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
