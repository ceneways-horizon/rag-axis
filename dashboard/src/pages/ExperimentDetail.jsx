import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '../components/UI/Card'
import { Badge } from '../components/UI/Badge'
import { Tabs } from '../components/UI/Tabs'
import { Table } from '../components/UI/Table'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { RunDetailPanel, ErrorCard, StatCard } from '../components/Common'
import { LineChart } from '../components/Charts/LineChart'
import { useExperiment, useRuns } from '../hooks'
import { formatDateTime, formatDuration, formatCost, formatPercent, truncate } from '../utils/format'
import { safeJsonStringify } from '../utils/helpers'
import { RECHARTS_COLORS } from '../utils/constants'

const runColumns = [
  { key: 'query_snippet', label: 'Query', render: (v) => <span className="font-mono text-xs">{truncate(v || '', 60)}</span> },
  { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
  { key: 'latency_ms', label: 'Latency', render: (v) => formatDuration(v) },
  { key: 'cost', label: 'Cost', render: (v) => formatCost(v) },
  { key: 'timestamp', label: 'Time', render: (v) => formatDateTime(v) },
]

const TABS = [
  { id: 'runs', label: 'Runs' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'config', label: 'Config' },
]

export function ExperimentDetail() {
  const { expId } = useParams()
  const { experiment, loading: eLoading, error: eError } = useExperiment(expId)
  const { runs, loading: rLoading } = useRuns({ exp_id: expId })
  const [activeTab, setActiveTab] = useState('runs')
  const [selectedRunId, setSelectedRunId] = useState(null)

  if (eLoading) return <LoadingSpinner size="lg" className="mt-16" />
  if (eError) return <ErrorCard error={eError} title="Failed to load experiment" />
  if (!experiment) return null

  const retrieval = experiment.frozen_config?.retrieval || {}
  const synthesis = experiment.frozen_config?.synthesis || {}

  const costTrend = [...runs]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-20)
    .map((r, i) => ({ index: i + 1, cost: Number((r.cost || 0).toFixed(4)), latency: Math.round(r.latency_ms || 0) }))

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Link to="/experiments" className="text-sm text-text-muted hover:text-text-primary">Experiments</Link>
        <span className="text-text-muted">/</span>
        <h1 className="text-xl font-semibold text-text-primary">{experiment.name}</h1>
      </div>
      {experiment.description && <p className="text-sm text-text-secondary mb-4">{experiment.description}</p>}
      <p className="text-xs font-mono text-text-muted mb-6">{experiment.exp_id} · corpus: {experiment.frozen_config?.corpus_id}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Runs" value={experiment.run_count ?? 0} />
        <StatCard label="Success Rate" value={formatPercent(experiment.success_rate)} accent="text-success" />
        <StatCard label="Avg Latency" value={formatDuration(experiment.avg_latency_ms)} />
        <StatCard label="Avg Cost" value={formatCost(experiment.avg_cost)} accent="text-cost" />
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'runs' && (
          <Card>
            <Card.Header>
              <h2 className="text-sm font-semibold text-text-primary">Runs ({runs.length})</h2>
            </Card.Header>
            {rLoading ? (
              <LoadingSpinner size="md" className="py-8" />
            ) : (
              <Table
                columns={runColumns}
                data={runs}
                onRowClick={(row) => setSelectedRunId(row.run_id)}
                emptyMessage="No runs under this experiment yet. Use the Playground to run a query."
              />
            )}
          </Card>
        )}

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <Card.Header><h3 className="text-sm font-medium text-text-primary">Cost Trend</h3></Card.Header>
              <Card.Body>
                {costTrend.length === 0 ? (
                  <p className="text-center text-text-muted text-sm py-8">No runs yet</p>
                ) : (
                  <LineChart data={costTrend} xKey="index" lines={[{ key: 'cost', label: 'Cost ($)', color: RECHARTS_COLORS.cost }]} />
                )}
              </Card.Body>
            </Card>
            <Card>
              <Card.Header><h3 className="text-sm font-medium text-text-primary">Latency Trend</h3></Card.Header>
              <Card.Body>
                {costTrend.length === 0 ? (
                  <p className="text-center text-text-muted text-sm py-8">No runs yet</p>
                ) : (
                  <LineChart data={costTrend} xKey="index" lines={[{ key: 'latency', label: 'Latency (ms)', color: RECHARTS_COLORS.primary }]} />
                )}
              </Card.Body>
            </Card>
          </div>
        )}

        {activeTab === 'config' && (
          <Card>
            <Card.Header><h3 className="text-sm font-medium text-text-primary">Frozen Config</h3></Card.Header>
            <Card.Body className="space-y-4">
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Retrieval</p>
                <pre className="text-xs font-mono text-text-secondary bg-bg-tertiary rounded p-4 overflow-x-auto whitespace-pre-wrap break-words">
                  {safeJsonStringify(retrieval)}
                </pre>
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Synthesis</p>
                <pre className="text-xs font-mono text-text-secondary bg-bg-tertiary rounded p-4 overflow-x-auto whitespace-pre-wrap break-words">
                  {safeJsonStringify(synthesis)}
                </pre>
              </div>
              <p className="text-xs text-text-muted">Config is immutable after creation (ADR-S6). Changing config requires a new experiment.</p>
            </Card.Body>
          </Card>
        )}
      </Tabs>

      <RunDetailPanel
        runId={selectedRunId}
        open={!!selectedRunId}
        onClose={() => setSelectedRunId(null)}
      />
    </div>
  )
}

export default ExperimentDetail
