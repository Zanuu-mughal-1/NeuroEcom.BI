import React from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--glass-bg-bright)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
      <div className="text-text-dim mb-1">{label}</div>
    <div className="px-3 py-2 rounded-xl text-[10px] glass shadow-xl border border-white/10" style={{ background: 'rgba(15, 15, 26, 0.9)', backdropFilter: 'blur(12px)' }}>
      <div className="text-text-dim mb-1 font-bold uppercase tracking-wider">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-bold text-sm text-text-bright">
          {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
        </div>
      ))}
    </div>
  )
}

export function SalesAreaChart({ data, color = '#6366f1', dataKey = 'Revenue', prefix = '$' }) {
  // Ensure data exists and keys match (fallback to lowercase if needed)
  const chartData = data?.map(item => ({
    ...item,
    Date: item.Date || item.date,
    Value: item[dataKey] || item[dataKey.toLowerCase()] || 0
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip prefix={prefix} />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
          fill={`url(#grad-${color.replace('#', '')})`} dot={false} activeDot={{ r: 4, fill: color }} />
      </AreaChart>
    </ResponsiveContainer>
    <div style={{ width: '100%', height: '100%', minHeight: '150px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="Date" 
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} 
            axisLine={false} 
            tickLine={false}
            minTickGap={30}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} 
            axisLine={false} 
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip prefix={prefix} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
          <Area 
            type="monotone" 
            dataKey="Value" 
            stroke={color} 
            strokeWidth={3}
            fill={`url(#grad-${color.replace('#', '')})`} 
            dot={false} 
            activeDot={{ r: 6, fill: color, stroke: '#0f0f1a', strokeWidth: 3 }} 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MultiLineChart({ data, lines }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="Date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
          {lines.map(line => (
            <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color}
              strokeWidth={3} dot={false} activeDot={{ r: 6, stroke: '#0f0f1a', strokeWidth: 3 }} name={line.label} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SimpleBarChart({ data, dataKey = 'Value', color = '#6366f1', prefix = '' }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '150px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="Name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltip prefix={prefix} />} cursor={{ fill: 'rgba(255,255,255,0.05)', opacity: 0.4 }} />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} animationDuration={1500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

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
        <Legend formatter={(v) => <span style={{ color: 'var(--text-mid)', fontSize: '12px' }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
    <div style={{ width: '100%', height: '100%', minHeight: '180px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            cx="50%" 
            cy="50%" 
            innerRadius="60%" 
            outerRadius="85%"
            dataKey="value" 
            paddingAngle={5}
            animationBegin={0}
            animationDuration={1500}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} stroke="rgba(15, 15, 26, 1)" strokeWidth={3} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
