export function ProgressBar({ value = 0, max = 100, className = '', color = 'accent' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  const colorClass = {
    accent: 'bg-accent',
    info: 'bg-info',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  }[color] || 'bg-accent'

  return (
    <div className={`w-full bg-bg-tertiary rounded-full h-1.5 ${className}`}>
      <div
        className={`h-1.5 rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default ProgressBar
