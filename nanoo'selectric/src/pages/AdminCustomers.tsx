import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  UserMinus,
  Shield,
  User
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { db, collection, getDocs, updateDoc, doc, Timestamp } from '../firebase';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const data = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (uid: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole, updatedAt: Timestamp.now() });
      setCustomers(customers.map(c => c.uid === uid ? { ...c, role: newRole } : c));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || c.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = [
    { label: 'Total Customers', value: customers.length, growth: 12.5, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Today', value: customers.filter(c => c.lastLogin).length, growth: 8.2, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'New This Month', value: customers.filter(c => c.createdAt).length, growth: 5.1, icon: ArrowUpRight, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Customers</h1>
          <p className="text-sm text-zinc-500">Manage your customer base and their permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 flex items-center gap-2">
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(stat.growth)}%
              </div>
            </div>
            <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-zinc-950 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="user">User</option>
          </select>
          <button className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
                      <p className="text-sm text-zinc-500 font-medium">Loading customers...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-zinc-400" />
                      </div>
                      <p className="text-sm text-zinc-500 font-medium">No customers found</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.uid} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                        {customer.photoURL ? (
                          <img src={customer.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-950 truncate">{customer.displayName || 'Anonymous'}</p>
                        <p className="text-xs text-zinc-500 truncate">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                      customer.role === 'admin' ? 'bg-red-100 text-red-700' :
                      customer.role === 'manager' ? 'bg-orange-100 text-orange-700' :
                      customer.role === 'staff' ? 'bg-blue-100 text-blue-700' :
                      'bg-zinc-100 text-zinc-700'
                    }`}>
                      {customer.role === 'admin' && <Shield className="w-3 h-3" />}
                      {customer.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-zinc-950">{customer.orderCount || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-zinc-950">${(customer.totalSpent || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-500">
                      {customer.lastLogin?.toDate ? format(customer.lastLogin.toDate(), 'MMM d, yyyy') : 'Never'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-950">
                        <Mail className="w-4 h-4" />
                      </button>
                      <div className="relative group/menu">
                        <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-950">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
                          <div className="p-2 space-y-1">
                            {['admin', 'manager', 'staff', 'user'].map((role) => (
                              <button
                                key={role}
                                onClick={() => handleRoleUpdate(customer.uid, role as UserRole)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium capitalize ${
                                  customer.role === role ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
                                }`}
                              >
                                Make {role}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
