import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { db, collection, getDocs, query, orderBy, limit } from '../firebase';
import { Order, Product, UserProfile } from '../types';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const data = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 2000, orders: 12 },
  { name: 'Thu', revenue: 2780, orders: 15 },
  { name: 'Fri', revenue: 1890, orders: 10 },
  { name: 'Sat', revenue: 2390, orders: 14 },
  { name: 'Sun', revenue: 3490, orders: 21 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 12.5,
    ordersGrowth: 8.2,
    customersGrowth: -2.4,
    productsGrowth: 5.1
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders = ordersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
      
      // Fetch products
      const productsSnap = await getDocs(collection(db, 'products'));
      const products = productsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));

      // Fetch customers
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));

      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers: users.length,
        totalProducts: products.length,
        revenueGrowth: 12.5,
        ordersGrowth: 8.2,
        customersGrowth: -2.4,
        productsGrowth: 5.1
      });

      setRecentOrders(orders.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).slice(0, 5));
      setTopProducts(products.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, growth: stats.revenueGrowth, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), growth: stats.ordersGrowth, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Customers', value: stats.totalCustomers.toLocaleString(), growth: stats.customersGrowth, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Products', value: stats.totalProducts.toLocaleString(), growth: stats.productsGrowth, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Dashboard Overview</h1>
          <p className="text-sm text-zinc-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 flex items-center gap-2 hover:bg-zinc-50">
            <Calendar className="w-4 h-4" /> Last 7 Days
          </button>
          <button className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-sm font-medium hover:bg-zinc-800">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-zinc-950">Revenue Growth</h3>
            <select className="text-sm border-none bg-transparent font-medium text-zinc-500 focus:ring-0">
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09090b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#09090b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  tickFormatter={(value) => `Rs. ${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#09090b', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#09090b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="font-bold text-zinc-950 mb-6">Top Selling Products</h3>
          <div className="space-y-6">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-950 truncate">{product.name}</p>
                  <p className="text-xs text-zinc-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-zinc-950">Rs. {product.price}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">In Stock</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2.5 text-sm font-bold text-zinc-950 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
            View All Products
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="font-bold text-zinc-950">Recent Orders</h3>
          <button className="text-sm font-bold text-zinc-950 flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-zinc-950">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-zinc-950">{order.customerName}</p>
                    <p className="text-xs text-zinc-500">{order.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-orange-100 text-orange-700' :
                      'bg-zinc-100 text-zinc-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-zinc-950">Rs. {order.total}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}
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
