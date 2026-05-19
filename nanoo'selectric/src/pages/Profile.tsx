import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Shield, Package, Settings, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, profile, isAdmin, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-zinc-500" />
          </div>
          <h1 className="text-2xl font-display font-bold uppercase tracking-tighter italic">Please Login</h1>
          <p className="text-zinc-500 max-w-xs mx-auto">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="glass rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 border border-white/10">
          <div className="w-32 h-32 rounded-full bg-white/5 overflow-hidden border-2 border-electric-blue/20 p-1">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-zinc-500" />
              </div>
            )}
          </div>
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-3xl font-display font-bold uppercase tracking-tighter italic">
                {user.displayName || 'Anonymous User'}
              </h1>
              {isAdmin && (
                <span className="px-3 py-1 bg-electric-blue/10 text-electric-blue text-[10px] font-bold uppercase tracking-widest rounded-full border border-electric-blue/20 w-fit mx-auto md:mx-0">
                  Admin Account
                </span>
              )}
            </div>
            <p className="text-zinc-400 flex items-center justify-center md:justify-start gap-2 text-sm">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
            <p className="text-zinc-500 flex items-center justify-center md:justify-start gap-2 text-xs uppercase tracking-widest font-bold">
              <Calendar className="w-3 h-3" /> Joined {profile?.createdAt?.toDate ? format(profile.createdAt.toDate(), 'MMMM yyyy') : 'Recently'}
            </p>
          </div>
          <button 
            onClick={logout}
            className="px-6 py-3 bg-red-500/10 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-2">
            <div className="p-2 bg-electric-blue/10 rounded-lg w-fit">
              <Package className="w-5 h-5 text-electric-blue" />
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Orders</p>
            <h3 className="text-2xl font-display font-bold italic">{profile?.orderCount || 0}</h3>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg w-fit">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Account Status</p>
            <h3 className="text-2xl font-display font-bold italic uppercase tracking-tighter">Verified</h3>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-2">
            <div className="p-2 bg-purple-500/10 rounded-lg w-fit">
              <Settings className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Member Since</p>
            <h3 className="text-2xl font-display font-bold italic">
              {profile?.createdAt?.toDate ? format(profile.createdAt.toDate(), 'yyyy') : '2024'}
            </h3>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-display font-bold uppercase tracking-tighter italic">Recent Activity</h2>
            <button className="text-[10px] font-bold uppercase tracking-widest text-electric-blue hover:underline">View All</button>
          </div>
          <div className="p-8">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">No recent activity found.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
