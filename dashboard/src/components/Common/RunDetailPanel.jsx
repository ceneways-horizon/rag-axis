import { SidePanel } from '../UI/SidePanel'
import { Badge } from '../UI/Badge'
import { formatDateTime, formatDuration, formatCost } from '../../utils/format'
import { safeJsonStringify } from '../../utils/helpers'

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border-color/50 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm text-text-primary font-medium">{value ?? '—'}</span>
    </div>
  )
}

export function RunDetailPanel({ run, open, onClose }) {
  if (!run) return null

  const costReport = run.cost_report || {}
  const auditTrail = run.audit_trail || []

  return (
    <SidePanel open={open} title="Run Detail" onClose={onClose}>
      <Section title="Overview">
        <InfoRow label="Status" value={<Badge status={run.status}>{run.status}</Badge>} />
        <InfoRow label="Created" value={formatDateTime(run.created_at)} />
        <InfoRow label="Duration" value={formatDuration(run.execution_time_ms)} />
        <InfoRow label="Cost" value={formatCost(run.estimated_cost)} />
      </Section>

      {run.query && (
        <Section title="Query">
          <p className="text-sm text-text-secondary bg-bg-tertiary rounded p-3 break-words">{run.query}</p>
        </Section>
      )}

      {run.answer && (
        <Section title="Answer">
          <p className="text-sm text-text-secondary bg-bg-tertiary rounded p-3 break-words whitespace-pre-wrap">{run.answer}</p>
        </Section>
      )}

      {run.citations && run.citations.length > 0 && (
        <Section title="Citations">
          <div className="space-y-2">
            {run.citations.map((c, i) => (
              <div key={i} className="bg-bg-tertiary rounded p-2 text-xs text-text-secondary">
                [{i + 1}] {c.text || c}
              </div>
            ))}
          </div>
        </Section>
      )}

      {Object.keys(costReport).length > 0 && (
        <Section title="Cost Breakdown">
          {Object.entries(costReport).map(([k, v]) => (
            <InfoRow key={k} label={k} value={typeof v === 'number' ? formatCost(v) : String(v)} />
          ))}
        </Section>
      )}

      {auditTrail.length > 0 && (
        <Section title="Audit Trail">
          <div className="space-y-1.5">
            {auditTrail.map((entry, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-text-muted flex-shrink-0">{entry.stage || entry.step || `Step ${i + 1}`}</span>
                <span className="text-text-secondary">{entry.message || entry.detail || safeJsonStringify(entry)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {run.error_message && (
        <Section title="Error">
          <p className="text-sm text-error bg-red-900/10 border border-error/20 rounded p-3 break-words">{run.error_message}</p>
        </Section>
      )}
    </SidePanel>
  )
}

export default RunDetailPanel
