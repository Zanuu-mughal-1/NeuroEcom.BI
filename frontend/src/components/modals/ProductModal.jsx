import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../../utils/api'

export default function ProductModal({ isOpen, onClose, onSuccess, product = null }) {
  const [formData, setFormData] = useState({
    Name: '',
    SKU: '',
    Category: '',
    Price: '',
    Cost: '',
    Stock: '',
    ReorderLevel: '',
    Description: '',
    IsActive: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (product) {
      setFormData({
        Name: product.Name || '',
        SKU: product.SKU || '',
        Category: product.Category || '',
        Price: product.Price || '',
        Cost: product.Cost || '',
        Stock: product.Stock || '',
        ReorderLevel: product.ReorderLevel || '',
        Description: product.Description || '',
        IsActive: product.IsActive ?? true
      })
    } else {
      setFormData({
        Name: '', SKU: '', Category: '', Price: '', Cost: '',
        Stock: '', ReorderLevel: '', Description: '', IsActive: true
      })
    }
  }, [product, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const parsedPrice = parseFloat(formData.Price)
      const parsedCost = parseFloat(formData.Cost)
      const parsedStock = parseInt(formData.Stock)
      const parsedReorder = parseInt(formData.ReorderLevel)

      if (isNaN(parsedPrice) || isNaN(parsedCost) || isNaN(parsedStock) || isNaN(parsedReorder)) {
        throw new Error('Please enter valid numbers for Price, Cost, Stock, and Reorder Level')
      }

      const payload = {
        ...formData,
        Price: parsedPrice,
        Cost: parsedCost,
        Stock: parsedStock,
        ReorderLevel: parsedReorder
      }

      if (product) {
        await api.put(`/products/${product.Id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to save product', err)
      setError(err.message || err?.response?.data?.message || 'Error saving product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg animate-scale-up">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-text-bright">{product ? 'Edit Product' : 'New Product'}</h2>
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
            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-mid mb-1">Product Name</label>
              <input required className="input w-full" value={formData.Name} onChange={e => setFormData({...formData, Name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">SKU</label>
              <input required className="input w-full" value={formData.SKU} onChange={e => setFormData({...formData, SKU: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Category</label>
              <input required className="input w-full" value={formData.Category} onChange={e => setFormData({...formData, Category: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Price ($)</label>
              <input required type="number" step="0.01" className="input w-full" value={formData.Price} onChange={e => setFormData({...formData, Price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Cost ($)</label>
              <input required type="number" step="0.01" className="input w-full" value={formData.Cost} onChange={e => setFormData({...formData, Cost: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Current Stock</label>
              <input required type="number" className="input w-full" value={formData.Stock} onChange={e => setFormData({...formData, Stock: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Reorder Level</label>
              <input required type="number" className="input w-full" value={formData.ReorderLevel} onChange={e => setFormData({...formData, ReorderLevel: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-mid mb-1">Description</label>
            <textarea className="input w-full h-20 resize-none py-2" value={formData.Description} onChange={e => setFormData({...formData, Description: e.target.value})} />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
