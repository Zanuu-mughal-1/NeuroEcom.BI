import { useState, useEffect } from 'react'
import { Brain, Sparkles, TrendingUp, TrendingDown, Package, Megaphone, Zap, Target, ChevronRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { SalesAreaChart } from '../../components/charts/MiniChart'
import { mockProducts, mockCampaigns, mockCustomers, generateSalesData } from '../../utils/api'

export default function Predictions() {
  const [activeTab, setActiveTab] = useState('product')
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[0])
  const [selectedCampaign, setSelectedCampaign] = useState(mockCampaigns[0])
  const [simPrice, setSimPrice] = useState(selectedProduct.Price)
  const [simStock, setSimStock] = useState(selectedProduct.Stock)
  const [simDiscount, setSimDiscount] = useState(10)
  const [simBudget, setSimBudget] = useState(200)
  const [productResult, setProductResult] = useState(null)
  const [adResult, setAdResult] = useState(null)
  const [forecastData, setForecastData] = useState(generateSalesData(30))
  const [adForecastData, setAdForecastData] = useState(generateSalesData(30))

  useEffect(() => {
    // Generate new ad forecast data whenever campaign or budget simulation changes
    const currentDailyBudget = selectedCampaign.TotalSpend / 30 || 50
    const budgetRatio = simBudget / currentDailyBudget
    const roiDecay = Math.log(budgetRatio + 1) * 0.7
    const baseDailyRevenue = (selectedCampaign.TotalRevenue / 30) || 500

    const newAdForecast = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() + (i + 1) * 86400000)
      const volatility = 0.8 + Math.random() * 0.4
      const revenue = Math.round(baseDailyRevenue * budgetRatio * roiDecay * volatility)

      return {
        date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        revenue: revenue,
        spend: simBudget * volatility
      }
    })
    setAdForecastData(newAdForecast)
  }, [selectedCampaign, simBudget])

  useEffect(() => {
    // Generate new forecast data whenever product or price simulation changes
    // This makes the UI feel alive and responsive to user input
    const baseDailySales = 15 // units per day
    const priceElasticity = -1.5
    const priceDiff = (simPrice - selectedProduct.Price) / selectedProduct.Price
    const salesMultiplier = 1 + (priceDiff * priceElasticity)

    const newForecast = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() + (i + 1) * 86400000)
      const seasonality = 1 + Math.sin(i / 5) * 0.1 // subtle wave
      const randomness = 0.9 + Math.random() * 0.2
      const units = Math.max(1, Math.round(baseDailySales * salesMultiplier * seasonality * randomness))

      return {
        date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        revenue: units * simPrice,
        units: units
      }
    })
    setForecastData(newForecast)
  }, [selectedProduct, simPrice])

  const runProductSim = () => {
    const priceDiff = (simPrice - selectedProduct.Price) / selectedProduct.Price
    const elasticity = -1.5
    const salesChange = priceDiff * elasticity
    const baseSales = 450
    const newSales = Math.round(baseSales * (1 + salesChange))
    const newRevenue = newSales * simPrice
    const baseRevenue = baseSales * selectedProduct.Price
    setProductResult({
      newPrice: +simPrice,
      newSales,
      newRevenue,
      salesChange: Math.round(salesChange * 100),
      revenueChange: Math.round((newRevenue - baseRevenue) / baseRevenue * 100),
      recommendation: newRevenue > baseRevenue ? 'Highly Recommended' : 'Low Efficiency',
      positive: newRevenue > baseRevenue,
    })
  }


  const runAdSim = () => {
    const currentDailyBudget = selectedCampaign.TotalSpend / 30
    const budgetRatio = simBudget / currentDailyBudget
    const roiDecay = Math.log(budgetRatio + 1) * 0.7
    const currentROI = selectedCampaign.ROI / 100
    const newROI = currentROI * roiDecay
    const newTotalSpend = simBudget * 30
    const newRevenue = newTotalSpend * (1 + newROI)
    setAdResult({
      newBudget: simBudget,
      newTotalSpend: Math.round(newTotalSpend),
      newRevenue: Math.round(newRevenue),
      newROI: Math.round(newROI * 100),
      roiChange: Math.round((newROI - currentROI) * 100),
      roas: (newRevenue / newTotalSpend).toFixed(2),
      recommendation: newROI > 0.5 ? 'Optimized Strategy' : newROI > 0 ? 'Moderate Performance' : 'Inefficient Allocation',
      positive: newROI > 0.5,
    })
  }

  const tabs = [
    { id: 'product', label: 'Product Predictions', icon: Package },
    { id: 'ads', label: 'Ads Predictions', icon: Megaphone },
    { id: 'customers', label: 'Customer Predictions', icon: Target },
    { id: 'returns', label: 'Return Predictions', icon: Zap },
  ]

  const [selectedCustomer, setSelectedCustomer] = useState(mockCustomers[0])
  const [simLoyaltyPoints, setSimLoyaltyPoints] = useState(selectedCustomer.LoyaltyPoints)
  const [selectedReturnProduct, setSelectedReturnProduct] = useState(mockProducts[0])
  const [simQualityLevel, setSimQualityLevel] = useState(0) // 0 to 100% improvement
  const [showFlags, setShowFlags] = useState(false)

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-neo/10 via-royal/10 to-pulse/5 border border-neo/20 shadow-neo">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 dark:opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--neo), transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 rounded-xl bg-neo/20 border border-neo/30">
            <Brain size={24} className="text-neo-bright" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-bright" style={{ fontFamily: 'Bebas Neue', letterSpacing: '1px' }}>
              AI Prediction Engine
            </h2>
            <p className="text-sm text-text-dim mt-0.5 font-medium">
              Run what-if simulations and get AI-powered forecasts for products, ads, customers, and returns
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bloom/10 border border-bloom/20">
            <Sparkles size={13} className="text-bloom" />
            <span className="text-xs font-bold text-bloom">Model v2.4 Active</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-surface border border-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-neo/20 text-neo-bright border border-neo/30' : 'text-text-dim hover:text-text-mid hover:bg-void/50'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* PRODUCT PREDICTIONS */}
      {activeTab === 'product' && (
        <div className="space-y-5">
          {/* Product selector */}
          <div className="card">
            <div className="section-title mb-3">Select Product</div>
            <div className="relative">
              <select
                value={selectedProduct.Id}
                onChange={(e) => {
                  const p = mockProducts.find(prod => prod.Id === parseInt(e.target.value));
                  setSelectedProduct(p);
                  setSimPrice(p.Price);
                  setSimStock(p.Stock);
                  setProductResult(null);
                }}
                className="w-full bg-void border border-border rounded-xl px-4 py-3 text-text-mid focus:outline-none focus:border-neo/50 transition-all appearance-none cursor-pointer"
              >
                {mockProducts.map(p => (
                  <option key={p.Id} value={p.Id} className="bg-surface text-text-mid">
                    {p.Name} — ${p.Price} ({p.Stock} in stock)
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim">
                <ChevronRight size={18} className="rotate-90" />
              </div>
            </div>
          </div>

          {/* Current metrics */}
          <div className="card">
            <div className="section-title mb-3 flex items-center gap-2">
              <Package size={15} className="text-neo" /> Current Metrics — {selectedProduct.Name}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Price', value: `$${selectedProduct.Price}`, color: 'var(--text-bright)' },
                { label: 'Cost', value: `$${selectedProduct.Cost}`, color: '#9ca3af' },
                { label: 'Margin', value: `${((selectedProduct.Price - selectedProduct.Cost) / selectedProduct.Price * 100).toFixed(1)}%`, color: '#34d399' },
                { label: 'Stock', value: selectedProduct.Stock, color: selectedProduct.Stock < 10 ? '#f87171' : '#818cf8' },
                { label: 'Sales (est)', value: '450 units', color: '#22d3ee' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-lg text-center bg-void border border-border">
                  <div className="stat-label">{m.label}</div>
                  <div className="text-base font-bold mt-0.5" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Price Simulation */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-neo" />
                <div className="section-title">Price Simulation</div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="stat-label block mb-1">New Price ($)</label>
                  <input type="number" className="input" value={simPrice}
                    onChange={e => setSimPrice(e.target.value)} step="0.01" min={0} />
                  <div className="text-xs text-text-dim mt-1">Current: ${selectedProduct.Price}</div>
                </div>
                <button onClick={runProductSim} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Zap size={14} /> Simulate Price Change
                </button>

                {!productResult && (
                  <div className="p-3 rounded-xl border border-dashed border-border/30 bg-surface/30 flex flex-col items-center justify-center py-6">
                    <TrendingUp size={24} className="text-text-dim/20 mb-2" />
                    <div className="text-[10px] uppercase tracking-wider text-text-dim font-bold">Awaiting Simulation</div>
                    <div className="text-[11px] text-text-dim/60 mt-1">Adjust price and click simulate</div>
                  </div>
                )}

                {productResult && (
                  <div className="p-4 rounded-xl space-y-3" style={{
                    background: productResult.positive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${productResult.positive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                  }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-text-bright">Projected Outcome</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-abyss border border-border text-text-mid">${productResult.newPrice}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="stat-label">Est. Sales</div>
                        <div className={`text-sm font-bold ${productResult.salesChange >= 0 ? 'text-bloom' : 'text-danger'}`}>
                          {productResult.newSales} ({productResult.salesChange >= 0 ? '+' : ''}{productResult.salesChange}%)
                        </div>
                      </div>
                      <div>
                        <div className="stat-label">Est. Revenue</div>
                        <div className={`text-sm font-bold ${productResult.revenueChange >= 0 ? 'text-bloom' : 'text-danger'}`}>
                          ${productResult.newRevenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/10 flex items-center gap-2">
                      {productResult.positive ? <CheckCircle size={14} className="text-bloom" /> : <XCircle size={14} className="text-danger" />}
                      <span className="text-xs font-bold text-text-bright">{productResult.recommendation}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory & Stock Simulation */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Package size={15} className="text-royal" />
                <div className="section-title">Inventory Simulation</div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="stat-label block mb-1">Simulated Stock Level</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max={Math.max(500, selectedProduct.Stock * 2)} step="10" value={simStock}
                      onChange={e => setSimStock(parseInt(e.target.value))}
                      className="flex-1 accent-neo" />
                    <span className="text-xl font-bold text-neo-bright w-12 text-right" style={{ fontFamily: 'Bebas Neue' }}>{simStock}</span>
                  </div>
                  <div className="text-xs text-text-dim mt-1">Current: {selectedProduct.Stock} units</div>
                </div>

                <div className="p-3 rounded-xl space-y-3 bg-abyss border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-dim">Stockout Risk</span>
                    {(() => {
                      const dailyRate = forecastData.reduce((sum, d) => sum + d.units, 0) / 30;
                      const daysLeft = simStock / dailyRate;
                      const risk = daysLeft < 7 ? 'Critical' : daysLeft < 15 ? 'High' : 'Low';
                      const color = risk === 'Critical' ? '#ef4444' : risk === 'High' ? '#f59e0b' : '#10b981';
                      return <span className="text-xs font-bold" style={{ color }}>{risk}</span>
                    })()}
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-abyss">
                    {(() => {
                      const dailyRate = forecastData.reduce((sum, d) => sum + d.units, 0) / 30;
                      const daysLeft = simStock / dailyRate;
                      const progress = Math.min(100, (daysLeft / 30) * 100);
                      const color = daysLeft < 7 ? '#ef4444' : daysLeft < 15 ? '#f59e0b' : '#10b981';
                      return <div className="h-full rounded-full" style={{ width: `${progress}%`, background: color }} />
                    })()}
                  </div>
                  <div className="flex justify-between text-[10px] text-text-dim mt-1">
                    <span>Depletion: ~{Math.floor(simStock / (forecastData.reduce((sum, d) => sum + d.units, 0) / 30))} days</span>
                    <span>Safety: {Math.round(simStock * 0.2)} units</span>
                  </div>
                </div>

                <div className="bg-neo/10 border border-neo/20 p-4 rounded-xl min-h-[100px] flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={12} className="text-neo dark:text-neo-bright" />
                    <div className="text-[10px] uppercase tracking-wider text-neo dark:text-neo-bright font-bold">AI Strategic Insight</div>
                  </div>
                  <p className="text-xs text-text-mid leading-relaxed italic">
                    "{simStock < 50 ? `Stock levels are dangerously low. Reorder at least 150 units immediately to avoid $${(150 * simPrice).toLocaleString()} in lost revenue.` :
                      simStock > 300 ? "Inventory is significantly over-buffered. Consider a slight price reduction to increase velocity and free up warehouse capital." :
                        "Maintain current levels. Inventory is balanced for the projected demand wave. No action required."}"
                  </p>
                </div>
              </div>
            </div>

            {/* AI Forecast */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={15} className="text-pulse" />
                <div className="section-title">AI Forecast (30 Days)</div>
              </div>
              <div className="space-y-3">
                {(() => {
                  const totalPredictedUnits = forecastData.reduce((sum, d) => sum + d.units, 0);
                  const totalPredictedRevenue = forecastData.reduce((sum, d) => sum + d.revenue, 0);
                  const revenueChange = ((totalPredictedRevenue - (15 * 30 * selectedProduct.Price)) / (15 * 30 * selectedProduct.Price) * 100).toFixed(1);

                  return [
                    { label: 'Predicted Sales', value: `${totalPredictedUnits} units`, change: `${revenueChange > 0 ? '+' : ''}${revenueChange}%`, positive: revenueChange > 0 },
                    { label: 'Predicted Revenue', value: `$${totalPredictedRevenue.toLocaleString()}`, change: `based on $${simPrice}`, positive: true },
                    { label: 'Return Rate Forecast', value: `${(8.5 + Math.random() * 3).toFixed(1)}%`, change: '±0.5%', positive: false },
                    { label: 'Optimal Price', value: `$${(selectedProduct.Price * 0.95).toFixed(2)}`, change: 'AI suggested', positive: true },
                    { label: 'Reorder Date', value: simStock === 0 ? 'Out of Stock' : `~${Math.floor(simStock / (totalPredictedUnits / 30))} days`, change: 'est. depletion', positive: simStock > 50 },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <span className="text-xs text-text-dim">{m.label}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-text-bright">{m.value}</div>
                        <div className={`text-xs ${m.positive === true ? 'text-bloom' : m.positive === false ? 'text-danger' : 'text-text-dim'}`}>
                          {m.change}
                        </div>
                      </div>
                    </div>
                  ))
                })()}
                <div className="pt-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-dim">Confidence Level</span>
                    <span className="text-bloom font-bold">85%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-abyss">
                    <div className="h-full rounded-full bg-bloom" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast chart */}
          <div className="card">
            <div className="section-title mb-1">30-Day Sales Forecast</div>
            <div className="section-subtitle mb-4">Projected performance with current settings</div>
            <div className="h-52">
              <SalesAreaChart data={forecastData} color="#8b5cf6" dataKey="revenue" prefix="$" />
            </div>
          </div>
        </div>
      )}

      {/* ADS PREDICTIONS */}
      {activeTab === 'ads' && (
        <div className="space-y-5">
          <div className="card">
            <div className="section-title mb-3">Select Campaign</div>
            <div className="relative">
              <select
                value={selectedCampaign.Id}
                onChange={(e) => {
                  const c = mockCampaigns.find(camp => camp.Id === parseInt(e.target.value));
                  setSelectedCampaign(c);
                  setAdResult(null);
                  setSimBudget(Math.round(c.TotalSpend / 30) || 100);
                }}
                className="w-full bg-void border border-border rounded-xl px-4 py-3 text-text-mid focus:outline-none focus:border-neo/50 transition-all appearance-none cursor-pointer"
              >
                {mockCampaigns.filter(c => c.Status !== 'Draft').map(c => (
                  <option key={c.Id} value={c.Id} className="bg-surface text-text-mid">
                    {c.Name} — {c.Platform} (${c.Budget.toLocaleString()} Budget)
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim">
                <ChevronRight size={18} className="rotate-90" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title mb-3 flex items-center gap-2">
              <Megaphone size={15} className="text-bloom" /> Current Metrics — {selectedCampaign.Name}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Budget', value: `$${selectedCampaign.Budget.toLocaleString()}`, color: 'var(--text-bright)' },
                { label: 'Total Spend', value: `$${selectedCampaign.TotalSpend.toLocaleString()}`, color: '#f87171' },
                { label: 'Revenue', value: `$${selectedCampaign.TotalRevenue.toLocaleString()}`, color: '#34d399' },
                { label: 'ROI', value: `${selectedCampaign.ROI}%`, color: '#818cf8' },
                { label: 'Clicks', value: selectedCampaign.Clicks.toLocaleString(), color: '#22d3ee' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-lg text-center bg-void border border-border">
                  <div className="stat-label">{m.label}</div>
                  <div className="text-base font-bold mt-0.5" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Budget Simulation */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-bloom" />
                <div className="section-title">Budget Change Simulation</div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="stat-label block mb-1">New Daily Budget ($)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="50" max="500" step="25" value={simBudget}
                      onChange={e => setSimBudget(e.target.value)} className="flex-1 accent-bloom" />
                    <span className="text-xl font-bold text-bloom w-16 text-right" style={{ fontFamily: 'Bebas Neue' }}>${simBudget}</span>
                  </div>
                </div>
                <button onClick={runAdSim} className="btn-success w-full flex items-center justify-center gap-2">
                  <Zap size={14} /> Simulate Budget Change
                </button>

                {!adResult && (
                  <div className="p-3 rounded-xl border border-dashed border-border/30 bg-surface/30 flex flex-col items-center justify-center py-6">
                    <TrendingUp size={24} className="text-text-dim/20 mb-2" />
                    <div className="text-[10px] uppercase tracking-wider text-text-dim font-bold">Awaiting Simulation</div>
                    <div className="text-[11px] text-text-dim/60 mt-1">Adjust budget and click simulate</div>
                  </div>
                )}

                {adResult && (
                  <div className="p-4 rounded-xl space-y-3" style={{
                    background: adResult.positive ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                    border: `1px solid ${adResult.positive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`
                  }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-text-bright">Ad Forecast Result</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-abyss border border-border text-text-mid">${adResult.newBudget}/day</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="stat-label">Monthly Spend</div>
                        <div className="text-sm font-bold text-danger">${adResult.newTotalSpend.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="stat-label">Expected Revenue</div>
                        <div className="text-sm font-bold text-bloom">${adResult.newRevenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="stat-label">Projected ROI</div>
                        <div className={`text-sm font-bold ${adResult.newROI > 100 ? 'text-bloom' : adResult.newROI > 0 ? 'text-ember' : 'text-danger'}`}>
                          {adResult.newROI}%
                        </div>
                      </div>
                      <div>
                        <div className="stat-label">Projected ROAS</div>
                        <div className="text-sm font-bold text-neo-bright">{adResult.roas}x</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/10">
                      <div className="flex items-center gap-1.5">
                        {adResult.newROI > 50 ? <CheckCircle size={14} className="text-bloom" /> : adResult.newROI > 0 ? <AlertTriangle size={14} className="text-ember" /> : <XCircle size={14} className="text-danger" />}
                        <div className="text-xs font-bold text-text-bright">{adResult.recommendation}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={15} className="text-neo" />
                <div className="section-title">AI Recommendations</div>
              </div>
              <div className="space-y-3">
                {(() => {
                  const currentDaily = selectedCampaign.TotalSpend / 30 || 50;
                  const optimalBudget = Math.round(currentDaily * 1.25);
                  const predictedRevenue = Math.round(selectedCampaign.TotalRevenue * 1.15);

                  const recommendations = [
                    { label: 'Optimal Daily Budget', value: `$${optimalBudget}`, confidence: 89, icon: Target, color: '#818cf8' },
                    { label: 'Expected ROI at optimal', value: `${Math.round(selectedCampaign.ROI * 1.1)}%`, confidence: 84, icon: TrendingUp, color: '#34d399' },
                    { label: 'Best Performing Platform', value: selectedCampaign.Platform, confidence: 76, icon: Megaphone, color: '#22d3ee' },
                    { label: 'Next 30 Day Revenue', value: `$${predictedRevenue.toLocaleString()}`, confidence: 78, icon: ChevronRight, color: '#fbbf24' },
                  ];

                  return recommendations.map(r => (
                    <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-void border border-border">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${r.color}18` }}>
                        <r.icon size={14} style={{ color: r.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-text-dim">{r.label}</div>
                        <div className="text-base font-bold mt-0.5" style={{ color: r.color }}>{r.value}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-text-dim">Confidence</div>
                        <div className="text-sm font-bold text-bloom">{r.confidence}%</div>
                      </div>
                    </div>
                  ));
                })()}

                <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={13} className="text-neo-bright" />
                    <span className="text-xs font-semibold text-neo-bright">Platform Allocation for {selectedCampaign.Name}</span>
                  </div>
                  <div className="space-y-1.5">
                    {(() => {
                      const primary = selectedCampaign.Platform;
                      const platforms = [
                        { name: primary, pct: 60, color: '#818cf8' },
                        { name: primary === 'Google' ? 'Facebook' : 'Google', pct: 25, color: '#ef4444' },
                        { name: 'Instagram', pct: 15, color: '#ec4899' }
                      ];
                      return platforms.map(p => (
                        <div key={p.name}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-text-dim">{p.name}</span>
                            <span style={{ color: p.color }}>{p.pct}%</span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden bg-abyss">
                            <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ad Forecast chart */}
          <div className="card">
            <div className="section-title mb-1">30-Day Ad Revenue Forecast</div>
            <div className="section-subtitle mb-4">Projected scaling performance for {selectedCampaign.Name}</div>
            <div className="h-52">
              <SalesAreaChart data={adForecastData} color="#10b981" dataKey="revenue" prefix="$" />
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER PREDICTIONS */}
      {activeTab === 'customers' && (
        <div className="space-y-5">
          <div className="card">
            <div className="section-title mb-3">Select Customer</div>
            <div className="relative">
              <select
                value={selectedCustomer.Id}
                onChange={(e) => {
                  const c = mockCustomers.find(cust => cust.Id === parseInt(e.target.value));
                  setSelectedCustomer(c);
                  setSimLoyaltyPoints(c.LoyaltyPoints);
                }}
                className="w-full bg-void border border-border rounded-xl px-4 py-3 text-text-mid focus:outline-none focus:border-neo/50 transition-all appearance-none cursor-pointer"
              >
                {mockCustomers.map(c => (
                  <option key={c.Id} value={c.Id} className="bg-surface text-text-mid">
                    {c.FirstName} {c.LastName} — {c.LoyaltyTier} ({c.TotalOrders} Orders)
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim">
                <ChevronRight size={18} className="rotate-90" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card">
              <div className="section-title mb-4">Loyalty Simulation</div>
              <div className="space-y-4">
                <div>
                  <label className="stat-label block mb-1">Add Loyalty Points</label>
                  <input type="range" min="0" max="5000" step="100" value={simLoyaltyPoints - selectedCustomer.LoyaltyPoints}
                    onChange={e => setSimLoyaltyPoints(selectedCustomer.LoyaltyPoints + parseInt(e.target.value))}
                    className="w-full accent-neo" />
                  <div className="flex justify-between text-xs text-text-dim mt-1">
                    <span>New Total: {simLoyaltyPoints} pts</span>
                    <span className="text-neo-bright">+{simLoyaltyPoints - selectedCustomer.LoyaltyPoints} pts</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-abyss border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] uppercase tracking-wider text-text-dim font-bold">Churn Risk Impact</div>
                    <div className="text-[10px] px-2 py-0.5 rounded bg-neo/10 text-neo-bright font-bold">
                      {selectedCustomer.LoyaltyTier} → {simLoyaltyPoints > 5000 ? 'VIP' : simLoyaltyPoints > 2000 ? 'Gold' : 'Silver'}
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold text-bloom">
                      {Math.max(2, Math.round(15 - (simLoyaltyPoints / 500)))}%
                    </div>
                    <div className="text-xs text-bloom mb-1 font-medium">Predicted Risk</div>
                  </div>
                  <div className="h-1 bg-border/20 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-bloom transition-all duration-500"
                      style={{ width: `${Math.min(100, (simLoyaltyPoints / 6000) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title mb-4">AI Customer Forecast</div>
              <div className="space-y-3">
                {[
                  { label: 'Projected Lifetime Value', value: `$${(selectedCustomer.TotalSpent * 1.4).toLocaleString()}`, icon: TrendingUp, color: '#34d399' },
                  { label: 'Next Purchase Probability', value: `${Math.min(95, 65 + (simLoyaltyPoints / 100)).toFixed(0)}%`, icon: Target, color: '#818cf8' },
                  { label: 'Predicted Next Purchase', value: 'Within 12 days', icon: Zap, color: '#22d3ee' },
                  { label: 'Suggested Segment', value: simLoyaltyPoints > 5000 ? 'VIP Elite' : simLoyaltyPoints > 2000 ? 'Gold Star' : 'Loyal Silver', icon: Brain, color: '#fbbf24' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-border/10">
                    <div className="flex items-center gap-3">
                      <item.icon size={14} style={{ color: item.color }} />
                      <span className="text-xs text-text-dim">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-text-bright">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="section-title mb-4">Product Affinity (AI Suggested)</div>
              {(() => {
                const affinityProduct = mockProducts[selectedCustomer.Id % mockProducts.length];
                const matchPct = 75 + (selectedCustomer.Id % 20);
                return (
                  <>
                    <div className="p-4 rounded-xl bg-neo/5 border border-neo/20 flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-neo/20 flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-neo-bright" />
                      </div>
                      <div>
                        <div className="text-xs text-text-dim">Likely Next Purchase</div>
                        <div className="text-sm font-bold text-text-bright mt-0.5">{affinityProduct.Name}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-bloom/10 text-bloom font-bold">{matchPct}% Match</span>
                          <span className="text-[10px] text-text-dim">Based on browsing history</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-text-dim font-bold">Cross-Sell Opportunities</div>
                      <div className="flex gap-2">
                        {['Premium Support', 'Extended Warranty'].map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-abyss border border-border text-text-mid">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="card">
              <div className="section-title mb-4">Churn Risk Drivers</div>
              <div className="space-y-3">
                {(() => {
                  const lastPurchaseDays = 15 + (selectedCustomer.Id % 60);
                  const supportTickets = selectedCustomer.Id % 3;
                  const returnRate = 5 + (selectedCustomer.Id % 15);

                  const drivers = [
                    { label: 'Last Purchase', value: `${lastPurchaseDays} days ago`, risk: lastPurchaseDays > 45 ? 'High' : lastPurchaseDays > 20 ? 'Medium' : 'Low', color: lastPurchaseDays > 45 ? '#ef4444' : lastPurchaseDays > 20 ? '#f59e0b' : '#10b981' },
                    { label: 'Support Tickets', value: `${supportTickets} unresolved`, risk: supportTickets > 1 ? 'High' : supportTickets > 0 ? 'Medium' : 'Low', color: supportTickets > 1 ? '#ef4444' : supportTickets > 0 ? '#f59e0b' : '#10b981' },
                    { label: 'Avg. Return Rate', value: `${returnRate}%`, risk: returnRate > 15 ? 'High' : returnRate > 8 ? 'Medium' : 'Low', color: returnRate > 15 ? '#ef4444' : returnRate > 8 ? '#f59e0b' : '#10b981' },
                  ];

                  return drivers.map(driver => (
                    <div key={driver.label} className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-text-bright font-medium">{driver.label}</div>
                        <div className="text-[10px] text-text-dim">{driver.value}</div>
                      </div>
                      <div className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${driver.color}15`, color: driver.color, border: `1px solid ${driver.color}30` }}>
                        {driver.risk}
                      </div>
                    </div>
                  ));
                })()}
                <div className="pt-2 mt-2 border-t border-border/10">
                  <p className="text-[10px] text-text-dim italic leading-relaxed">
                    {(() => {
                      const lastPurchaseDays = 15 + (selectedCustomer.Id % 60);
                      const isVIP = selectedCustomer.TotalSpent > 3000;
                      const hasTickets = (selectedCustomer.Id % 3) > 1;

                      if (hasTickets) return `*AI suggests a personalized follow-up from the Success Team to resolve ${selectedCustomer.Id % 3} open tickets before proposing new offers.`;
                      if (lastPurchaseDays > 45) return `*AI suggests a "We Miss You" reactivation campaign with a 20% discount on their favorite category: ${mockProducts[selectedCustomer.Id % mockProducts.length].Category}.`;
                      if (isVIP) return `*AI suggests an "Elite Appreciation" gift: Free 1-year extended warranty on their next purchase of ${mockProducts[selectedCustomer.Id % mockProducts.length].Name}.`;
                      if (selectedCustomer.TotalOrders > 10) return `*AI suggests inviting ${selectedCustomer.FirstName} to the "Ambassador Program" to leverage their high brand loyalty for referrals.`;

                      return `*AI suggests a "Next-Step" voucher: 10% off ${mockProducts[(selectedCustomer.Id + 1) % mockProducts.length].Name} to encourage their ${(selectedCustomer.TotalOrders + 1)}th order.`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title mb-4">Projected LTV Growth</div>
            <div className="section-subtitle mb-4">Estimated value increase over the next 12 months based on current loyalty simulation</div>
            <div className="h-48">
              <SalesAreaChart
                data={Array.from({ length: 12 }, (_, i) => ({
                  date: `Month ${i + 1}`,
                  revenue: Math.round(selectedCustomer.TotalSpent + (i + 1) * (selectedCustomer.TotalSpent / (selectedCustomer.TotalOrders || 1)) * (1 + simLoyaltyPoints / 10000))
                }))}
                color="#f59e0b"
                dataKey="revenue"
                prefix="$"
              />
            </div>
          </div>
        </div>
      )}

      {/* RETURN PREDICTIONS */}
      {activeTab === 'returns' && (
        <div className="space-y-5">
          {/* Top Status & Simulator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card col-span-1 lg:col-span-2">
              <div className="section-title mb-4">Product Return Simulator</div>
              <div className="space-y-4">
                <div className="relative">
                  <select
                    value={selectedReturnProduct.Id}
                    onChange={(e) => {
                      const p = mockProducts.find(prod => prod.Id === parseInt(e.target.value));
                      setSelectedReturnProduct(p);
                      setSimQualityLevel(0);
                    }}
                    className="w-full bg-void border border-border rounded-xl px-4 py-3 text-text-mid focus:outline-none focus:border-neo/50 transition-all appearance-none cursor-pointer"
                  >
                    {mockProducts.map(p => (
                      <option key={p.Id} value={p.Id} className="bg-surface text-text-mid">{p.Name} — Current Return Rate: {(5 + (p.Id % 10)).toFixed(1)}%</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim">
                    <ChevronRight size={18} className="rotate-90" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface/30 border border-border/10 space-y-4">
                  <div>
                    <label className="stat-label block mb-2">Quality & Packaging Improvement</label>
                    <input type="range" min="0" max="100" step="5" value={simQualityLevel}
                      onChange={e => setSimQualityLevel(parseInt(e.target.value))}
                      className="w-full accent-danger" />
                    <div className="flex justify-between text-[10px] text-text-dim mt-1">
                      <span>Standard</span>
                      <span className="text-bloom font-bold">+{simQualityLevel}% Improvement</span>
                      <span>Premium QC</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {(() => {
                      const baseRate = 5 + (selectedReturnProduct.Id % 10);
                      const reduction = (simQualityLevel / 100) * 0.6; // max 60% reduction
                      const newRate = baseRate * (1 - reduction);
                      const monthlyReturns = 150;
                      const savingsPerReturn = selectedReturnProduct.Price * 0.4;
                      const monthlySavings = Math.round((baseRate - newRate) / 100 * monthlyReturns * savingsPerReturn);

                      return (
                        <>
                          <div className="p-3 rounded-lg bg-abyss border border-border">
                            <div className="stat-label">Predicted Return Rate</div>
                            <div className="text-xl font-bold text-danger">{newRate.toFixed(1)}%</div>
                            <div className="text-[10px] text-bloom">↓ {Math.round(reduction * 100)}% Improvement</div>
                          </div>
                          <div className="p-3 rounded-lg bg-abyss border border-border">
                            <div className="stat-label">Est. Monthly Savings</div>
                            <div className="text-xl font-bold text-bloom">${monthlySavings.toLocaleString()}</div>
                            <div className="text-[10px] text-text-dim">Based on {monthlyReturns} orders</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title mb-4">Return Reason Analysis</div>
              <div className="space-y-4">
                {(() => {
                  const reasons = [
                    { label: 'Defective/Damaged', pct: 45 - (simQualityLevel / 3), color: '#ef4444' },
                    { label: 'Wrong Size/Item', pct: 25, color: '#818cf8' },
                    { label: 'Changed Mind', pct: 30, color: '#9ca3af' }
                  ];
                  return reasons.map(r => (
                    <div key={r.label}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-text-dim">{r.label}</span>
                        <span className="font-bold text-text-bright">{Math.max(5, Math.round(r.pct))}%</span>
                      </div>
                      <div className="h-1.5 bg-abyss rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-700"
                          style={{ width: `${Math.max(5, r.pct)}%`, background: r.color }} />
                      </div>
                    </div>
                  ));
                })()}
                <div className="p-3 rounded-xl bg-neo/5 border border-neo/20 mt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain size={12} className="text-neo-bright" />
                    <span className="text-[10px] font-bold text-neo-bright uppercase">AI Suggestion</span>
                  </div>
                  <p className="text-[10px] text-text-dim leading-relaxed">
                    Increasing Quality Control by 40% will eliminate 80% of "Defective" returns for {selectedReturnProduct.Name}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Impact Chart */}
          <div className="card">
            <div className="section-title mb-1">Return Cost Forecast (6 Months)</div>
            <div className="section-subtitle mb-4">Projected financial loss due to returns vs optimized scenario</div>
            <div className="h-52">
              <SalesAreaChart
                data={Array.from({ length: 6 }, (_, i) => {
                  const baseLoss = 5000 + (Math.random() * 1000);
                  const improvement = 1 - ((simQualityLevel / 100) * 0.4);
                  return {
                    date: `Month ${i + 1}`,
                    revenue: Math.round(baseLoss * improvement)
                  };
                })}
                color="#ef4444"
                dataKey="revenue"
                prefix="$"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card col-span-2">
              <div className="section-title mb-4">High Risk Return Categories</div>
              <div className="space-y-4">
                {[
                  { cat: 'Electronics', current: '12.4%', predicted: '14.2%', trend: 'up' },
                  { cat: 'Accessories', current: '5.1%', predicted: '4.2%', trend: 'down' },
                  { cat: 'Storage', current: '8.9%', predicted: '7.5%', trend: 'down' },
                ].map(r => (
                  <div key={r.cat} className="flex items-center gap-4">
                    <div className="w-24 text-xs font-medium text-text-mid">{r.cat}</div>
                    <div className="flex-1 h-2 bg-abyss rounded-full overflow-hidden">
                      <div className="h-full bg-neo" style={{ width: r.current }} />
                    </div>
                    <div className="text-xs font-bold text-text-bright w-12">{r.current}</div>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.trend === 'up' ? 'bg-danger/10 text-danger' : 'bg-bloom/10 text-bloom'}`}>
                      {r.trend === 'up' ? '↑' : '↓'} {r.predicted}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="section-title mb-4">Fraud Detection AI</div>
              <div className="p-4 rounded-xl bg-danger/5 border border-danger/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-danger" />
                  <span className="text-xs font-bold text-danger uppercase tracking-wider">Active Alerts</span>
                </div>
                <div className="text-2xl font-bold text-text-bright">34</div>
                <div className="text-[10px] text-text-dim mt-1">Suspicious return patterns detected this week</div>
                <button
                  onClick={() => setShowFlags(!showFlags)}
                  className="btn-ghost w-full mt-4 text-[10px] py-1"
                >
                  {showFlags ? 'Hide Alerts' : 'Review Flags'}
                </button>

                {showFlags && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    {[
                      { id: '#RTN-2941', reason: 'Bulk return (5+ items)', risk: 'High' },
                      { id: '#RTN-1022', reason: 'Used condition reported', risk: 'Medium' },
                      { id: '#RTN-8832', reason: 'Multiple account linkage', risk: 'High' },
                    ].map(f => (
                      <div key={f.id} className="p-2 rounded bg-surface/40 border border-border/10 flex justify-between items-center">
                        <div>
                          <div className="text-[9px] font-bold text-text-bright">{f.id}</div>
                          <div className="text-[8px] text-text-dim">{f.reason}</div>
                        </div>
                        <span className={`text-[8px] font-bold ${f.risk === 'High' ? 'text-danger' : 'text-ember'}`}>{f.risk}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
