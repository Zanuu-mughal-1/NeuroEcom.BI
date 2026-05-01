import { useState } from 'react'
import { Brain, Sparkles, TrendingUp, TrendingDown, Package, Megaphone, Zap, Target, ChevronRight } from 'lucide-react'
import { SalesAreaChart } from '../../components/charts/MiniChart'
import { mockProducts, mockCampaigns, generateSalesData } from '../../utils/api'

export default function Predictions() {
  const [activeTab, setActiveTab] = useState('product')
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[0])
  const [selectedCampaign, setSelectedCampaign] = useState(mockCampaigns[0])
  const [simPrice, setSimPrice] = useState(selectedProduct.Price)
  const [simDiscount, setSimDiscount] = useState(10)
  const [simBudget, setSimBudget] = useState(200)
  const [productResult, setProductResult] = useState(null)
  const [adResult, setAdResult] = useState(null)
  const forecastData = generateSalesData(30)

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
      recommendation: newRevenue > baseRevenue ? '✅ Recommended' : '❌ Not recommended',
      positive: newRevenue > baseRevenue,
    })
  }

  const runDiscountSim = () => {
    const discPct = +simDiscount / 100
    const newPrice = selectedProduct.Price * (1 - discPct)
    const salesLift = 1 + discPct * 2.8
    const baseSales = 450
    const newSales = Math.round(baseSales * salesLift)
    const newRevenue = newSales * newPrice
    const baseRevenue = baseSales * selectedProduct.Price
    setProductResult({
      label: `${simDiscount}% discount`,
      newPrice: newPrice.toFixed(2),
      newSales,
      newRevenue: Math.round(newRevenue),
      salesChange: Math.round((salesLift - 1) * 100),
      revenueChange: Math.round((newRevenue - baseRevenue) / baseRevenue * 100),
      recommendation: newRevenue > baseRevenue ? '✅ Recommended' : '❌ Not recommended',
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
      recommendation: newROI > 0.5 ? '✅ Recommended — solid returns' : newROI > 0 ? '⚠️ Moderate — diminishing returns' : '❌ Not recommended',
      positive: newROI > 0.5,
    })
  }

  const tabs = [
    { id: 'product', label: 'Product Predictions', icon: Package },
    { id: 'ads', label: 'Ads Predictions', icon: Megaphone },
  ]

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl p-5" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 50%, rgba(6,182,212,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        boxShadow: '0 0 60px rgba(99,102,241,0.1)'
      }}>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Brain size={24} className="text-neo-bright" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-white" style={{ fontFamily: 'Bebas Neue', letterSpacing: '1px' }}>
              AI Prediction Engine
            </h2>
            <p className="text-sm text-text-dim mt-0.5">
              Run what-if simulations and get AI-powered forecasts for products and ads
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <Sparkles size={13} className="text-bloom" />
            <span className="text-xs font-medium text-bloom">Model v2.4 Active</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-neo/20 text-neo-bright border border-neo/30' : 'text-text-dim hover:text-text-mid'}`}>
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
            <div className="flex gap-2 flex-wrap">
              {mockProducts.slice(0, 5).map(p => (
                <button key={p.Id} onClick={() => { setSelectedProduct(p); setSimPrice(p.Price); setProductResult(null) }}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${selectedProduct.Id === p.Id ? 'bg-neo/20 text-neo-bright border border-neo/30' : 'btn-ghost'}`}>
                  {p.Name}
                </button>
              ))}
            </div>
          </div>

          {/* Current metrics */}
          <div className="card">
            <div className="section-title mb-3 flex items-center gap-2">
              <Package size={15} className="text-neo" /> Current Metrics — {selectedProduct.Name}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Price', value: `$${selectedProduct.Price}`, color: '#f8fafc' },
                { label: 'Cost', value: `$${selectedProduct.Cost}`, color: '#9ca3af' },
                { label: 'Margin', value: `${((selectedProduct.Price - selectedProduct.Cost) / selectedProduct.Price * 100).toFixed(1)}%`, color: '#34d399' },
                { label: 'Stock', value: selectedProduct.Stock, color: selectedProduct.Stock < 10 ? '#f87171' : '#818cf8' },
                { label: 'Sales (est)', value: '450 units', color: '#22d3ee' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
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

                {productResult && !productResult.label && (
                  <div className="p-3 rounded-xl space-y-2" style={{
                    background: productResult.positive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${productResult.positive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                  }}>
                    <div className="text-xs font-semibold text-text-bright">At ${productResult.newPrice}:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-text-dim">Sales</span>
                        <div className={`font-bold ${productResult.salesChange >= 0 ? 'text-bloom' : 'text-danger'}`}>
                          {productResult.newSales} ({productResult.salesChange >= 0 ? '+' : ''}{productResult.salesChange}%)
                        </div>
                      </div>
                      <div>
                        <span className="text-text-dim">Revenue</span>
                        <div className={`font-bold ${productResult.revenueChange >= 0 ? 'text-bloom' : 'text-danger'}`}>
                          ${productResult.newRevenue.toLocaleString()} ({productResult.revenueChange >= 0 ? '+' : ''}{productResult.revenueChange}%)
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold">{productResult.recommendation}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Discount Simulation */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Target size={15} className="text-royal" />
                <div className="section-title">Discount Simulation</div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="stat-label block mb-1">Discount Percentage</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="5" max="50" step="5" value={simDiscount}
                      onChange={e => setSimDiscount(e.target.value)}
                      className="flex-1 accent-neo" />
                    <span className="text-xl font-bold text-neo-bright w-12 text-right" style={{ fontFamily: 'Bebas Neue' }}>{simDiscount}%</span>
                  </div>
                  <div className="text-xs text-text-dim mt-1">
                    New price: ${(selectedProduct.Price * (1 - simDiscount / 100)).toFixed(2)}
                  </div>
                </div>
                <button onClick={runDiscountSim} className="btn-primary w-full flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                  <Sparkles size={14} /> Simulate Discount
                </button>

                {productResult?.label && (
                  <div className="p-3 rounded-xl space-y-2" style={{
                    background: productResult.positive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${productResult.positive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                  }}>
                    <div className="text-xs font-semibold text-text-bright">At {productResult.label} (${productResult.newPrice}):</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-text-dim">Est. Sales</span>
                        <div className="font-bold text-bloom">{productResult.newSales} (+{productResult.salesChange}%)</div>
                      </div>
                      <div>
                        <span className="text-text-dim">Revenue</span>
                        <div className={`font-bold ${productResult.revenueChange >= 0 ? 'text-bloom' : 'text-danger'}`}>
                          ${productResult.newRevenue.toLocaleString()} ({productResult.revenueChange >= 0 ? '+' : ''}{productResult.revenueChange}%)
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold">{productResult.recommendation}</div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Forecast */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={15} className="text-pulse" />
                <div className="section-title">AI Forecast (30 Days)</div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Predicted Sales', value: '520 units', change: '+16%', positive: true },
                  { label: 'Predicted Revenue', value: '$15,600', change: '+$2,105', positive: true },
                  { label: 'Return Rate Forecast', value: '9.5%', change: '+1.3%', positive: false },
                  { label: 'Optimal Price', value: `$${(selectedProduct.Price * 0.93).toFixed(2)}`, change: 'AI suggested', positive: true },
                  { label: 'Reorder Date', value: '~18 days', change: 'at current rate', positive: null },
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
                ))}
                <div className="pt-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-dim">Confidence Level</span>
                    <span className="text-bloom font-bold">85%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
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
            <div className="flex gap-2 flex-wrap">
              {mockCampaigns.filter(c => c.Status !== 'Draft').map(c => (
                <button key={c.Id} onClick={() => { setSelectedCampaign(c); setAdResult(null) }}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${selectedCampaign.Id === c.Id ? 'bg-neo/20 text-neo-bright border border-neo/30' : 'btn-ghost'}`}>
                  {c.Name}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title mb-3 flex items-center gap-2">
              <Megaphone size={15} className="text-bloom" /> Current Metrics — {selectedCampaign.Name}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Budget', value: `$${selectedCampaign.Budget.toLocaleString()}`, color: '#f8fafc' },
                { label: 'Total Spend', value: `$${selectedCampaign.TotalSpend.toLocaleString()}`, color: '#f87171' },
                { label: 'Revenue', value: `$${selectedCampaign.TotalRevenue.toLocaleString()}`, color: '#34d399' },
                { label: 'ROI', value: `${selectedCampaign.ROI}%`, color: '#818cf8' },
                { label: 'Clicks', value: selectedCampaign.Clicks.toLocaleString(), color: '#22d3ee' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
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

                {adResult && (
                  <div className="p-3 rounded-xl space-y-2" style={{
                    background: adResult.positive ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                    border: `1px solid ${adResult.positive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`
                  }}>
                    <div className="text-xs font-semibold text-text-bright">At ${adResult.newBudget}/day:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-text-dim">Monthly Spend</span>
                        <div className="font-bold text-danger">${adResult.newTotalSpend.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-text-dim">Expected Revenue</span>
                        <div className="font-bold text-bloom">${adResult.newRevenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-text-dim">Projected ROI</span>
                        <div className={`font-bold ${adResult.newROI > 100 ? 'text-bloom' : adResult.newROI > 0 ? 'text-ember' : 'text-danger'}`}>
                          {adResult.newROI}% ({adResult.roiChange >= 0 ? '+' : ''}{adResult.roiChange}%)
                        </div>
                      </div>
                      <div>
                        <span className="text-text-dim">Projected ROAS</span>
                        <div className="font-bold text-neo-bright">{adResult.roas}x</div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold">{adResult.recommendation}</div>
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
                {[
                  { label: 'Optimal Daily Budget', value: '$175', confidence: 89, icon: Target, color: '#818cf8' },
                  { label: 'Expected ROI at optimal', value: '310%', confidence: 84, icon: TrendingUp, color: '#34d399' },
                  { label: 'Best Performing Platform', value: 'Google', confidence: 76, icon: Megaphone, color: '#22d3ee' },
                  { label: 'Next 30 Day Revenue', value: '$21,000', confidence: 78, icon: ChevronRight, color: '#fbbf24' },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
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
                ))}

                <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={13} className="text-neo-bright" />
                    <span className="text-xs font-semibold text-neo-bright">Platform Allocation</span>
                  </div>
                  <div className="space-y-1.5">
                    {[{ name: 'Google', pct: 45, color: '#ef4444' }, { name: 'Facebook', pct: 35, color: '#818cf8' }, { name: 'Instagram', pct: 20, color: '#ec4899' }].map(p => (
                      <div key={p.name}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-text-dim">{p.name}</span>
                          <span style={{ color: p.color }}>{p.pct}%</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
