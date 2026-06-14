import { useState } from 'react'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Badge } from '../components/UI/Badge'
import { Table } from '../components/UI/Table'
import { FormInput } from '../components/UI/FormInput'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { RunDetailPanel, ErrorCard } from '../components/Common'
import { useRuns, useExperiments } from '../hooks'
import { formatDateTime, formatDuration, formatCost, truncate } from '../utils/format'

const STATUSES = ['', 'success', 'degraded', 'failed']

const runColumns = [
  { key: 'query_snippet', label: 'Query', render: (v) => <span className="font-mono text-xs">{truncate(v || '', 70)}</span> },
  { key: 'exp_id', label: 'Experiment', render: (v) => <span className="font-mono text-xs">{v}</span> },
  { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
  { key: 'latency_ms', label: 'Latency', render: (v) => formatDuration(v) },
  { key: 'cost', label: 'Cost', render: (v) => formatCost(v) },
  { key: 'timestamp', label: 'Time', render: (v) => formatDateTime(v) },
]

export function Runs() {
  const { experiments } = useExperiments()
  const [expFilter, setExpFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRunId, setSelectedRunId] = useState(null)

  const filters = {}
  if (expFilter) filters.exp_id = expFilter
  if (statusFilter) filters.status = statusFilter

  const { runs, total, loading, error } = useRuns(filters)

  return (
    <div>
      <Header title="Runs" subtitle={`${total} run(s) across all experiments`} />

      <Card className="mb-6">
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput label="Experiment" as="select" value={expFilter} onChange={e => setExpFilter(e.target.value)}>
              <option value="">All experiments</option>
              {experiments.map(exp => <option key={exp.exp_id} value={exp.exp_id}>{exp.name}</option>)}
            </FormInput>
            <FormInput label="Status" as="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
            </FormInput>
          </div>
        </Card.Body>
      </Card>

      {error && <ErrorCard error={error} title="Failed to load runs" />}

      <Card>
        {loading ? (
          <LoadingSpinner size="lg" className="py-16" />
        ) : (
          <Table
            columns={runColumns}
            data={runs}
            onRowClick={(row) => setSelectedRunId(row.run_id)}
            emptyMessage="No runs match these filters"
          />
        )}
      </Card>

      <RunDetailPanel
        runId={selectedRunId}
        open={!!selectedRunId}
        onClose={() => setSelectedRunId(null)}
      />
    </div>
  )
}

export default Runs
