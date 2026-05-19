import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  MoreVertical,
  FileText,
  Printer,
  RefreshCcw,
  MapPin,
  User,
  CreditCard,
  Package,
  Calendar,
  X
} from 'lucide-react';
import Papa from 'papaparse';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { db, collection, getDocs, updateDoc, doc, Timestamp } from '../firebase';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus, updatedAt: Timestamp.now() });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleExportCSV = () => {
    const csvData = orders.map(order => ({
      id: order.id,
      customer: order.customerName,
      email: order.customerEmail,
      total: order.total,
      status: order.status,
      payment: order.paymentStatus,
      date: order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : new Date(order.createdAt).toISOString()
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'orders_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateInvoice = (order: Order) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Order ID: #${order.id.toUpperCase()}`, 20, 40);
    
    // Handle date conversion if it's a Firestore Timestamp or string
    const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    doc.text(`Date: ${format(date, 'PPP')}`, 20, 45);
    
    // Customer Info
    doc.setFontSize(12);
    doc.text('Customer Details:', 20, 60);
    doc.setFontSize(10);
    doc.text(order.customerName, 20, 65);
    doc.text(order.customerEmail, 20, 70);
    doc.text(`${order.shippingAddress.line1}, ${order.shippingAddress.city}`, 20, 75);
    doc.text(`${order.shippingAddress.state}, ${order.shippingAddress.postalCode}`, 20, 80);
    
    // Items Table
    const tableData = order.items.map(item => [
      item.name,
      item.quantity.toString(),
      `Rs. ${item.price.toFixed(2)}`,
      `Rs. ${(item.price * item.quantity).toFixed(2)}`
    ]);
    
    (doc as any).autoTable({
      startY: 90,
      head: [['Product', 'Quantity', 'Price', 'Total']],
      body: tableData,
      foot: [['', '', 'Total', `Rs. ${order.total.toFixed(2)}`]],
      theme: 'grid',
      headStyles: { fillColor: [9, 9, 11] }
    });
    
    doc.save(`invoice-${order.id}.pdf`);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'processing': return <RefreshCcw className="w-3 h-3" />;
      case 'shipped': return <Truck className="w-3 h-3" />;
      case 'delivered': return <CheckCircle2 className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-zinc-100 text-zinc-700';
      case 'processing': return 'bg-orange-100 text-orange-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Orders</h1>
          <p className="text-sm text-zinc-500">Track and manage customer orders and fulfillment.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 flex items-center gap-2 hover:bg-zinc-50"
          >
            <Download className="w-4 h-4" /> Export Orders
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by order ID or customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
                      <p className="text-sm text-zinc-500 font-medium">Loading orders...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-zinc-400" />
                      </div>
                      <p className="text-sm text-zinc-500 font-medium">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-zinc-950">#{order.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-950 truncate">{order.customerName}</p>
                      <p className="text-xs text-zinc-500 truncate">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      order.paymentStatus === 'refunded' ? 'bg-red-100 text-red-700' :
                      'bg-zinc-100 text-zinc-700'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-zinc-950">Rs. {order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-500">
                      {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-950"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => generateInvoice(order)}
                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-950"
                        title="Download Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <div className="relative group/menu">
                        <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-950">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
                          <div className="p-2 space-y-1">
                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusUpdate(order.id, status as OrderStatus)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium capitalize ${
                                  order.status === status ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
                                }`}
                              >
                                Mark as {status}
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
        {/* Pagination */}
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <p className="text-xs text-zinc-500 font-medium">
            Showing <span className="text-zinc-950">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-zinc-950">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="text-zinc-950">{filteredOrders.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 border border-zinc-200 rounded-lg ${currentPage === 1 ? 'text-zinc-400 cursor-not-allowed' : 'text-zinc-700 hover:bg-zinc-50'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === page 
                    ? 'bg-zinc-950 text-white shadow-lg shadow-zinc-950/10' 
                    : 'text-zinc-500 hover:bg-zinc-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 border border-zinc-200 rounded-lg ${currentPage === totalPages ? 'text-zinc-400 cursor-not-allowed' : 'text-zinc-700 hover:bg-zinc-50'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div>
                <h2 className="text-xl font-bold text-zinc-950">Order Details</h2>
                <p className="text-sm text-zinc-500 font-medium">#{selectedOrder.id.toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Order Status & Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Status</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Payment</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 ${
                    selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Date</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-950">
                    {selectedOrder.createdAt?.toDate ? format(selectedOrder.createdAt.toDate(), 'PPP p') : format(new Date(selectedOrder.createdAt), 'PPP p')}
                  </p>
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Information
                  </h3>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-2">
                    <p className="text-sm font-bold text-zinc-950">{selectedOrder.customerName}</p>
                    <p className="text-sm text-zinc-500">{selectedOrder.customerEmail}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Shipping Address
                  </h3>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-1">
                    <p className="text-sm text-zinc-950 font-medium">{selectedOrder.shippingAddress.line1}</p>
                    {selectedOrder.shippingAddress.line2 && <p className="text-sm text-zinc-500">{selectedOrder.shippingAddress.line2}</p>}
                    <p className="text-sm text-zinc-500">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p className="text-sm text-zinc-500">{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Order Items
                </h3>
                <div className="border border-zinc-100 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {selectedOrder.items.map((item, i) => (
                        <tr key={i} className="text-sm">
                          <td className="px-4 py-3 font-medium text-zinc-950">{item.name}</td>
                          <td className="px-4 py-3 text-center text-zinc-500">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-zinc-500">Rs. {item.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-bold text-zinc-950">Rs. {(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-zinc-50/50 font-bold">
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-right text-zinc-500">Subtotal</td>
                        <td className="px-4 py-4 text-right text-zinc-950">Rs. {selectedOrder.total.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-right text-zinc-500">Shipping</td>
                        <td className="px-4 py-4 text-right text-emerald-600">Free</td>
                      </tr>
                      <tr className="border-t border-zinc-200">
                        <td colSpan={3} className="px-4 py-4 text-right text-lg text-zinc-950">Total</td>
                        <td className="px-4 py-4 text-right text-lg text-zinc-950">Rs. {selectedOrder.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <button 
                onClick={() => generateInvoice(selectedOrder)}
                className="px-4 py-2 bg-white border border-zinc-200 text-zinc-950 rounded-lg text-sm font-medium hover:bg-zinc-50 flex items-center gap-2 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <div className="flex items-center gap-3">
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value as OrderStatus)}
                  className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all shadow-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button 
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-6 py-2 bg-zinc-950 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-950/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
