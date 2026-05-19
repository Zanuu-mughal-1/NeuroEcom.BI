import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Droplets, Brain, Plus, ChevronRight, Search, SlidersHorizontal, Activity, Coffee, Dumbbell, Lightbulb, Home, Factory, Cable, Wrench, Battery } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts, mapBackendProduct } from '../api';

export default function Shop() {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as any;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      const mapped = data.map(mapBackendProduct);
      setProducts(mapped);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }
    
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    }
    
    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  const categories = [
    { id: 'all', label: 'All', icon: null },
    { id: 'lighting', label: 'Lighting', icon: Lightbulb },
    { id: 'smart home', label: 'Smart Home', icon: Home },
    { id: 'industrial', label: 'Industrial', icon: Factory },
    { id: 'wiring', label: 'Wiring', icon: Cable },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'power', label: 'Power', icon: Battery },
  ] as const;

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
        <div>
          <h1 className="text-6xl font-bold uppercase italic mb-4">Electrical Catalog</h1>
          <p className="text-zinc-500 max-w-md">Professional-grade electrical components and smart home solutions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-electric-blue transition-colors"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-electric-blue transition-colors appearance-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setSearchParams(cat.id === 'all' ? {} : { category: cat.id });
            }}
            className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeCategory === cat.id 
                ? 'bg-white text-zinc-950' 
                : 'glass hover:bg-white/10 text-zinc-500'
            }`}
          >
            {cat.icon && <cat.icon className="w-3 h-3" />}
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="group relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl glass group-hover:border-white/20 transition-colors">
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 pointer-events-none" />
                
                <div className="absolute top-6 left-6">
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                    {product.category === 'lighting' && <Lightbulb className="w-5 h-5 text-electric-blue" />}
                    {product.category === 'smart home' && <Home className="w-5 h-5 text-electric-purple" />}
                    {product.category === 'industrial' && <Factory className="w-5 h-5 text-zinc-400" />}
                    {product.category === 'wiring' && <Cable className="w-5 h-5 text-amber-500" />}
                    {product.category === 'tools' && <Wrench className="w-5 h-5 text-zinc-400" />}
                    {product.category === 'power' && <Battery className="w-5 h-5 text-emerald-500" />}
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-2xl font-bold uppercase italic mb-1 hover:text-electric-blue transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-display font-bold">Rs. {product.price}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-10 h-10 rounded-full electric-gradient flex items-center justify-center text-zinc-950 hover:scale-110 transition-transform active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-40 text-center">
          <h3 className="text-2xl font-bold uppercase mb-4">No products found</h3>
          <p className="text-zinc-500">Try adjusting your search or filters.</p>
          <button 
            onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
            className="mt-8 px-8 py-4 glass text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white/10"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
