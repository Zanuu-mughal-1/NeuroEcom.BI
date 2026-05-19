import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Trash2, Minus, Plus, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    cartCount, 
    cartTotal, 
    removeFromCart, 
    updateQuantity 
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-900 z-[70] flex flex-col shadow-2xl"
          >
            <div className="p-8 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-electric-blue" />
                <h2 className="text-xl font-bold uppercase italic">Your Cart</h2>
                <span className="text-[10px] font-bold glass px-2 py-1 rounded-full">{cartCount}</span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full glass flex items-center justify-center opacity-20">
                    <ShoppingCart className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase mb-2">Cart is empty</h3>
                    <p className="text-zinc-500 text-sm">Start your mission by adding some fuel.</p>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="px-8 py-4 glass text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white/10"
                  >
                    Browse Collection
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden glass flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold uppercase text-sm mb-1">{item.name}</h4>
                          <span className="text-xs text-zinc-500 uppercase tracking-widest">{item.category}</span>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-zinc-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 glass px-3 py-1 rounded-full">
                          <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-electric-blue"><Minus className="w-3 h-3" /></button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-electric-blue"><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="font-display font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-zinc-950/50 border-t border-white/5 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-zinc-500 text-xs uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 text-xs uppercase tracking-widest">
                    <span>Shipping</span>
                    <span className="text-electric-blue">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold uppercase italic pt-4">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full py-5 electric-gradient text-zinc-950 font-bold uppercase tracking-widest text-sm rounded-full hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-3"
                >
                  Secure Checkout <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
