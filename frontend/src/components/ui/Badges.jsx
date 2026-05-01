export function HealthBadge({ status }) {
  const map = {
    Healthy: { cls: 'badge-bloom', dot: '#10b981', label: '● Healthy' },
    Warning: { cls: 'badge-ember', dot: '#f59e0b', label: '● Warning' },
    Critical: { cls: 'badge-danger', dot: '#ef4444', label: '● Critical' },
    Discontinued: { cls: 'badge-dim', dot: '#6b7280', label: '● Discontinued' },
  }
  const s = map[status] || map.Discontinued
  return <span className={s.cls + ' badge'}>{s.label}</span>
}

export function StatusBadge({ status }) {
  const map = {
    Active: 'badge-bloom', Paused: 'badge-ember', Draft: 'badge-pulse',
    Ended: 'badge-dim', Pending: 'badge-ember', Shipped: 'badge-neo',
    Delivered: 'badge-bloom', Cancelled: 'badge-danger', Returned: 'badge-royal',
    Approved: 'badge-bloom', Rejected: 'badge-danger', Refunded: 'badge-pulse',
    Confirmed: 'badge-bloom', Failed: 'badge-danger',
    'Auto-Approved': 'badge-bloom', 'Manual Review': 'badge-ember',
    'Auto-Rejected': 'badge-danger', 'Additional Verification': 'badge-royal',
  }
  return <span className={`${map[status] || 'badge-dim'} badge`}>{status}</span>
}

export function LoyaltyBadge({ tier }) {
  const map = {
    VIP: { cls: 'badge-royal', icon: '💎' },
    Gold: { cls: 'badge-ember', icon: '⭐' },
    Silver: { cls: 'badge-pulse', icon: '🥈' },
    Bronze: { cls: 'badge-neo', icon: '🥉' },
    New: { cls: 'badge-dim', icon: '🆕' },
  }
  const t = map[tier] || map.New
  return <span className={`${t.cls} badge gap-1`}>{t.icon} {tier}</span>
}

export function FlagBadge({ flagType }) {
  const map = {
    HighReturn: 'badge-danger',
    FraudRisk: 'badge-danger',
    PaymentIssue: 'badge-ember',
    Abusive: 'badge-danger',
    VIP: 'badge-royal',
  }
  return <span className={`${map[flagType] || 'badge-dim'} badge`}>🚩 {flagType}</span>
}

export function RTORiskBadge({ score }) {
  if (score <= 20) return <span className="badge badge-bloom">🟢 Low ({score})</span>
  if (score <= 50) return <span className="badge badge-ember">🟡 Medium ({score})</span>
  if (score <= 80) return <span className="badge" style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}>🟠 High ({score})</span>
  return <span className="badge badge-danger">🔴 Critical ({score})</span>
}

export function PlatformBadge({ platform }) {
  const map = {
    Facebook: { bg: 'rgba(24,119,242,0.15)', color: '#1877F2', border: 'rgba(24,119,242,0.3)', icon: 'f' },
    Google: { bg: 'rgba(234,67,53,0.15)', color: '#EA4335', border: 'rgba(234,67,53,0.3)', icon: 'G' },
    Instagram: { bg: 'rgba(225,48,108,0.15)', color: '#E1306C', border: 'rgba(225,48,108,0.3)', icon: '◎' },
    TikTok: { bg: 'rgba(0,0,0,0.3)', color: '#69C9D0', border: 'rgba(105,201,208,0.3)', icon: '♪' },
  }
  const p = map[platform] || { bg: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: 'rgba(255,255,255,0.1)', icon: '?' }
  return (
    <span className="badge" style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
      {platform}
    </span>
  )
}
