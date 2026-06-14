import { Link } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Badge } from '../components/UI/Badge'
import { Table } from '../components/UI/Table'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { ErrorCard, StatCard } from '../components/Common'
import { LineChart } from '../components/Charts/LineChart'
import { useOverview, useRuns } from '../hooks'
import { formatNumber, formatCost, formatPercent, formatDuration, formatDateTime, truncate } from '../utils/format'
import { RECHARTS_COLORS } from '../utils/constants'

const runColumns = [
  { key: 'query_snippet', label: 'Query', render: (v) => <span className="font-mono text-xs">{truncate(v || '', 60)}</span> },
  { key: 'exp_id', label: 'Experiment', render: (v) => <span className="font-mono text-xs">{v}</span> },
  { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
  { key: 'latency_ms', label: 'Latency', render: (v) => formatDuration(v) },
  { key: 'cost', label: 'Cost', render: (v) => formatCost(v) },
  { key: 'timestamp', label: 'Time', render: (v) => formatDateTime(v) },
]

export function Overview() {
  const { overview, loading, error } = useOverview()
  const { runs, loading: runsLoading } = useRuns({ limit: 5 })

  if (loading) return <LoadingSpinner size="lg" className="mt-16" />
  if (error) return <ErrorCard error={error} title="Failed to load overview" />
  if (!overview) return null

  const { deployment, stats, activity } = overview

  return (
    <div>
      <Header
        title="Overview"
        subtitle={`rag-axis server v${deployment.server_version} · ${deployment.db_backend} · uptime ${formatDuration(deployment.uptime_seconds * 1000)}`}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Corpora" value={formatNumber(stats.corpora)} />
        <StatCard label="Experiments" value={formatNumber(stats.experiments)} />
        <StatCard label="Total Runs" value={formatNumber(stats.total_runs)} />
        <StatCard label="Avg Cost" value={formatCost(stats.avg_cost)} accent="text-cost" />
        <StatCard label="Success Rate" value={formatPercent(stats.success_rate)} accent="text-success" />
        <StatCard label="Avg Latency" value={formatDuration(stats.avg_latency_ms)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <h2 className="text-sm font-semibold text-text-primary">Activity (runs over time)</h2>
          </Card.Header>
          <Card.Body>
            {activity?.length ? (
              <LineChart
                data={activity}
                xKey="date"
                lines={[{ key: 'runs', label: 'Runs', color: RECHARTS_COLORS.primary }]}
              />
            ) : (
              <p className="text-center text-text-muted text-sm py-8">No activity yet</p>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-sm font-semibold text-text-primary">Deployment</h2>
          </Card.Header>
          <Card.Body className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Server version</span>
              <span className="text-text-primary font-mono">{deployment.server_version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">DB backend</span>
              <span className="text-text-primary font-mono">{deployment.db_backend}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Uptime</span>
              <span className="text-text-primary font-mono">{formatDuration(deployment.uptime_seconds * 1000)}</span>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Recent Runs</h2>
            <Link to="/runs" className="text-xs text-accent hover:underline">View all</Link>
          </div>
        </Card.Header>
        {runsLoading ? (
          <LoadingSpinner size="md" className="py-8" />
        ) : (
          <Table columns={runColumns} data={runs} emptyMessage="No runs yet" />
        )}
      </Card>
    </div>
  )
}

export default Overview
