import React, { useState, useEffect } from 'react';
import { 
  Truck, Package, MapPin, Clock, BarChart3, 
  ShieldAlert, TrendingUp, Search, Filter, 
  ChevronRight, ExternalLink, Activity, 
  DollarSign, CheckCircle2, AlertCircle, RefreshCw,
  RotateCcw, Zap, Settings, Thermometer, Map, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, ZAxis, ComposedChart
} from 'recharts';
import { mockRules, generateSalesData, fetchOrders } from '../../utils/api';

const Logistics = () => {
  const [activeTab, setActiveTab] = useState('directory');
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (err) {
        console.error('Logistics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const performanceData = generateSalesData(7).map((d, i) => ({
    name: d.date,
    BlueDart: 94 + Math.sin(i * 1.5) * 2,
    Delhivery: 88 + Math.cos(i * 1.2) * 3,
    XpressBees: 84 + Math.sin(i * 0.8) * 4,
    Shadowfax: 80 + Math.cos(i * 0.5) * 5,
  }));

  const carriers = [
    { id: 1, name: 'BlueDart', tiers: ['Standard', 'Express'], coverage: 'Pan India', status: 'Active', sla: 98, avgTransit: 2.4, avgCost: 85.50, fasr: 92, rto: 4.2 },
    { id: 2, name: 'Delhivery', tiers: ['Surface', 'Air'], coverage: '18,000+ Pincodes', status: 'Active', sla: 94, avgTransit: 3.1, avgCost: 62.20, fasr: 88, rto: 7.8 },
    { id: 3, name: 'XpressBees', tiers: ['Standard'], coverage: 'Tier 1 & 2', status: 'Active', sla: 91, avgTransit: 3.5, avgCost: 48.90, fasr: 84, rto: 11.5 },
    { id: 4, name: 'Shadowfax', tiers: ['Hyperlocal', 'Standard'], coverage: 'Metros Only', status: 'Inactive', sla: 89, avgTransit: 1.2, avgCost: 35.00, fasr: 96, rto: 3.1 },
  ];

  const zoneData = [
    { zone: 'North', rto: 12.4, volume: 4500, delivery: 94 },
    { zone: 'South', rto: 6.2, volume: 3800, delivery: 97 },
    { zone: 'East', rto: 18.5, volume: 1200, delivery: 88 },
    { zone: 'West', rto: 8.1, volume: 5200, delivery: 95 },
    { zone: 'Central', rto: 14.2, volume: 900, delivery: 91 },
  ];

  const trackingEvents = [
    { status: 'Delivered', time: 'Today, 2:45 PM', location: 'Mumbai Hub', description: 'Package handed over to customer' },
    { status: 'Out for Delivery', time: 'Today, 9:00 AM', location: 'Mumbai Hub', description: 'Agent: Rahul Sharma' },
    { status: 'In Transit', time: 'Yesterday, 11:30 PM', location: 'Delhi Gateway', description: 'Departed for destination' },
    { status: 'Picked Up', time: 'May 08, 4:00 PM', location: 'Warehouse Alpha', description: 'Shipment picked up by BlueDart' },
  ];

  if (loading) return <div className="p-8 text-text-dim animate-pulse">Loading Logistics Intelligence...</div>;

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Logistics & Courier</h1>
          <p className="text-text-dim text-sm mt-1">Manage carrier performance, rate matrices, and real-time tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost flex items-center gap-2">
            <RefreshCw size={16} /> Sync Status
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Truck size={16} /> New Shipment
          </button>
        </div>
      </div>

      {/* KPI Ribbons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">On-Time Delivery</p>
              <h3 className="stat-value">92.4%</h3>
              <p className="stat-change-up">
                <TrendingUp size={12} /> +2.1%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-bloom/10 text-bloom group-hover:scale-110 transition-transform">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Avg. Transit Time</p>
              <h3 className="stat-value">2.8 Days</h3>
              <p className="stat-change-down text-danger">
                <TrendingUp size={12} className="rotate-180" /> +0.4d
              </p>
            </div>
            <div className="p-3 rounded-xl bg-neo/10 text-neo group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">RTO Rate</p>
              <h3 className="stat-value">8.2%</h3>
              <p className="stat-change-up">
                <TrendingUp size={12} className="rotate-180" /> -1.2%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-ember/10 text-ember group-hover:scale-110 transition-transform">
              <RotateCcw size={24} />
            </div>
          </div>
        </div>

        <div className="kpi-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Shipping Cost/Order</p>
              <h3 className="stat-value">Rs 54.20</h3>
              <p className="stat-change-up">
                <TrendingUp size={12} /> +Rs 2.1
              </p>
            </div>
            <div className="p-3 rounded-xl bg-pulse/10 text-pulse group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 glass rounded-2xl w-fit">
        {[
          { id: 'directory', label: 'Carrier Directory', icon: MapPin },
          { id: 'tracking', label: 'Live Tracking', icon: Activity },
          { id: 'performance', label: 'Analytics & BI', icon: BarChart3 },
          { id: 'automation', label: 'Decision Engine', icon: ShieldAlert },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-surface text-neo shadow-sm' 
                : 'text-text-dim hover:text-text-mid'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'directory' && (
          <div className="card overflow-hidden border-none">
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title">Carrier Directory</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
                  <input type="text" placeholder="Search carriers..." className="input pl-9 w-64" />
                </div>
                <button className="btn-ghost flex items-center gap-2"><Filter size={14} /> Filters</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Carrier Name</th>
                    <th className="table-header">Service Tiers</th>
                    <th className="table-header">Coverage</th>
                    <th className="table-header">SLA Rate</th>
                    <th className="table-header">Avg Transit</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carriers.map(carrier => (
                    <tr key={carrier.id} className={`table-row cursor-pointer ${selectedCarrier?.id === carrier.id ? 'bg-neo/5 border-l-2 border-l-neo' : ''}`}
                        onClick={() => setSelectedCarrier(carrier)}>
                      <td className="table-cell">
                        <div className="font-bold text-text-bright">{carrier.name}</div>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          {carrier.tiers.map(tier => (
                            <span key={tier} className="badge-neo">{tier}</span>
                          ))}
                        </div>
                      </td>
                      <td className="table-cell text-text-dim">{carrier.coverage}</td>
                      <td className="table-cell font-mono">{carrier.sla}%</td>
                      <td className="table-cell">{carrier.avgTransit} Days</td>
                      <td className="table-cell">
                        <span className={carrier.status === 'Active' ? 'badge-bloom' : 'badge-dim'}>
                          {carrier.status}
                        </span>
                      </td>
                      <td className="table-cell text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedCarrier(carrier); }}
                          className="p-2 hover:bg-void rounded-lg transition-colors text-text-dim hover:text-neo"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Carrier Detail Panel */}
            {selectedCarrier && (
              <div className="border-t border-border bg-neo/5 p-6 animate-fade-up">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-sm">
                      <Truck className="text-neo" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-bright">{selectedCarrier.name} Details</h3>
                      <p className="text-xs text-text-dim">Configuration and SLA performance for {selectedCarrier.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCarrier(null)} className="btn-ghost px-3 py-1 text-xs">Close</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <div className="stat-label">SLA Commitment</div>
                    <div className="text-xl font-bold text-text-bright mt-1">{selectedCarrier.sla}%</div>
                    <div className="text-[10px] text-bloom font-bold mt-1 uppercase">Meeting Target</div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <div className="stat-label">Avg. Transit</div>
                    <div className="text-xl font-bold text-text-bright mt-1">{selectedCarrier.avgTransit} Days</div>
                    <div className="text-[10px] text-text-dim font-bold mt-1 uppercase">Last 30 Days</div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <div className="stat-label">Coverage Area</div>
                    <div className="text-xl font-bold text-text-bright mt-1">{selectedCarrier.coverage}</div>
                    <div className="text-[10px] text-neo font-bold mt-1 uppercase">Whitelisted</div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <div className="stat-label">Status</div>
                    <div className="mt-1">
                      <span className={selectedCarrier.status === 'Active' ? 'badge-bloom' : 'badge-dim'}>
                        {selectedCarrier.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-dim font-bold mt-2 uppercase">Operational</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="btn-primary flex items-center gap-2">
                    <Settings size={16} /> Edit Carrier Config
                  </button>
                  <button className="btn-ghost flex items-center gap-2">
                    <BarChart3 size={16} /> View Rate Matrix
                  </button>
                  <button className={`btn-ghost flex items-center gap-2 ${selectedCarrier.status === 'Active' ? 'text-danger hover:bg-danger/5' : 'text-bloom hover:bg-bloom/5'}`}>
                    {selectedCarrier.status === 'Active' ? 'Disable Carrier' : 'Enable Carrier'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="section-title">Active Shipments</h3>
                  <span className="badge-neo">124 In Transit</span>
                </div>
                <div className="space-y-4">
                  {(orders.length > 0 ? orders : []).filter(o => o.FulfillmentStatus === 'Shipped' || o.FulfillmentStatus === 'Delivered').slice(0, 3).map((order, i) => (
                    <div key={order.Id} className="p-4 rounded-xl border border-border hover:border-neo/30 transition-colors bg-void/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border">
                            <Package size={20} className="text-neo" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-text-bright">AWB #72819203{order.Id}</div>
                            <div className="text-[10px] text-text-dim uppercase font-bold tracking-tighter">Order #{order.OrderNumber} • BlueDart</div>
                          </div>
                        </div>
                        <span className={order.FulfillmentStatus === 'Delivered' ? 'badge-bloom' : 'badge-pulse'}>
                          {order.FulfillmentStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                          <div className={`h-full bg-neo shadow-[0_0_8px_rgba(0,234,255,0.5)] ${order.FulfillmentStatus === 'Delivered' ? 'w-full' : 'w-2/3'}`} />
                        </div>
                        <span className="text-[10px] font-bold text-text-dim">
                          {order.FulfillmentStatus === 'Delivered' ? 'Delivered' : 'ETA: Tomorrow'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-text-dim">
                          <MapPin size={12} /> Last Scan: {order.FulfillmentStatus === 'Delivered' ? 'Customer Hub' : 'Regional Gateway'}
                        </div>
                        <button className="text-neo font-bold hover:underline">Track Full History</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="section-title mb-6">Live Timeline</h3>
                <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {trackingEvents.map((event, i) => (
                    <div key={i} className="relative pl-8">
                      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-4 border-abyss z-10 ${
                        i === 0 ? 'bg-bloom text-white' : 'bg-surface text-text-dim'
                      }`}>
                        {i === 0 ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-bright">{event.status}</div>
                        <div className="text-[10px] text-text-dim font-medium mb-1">{event.time} • {event.location}</div>
                        <div className="text-xs text-text-mid leading-relaxed">{event.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card bg-neo/5 border-neo/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-neo text-white">
                    <ShieldAlert size={18} />
                  </div>
                  <h3 className="font-bold text-text-bright">Intelligence Alert</h3>
                </div>
                <p className="text-xs text-text-mid mb-4">
                  Shipment #88192 has been stuck in <strong>Mumbai Hub</strong> for &gt; 24 hours. Estimated delay: 1.5 days.
                </p>
                <button className="btn-primary w-full text-xs py-2">Escalate to Carrier</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Spicy BI Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card border-l-4 border-l-bloom bg-bloom/5">
                <div className="flex items-center gap-3 mb-2">
                  <Zap size={18} className="text-bloom" />
                  <span className="text-xs font-bold uppercase tracking-wider text-text-dim">Efficiency Leader</span>
                </div>
                <div className="text-lg font-bold text-text-bright">BlueDart (Express)</div>
                <div className="text-xs text-text-mid">Highest FASR (92%) with lowest RTO correlation.</div>
              </div>
              <div className="card border-l-4 border-l-danger bg-danger/5">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle size={18} className="text-danger" />
                  <span className="text-xs font-bold uppercase tracking-wider text-text-dim">Revenue Leakage</span>
                </div>
                <div className="text-lg font-bold text-text-bright">Rs 12,450 / Week</div>
                <div className="text-xs text-text-mid">Lost due to failed 1st attempts in Tier-3 cities.</div>
              </div>
              <div className="card border-l-4 border-l-neo bg-neo/5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={18} className="text-neo" />
                  <span className="text-xs font-bold uppercase tracking-wider text-text-dim">Optimization Tip</span>
                </div>
                <div className="text-sm font-bold text-text-bright">Switch Zone: East to Delhivery</div>
                <div className="text-xs text-text-mid">Projected RTO reduction: -4.5% (Savings: Rs 8k).</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Multi-Carrier Performance */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="section-title">Carrier On-Time Comparison</h3>
                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#00eaff]" /> BlueDart</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10b981]" /> Delhivery</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f59e0b]" /> XpressBees</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#06b6d4]" /> Shadowfax</div>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        {['BlueDart', 'Delhivery', 'XpressBees', 'Shadowfax'].map((id, i) => {
                          const colors = ['#00eaff', '#10b981', '#f59e0b', '#06b6d4'];
                          return (
                            <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={colors[i]} stopOpacity={0.2}/>
                              <stop offset="95%" stopColor={colors[i]} stopOpacity={0}/>
                            </linearGradient>
                          );
                        })}
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} />
                      <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                        itemStyle={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 0' }}
                      />
                      <Area type="monotone" dataKey="BlueDart" stroke="#00eaff" strokeWidth={3} fillOpacity={1} fill="url(#grad-BlueDart)" />
                      <Area type="monotone" dataKey="Delhivery" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#grad-Delhivery)" />
                      <Area type="monotone" dataKey="XpressBees" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#grad-XpressBees)" />
                      <Area type="monotone" dataKey="Shadowfax" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#grad-Shadowfax)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Cost vs Efficiency Bubble Chart */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="section-title">Efficiency Matrix</h3>
                    <p className="text-[10px] text-text-dim">Transit Days vs. Cost (Bubble Size = FASR%)</p>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                      <XAxis type="number" dataKey="avgTransit" name="Days" unit="d" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} label={{ value: 'Transit Time', position: 'bottom', fill: 'var(--text-dim)', fontSize: 10 }} />
                      <YAxis type="number" dataKey="avgCost" name="Cost" unit="Rs" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} label={{ value: 'Cost', angle: -90, position: 'insideLeft', fill: 'var(--text-dim)', fontSize: 10 }} />
                      <ZAxis type="number" dataKey="fasr" range={[100, 1000]} name="FASR" unit="%" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                      <Scatter name="Carriers" data={carriers} fill="#00eaff">
                        {carriers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#00eaff', '#10b981', '#f59e0b', '#06b6d4'][index % 4]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: RTO Risk Heatmap by Zone */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="section-title">Regional RTO Risk Heatmap</h3>
                  <span className="text-[10px] font-bold text-danger uppercase tracking-widest flex items-center gap-1">
                    <Thermometer size={12} /> High Risk Zones
                  </span>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={zoneData} layout="vertical">
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.1} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="zone" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} />
                      <Tooltip contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                      <Bar dataKey="rto" radius={[0, 4, 4, 0]} barSize={20}>
                        {zoneData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.rto > 12 ? '#ef4444' : entry.rto > 8 ? '#f59e0b' : '#10b981'} />
                        ))}
                      </Bar>
                      <Line type="monotone" dataKey="delivery" stroke="#00eaff" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-void/50 border border-border/50 text-[10px] text-text-dim italic text-center">
                  *Correlation: Zones with RTO &gt; 12% show 18% higher fulfillment cost.
                </div>
              </div>

              {/* Chart 4: Cost per Courier (Redesigned) */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="section-title">Cost & ROI Impact</h3>
                  <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Base Rate (Rs)</span>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={carriers}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} />
                      <Tooltip 
                        cursor={{ fill: 'var(--void)', opacity: 0.5 }}
                        contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                        formatter={(value) => [`Rs ${value}`, 'Average Cost']}
                      />
                      <Bar dataKey="avgCost" radius={[6, 6, 0, 0]} barSize={45}>
                        {carriers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00eaff' : '#06b6d4'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="card border-none">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="section-title">Decision Engine: Logistics</h3>
                <p className="text-xs text-text-dim">AI-driven carrier selection and risk mitigation rules.</p>
              </div>
              <button className="btn-primary">Add New Rule</button>
            </div>
            
            <div className="space-y-4">
              {mockRules.filter(r => r.Category === 'RTO').map((rule, idx) => (
                <div key={rule.Id} className="p-6 rounded-2xl border border-border bg-void/30 flex items-center justify-between group hover:border-neo/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-bloom/10 text-bloom">
                      <Zap size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-text-bright">{rule.RuleName}</span>
                        <span className="badge-bloom">Active</span>
                      </div>
                      <div className="text-xs text-text-mid mb-2">
                        {rule.Description}: <span className="font-mono text-neo bg-neo/5 px-1 rounded">{rule.CurrentValue}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-bloom uppercase tracking-wider">
                        <Activity size={10} /> Impacting {idx * 5 + 12}% of RTOs
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="btn-ghost py-1.5 px-3">Edit</button>
                    <button className="btn-ghost py-1.5 px-3 text-danger">Disable</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logistics;
