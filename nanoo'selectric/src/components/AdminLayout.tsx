import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Ticket, 
  Settings, 
  LogOut, 
  ChevronRight,
  Menu,
  X,
  Store,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout() {
  const { logout, profile, isStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Redirect if not staff
  React.useEffect(() => {
    if (!isStaff) {
      navigate('/');
    }
  }, [isStaff, navigate]);

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/discounts', icon: Ticket, label: 'Discounts' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  if (!isStaff) return null;

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-zinc-200 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              {isSidebarOpen && (
                <span className="font-bold text-zinc-950 tracking-tight">Zanoo Admin</span>
              )}
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 hover:bg-zinc-100 rounded-md lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-zinc-950 text-white' 
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-zinc-200">
            <div className={`flex items-center gap-3 ${isSidebarOpen ? 'px-2' : 'justify-center'}`}>
              <img 
                src={profile?.photoURL || 'https://ui-avatars.com/api/?name=' + profile?.displayName} 
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-950 truncate">{profile?.displayName}</p>
                  <p className="text-xs text-zinc-500 truncate capitalize">{profile?.role}</p>
                </div>
              )}
              {isSidebarOpen && (
                <button 
                  onClick={logout}
                  className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-500 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-100 rounded-md hidden lg:block"
            >
              <Menu className="w-5 h-5 text-zinc-500" />
            </button>
            <h2 className="text-lg font-semibold text-zinc-950">
              {navItems.find(item => item.path === location.pathname)?.label || 'Admin'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-zinc-100 rounded-full relative text-zinc-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-zinc-200 mx-2" />
            <Link 
              to="/" 
              className="text-sm font-medium text-zinc-500 hover:text-zinc-950 flex items-center gap-1"
            >
              View Store <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
