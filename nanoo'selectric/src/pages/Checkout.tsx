import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Lock, CreditCard, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api';

const initialShippingDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
};

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  const [shippingDetails, setShippingDetails] = useState(initialShippingDetails);

  const handleShippingChange = (field: keyof typeof initialShippingDetails, value: string) => {
    setShippingDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setOrderError(null);

    try {
      const shippingAddress = [
        shippingDetails.address,
        shippingDetails.city,
        shippingDetails.state,
        shippingDetails.zip,
      ].filter(Boolean).join(', ');

      const payload = {
        Customer: {
          FirstName: shippingDetails.firstName.trim(),
          LastName: shippingDetails.lastName.trim(),
          Email: shippingDetails.email.trim(),
          Phone: shippingDetails.phone.trim(),
          City: shippingDetails.city.trim(),
          Pincode: shippingDetails.zip.trim(),
          ShippingAddress: shippingAddress,
          BillingAddress: shippingAddress,
        },
        TotalAmount: Number(cartTotal.toFixed(2)),
        PaymentMethod: 'CreditCard',
        PaymentStatus: 'Paid',
        ShippingAddress: shippingAddress,
        Notes: `Store checkout placed from Zanoo Electric on ${new Date().toISOString()}`,
        Items: cart.map(item => ({
          ProductId: Number.parseInt(item.id, 10),
          Quantity: item.quantity,
          UnitPrice: Number(item.price),
        })),
      };

      if (!payload.Customer.Email || payload.Items.some(item => Number.isNaN(item.ProductId))) {
        throw new Error('Please check customer details and cart products before placing the order.');
      }

      const response = await api.post('/orders', payload);
      setPlacedOrderNumber(response.data?.OrderNumber || response.data?.orderNumber || null);
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    } catch (error: any) {
      console.error('Failed to place order', error);
      setOrderError(error?.response?.data?.message || error?.message || 'Order could not be placed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold uppercase italic mb-6">Your Cart is Empty</h1>
        <p className="text-zinc-500 mb-12">You need to add some fuel before you can checkout.</p>
        <Link to="/shop" className="px-10 py-5 electric-gradient text-zinc-950 font-bold uppercase tracking-widest text-sm rounded-full">
          Back to Shop
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 rounded-full bg-electric-blue flex items-center justify-center mb-10 shadow-2xl shadow-electric-blue/40"
        >
          <CheckCircle2 className="w-12 h-12 text-zinc-950" />
        </motion.div>
        <h1 className="text-5xl font-bold uppercase italic mb-6">Mission Confirmed</h1>
        <p className="text-zinc-500 mb-12 max-w-md">Your order {placedOrderNumber ? `#${placedOrderNumber}` : ''} has been placed. We're preparing your shipment. You'll receive a confirmation email shortly.</p>
        <Link to="/" className="px-10 py-5 glass font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/10 transition-colors">
          Return to Base
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-20 items-start">
        {/* Checkout Form */}
        <div className="flex-1 space-y-12">
          <div className="flex items-center gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= i ? 'electric-gradient text-zinc-950' : 'glass text-zinc-500'
                }`}>
                  {i}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  step >= i ? 'text-white' : 'text-zinc-600'
                }`}>
                  {i === 1 ? 'Shipping' : i === 2 ? 'Payment' : 'Review'}
                </span>
                {i < 3 && <div className="w-8 h-px bg-white/10" />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleNextStep}
                className="space-y-8"
              >
                <h2 className="text-3xl font-bold uppercase italic">Shipping Details</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">First Name</label>
                    <input required type="text" value={shippingDetails.firstName} onChange={(e) => handleShippingChange('firstName', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Last Name</label>
                    <input required type="text" value={shippingDetails.lastName} onChange={(e) => handleShippingChange('lastName', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email</label>
                    <input required type="email" value={shippingDetails.email} onChange={(e) => handleShippingChange('email', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Phone</label>
                    <input type="tel" value={shippingDetails.phone} onChange={(e) => handleShippingChange('phone', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Address</label>
                  <input required type="text" value={shippingDetails.address} onChange={(e) => handleShippingChange('address', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">City</label>
                    <input required type="text" value={shippingDetails.city} onChange={(e) => handleShippingChange('city', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">State</label>
                    <input required type="text" value={shippingDetails.state} onChange={(e) => handleShippingChange('state', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Zip</label>
                    <input required type="text" value={shippingDetails.zip} onChange={(e) => handleShippingChange('zip', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 electric-gradient text-zinc-950 font-bold uppercase tracking-widest text-sm rounded-full flex items-center justify-center gap-3">
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleNextStep}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold uppercase italic">Payment Method</h2>
                  <button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white">Edit Shipping</button>
                </div>
                <div className="space-y-4">
                  <div className="p-6 rounded-3xl border border-electric-blue/50 bg-electric-blue/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CreditCard className="w-6 h-6 text-electric-blue" />
                      <span className="font-bold uppercase text-sm italic">Credit / Debit Card</span>
                    </div>
                    <div className="w-5 h-5 rounded-full border-4 border-electric-blue bg-zinc-950" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Card Number</label>
                  <input required type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Expiry</label>
                    <input required type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">CVV</label>
                    <input required type="text" placeholder="000" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 electric-gradient text-zinc-950 font-bold uppercase tracking-widest text-sm rounded-full flex items-center justify-center gap-3">
                  Review Order <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold uppercase italic">Final Review</h2>
                  <button onClick={() => setStep(2)} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white">Edit Payment</button>
                </div>
                <div className="glass rounded-3xl p-8 space-y-6">
                  <div className="flex items-center gap-4 text-zinc-400">
                    <Truck className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-widest font-bold">Standard Delivery (3-5 Days)</span>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-400">
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-widest font-bold">Visa Ending in 4242</span>
                  </div>
                </div>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full py-5 electric-gradient text-zinc-950 font-bold uppercase tracking-widest text-sm rounded-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Confirm & Pay Rs. {cartTotal.toFixed(2)}</>
                  )}
                </button>
                {orderError && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
                    {orderError}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px] glass rounded-[40px] p-10 space-y-10 sticky top-32">
          <h3 className="text-xl font-bold uppercase italic">Order Summary</h3>
          <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden glass flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-xs font-bold uppercase mb-1">{item.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Qty: {item.quantity}</span>
                    <span className="text-xs font-bold">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4 pt-10 border-t border-white/5">
            <div className="flex justify-between text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              <span>Subtotal</span>
              <span>Rs. {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              <span>Shipping</span>
              <span className="text-electric-blue">FREE</span>
            </div>
            <div className="flex justify-between text-2xl font-bold uppercase italic pt-4">
              <span>Total</span>
              <span>Rs. {cartTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-zinc-500 justify-center">
            <Lock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure SSL Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
