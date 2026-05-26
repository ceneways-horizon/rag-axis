import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Badge } from '../components/UI/Badge'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { useHealth, useTelemetry } from '../hooks/useMetrics'
import { formatNumber, formatDuration } from '../utils/format'

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-border-color/50 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm text-text-primary font-medium">{value ?? '—'}</span>
    </div>
  )
}

export function Health() {
  const { health, loading: hLoading, error: hError } = useHealth()
  const { telemetry, loading: tLoading } = useTelemetry()

  const status = health?.status || 'unknown'
  const isHealthy = status === 'healthy' || status === 'ok'

  return (
    <div>
      <Header title="System Health" subtitle="Backend status and telemetry" />

      <div className="space-y-6">
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">System Status</h2>
              {!hLoading && health && (
                <Badge status={isHealthy ? 'active' : 'degraded'}>
                  {isHealthy ? 'healthy' : 'degraded'}
                </Badge>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            {hLoading && <LoadingSpinner size="sm" />}
            {hError && (
              <div className="flex items-center gap-2">
                <Badge status="error">error</Badge>
                <span className="text-sm text-error">{hError}</span>
              </div>
            )}
            {!hLoading && !hError && health && (
              <div>
                <InfoRow label="Status" value={<Badge status={isHealthy ? 'active' : 'degraded'}>{status}</Badge>} />
                {health.version && <InfoRow label="Version" value={health.version} />}
                {health.uptime_seconds != null && (
                  <InfoRow label="Uptime" value={formatDuration(health.uptime_seconds * 1000)} />
                )}
                {health.database && (
                  <InfoRow
                    label="Database"
                    value={<Badge status={health.database === 'ok' ? 'active' : 'error'}>{health.database}</Badge>}
                  />
                )}
                {health.environment && <InfoRow label="Environment" value={health.environment} />}
              </div>
            )}
          </Card.Body>
        </Card>

        {health?.adapters && Object.keys(health.adapters).length > 0 && (
          <Card>
            <Card.Header>
              <h2 className="text-sm font-semibold text-text-primary">Adapters</h2>
            </Card.Header>
            <Card.Body>
              {Object.entries(health.adapters).map(([name, adapterStatus]) => (
                <InfoRow
                  key={name}
                  label={name.replace(/_/g, ' ')}
                  value={
                    <Badge status={adapterStatus === true || adapterStatus === 'ok' ? 'active' : 'error'}>
                      {adapterStatus === true || adapterStatus === 'ok' ? 'ok' : 'error'}
                    </Badge>
                  }
                />
              ))}
            </Card.Body>
          </Card>
        )}

        <Card>
          <Card.Header>
            <h2 className="text-sm font-semibold text-text-primary">Request Telemetry</h2>
          </Card.Header>
          <Card.Body>
            {tLoading && <LoadingSpinner size="sm" />}
            {!tLoading && !telemetry && (
              <p className="text-sm text-text-muted">No telemetry data available</p>
            )}
            {!tLoading && telemetry && (
              <div>
                {telemetry.total_requests != null && (
                  <InfoRow label="Total Requests" value={formatNumber(telemetry.total_requests)} />
                )}
                {telemetry.success_rate != null && (
                  <InfoRow label="Success Rate" value={`${(telemetry.success_rate * 100).toFixed(1)}%`} />
                )}
                {telemetry.avg_latency_ms != null && (
                  <InfoRow label="Avg Latency" value={formatDuration(telemetry.avg_latency_ms)} />
                )}
                {telemetry.error_rate != null && (
                  <InfoRow label="Error Rate" value={`${(telemetry.error_rate * 100).toFixed(1)}%`} />
                )}
                {telemetry.requests_per_minute != null && (
                  <InfoRow label="Req / Min" value={formatNumber(telemetry.requests_per_minute)} />
                )}
                {Object.entries(telemetry)
                  .filter(([k]) => !['total_requests', 'success_rate', 'avg_latency_ms', 'error_rate', 'requests_per_minute'].includes(k))
                  .map(([k, v]) => (
                    <InfoRow key={k} label={k.replace(/_/g, ' ')} value={String(v)} />
                  ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Health
