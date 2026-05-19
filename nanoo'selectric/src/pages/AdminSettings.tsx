import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  CreditCard, 
  Truck, 
  Bell, 
  Shield, 
  Save, 
  Store, 
  Mail, 
  MapPin, 
  DollarSign, 
  Percent,
  Image as ImageIcon,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Settings } from '../types';
import { toast } from 'sonner';
import { db, doc, getDoc, setDoc, Timestamp } from '../firebase';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'shipping' | 'notifications'>('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'settings', 'store');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(docSnap.data() as Settings);
      } else {
        // Default settings
        const defaultSettings: Settings = {
          storeName: "Zanoo'Electric",
          storeEmail: "contact@zanooelectric.com",
          currency: "PKR",
          taxRate: 5,
          shippingZones: [],
          paymentMethods: [],
          notifications: {
            orderConfirmation: true,
            shippingUpdate: true,
            newPromotion: false
          }
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), { ...settings, updatedAt: Timestamp.now() });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Settings</h1>
          <p className="text-sm text-zinc-500">Manage your store configuration and preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                ? 'bg-zinc-950 text-white shadow-lg shadow-zinc-950/10' 
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && settings && (
            <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                  <Store className="w-5 h-5" /> Store Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Store Name</label>
                    <input 
                      type="text" 
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Store Email</label>
                    <input 
                      type="email" 
                      value={settings.storeEmail}
                      onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-zinc-100">
                <h3 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> Localization & Tax
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Currency</label>
                    <select 
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                    >
                      <option value="PKR">PKR (Rs.)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tax Rate (%)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={settings.taxRate}
                        onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                        className="w-full pl-4 pr-10 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && settings && (
            <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                <Bell className="w-5 h-5" /> Notification Preferences
              </h3>
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100 transition-all">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-zinc-950 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-xs text-zinc-500">Send email notification for this event.</p>
                    </div>
                    <div 
                      onClick={() => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, [key]: !value }
                      })}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${value ? 'bg-zinc-950' : 'bg-zinc-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Placeholders for other tabs */}
          {(activeTab === 'payments' || activeTab === 'shipping') && (
            <div className="bg-white p-12 rounded-2xl border border-zinc-200 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                <SettingsIcon className="w-8 h-8 text-zinc-400 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950">Under Construction</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-1">
                  We're working hard to bring you advanced {activeTab} management features.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
