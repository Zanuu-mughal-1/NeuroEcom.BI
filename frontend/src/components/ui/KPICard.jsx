import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KPICard({ label, value, change, changeLabel, icon: Icon, color = 'neo', prefix = '', suffix = '', subtitle }) {
  const colorMap = {
    neo: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', glow: 'rgba(99,102,241,0.15)', text: '#818cf8', icon: '#6366f1' },
    pulse: { bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)', glow: 'rgba(6,182,212,0.15)', text: '#22d3ee', icon: '#06b6d4' },
    bloom: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', glow: 'rgba(16,185,129,0.15)', text: '#34d399', icon: '#10b981' },
    ember: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', glow: 'rgba(245,158,11,0.15)', text: '#fbbf24', icon: '#f59e0b' },
    danger: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', glow: 'rgba(239,68,68,0.15)', text: '#f87171', icon: '#ef4444' },
    royal: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', glow: 'rgba(139,92,246,0.15)', text: '#a78bfa', icon: '#8b5cf6' },
  }
  const c = colorMap[color] || colorMap.neo
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <div className="kpi-card relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${c.bg}, rgba(20,20,32,0.6))`, border: `1px solid ${c.border}`, boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 40px ${c.glow}` }}>
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.icon}, transparent)`, transform: 'translate(40%, -40%)' }} />

      <div className="flex items-start justify-between mb-3">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${c.bg}`, border: `1px solid ${c.border}` }}>
            <Icon size={18} style={{ color: c.icon }} />
          </div>
        )}
      </div>

      <div className="mb-2">
        <span className="stat-value" style={{ color: '#f8fafc' }}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </span>
        {subtitle && <div className="text-xs text-text-dim mt-0.5">{subtitle}</div>}
      </div>

      {change !== undefined && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isPositive ? 'text-bloom' : isNegative ? 'text-danger' : 'text-text-dim'}`}>
          {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Minus size={12} />}
          <span>{isPositive ? '+' : ''}{change}%</span>
          {changeLabel && <span className="text-text-dim font-normal">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
