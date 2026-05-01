import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = {
  neo: '#6366f1', pulse: '#06b6d4', bloom: '#10b981',
  ember: '#f59e0b', danger: '#ef4444', royal: '#8b5cf6'
}

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-4 py-3 shadow-panel" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-xs text-text-dim mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-mid capitalize">{p.name}:</span>
          <span className="text-text-white font-semibold">{prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}</span>
        </div>
      ))}
    </div>
  )
}

export function SalesAreaChart({ data, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip prefix="$" />} />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#revenueGrad)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function DualLineChart({ data, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="orders" name="Orders" stroke="#06b6d4" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="returns" name="Returns" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function CategoryBarChart({ data, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={Object.values(COLORS)[i % Object.keys(COLORS).length]} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ data, height = 180, innerRadius = 50, outerRadius = 75 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius}
          dataKey="value" paddingAngle={3}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color || Object.values(COLORS)[i % 6]} opacity={0.85} />
          ))}
        </Pie>
        <Tooltip content={({ active, payload }) => active && payload?.length ? (
          <div className="glass rounded-xl px-3 py-2" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm font-medium" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
            <p className="text-text-white font-bold">{payload[0].value}</p>
          </div>
        ) : null} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function SpendRevenueBarChart({ data, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip prefix="$" />} />
        <Legend wrapperStyle={{ color: '#6b7280', fontSize: 12 }} />
        <Bar dataKey="spend" name="Spend" fill="#ef4444" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
        <Bar dataKey="revenue" name="Revenue" fill="#10b981" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
