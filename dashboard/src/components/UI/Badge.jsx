import { STATUS_COLORS } from '../../utils/constants'

const colorClasses = {
  success: 'text-success bg-green-900/20 border border-green-800/30',
  error: 'text-error bg-red-900/20 border border-red-800/30',
  warning: 'text-warning bg-yellow-900/20 border border-yellow-800/30',
  info: 'text-info bg-blue-900/20 border border-blue-800/30',
  muted: 'text-text-muted bg-bg-tertiary border border-border-color',
}

const dotColors = {
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  info: 'bg-info',
  muted: 'bg-text-muted',
}

export function Badge({ status, variant, children }) {
  const colorKey = variant || STATUS_COLORS[status] || 'muted'
  const label = children || status || ''

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses[colorKey]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[colorKey]}`} />
      {label}
    </span>
  )
}

export default Badge
