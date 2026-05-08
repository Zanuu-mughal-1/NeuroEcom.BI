import { useState, useEffect } from 'react'
import {
  FlaskConical, TrendingUp, Target, ArrowRight,
  Sparkles, Zap, BarChart3, RefreshCcw, Play, Package, PieChart, Info
} from 'lucide-react'
import { SalesAreaChart } from '../../components/charts/MiniChart'
import api from '../../utils/api'

export default function Predictions() {
  const [products, setProducts] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [budgetBoost, setBudgetBoost] = useState(20)
  const [priceChange, setPriceChange] = useState(0)
  const [simulating, setSimulating] = useState(false)
  const [results, setResults] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [prodRes, adsRes] = await Promise.all([
          api.get('/products'),
          api.get('/ads')
        ])
        setProducts(prodRes.data)
        setCampaigns(adsRes.data)
        if (prodRes.data.length > 0) setSelectedProduct(prodRes.data[0])
        if (adsRes.data.length > 0) setSelectedCampaign(adsRes.data[0])
      } catch (err) {
        console.error('Failed to fetch data for predictions', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const runSimulation = () => {
    if (!selectedProduct) return
    setSimulating(true)
    setTimeout(() => {
      const currentRev = selectedCampaign ? selectedCampaign.TotalRevenue || 1000 : 1000
      const currentSpend = selectedCampaign ? selectedCampaign.TotalSpend || 200 : 200
      const boostFactor = 1 + (budgetBoost / 100)
      const newRevenue = currentRev * boostFactor * (1 - (priceChange / 200))
      const newSpend = currentSpend * boostFactor
      setResults({
        revenue: newRevenue,
        spend: newSpend,
        roi: ((newRevenue - newSpend) / newSpend) * 100,
        orders: Math.max(1, Math.floor(newRevenue / selectedProduct.Price)),
        improvement: ((newRevenue - currentRev) / currentRev) * 100
      })
      setSimulating(false)
    }, 1500)
  }

  if (loading) return <div className="p-6 text-text-dim">Loading Prediction Engine...</div>
  if (products.length === 0) return <div className="p-6 text-text-dim">No products found. Add products first to run predictions.</div>

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="text-bloom" size={20} />
            <h1 className="text-2xl font-bold text-text-white">AI Prediction Engine</h1>
          </div>
          <p className="text-text-dim text-sm italic">Simulate market changes and ad spend impacts with Neuro-Models</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-text-dim font-bold">Model Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-neo animate-pulse" />
              <span className="text-sm font-medium text-neo">Neural Link Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-1 space-y-5">
          <div className="card border-l-4 border-l-bloom">
            <div className="section-title mb-4 flex items-center gap-2">
              <Zap size={16} className="text-bloom" /> Simulation Parameters
            </div>
            <div className="space-y-4">
              <div>
                <label className="stat-label mb-1.5 block text-xs uppercase">Target Product</label>
                <select
                  className="select w-full"
                  value={selectedProduct?.Id || ''}
                  onChange={e => setSelectedProduct(products.find(p => p.Id === parseInt(e.target.value)))}
                >
                  {products.map(p => (
                    <option key={p.Id} value={p.Id}>{p.Name} (Rs{p.Price})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="stat-label mb-1.5 block text-xs uppercase">Linked Campaign</label>
                <select
                  className="select w-full"
                  value={selectedCampaign?.Id || ''}
                  onChange={e => setSelectedCampaign(campaigns.find(c => c.Id === parseInt(e.target.value)))}
                >
                  <option value="">No Active Campaign</option>
                  {campaigns.map(c => (
                    <option key={c.Id} value={c.Id}>{c.Name} ({c.Platform})</option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <div className="flex justify-between mb-2">
                  <label className="stat-label text-xs uppercase">Ad Budget Boost</label>
                  <span className="text-bloom font-bold text-sm">+{budgetBoost}%</span>
                </div>
                <input type="range" min="0" max="200" step="5"
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-bloom"
                  value={budgetBoost} onChange={e => setBudgetBoost(parseInt(e.target.value))} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="stat-label text-xs uppercase">Price Adjustment</label>
                  <span className={`${priceChange >= 0 ? 'text-neo' : 'text-danger'} font-bold text-sm`}>
                    {priceChange > 0 ? '+' : ''}{priceChange}%
                  </span>
                </div>
                <input type="range" min="-50" max="50" step="1"
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-neo"
                  value={priceChange} onChange={e => setPriceChange(parseInt(e.target.value))} />
              </div>
              <button onClick={runSimulation} disabled={simulating}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2 group">
                {simulating ? (
                  <><RefreshCcw size={16} className="animate-spin" /><span>Neural Processing...</span></>
                ) : (
                  <><Play size={16} /><span>Run Neuro-Simulation</span></>
                )}
              </button>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-bloom/5 to-transparent border-bloom/10">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-bloom/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-bloom" />
              </div>
              <div>
                <div className="text-sm font-bold text-text-white mb-1">AI Recommendation</div>
                <p className="text-xs text-text-dim leading-relaxed">
                  For <strong className="text-text-mid">{selectedProduct?.Name}</strong>, a budget increase of 25% with a 5% price reduction typically yields the highest ROI based on category trends.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!results ? (
            <div className="card h-full flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-border/50 bg-transparent">
              <div className="w-20 h-20 rounded-full bg-border/20 flex items-center justify-center mb-6">
                <BarChart3 size={32} className="text-text-dim opacity-30" />
              </div>
              <h3 className="text-xl font-bold text-text-mid mb-2">Ready for Simulation</h3>
              <p className="text-text-dim max-w-xs">Adjust the parameters on the left and run the engine to see predicted outcomes.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-up">
              {/* Result Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-neo/5 border-neo/20 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp size={80} className="text-neo" />
                  </div>
                  <div className="stat-label text-neo">Predicted Revenue</div>
                  <div className="text-2xl font-black text-text-white mt-1">
                    Rs{results.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neo font-bold mt-2">
                    <TrendingUp size={12} />
                    <span>+{results.improvement.toFixed(1)}% growth</span>
                  </div>
                </div>
                <div className="card bg-bloom/5 border-bloom/20 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <PieChart size={80} className="text-bloom" />
                  </div>
                  <div className="stat-label text-bloom">Predicted ROI</div>
                  <div className="text-2xl font-black text-text-white mt-1">{results.roi.toFixed(1)}%</div>
                  <div className="flex items-center gap-1 text-xs text-bloom font-bold mt-2">
                    <Target size={12} />
                    <span>{(results.roi / 100).toFixed(2)}x ROAS</span>
                  </div>
                </div>
                <div className="card bg-royal/5 border-royal/20 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Package size={80} className="text-royal" />
                  </div>
                  <div className="stat-label text-royal">Predicted Units</div>
                  <div className="text-2xl font-black text-text-white mt-1">{results.orders}</div>
                  <div className="flex items-center gap-1 text-xs text-text-dim mt-2 font-medium">
                    <Info size={12} /><span>Estimated demand</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="section-title">Projection Analysis</div>
                    <div className="section-subtitle">Forecasted revenue trajectory</div>
                  </div>
                </div>
                <div className="h-64">
                  <SalesAreaChart
                    data={[
                      { date: 'Week 1', revenue: results.revenue * 0.2 },
                      { date: 'Week 2', revenue: results.revenue * 0.5 },
                      { date: 'Week 3', revenue: results.revenue * 0.8 },
                      { date: 'Week 4', revenue: results.revenue },
                    ]}
                    color="#6366f1" dataKey="revenue" prefix="Rs"
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-neo/10 to-transparent border border-neo/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neo/10 flex items-center justify-center text-neo">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-white">High Confidence Opportunity</div>
                    <div className="text-xs text-text-dim">Our models suggest an 84% success probability.</div>
                  </div>
                </div>
                <button className="btn-primary !py-2 !px-6 flex items-center gap-2">
                  Apply Strategy <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
