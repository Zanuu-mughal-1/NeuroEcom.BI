import React from 'react';
import { Zap, Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 electric-gradient rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-zinc-950 fill-zinc-950" />
              </div>
              <span className="text-xl font-display font-bold tracking-tighter uppercase italic">Zanoo'Electric</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Professional-grade electrical solutions and smart home technology.
            </p>
          </div>
          
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-zinc-400">Products</h5>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link to="/shop?category=lighting" className="hover:text-white transition-colors">Lighting</Link></li>
              <li><Link to="/shop?category=smart%20home" className="hover:text-white transition-colors">Smart Home</Link></li>
              <li><Link to="/shop?category=industrial" className="hover:text-white transition-colors">Industrial</Link></li>
              <li><Link to="/shop?category=tools" className="hover:text-white transition-colors">Tools & Gear</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-zinc-400">Company</h5>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Science</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-zinc-400">Newsletter</h5>
            <p className="text-zinc-500 text-xs mb-6">Join the current. Get early access to new drops.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-electric-blue transition-colors flex-1"
              />
              <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t border-white/5">
          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">© 2026 Zanoo'Electric. All rights reserved.</span>
          <div className="flex gap-8">
            <Instagram className="w-5 h-5 text-zinc-600 hover:text-white cursor-pointer transition-colors" />
            <Twitter className="w-5 h-5 text-zinc-600 hover:text-white cursor-pointer transition-colors" />
            <Facebook className="w-5 h-5 text-zinc-600 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
