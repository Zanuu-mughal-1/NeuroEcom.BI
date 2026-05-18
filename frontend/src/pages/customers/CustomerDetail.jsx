import { useEffect, useState } from 'react'
import { ArrowLeft, Flag, Gift, Mail, Phone, Lock, Unlock, Star, Users, RefreshCw, ShoppingBag } from 'lucide-react'
import { LoyaltyBadge, FlagBadge } from '../../components/ui/StatusBadge'
import { customerApi } from '../../utils/api'

export default function CustomerDetail({ customer, onBack, onUpdate }) {
  const [activeAction, setActiveAction] = useState(null)
  const [localCustomer, setlocalCustomer] = useState(customer)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [discountValue, setDiscountValue] = useState('')
  const [discountReason, setDiscountReason] = useState('')
  const [selectedFlag, setSelectedFlag] = useState('HighReturn')
  const [selectedTier, setSelectedTier] = useState(customer.LoyaltyTier)
  const [emailMessage, setEmailMessage] = useState('')
  const [callNote, setCallNote] = useState('')

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
    neo: { bg: 'rgba(0,234,255,0.1)', border: 'rgba(0,234,255,0.2)', text: '#67f4ff' },
    bloom: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: '#34d399' },
    danger: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', text: '#f87171' },
    ember: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#fbbf24' },
    pulse: { bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)', text: '#22d3ee' },
  }

  useEffect(() => {
    let isMounted = true

    const fetchCustomerDetails = async () => {
      if (!customer?.Id) return

      setLoadingDetails(true)
      try {
        const res = await customerApi.getById(customer.Id)
        if (isMounted && res.data) {
          setlocalCustomer(prev => ({ ...prev, ...res.data }))
        }
      } catch (err) {
        console.warn('Failed to load customer purchase history', err)
      } finally {
        if (isMounted) setLoadingDetails(false)
      }
    }

    fetchCustomerDetails()
    return () => { isMounted = false }
  }, [customer?.Id])

  const totalSpent = Number(localCustomer.TotalSpent ?? 0)
  const totalOrders = Number(localCustomer.TotalOrders ?? 0)
  const loyaltyPoints = Number(localCustomer.LoyaltyPoints ?? 0)
  const customerIdSeed = Number(localCustomer.Id ?? 1)
  const firstInitial = localCustomer.FirstName?.[0] ?? '?'
  const lastInitial = localCustomer.LastName?.[0] ?? ''
  const ltv = totalSpent
  const nextTierSpend = localCustomer.LoyaltyTier === 'Bronze' ? 500 : localCustomer.LoyaltyTier === 'Silver' ? 2000 : localCustomer.LoyaltyTier === 'Gold' ? 5000 : null
  const tierProgress = nextTierSpend ? Math.min(100, (ltv / nextTierSpend) * 100) : 100
  const recentOrders = Array.isArray(localCustomer.RecentOrders) ? localCustomer.RecentOrders : []

  const handleConfirm = async (actionId) => {
    let updated = { ...localCustomer }

    // Prepare API data
    let actionData = { Action: actionId }
    if (actionId === 'Block') actionData.Reason = 'Administrative block'
    if (actionId === 'Flag') actionData.FlagType = selectedFlag
    if (actionId === 'GiveDiscount') {
      actionData.DiscountValue = parseFloat(discountValue)
      actionData.DiscountType = 'Percentage'
      actionData.Reason = discountReason
    }
    if (actionId === 'ChangeTier') actionData.Tier = selectedTier

    try {
      // 1. Try to update Database
      await customerApi.takeAction(localCustomer.Id, actionData)

      // 2. If success, refresh local state from DB (or just update locally)
      if (actionId === 'Block') updated.IsBlocked = true
      else if (actionId === 'Unblock') updated.IsBlocked = false
      else if (actionId === 'Flag') updated.Flags = [{ FlagType: selectedFlag }]
      else if (actionId === 'ChangeTier') updated.LoyaltyTier = selectedTier

      alert(`${actionId} updated in Database successfully`)
    } catch (err) {
      // 3. Fallback: Update only local state if backend is down
      if (actionId === 'Block') updated.IsBlocked = true
      else if (actionId === 'Unblock') updated.IsBlocked = false
      else if (actionId === 'Flag') updated.Flags = [{ FlagType: selectedFlag }]
      else if (actionId === 'ChangeTier') updated.LoyaltyTier = selectedTier

      console.warn('Backend not reachable, updated locally only.')
      alert(`${actionId} updated locally (Backend Offline)`)
    }

    setlocalCustomer(updated)
    onUpdate(updated)
    setActiveAction(null)
  }

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
              style={{ background: `linear-gradient(135deg, hsl(${customerIdSeed * 47}deg 70% 50%), hsl(${customerIdSeed * 47 + 40}deg 60% 40%))` }}>
              {firstInitial}{lastInitial}
            </div>
            <h3 className="text-xl font-bold text-text-white">{localCustomer.FirstName} {localCustomer.LastName}</h3>
            <p className="text-sm text-text-dim mt-0.5">{localCustomer.Email}</p>
            <p className="text-sm text-text-dim">{localCustomer.Phone}</p>
            <div className="flex justify-center gap-2 mt-3">
              <LoyaltyBadge tier={localCustomer.LoyaltyTier} />
              {localCustomer.Flags?.length > 0 && <FlagBadge type={localCustomer.Flags[0].FlagType} />}
              {localCustomer.IsBlocked && <span className="badge-danger">Blocked</span>}
            </div>

            {/* Tier progress */}

            {nextTierSpend && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-text-dim mb-1">
                  <span>Progress to next tier</span>
                  <span>${nextTierSpend.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-abyss">
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
                { label: 'Total Spent', value: `Rs ${totalSpent.toLocaleString()}`, color: '#34d399' },
                { label: 'Total Orders', value: totalOrders.toLocaleString(), color: '#67f4ff' },
                { label: 'Loyalty Points', value: loyaltyPoints.toLocaleString(), color: '#fbbf24' },
                { label: 'City', value: localCustomer.City || '—', color: '#9ca3af' },
                { label: 'Member Since', value: new Date(localCustomer.JoinedDate || Date.now()).toLocaleDateString(), color: '#9ca3af' },
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
          <div className="section-title mb-4 flex items-center gap-2">
            Purchase History
            {loadingDetails && <RefreshCw size={13} className="animate-spin text-neo" />}
          </div>
          <div className="space-y-2">
            {recentOrders.map(o => (
              <div key={o.Id} className="flex items-center justify-between p-2.5 rounded-lg bg-abyss border border-border">
                <div>
                  <div className="text-xs font-mono text-neo-bright">{o.OrderNumber}</div>
                  <div className="text-xs text-text-dim">{new Date(o.OrderDate || Date.now()).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-text-white">Rs {Number(o.TotalAmount ?? 0).toLocaleString()}</div>
                  <span className={`text-xs ${o.FulfillmentStatus === 'Cancelled' ? 'text-danger' : 'text-bloom'}`}>{o.FulfillmentStatus || 'Pending'}</span>
                </div>
              </div>
            ))}
            {!loadingDetails && recentOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl bg-abyss border border-border">
                <ShoppingBag size={26} className="text-text-dim mb-3" />
                <div className="text-sm font-semibold text-text-bright">No purchase history yet</div>
                <div className="text-xs text-text-dim mt-1">Orders from the ecommerce website will appear here after checkout.</div>
              </div>
            )}
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
                    style={{ background: isActive ? c.bg : 'var(--abyss)', border: `1px solid ${isActive ? c.border : 'var(--border)'}` }}>
                    <action.icon size={15} style={{ color: c.text }} />
                    <span className="text-sm font-medium" style={{ color: isActive ? c.text : 'var(--text-mid)' }}>{action.label}</span>
                  </button>
                  {isActive && (
                    <div className="mt-1 p-3 rounded-lg space-y-2" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                      {action.id === 'GiveDiscount' && (
                        <>
                          <input className="input" placeholder="Discount % or $amount"
                            value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
                          <input className="input" placeholder="Reason (optional)"
                            value={discountReason} onChange={e => setDiscountReason(e.target.value)} />
                        </>
                      )}
                      {action.id === 'Flag' && (
                        <select className="select" value={selectedFlag} onChange={e => setSelectedFlag(e.target.value)}>
                          <option>HighReturn</option>
                          <option>FraudRisk</option>
                          <option>PaymentIssue</option>
                          <option>Abusive</option>
                        </select>
                      )}
                      {action.id === 'ChangeTier' && (
                        <select className="select" value={selectedTier} onChange={e => setSelectedTier(e.target.value)}>
                          <option>VIP</option>
                          <option>Gold</option>
                          <option>Silver</option>
                          <option>Bronze</option>
                        </select>
                      )}
                      {action.id === 'SendEmail' && (
                        <textarea className="input" rows={3} placeholder="Message..."
                          value={emailMessage} onChange={e => setEmailMessage(e.target.value)} />
                      )}
                      {action.id === 'LogCall' && (
                        <input className="input" placeholder="Call notes..."
                          value={callNote} onChange={e => setCallNote(e.target.value)} />
                      )}
                      <button className="btn-primary w-full text-xs"
                        onClick={() => handleConfirm(action.id)}>
                        Confirm {action.label}
                      </button>
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

