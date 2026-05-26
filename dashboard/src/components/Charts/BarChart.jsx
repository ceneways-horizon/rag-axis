import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { RECHARTS_COLORS } from '../../utils/constants'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-secondary border border-border-color rounded p-2 text-xs shadow-lg">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.fill || RECHARTS_COLORS.primary }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

const PALETTE = [
  RECHARTS_COLORS.primary,
  RECHARTS_COLORS.success,
  RECHARTS_COLORS.error,
  RECHARTS_COLORS.warning,
  RECHARTS_COLORS.cost,
]

export function BarChart({ data, xKey = 'name', valueKey = 'value', height = 250, colors }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={RECHARTS_COLORS.grid} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: RECHARTS_COLORS.text, fontSize: 11 }}
          axisLine={{ stroke: RECHARTS_COLORS.grid }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: RECHARTS_COLORS.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={valueKey} radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={
                colors
                  ? colors[entry[xKey]] || PALETTE[i % PALETTE.length]
                  : PALETTE[i % PALETTE.length]
              }
            />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  )
}

export default BarChart
