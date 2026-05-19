import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  ChevronLeft,
  ChevronRight,
  Package,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import { Product, ProductStatus } from '../types';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from '../firebase';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    compareAtPrice: 0,
    sku: '',
    inventory: 0,
    category: '',
    status: 'draft',
    image: '',
    images: []
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'products'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      compareAtPrice: 0,
      sku: '',
      inventory: 0,
      category: '',
      status: 'draft',
      image: '',
      images: []
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Remove undefined values and id
      const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== undefined && key !== 'id') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const productData = {
        ...cleanData,
        updatedAt: Timestamp.now()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated');
      } else {
        productData.createdAt = Timestamp.now();
        await addDoc(collection(db, 'products'), productData);
        toast.success('Product added');
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formDataUpload = new FormData();
    for (let i = 0; i < files.length; i++) {
      formDataUpload.append('image', files[i]);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      
      const uploadedUrls = data.imageUrls || [data.imageUrl];
      
      setFormData(prev => ({ 
        ...prev, 
        image: prev.image || uploadedUrls[0], 
        images: [...(prev.images || []), ...uploadedUrls] 
      }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Image upload failed');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages,
        image: newImages[0] || ''
      };
    });
  };

  const handleAddVariant = () => {
    const newVariant = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      price: formData.price || 0,
      inventory: 0,
      sku: `${formData.sku || 'SKU'}-${(formData.variants?.length || 0) + 1}`
    };
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const handleUpdateVariant = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map(v => v.id === id ? { ...v, [field]: value } : v)
    }));
  };

  const handleRemoveVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter(v => v.id !== id)
    }));
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(products);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const newProducts = results.data as any[];
        try {
          const promises = newProducts.map(p => {
            const productData = {
              ...p,
              price: parseFloat(p.price) || 0,
              inventory: parseInt(p.inventory) || 0,
              status: 'draft',
              images: p.images ? p.images.split(',') : [],
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now()
            };
            return addDoc(collection(db, 'products'), productData);
          });
          await Promise.all(promises);
          toast.success(`Successfully uploaded ${newProducts.length} products`);
          fetchProducts();
        } catch (error) {
          toast.error('Failed to upload products');
        }
      }
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Products</h1>
          <p className="text-sm text-zinc-500">Manage your product catalog and inventory.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 flex items-center gap-2 hover:bg-zinc-50 cursor-pointer">
            <Upload className="w-4 h-4" /> Import
            <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
          </label>
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 flex items-center gap-2 hover:bg-zinc-50"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={handleAdd}
            className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4 w-12">
                  <input type="checkbox" className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950" />
                </th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Inventory</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
                      <p className="text-sm text-zinc-500 font-medium">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-zinc-400" />
                      </div>
                      <p className="text-sm text-zinc-500 font-medium">No products found</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                        {product.image ? (
                          <img src={product.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-950 truncate">{product.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">{product.sku || 'No SKU'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                      product.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                      product.status === 'draft' ? 'bg-zinc-100 text-zinc-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.status === 'published' ? <CheckCircle2 className="w-3 h-3" /> : 
                       product.status === 'draft' ? <AlertCircle className="w-3 h-3" /> : 
                       <XCircle className="w-3 h-3" />}
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <p className={`text-sm font-bold ${product.inventory && product.inventory <= 10 ? 'text-red-600' : 'text-zinc-950'}`}>
                        {product.inventory} in stock
                      </p>
                      {product.variants && (
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                          {product.variants.length} variants
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2 py-1 rounded-md">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-950">Rs. {product.price}</span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-zinc-400 line-through">Rs. {product.compareAtPrice}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-950">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-950"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-zinc-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <p className="text-xs text-zinc-500 font-medium">
            Showing <span className="text-zinc-950">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-zinc-950">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="text-zinc-950">{filteredProducts.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 border border-zinc-200 rounded-lg ${currentPage === 1 ? 'text-zinc-400 cursor-not-allowed' : 'text-zinc-700 hover:bg-zinc-50'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === page 
                    ? 'bg-zinc-950 text-white shadow-lg shadow-zinc-950/10' 
                    : 'text-zinc-500 hover:bg-zinc-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 border border-zinc-200 rounded-lg ${currentPage === totalPages ? 'text-zinc-400 cursor-not-allowed' : 'text-zinc-700 hover:bg-zinc-50'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-950">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Product Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                      placeholder="e.g. Wireless Headphones"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Category</label>
                    <input 
                      type="text" 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                      placeholder="e.g. energy, hydration, focus"
                    />
                  </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Price (Rs.)</label>
                        <input 
                          type="number" 
                          required
                          step="0.01"
                          value={formData.price || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Compare at Price (Rs.)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={formData.compareAtPrice || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, compareAtPrice: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">SKU</label>
                        <input 
                          type="text" 
                          value={formData.sku || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                          className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                          placeholder="PRD-001"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Inventory</label>
                        <input 
                          type="number" 
                          required
                          value={formData.inventory || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                        />
                      </div>
                    </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Product Images</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {formData.images?.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-lg border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors">
                        <Plus className="w-4 h-4 text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Add</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Variants</label>
                      <button 
                        type="button"
                        onClick={handleAddVariant}
                        className="text-[10px] font-bold text-zinc-950 uppercase tracking-widest hover:underline"
                      >
                        + Add Variant
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {formData.variants?.map((variant) => (
                        <div key={variant.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2 relative group">
                          <button 
                            type="button"
                            onClick={() => handleRemoveVariant(variant.id)}
                            className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <input 
                            type="text" 
                            placeholder="Variant Name (e.g. XL / Red)"
                            value={variant.name}
                            onChange={(e) => handleUpdateVariant(variant.id, 'name', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-zinc-200 rounded text-xs focus:outline-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-zinc-400">Rs.</span>
                              <input 
                                type="number" 
                                placeholder="Price"
                                value={variant.price}
                                onChange={(e) => handleUpdateVariant(variant.id, 'price', parseFloat(e.target.value))}
                                className="w-full px-2 py-1 bg-white border border-zinc-200 rounded text-xs focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3 text-zinc-400" />
                              <input 
                                type="number" 
                                placeholder="Stock"
                                value={variant.inventory}
                                onChange={(e) => handleUpdateVariant(variant.id, 'inventory', parseInt(e.target.value))}
                                className="w-full px-2 py-1 bg-white border border-zinc-200 rounded text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!formData.variants || formData.variants.length === 0) && (
                        <p className="text-[10px] text-zinc-400 text-center py-4 border border-dashed border-zinc-200 rounded-lg">
                          No variants added yet
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProductStatus }))}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all resize-none"
                  placeholder="Describe your product..."
                />
              </div>
            </form>

            <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-3 bg-zinc-50/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-zinc-950 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
