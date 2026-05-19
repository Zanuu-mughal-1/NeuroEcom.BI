import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Ticket, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Copy
} from 'lucide-react';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from '../firebase';
import { Coupon } from '../types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminDiscounts() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      const couponList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Coupon));
      setCoupons(couponList);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success('Coupon deleted successfully');
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const toggleStatus = async (coupon: Coupon) => {
    try {
      await updateDoc(doc(db, 'coupons', coupon.id), { active: !coupon.active });
      setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c));
      toast.success(`Coupon ${!coupon.active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update coupon status');
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Discounts & Coupons</h1>
          <p className="text-sm text-zinc-500">Create and manage promotional offers for your store.</p>
        </div>
        <button className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by coupon code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
          />
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
              <p className="text-sm text-zinc-500 font-medium">Loading coupons...</p>
            </div>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center">
                <Ticket className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-500 font-medium">No coupons found</p>
            </div>
          </div>
        ) : filteredCoupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden group">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="px-3 py-1 bg-zinc-100 rounded-lg border border-zinc-200">
                  <span className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider">{coupon.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(coupon)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      coupon.active ? 'text-emerald-600 bg-emerald-50' : 'text-zinc-400 bg-zinc-50'
                    }`}
                  >
                    {coupon.active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(coupon.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-zinc-950">
                  {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `Rs. ${coupon.value} OFF`}
                </h3>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">
                  {coupon.type} Discount
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Usage</p>
                  <p className="text-sm font-bold text-zinc-950">{coupon.usageCount} / {coupon.usageLimit || '∞'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Expires</p>
                  <p className="text-sm font-bold text-zinc-950">
                    {coupon.expiryDate?.toDate ? format(coupon.expiryDate.toDate(), 'MMM d, yyyy') : 'Never'}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${coupon.active ? 'text-emerald-600' : 'text-zinc-400'}`}>
                {coupon.active ? 'Active' : 'Inactive'}
              </span>
              <button className="text-xs font-bold text-zinc-950 flex items-center gap-1 hover:underline">
                <Edit2 className="w-3 h-3" /> Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
