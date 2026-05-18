import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KPICard({ label, value, change, changeLabel, icon: Icon, color = 'neo', prefix = '', suffix = '', subtitle, onClick }) {
  const colorMap = {
    neo: { bg: 'rgba(0,234,255,0.10)', border: 'rgba(34,211,238,0.42)', glow: 'rgba(34,211,238,0.22)', text: '#67f4ff', icon: '#00eaff' },
    pulse: { bg: 'rgba(34,211,238,0.10)', border: 'rgba(34,211,238,0.36)', glow: 'rgba(34,211,238,0.18)', text: '#7dd3fc', icon: '#22d3ee' },
    bloom: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.24)', glow: 'rgba(16,185,129,0.14)', text: '#34d399', icon: '#10b981' },
    ember: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', glow: 'rgba(245,158,11,0.15)', text: '#fbbf24', icon: '#f59e0b' },
    danger: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', glow: 'rgba(239,68,68,0.15)', text: '#f87171', icon: '#ef4444' },
    royal: { bg: 'rgba(56,189,248,0.10)', border: 'rgba(56,189,248,0.34)', glow: 'rgba(56,189,248,0.17)', text: '#93c5fd', icon: '#38bdf8' },
  }
  const c = colorMap[color] || colorMap.neo
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <div className="kpi-card relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${c.bg}, var(--bg-secondary))`, 
        border: `1px solid ${c.border}`, 
        boxShadow: `var(--card-shadow), 0 0 40px ${c.glow}` 
      }}>
      
      {/* Background glow overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.08] dark:opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.icon}, transparent)`, transform: 'translate(40%, -40%)' }} />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${c.bg}`, border: `1px solid ${c.border}` }}>
            <Icon size={18} style={{ color: c.icon }} />
          </div>
        )}
      </div>

      <div className="mb-2">
        <span className="stat-value" style={{ color: 'var(--text-white)' }}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </span>
        {subtitle && <div className="text-xs text-text-dim mt-0.5">{subtitle}</div>}
      </div>

      {change !== undefined && (
        <div className={`flex items-center gap-1.5 text-xs font-medium relative z-10 ${isPositive ? 'text-bloom' : isNegative ? 'text-danger' : 'text-text-dim'}`}>
          {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Minus size={12} />}
          <span>{isPositive ? '+' : ''}{change}%</span>
          {changeLabel && <span className="text-text-dim font-normal">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
