import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Badge } from '../components/UI/Badge'
import { Tabs } from '../components/UI/Tabs'
import { Table } from '../components/UI/Table'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { RunDetailPanel } from '../components/Common/RunDetailPanel'
import { LineChart } from '../components/Charts/LineChart'
import { BarChart } from '../components/Charts/BarChart'
import { useToast } from '../components/UI/Toast'
import { useExperiment, useRunExperiment } from '../hooks/useExperiments'
import { useRuns } from '../hooks/useRuns'
import { useMetrics } from '../hooks/useMetrics'
import { formatDateTime, formatDuration, formatCost, formatPercent, truncate } from '../utils/format'
import { safeJsonStringify } from '../utils/helpers'
import { RECHARTS_COLORS } from '../utils/constants'

const runColumns = [
  { key: 'query', label: 'Query', render: (v) => <span className="font-mono text-xs">{truncate(v || '', 60)}</span> },
  { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
  { key: 'execution_time_ms', label: 'Duration', render: (v) => formatDuration(v) },
  { key: 'estimated_cost', label: 'Cost', render: (v) => formatCost(v) },
  { key: 'created_at', label: 'Date', render: (v) => formatDateTime(v) },
]

const TABS = [
  { id: 'runs', label: 'Runs' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'config', label: 'Config' },
]

export function ExperimentDetail() {
  const { projectId, experimentId } = useParams()
  const { experiment, loading: eLoading } = useExperiment(projectId, experimentId)
  const { runs, loading: rLoading, refetch: refetchRuns } = useRuns(projectId, experimentId)
  const { metrics, loading: mLoading } = useMetrics(projectId, experimentId)
  const { run, loading: running } = useRunExperiment(projectId, experimentId)
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('runs')
  const [selectedRun, setSelectedRun] = useState(null)
  const [query, setQuery] = useState('')

  const handleRunQuery = async () => {
    if (!query.trim()) return
    try {
      const result = await run({ query: query.trim() })
      toast.success('Query executed')
      setQuery('')
      refetchRuns()
      setSelectedRun(result)
      setActiveTab('runs')
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (eLoading) return <LoadingSpinner size="lg" className="mt-16" />
  if (!experiment) return null

  const statusCounts = runs.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const barData = Object.entries(statusCounts).map(([status, count]) => ({ name: status, value: count }))
  const statusColors = {
    success: RECHARTS_COLORS.success,
    error: RECHARTS_COLORS.error,
    running: RECHARTS_COLORS.primary,
    pending: RECHARTS_COLORS.text,
  }

  const lineData = [...runs]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-20)
    .map((r, i) => ({
      index: i + 1,
      cost: r.estimated_cost ? Number(r.estimated_cost.toFixed(4)) : 0,
      duration: r.execution_time_ms ? Math.round(r.execution_time_ms) : 0,
    }))

  const successRuns = runs.filter(r => r.status === 'success')
  const successRate = runs.length ? successRuns.length / runs.length : 0
  const avgDuration = runs.length
    ? runs.reduce((acc, r) => acc + (r.execution_time_ms || 0), 0) / runs.length
    : 0
  const avgCost = runs.length
    ? runs.reduce((acc, r) => acc + (r.estimated_cost || 0), 0) / runs.length
    : 0

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold text-text-primary">{experiment.name}</h1>
            <Badge status={experiment.status}>{experiment.status || 'draft'}</Badge>
          </div>
          {experiment.description && (
            <p className="text-sm text-text-secondary">{experiment.description}</p>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <Card.Body>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRunQuery()}
              placeholder="Enter a query to run..."
              className="flex-1 bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
            <Button onClick={handleRunQuery} loading={running} disabled={!query.trim()}>
              Run Query
            </Button>
          </div>
        </Card.Body>
      </Card>

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
                onRowClick={(row) => setSelectedRun(row)}
                emptyMessage="No runs yet. Submit a query above to get started."
              />
            )}
          </Card>
        )}

        {activeTab === 'metrics' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card><Card.Body>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Total Runs</p>
                <p className="text-2xl font-semibold text-text-primary">{runs.length}</p>
              </Card.Body></Card>
              <Card><Card.Body>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Success Rate</p>
                <p className="text-2xl font-semibold text-success">{formatPercent(successRate)}</p>
              </Card.Body></Card>
              <Card><Card.Body>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Avg Duration</p>
                <p className="text-2xl font-semibold text-text-primary">{formatDuration(avgDuration)}</p>
              </Card.Body></Card>
              <Card><Card.Body>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Avg Cost</p>
                <p className="text-2xl font-semibold text-cost">{formatCost(avgCost)}</p>
              </Card.Body></Card>
            </div>

            {mLoading ? (
              <LoadingSpinner size="md" className="py-8" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <Card.Header><h3 className="text-sm font-medium text-text-primary">Cost Trend</h3></Card.Header>
                  <Card.Body>
                    {lineData.length === 0 ? (
                      <p className="text-center text-text-muted text-sm py-8">No data yet</p>
                    ) : (
                      <LineChart
                        data={lineData}
                        xKey="index"
                        lines={[{ key: 'cost', label: 'Cost ($)', color: RECHARTS_COLORS.cost }]}
                      />
                    )}
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Header><h3 className="text-sm font-medium text-text-primary">Status Distribution</h3></Card.Header>
                  <Card.Body>
                    {barData.length === 0 ? (
                      <p className="text-center text-text-muted text-sm py-8">No data yet</p>
                    ) : (
                      <BarChart data={barData} xKey="name" valueKey="value" colors={statusColors} />
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <Card>
            <Card.Header><h3 className="text-sm font-medium text-text-primary">Experiment Config</h3></Card.Header>
            <Card.Body>
              <pre className="text-xs font-mono text-text-secondary bg-bg-tertiary rounded p-4 overflow-x-auto whitespace-pre-wrap break-words">
                {safeJsonStringify(experiment.config || {})}
              </pre>
            </Card.Body>
          </Card>
        )}
      </Tabs>

      <RunDetailPanel
        run={selectedRun}
        open={!!selectedRun}
        onClose={() => setSelectedRun(null)}
      />
    </div>
  )
}

export default ExperimentDetail
