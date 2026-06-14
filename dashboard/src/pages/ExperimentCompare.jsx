import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { ErrorCard } from '../components/Common'
import { ScatterChart } from '../components/Charts/ScatterChart'
import { useExperiments, useFetch } from '../hooks'
import * as api from '../api'
import { formatPercent, formatCost, formatDuration } from '../utils/format'

const METRIC_LABELS = {
  runs: 'Runs',
  success_rate: 'Success Rate',
  avg_latency: 'Avg Latency',
  p95_latency: 'P95 Latency',
  avg_cost: 'Avg Cost',
  retrieval_quality: 'Retrieval Quality',
  confidence: 'Confidence',
  truncation_rate: 'Truncation Rate',
}

function formatMetric(metric, value) {
  if (value == null) return '—'
  switch (metric) {
    case 'success_rate':
    case 'retrieval_quality':
    case 'confidence':
    case 'truncation_rate':
      return formatPercent(value)
    case 'avg_cost':
      return formatCost(value)
    case 'avg_latency':
    case 'p95_latency':
      return formatDuration(value)
    default:
      return value
  }
}

export function ExperimentCompare() {
  const [params, setParams] = useSearchParams()
  const ids = useMemo(() => (params.get('ids') || '').split(',').filter(Boolean), [params])
  const { experiments: allExperiments, loading: listLoading } = useExperiments()
  const [selected, setSelected] = useState(new Set(ids))

  const { data, loading, error } = useFetch(
    () => (ids.length ? api.compareExperiments(ids) : Promise.resolve(null)),
    [ids.join(',')]
  )

  const toggle = (expId) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(expId)) next.delete(expId)
      else next.add(expId)
      return next
    })
  }

  const applySelection = () => {
    setParams({ ids: Array.from(selected).join(',') })
  }

  return (
    <div>
      <Header
        title="Compare Experiments"
        subtitle="Side-by-side metrics for experiments with frozen configs"
        actions={<Link to="/experiments" className="text-sm text-accent hover:underline self-center">Back to experiments</Link>}
      />

      <Card className="mb-6">
        <Card.Header><h2 className="text-sm font-semibold text-text-primary">Select experiments</h2></Card.Header>
        <Card.Body>
          {listLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="space-y-2 mb-4">
              {allExperiments.map(exp => (
                <label key={exp.exp_id} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(exp.exp_id)}
                    onChange={() => toggle(exp.exp_id)}
                    className="accent-accent"
                  />
                  {exp.name}
                  <span className="text-xs font-mono text-text-muted">{exp.exp_id}</span>
                </label>
              ))}
            </div>
          )}
          <Button onClick={applySelection} disabled={selected.size === 0}>Compare</Button>
        </Card.Body>
      </Card>

      {loading && <LoadingSpinner size="lg" className="mt-8" />}
      {error && <ErrorCard error={error} title="Failed to compare experiments" />}

      {!loading && !error && data && data.experiments.length > 0 && (
        <>
          <Card className="mb-6">
            <Card.Header><h2 className="text-sm font-semibold text-text-primary">Metrics</h2></Card.Header>
            <Card.Body className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-color">
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Metric</th>
                    {data.experiments.map(exp => (
                      <th key={exp.exp_id} className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{exp.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.metrics.map(metric => (
                    <tr key={metric} className="border-b border-border-color/50">
                      <td className="px-3 py-2 text-text-secondary">{METRIC_LABELS[metric] || metric}</td>
                      {data.experiments.map(exp => (
                        <td key={exp.exp_id} className="px-3 py-2 text-text-primary font-medium">{formatMetric(metric, exp[metric])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header><h2 className="text-sm font-semibold text-text-primary">Cost vs Latency</h2></Card.Header>
            <Card.Body>
              <ScatterChart
                data={data.experiments.map(exp => ({ x: exp.avg_cost, y: exp.avg_latency, name: exp.name }))}
                xKey="x"
                yKey="y"
              />
            </Card.Body>
          </Card>
        </>
      )}

      {!loading && !error && ids.length === 0 && (
        <p className="text-sm text-text-muted">Select two or more experiments above and click Compare.</p>
      )}
    </div>
  )
}

export default ExperimentCompare
