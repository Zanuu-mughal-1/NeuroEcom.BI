import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl text-[10px] glass shadow-xl">
      <div className="text-text-dim mb-1 font-bold uppercase tracking-wider">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-bold text-sm" style={{ color: p.color }}>
          {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
        </div>
      ))}
    </div>
  )
}

export function SalesAreaChart({ data, color = '#6366f1', dataKey = 'revenue', prefix = '$' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip prefix={prefix} />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5}
          fill={`url(#grad-${color.replace('#', '')})`} dot={false} activeDot={{ r: 5, fill: color, stroke: 'var(--void)', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MultiLineChart({ data, lines }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
        {lines.map(line => (
          <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color}
            strokeWidth={2.5} dot={false} activeDot={{ r: 5, stroke: 'var(--void)', strokeWidth: 2 }} name={line.label} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function SimpleBarChart({ data, dataKey = 'value', color = '#6366f1', prefix = '' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip prefix={prefix} />} cursor={{ fill: 'var(--void)', opacity: 0.4 }} />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

import { PieChart, Pie, Cell, Legend } from 'recharts'
export function DonutChart({ data, colors }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius="60%" outerRadius="85%"
          dataKey="value" paddingAngle={5}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} stroke="var(--surface)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} formatter={(v) => <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
