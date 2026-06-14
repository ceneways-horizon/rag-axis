import { useState } from 'react'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Badge } from '../components/UI/Badge'
import { Button } from '../components/UI/Button'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { useToast } from '../components/UI/Toast'
import { ErrorCard } from '../components/Common'
import { useHealth, useConfig } from '../hooks'
import * as api from '../api'
import { formatNumber, formatDuration, formatDateTime } from '../utils/format'
import { safeJsonStringify } from '../utils/helpers'

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-border-color/50 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm text-text-primary font-medium">{value ?? '—'}</span>
    </div>
  )
}

function AdapterRow({ name, adapter, onTest, testing }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-color/50 last:border-0">
      <div>
        <p className="text-sm text-text-primary font-medium capitalize">{name.replace(/_/g, ' ')}</p>
        <p className="text-xs font-mono text-text-muted">{adapter.name}</p>
        <p className="text-xs text-text-muted mt-0.5">Last tested: {formatDateTime(adapter.last_tested)}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge status={adapter.status}>{adapter.status}</Badge>
        <Button size="sm" variant="secondary" onClick={() => onTest(name)} loading={testing}>Test</Button>
      </div>
    </div>
  )
}

export function Health() {
  const { health, loading, error, refetch } = useHealth()
  const { config, loading: configLoading, error: configError } = useConfig()
  const toast = useToast()
  const [testing, setTesting] = useState(null)
  const [testError, setTestError] = useState(null)

  const handleTest = async (name) => {
    setTesting(name)
    setTestError(null)
    try {
      const result = await api.testAdapter(name)
      toast.success(`${name}: ${result.status} (${result.latency_ms}ms)`)
      refetch()
    } catch (e) {
      setTestError(e)
      toast.error(`${name} test failed: ${e.message}`)
    } finally {
      setTesting(null)
    }
  }

  if (loading) return <LoadingSpinner size="lg" className="mt-16" />
  if (error) return <ErrorCard error={error} title="Failed to load health" />
  if (!health) return null

  return (
    <div>
      <Header title="Server / Health" subtitle="Adapter health, DB backend, and config-in-effect" />

      <div className="space-y-6">
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Server Status</h2>
              <Badge status={health.status}>{health.status}</Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <InfoRow label="Version" value={health.server_version} />
            <InfoRow label="Uptime" value={formatDuration(health.uptime_seconds * 1000)} />
            <InfoRow label="Requests (last hour)" value={formatNumber(health.request_rate_last_hour)} />
          </Card.Body>
        </Card>

        <Card>
          <Card.Header><h2 className="text-sm font-semibold text-text-primary">Database</h2></Card.Header>
          <Card.Body>
            <InfoRow label="Backend" value={<span className="font-mono">{health.db.backend}</span>} />
            <InfoRow label="Connected" value={<Badge status={health.db.connected ? 'healthy' : 'unhealthy'}>{health.db.connected ? 'connected' : 'disconnected'}</Badge>} />
            <InfoRow label="Location" value={<span className="font-mono text-xs">{health.db.location}</span>} />
          </Card.Body>
        </Card>

        <Card>
          <Card.Header><h2 className="text-sm font-semibold text-text-primary">Adapters</h2></Card.Header>
          <Card.Body>
            {testError && <div className="mb-3"><ErrorCard error={testError} title="Adapter test failed" /></div>}
            {Object.entries(health.adapters).map(([name, adapter]) => (
              <AdapterRow key={name} name={name} adapter={adapter} onTest={handleTest} testing={testing === name} />
            ))}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header><h2 className="text-sm font-semibold text-text-primary">Config in Effect</h2></Card.Header>
          <Card.Body>
            {configLoading && <LoadingSpinner size="sm" />}
            {configError && <ErrorCard error={configError} title="Failed to load config" />}
            {!configLoading && !configError && config && (
              <pre className="text-xs font-mono text-text-secondary bg-bg-tertiary rounded p-4 overflow-x-auto whitespace-pre-wrap break-words">
                {safeJsonStringify(config)}
              </pre>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Health
