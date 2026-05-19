import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Droplets, Brain, Plus, Minus, ChevronLeft, ShieldCheck, Truck, RefreshCcw, Activity, Coffee, Dumbbell, Lightbulb, Home as HomeIcon, Factory, Cable, Wrench, Battery } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import api, { mapBackendProduct } from '../api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const p = response.data;
      const mapped = mapBackendProduct(p);

      setProduct({
        ...mapped,
        healthStatus: p.HealthStatus ?? p.healthStatus,
        specs: {
          sku: p.SKU ?? p.sku ?? 'N/A',
          stock: p.Stock ?? p.stock ?? 0,
          reorderLevel: p.ReorderLevel ?? p.reorderLevel ?? 'N/A',
          status: p.HealthStatus ?? p.healthStatus ?? 'Available'
        },
        benefits: [
          'Reliable electrical supply',
          'Ready for home and professional projects',
          'Live inventory-backed catalog'
        ]
      });
    } catch (err) {
      console.error('Failed to fetch product', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold uppercase italic mb-6">Loading...</h1>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold uppercase italic mb-6">Product Not Found</h1>
        <p className="text-zinc-500 mb-12">The product you're looking for doesn't exist or has been discontinued.</p>
        <Link to="/shop" className="px-10 py-5 electric-gradient text-zinc-950 font-bold uppercase tracking-widest text-sm rounded-full">
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'lighting': return <Lightbulb className="w-8 h-8 text-electric-blue" />;
      case 'smart home': return <HomeIcon className="w-8 h-8 text-electric-purple" />;
      case 'industrial': return <Factory className="w-8 h-8 text-zinc-400" />;
      case 'wiring': return <Cable className="w-8 h-8 text-amber-500" />;
      case 'tools': return <Wrench className="w-8 h-8 text-zinc-400" />;
      case 'power': return <Battery className="w-8 h-8 text-emerald-500" />;
      default: return <Zap className="w-8 h-8 text-electric-blue" />;
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase text-[10px] font-bold tracking-widest mb-12"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square rounded-[40px] overflow-hidden glass group"
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-8 left-8">
            <div className="w-14 h-14 rounded-full glass flex items-center justify-center">
              {getCategoryIcon(product.category)}
            </div>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-10"
        >
          <div>
            <span className="text-electric-blue text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">
              {product.category} Series
            </span>
            <h1 className="text-6xl font-bold uppercase italic mb-6 leading-tight">{product.name}</h1>
            <p className="text-zinc-400 text-lg leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-end gap-6">
            <span className="text-5xl font-display font-bold">Rs. {product.price}</span>
            <span className="text-zinc-500 text-sm uppercase tracking-widest mb-2">Per Unit</span>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-6 glass px-6 py-3 rounded-full">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-electric-blue"><Minus className="w-4 h-4" /></button>
                <span className="text-lg font-bold w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="hover:text-electric-blue"><Plus className="w-4 h-4" /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-1 py-5 electric-gradient text-zinc-950 font-bold uppercase tracking-widest text-sm rounded-full hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-electric-blue/20"
              >
                Add to Cart
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-10 border-t border-white/5">
            <div className="flex flex-col items-center text-center gap-3">
              <Truck className="w-6 h-6 text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <ShieldCheck className="w-6 h-6 text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Verified Safe</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <RefreshCcw className="w-6 h-6 text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">30 Day Returns</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Specs */}
      <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="glass rounded-[40px] p-12">
          <h3 className="text-2xl font-bold uppercase italic mb-10">Technical Specifications</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-zinc-400 uppercase text-xs tracking-widest">SKU</span>
              <span className="font-bold">{product.specs?.sku}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-zinc-400 uppercase text-xs tracking-widest">Stock</span>
              <span className="font-bold">{product.specs?.stock}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-zinc-400 uppercase text-xs tracking-widest">Reorder Level</span>
              <span className="font-bold">{product.specs?.reorderLevel}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-zinc-400 uppercase text-xs tracking-widest">Status</span>
              <span className="font-bold">{product.specs?.status}</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-[40px] p-12">
          <h3 className="text-2xl font-bold uppercase italic mb-10">Key Benefits</h3>
          <ul className="space-y-6">
            {product.benefits?.map((benefit, i) => (
              <li key={i} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-electric-blue/20 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-electric-blue" />
                </div>
                <span className="text-zinc-300 font-medium">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
