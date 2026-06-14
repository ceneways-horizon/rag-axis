import { Card } from '../UI/Card'

export function StatCard({ label, value, accent = 'text-text-primary' }) {
  return (
    <Card>
      <Card.Body>
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-semibold ${accent}`}>{value}</p>
      </Card.Body>
    </Card>
  )
}

export default StatCard
