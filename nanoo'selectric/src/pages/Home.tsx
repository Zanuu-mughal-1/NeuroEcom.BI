import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, Plus, Droplets, Brain, Activity, Coffee, Dumbbell, Lightbulb, Home as HomeIcon, Factory, Cable, Wrench, Battery } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { getProducts, mapBackendProduct } from '../api';

export default function Home() {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const data = await getProducts();
      const mapped = data.slice(0, 3).map(mapBackendProduct);
      setFeaturedProducts(mapped);
    } catch (err) {
      console.error('Failed to fetch featured products', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-electric-blue/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-electric-purple/20 blur-[120px] rounded-full animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full glass text-[10px] font-bold tracking-[0.2em] uppercase mb-8 text-electric-blue border-electric-blue/20">
              Powering the Modern World
            </span>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85] uppercase italic mb-8">
              Premium <br />
              <span className="electric-text">Electrical</span>
            </h1>
            <p className="max-w-xl mx-auto text-zinc-400 text-lg mb-12 leading-relaxed">
              Professional-grade electrical solutions for residential, industrial, and smart home projects. Quality you can trust, delivered.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/shop" className="px-10 py-5 electric-gradient text-zinc-950 font-bold uppercase tracking-widest text-sm rounded-full hover:scale-105 transition-transform duration-300 flex items-center gap-3">
              Shop Now <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/shop?category=smart home" className="px-10 py-5 glass font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/10 transition-colors">
                Smart Home
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div>
            <h2 className="text-5xl font-bold uppercase italic mb-4">Featured Products</h2>
            <p className="text-zinc-500 max-w-md">Reliable electrical essentials selected from the live catalog.</p>
          </div>
          <Link to="/shop" className="text-electric-blue text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
            View All Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group relative">
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
                    {product.category === 'smart home' && <HomeIcon className="w-5 h-5 text-electric-purple" />}
                    {product.category === 'industrial' && <Factory className="w-5 h-5 text-zinc-400" />}
                    {product.category === 'wiring' && <Cable className="w-5 h-5 text-amber-500" />}
                    {product.category === 'tools' && <Wrench className="w-5 h-5 text-zinc-400" />}
                    {product.category === 'power' && <Battery className="w-5 h-5 text-emerald-500" />}
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-3xl font-bold uppercase italic mb-2 hover:text-electric-blue transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-display font-bold">Rs. {product.price}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-12 h-12 rounded-full electric-gradient flex items-center justify-center text-zinc-950 hover:scale-110 transition-transform active:scale-95"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-32 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden glass">
              <img 
                src="https://picsum.photos/seed/science/1000/1000" 
                alt="Science" 
                className="w-full h-full object-cover opacity-50 grayscale"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 glass rounded-3xl p-8 flex flex-col justify-end">
              <span className="text-4xl font-bold electric-text mb-2">0.0%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sugar Content</span>
            </div>
          </div>
          <div>
            <span className="text-electric-blue text-[10px] font-bold uppercase tracking-[0.3em] mb-6 block">Our Philosophy</span>
            <h2 className="text-5xl font-bold uppercase italic mb-8 leading-tight">Engineered for safer, <br />smarter power</h2>
            <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
              We focus on practical electrical gear for homes, workshops, and industrial maintenance. Every item is selected for dependable installation, clear specs, and everyday availability.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold uppercase text-sm mb-2">Project Ready</h4>
                <p className="text-zinc-500 text-xs">Stocked components for repairs, upgrades, and new installs.</p>
              </div>
              <div>
                <h4 className="font-bold uppercase text-sm mb-2">Quality Checked</h4>
                <p className="text-zinc-500 text-xs">Clear product details and category-level sourcing standards.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Categories Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold uppercase italic mb-4">Explore the Range</h2>
          <p className="text-zinc-500">Solutions for lighting, automation, wiring, tools, and power backup.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'lighting', label: 'Lighting', icon: Lightbulb, color: 'text-electric-blue' },
            { id: 'smart home', label: 'Smart Home', icon: HomeIcon, color: 'text-electric-purple' },
            { id: 'industrial', label: 'Industrial', icon: Factory, color: 'text-zinc-400' },
          ].map((cat) => (
            <Link 
              key={cat.id} 
              to={`/shop?category=${cat.id}`}
              className="glass p-8 rounded-3xl flex flex-col items-center gap-4 hover:bg-white/5 transition-colors group"
            >
              <cat.icon className={`w-8 h-8 ${cat.color} group-hover:scale-110 transition-transform`} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
            <h2 className="text-5xl font-bold uppercase italic text-center md:text-left">Trusted by <br />the Elite</h2>
            <div className="flex gap-4">
              <div className="glass px-6 py-4 rounded-2xl text-center">
                <div className="text-2xl font-bold">500k+</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Units Sold</div>
              </div>
              <div className="glass px-6 py-4 rounded-2xl text-center">
                <div className="text-2xl font-bold">4.9/5</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">User Rating</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Alex Rivera", role: "Pro Gamer", text: "The Focus series is a game-changer for long tournament days. No jitters, just pure clarity." },
              { name: "Sarah Chen", role: "Marathon Runner", text: "Hydration Blue is the only thing that keeps me going past mile 20. The electrolyte balance is perfect." },
              { name: "Marcus Thorne", role: "Software Engineer", text: "Nootropic Fuel has replaced my afternoon coffee. I stay productive without the 4 PM crash." }
            ].map((review, i) => (
              <div key={i} className="glass p-10 rounded-[40px] space-y-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Zap key={i} className="w-3 h-3 text-electric-blue fill-electric-blue" />)}
                </div>
                <p className="text-zinc-400 italic">"{review.text}"</p>
                <div>
                  <div className="font-bold uppercase text-sm">{review.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-electric-blue">{review.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto glass rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-electric-blue/5 blur-[100px] -z-10" />
            <h2 className="text-5xl md:text-7xl font-bold uppercase italic mb-8">Join the <br />Current</h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto">Subscribe for new arrivals, project tips, and electrical supply updates.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors"
            />
            <button className="px-10 py-4 electric-gradient text-zinc-950 font-bold uppercase tracking-widest text-sm rounded-full hover:scale-105 transition-transform">
              Join Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
