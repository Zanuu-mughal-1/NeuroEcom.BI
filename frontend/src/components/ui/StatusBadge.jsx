export function HealthBadge({ status }) {
  const map = {
    Healthy: 'badge-bloom', Warning: 'badge-ember',
    Critical: 'badge-danger', Discontinued: 'badge-dim'
  }
  const dots = { Healthy: '🟢', Warning: '🟡', Critical: '🔴', Discontinued: '⚫' }
  return <span className={map[status] || 'badge-dim'}>{dots[status]} {status}</span>
}

export function OrderStatusBadge({ status }) {
  const map = {
    Pending: 'badge-ember', Shipped: 'badge-pulse', Delivered: 'badge-bloom',
    Cancelled: 'badge-danger', Returned: 'badge-royal'
  }
  return <span className={map[status] || 'badge-dim'}>{status}</span>
}

export function LoyaltyBadge({ tier }) {
  const map = {
    VIP: { cls: 'badge-neo', icon: '💎' },
    Gold: { cls: 'badge-ember', icon: '⭐' },
    Silver: { cls: 'badge-dim', icon: '🥈' },
    Bronze: { cls: 'badge-danger', icon: '🥉' },
    New: { cls: 'badge-pulse', icon: '🆕' },
  }
  const t = map[tier] || map.New
  return <span className={t.cls}>{t.icon} {tier}</span>
}

export function RTORiskBadge({ score }) {
  if (score <= 20) return <span className="badge-bloom">🟢 Low ({score})</span>
  if (score <= 50) return <span className="badge-ember">🟡 Medium ({score})</span>
  if (score <= 80) return <span className="badge-danger">🔴 High ({score})</span>
  return <span className="badge-danger" style={{ background: 'rgba(239,68,68,0.3)' }}>🚨 Critical ({score})</span>
}

export function CampaignStatusBadge({ status }) {
  const map = {
    Active: 'badge-bloom', Paused: 'badge-ember',
    Ended: 'badge-dim', Draft: 'badge-pulse'
  }
  return <span className={map[status] || 'badge-dim'}>{status}</span>
}

export function FlagBadge({ type }) {
  const map = {
    HighReturn: { cls: 'badge-danger', label: '🚩 High Return' },
    FraudRisk: { cls: 'badge-danger', label: '🚩 Fraud Risk' },
    PaymentIssue: { cls: 'badge-ember', label: '🚩 Payment Issue' },
    Abusive: { cls: 'badge-danger', label: '🚩 Abusive' },
    VIP: { cls: 'badge-neo', label: '⭐ VIP' },
  }
  const f = map[type] || { cls: 'badge-dim', label: `🚩 ${type}` }
  return <span className={f.cls}>{f.label}</span>
}
