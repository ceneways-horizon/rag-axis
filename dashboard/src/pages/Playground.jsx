import { useState, useEffect } from 'react'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { FormInput } from '../components/UI/FormInput'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { ErrorCard, RunResultView } from '../components/Common'
import { useExperiments, useAsync } from '../hooks'
import { usePlaygroundStore } from '../stores/playgroundStore'
import * as api from '../api'
import { truncate, formatDateTime } from '../utils/format'

export function Playground() {
  const { experiments, loading: expLoading } = useExperiments()
  const { loading: running, error, execute } = useAsync()
  const { selectedExpId, setSelectedExpId, history, addResult } = usePlaygroundStore()

  const [query, setQuery] = useState('')
  const [activeResult, setActiveResult] = useState(null)

  useEffect(() => {
    if (!selectedExpId && experiments.length > 0) {
      setSelectedExpId(experiments[0].exp_id)
    }
  }, [experiments, selectedExpId, setSelectedExpId])

  const handleRun = async () => {
    if (!query.trim() || !selectedExpId) return
    try {
      const result = await execute(() => api.runQuery({ exp_id: selectedExpId, query: query.trim() }))
      addResult(result)
      setActiveResult(result)
      setQuery('')
    } catch {
      // error surfaced via useAsync().error and rendered below
    }
  }

  return (
    <div>
      <Header title="Playground" subtitle="Pick an experiment, run a query, inspect the full RunResult" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <Card>
            <Card.Body className="space-y-3">
              <FormInput
                label="Experiment"
                as="select"
                value={selectedExpId || ''}
                onChange={e => setSelectedExpId(e.target.value)}
                disabled={expLoading}
              >
                {experiments.map(exp => (
                  <option key={exp.exp_id} value={exp.exp_id}>{exp.name} ({exp.exp_id})</option>
                ))}
              </FormInput>

              <FormInput
                label="Query"
                as="textarea"
                rows={4}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="What are the key investment risks?"
              />

              <div className="flex justify-end">
                <Button onClick={handleRun} loading={running} disabled={!query.trim() || !selectedExpId}>
                  Run
                </Button>
              </div>
            </Card.Body>
          </Card>

          {error && <ErrorCard error={error} title="Query failed" />}

          {running && (
            <Card><Card.Body><LoadingSpinner size="lg" className="py-10" /></Card.Body></Card>
          )}

          {!running && activeResult && (
            <Card>
              <Card.Header><h2 className="text-sm font-semibold text-text-primary">Result</h2></Card.Header>
              <Card.Body>
                <RunResultView result={activeResult} />
              </Card.Body>
            </Card>
          )}

          {!running && !activeResult && !error && (
            <Card><Card.Body>
              <p className="text-sm text-text-muted text-center py-10">Run a query to see the full RunResult — answer, citations, audit trail, cost, and confidence.</p>
            </Card.Body></Card>
          )}
        </div>

        <Card className="h-fit">
          <Card.Header>
            <h2 className="text-sm font-semibold text-text-primary">Session History</h2>
          </Card.Header>
          <Card.Body className="space-y-2 max-h-[70vh] overflow-y-auto">
            {history.length === 0 && (
              <p className="text-xs text-text-muted">Runs you submit this session appear here.</p>
            )}
            {history.map(result => (
              <button
                key={result.run_id}
                onClick={() => setActiveResult(result)}
                className={`w-full text-left rounded p-2 text-xs transition-colors ${
                  activeResult?.run_id === result.run_id ? 'bg-accent/10 border border-accent/40' : 'bg-bg-tertiary hover:bg-bg-tertiary/70'
                }`}
              >
                <p className="text-text-primary truncate">{truncate(result.query, 50)}</p>
                <p className="text-text-muted mt-0.5">{formatDateTime(result.reproducibility?.run_timestamp)}</p>
              </button>
            ))}
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Playground
