import { useState } from 'react'
import { ArrowLeft, Flag, Gift, Mail, Phone, Lock, Unlock, Star, Users } from 'lucide-react'
import { LoyaltyBadge, FlagBadge } from '../../components/ui/StatusBadge'

export default function CustomerDetail({ customer, onBack }) {
  const [activeAction, setActiveAction] = useState(null)

  const actions = [
    { id: 'GiveDiscount', icon: Gift, label: 'Give Discount', color: 'bloom' },
    { id: 'Flag', icon: Flag, label: 'Flag Customer', color: 'danger' },
    { id: 'ChangeTier', icon: Star, label: 'Change Tier', color: 'ember' },
    { id: 'SendEmail', icon: Mail, label: 'Send Email', color: 'neo' },
    { id: 'LogCall', icon: Phone, label: 'Log Call', color: 'pulse' },
    { id: 'Block', icon: Lock, label: 'Block Customer', color: 'danger' },
    { id: 'Unblock', icon: Unlock, label: 'Unblock', color: 'bloom' },
  ]

  const colorMap = {
    neo: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', text: '#818cf8' },
    bloom: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: '#34d399' },
    danger: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', text: '#f87171' },
    ember: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#fbbf24' },
    pulse: { bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)', text: '#22d3ee' },
  }

  const ltv = customer.TotalSpent
  const nextTierSpend = customer.LoyaltyTier === 'Bronze' ? 500 : customer.LoyaltyTier === 'Silver' ? 2000 : customer.LoyaltyTier === 'Gold' ? 5000 : null
  const tierProgress = nextTierSpend ? Math.min(100, (ltv / nextTierSpend) * 100) : 100

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="btn-ghost flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile */}
        <div className="space-y-4">
          <div className="card text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4"
              style={{ background: `linear-gradient(135deg, hsl(${customer.Id * 47}deg 70% 50%), hsl(${customer.Id * 47 + 40}deg 60% 40%))` }}>
              {customer.FirstName[0]}{customer.LastName[0]}
            </div>
            <h3 className="text-xl font-bold text-text-white">{customer.FirstName} {customer.LastName}</h3>
            <p className="text-sm text-text-dim mt-0.5">{customer.Email}</p>
            <p className="text-sm text-text-dim">{customer.Phone}</p>
            <div className="flex justify-center gap-2 mt-3">
              <LoyaltyBadge tier={customer.LoyaltyTier} />
              {customer.Flags?.length > 0 && <FlagBadge type={customer.Flags[0].FlagType} />}
              {customer.IsBlocked && <span className="badge-danger">Blocked</span>}
            </div>

            {/* Tier progress */}
            {nextTierSpend && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-text-dim mb-1">
                  <span>Progress to next tier</span>
                  <span>${nextTierSpend.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full bg-neo" style={{ width: `${tierProgress}%` }} />
                </div>
                <div className="text-xs text-neo mt-1">{tierProgress.toFixed(0)}% complete</div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="card">
            <div className="section-title mb-4 flex items-center gap-2"><Users size={14} className="text-pulse" /> Summary</div>
            <div className="space-y-3">
              {[
                { label: 'Total Spent', value: `$${customer.TotalSpent.toLocaleString()}`, color: '#34d399' },
                { label: 'Total Orders', value: customer.TotalOrders, color: '#818cf8' },
                { label: 'Loyalty Points', value: customer.LoyaltyPoints.toLocaleString(), color: '#fbbf24' },
                { label: 'City', value: customer.City || '—', color: '#9ca3af' },
                { label: 'Member Since', value: new Date(customer.JoinedDate || Date.now()).toLocaleDateString(), color: '#9ca3af' },
              ].map(m => (
                <div key={m.label} className="flex justify-between text-sm">
                  <span className="text-text-dim">{m.label}</span>
                  <span className="font-semibold" style={{ color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <div className="card">
          <div className="section-title mb-4">Purchase History</div>
          <div className="space-y-2">
            {[
              { id: 'ORD-00234', date: '2024-04-20', amount: 129.98, status: 'Delivered' },
              { id: 'ORD-00220', date: '2024-04-10', amount: 79.99, status: 'Delivered' },
              { id: 'ORD-00198', date: '2024-03-28', amount: 45.99, status: 'Returned' },
              { id: 'ORD-00185', date: '2024-03-15', amount: 299.97, status: 'Delivered' },
              { id: 'ORD-00170', date: '2024-03-01', amount: 55.99, status: 'Delivered' },
            ].map(o => (
              <div key={o.id} className="flex items-center justify-between p-2.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div className="text-xs font-mono text-neo-bright">{o.id}</div>
                  <div className="text-xs text-text-dim">{o.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-text-white">${o.amount}</div>
                  <span className={`text-xs ${o.status === 'Returned' ? 'text-danger' : 'text-bloom'}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <div className="section-title mb-4">Customer Actions</div>
          <div className="space-y-2">
            {actions.map(action => {
              const c = colorMap[action.color]
              const isActive = activeAction === action.id
              return (
                <div key={action.id}>
                  <button onClick={() => setActiveAction(isActive ? null : action.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                    style={{ background: isActive ? c.bg : 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? c.border : 'rgba(255,255,255,0.05)'}` }}>
                    <action.icon size={15} style={{ color: c.text }} />
                    <span className="text-sm font-medium" style={{ color: isActive ? c.text : '#9ca3af' }}>{action.label}</span>
                  </button>
                  {isActive && (
                    <div className="mt-1 p-3 rounded-lg space-y-2" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                      {action.id === 'GiveDiscount' && (
                        <>
                          <input className="input" placeholder="Discount % or $amount" />
                          <input className="input" placeholder="Reason (optional)" />
                        </>
                      )}
                      {action.id === 'Flag' && (
                        <select className="select">
                          <option>HighReturn</option>
                          <option>FraudRisk</option>
                          <option>PaymentIssue</option>
                          <option>Abusive</option>
                        </select>
                      )}
                      {action.id === 'ChangeTier' && (
                        <select className="select">
                          <option>VIP</option>
                          <option>Gold</option>
                          <option>Silver</option>
                          <option>Bronze</option>
                        </select>
                      )}
                      {action.id === 'SendEmail' && (
                        <textarea className="input" rows={3} placeholder="Message..." />
                      )}
                      <button className="btn-primary w-full text-xs">Confirm {action.label}</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
