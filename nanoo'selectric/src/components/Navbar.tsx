import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Menu, Zap, X, User, LogOut, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, profile, isAdmin, signIn, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop All', path: '/shop' },
    { name: 'Lighting', path: '/shop?category=lighting' },
    { name: 'Smart Home', path: '/shop?category=smart%20home' },
    { name: 'Industrial', path: '/shop?category=industrial' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass py-4' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 electric-gradient rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <Zap className="w-6 h-6 text-zinc-950 fill-zinc-950" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tighter uppercase italic">Zanoo'Electric</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold tracking-widest uppercase">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`hover:text-electric-blue transition-colors ${location.search.includes(link.path.split('=')[1]) ? 'text-electric-blue' : 'text-zinc-400'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* User Menu */}
          <div className="relative">
            {user ? (
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 glass px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">
                  {isAdmin ? 'Admin' : 'Account'}
                </span>
              </button>
            ) : (
              <button 
                onClick={signIn}
                className="glass px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Login
              </button>
            )}

            {isUserMenuOpen && user && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-4 w-48 glass rounded-2xl p-4 flex flex-col gap-2"
              >
                <div className="px-2 py-1 mb-2 border-b border-white/10">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Signed in as</p>
                  <p className="text-[10px] font-bold text-white truncate">{user.email}</p>
                </div>

                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest text-electric-blue"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                
                <Link 
                  to="/profile" 
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>

                <button 
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-electric-blue text-zinc-950 text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden absolute top-full left-0 right-0 glass p-6 flex flex-col gap-6 text-center uppercase tracking-widest font-bold text-sm"
        >
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-electric-blue"
            >
              {link.name}
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
}
