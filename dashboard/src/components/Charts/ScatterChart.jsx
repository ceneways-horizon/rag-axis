import {
  ScatterChart as ReScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { RECHARTS_COLORS } from '../../utils/constants'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-secondary border border-border-color rounded p-2 text-xs shadow-lg">
      {payload.map((entry, i) => (
        <p key={i} className="text-text-secondary">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export function ScatterChart({ data, xKey = 'x', yKey = 'y', height = 250, color }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={RECHARTS_COLORS.grid} />
        <XAxis
          dataKey={xKey}
          type="number"
          name={xKey}
          tick={{ fill: RECHARTS_COLORS.text, fontSize: 11 }}
          axisLine={{ stroke: RECHARTS_COLORS.grid }}
          tickLine={false}
        />
        <YAxis
          dataKey={yKey}
          type="number"
          name={yKey}
          tick={{ fill: RECHARTS_COLORS.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter data={data} fill={color || RECHARTS_COLORS.primary} />
      </ReScatterChart>
    </ResponsiveContainer>
  )
}

export default ScatterChart
