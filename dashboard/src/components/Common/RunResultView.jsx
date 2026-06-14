import { Badge } from '../UI/Badge'
import { Disclosure } from './Disclosure'
import { formatCost, formatPercent, formatDateTime, formatNumber } from '../../utils/format'
import { safeJsonStringify } from '../../utils/helpers'
import { confidenceVariant } from '../../utils/constants'

function ScoreList({ label, scores }) {
  if (!scores || scores.length === 0) return null
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-text-muted flex-shrink-0 w-28">{label}</span>
      <span className="font-mono text-text-secondary break-all">
        {scores.map(s => Number(s).toFixed(2)).join(', ')}
      </span>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border-color/50 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm text-text-primary font-medium text-right">{value ?? '—'}</span>
    </div>
  )
}

const statusVariant = {
  success: 'success',
  degraded: 'warning',
  failed: 'error',
}

const confidenceTextClass = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  muted: 'text-text-muted',
}

// Renders a full RunResult per the Dashboard Server API Contract v1 — the
// visual rendering of I2 (audit), I3 (confidence), I7 (cost).
export function RunResultView({ result }) {
  if (!result) return null

  const { query, answer, citations = [], confidence, retrieval_quality, cost = {}, audit_trail = {}, reproducibility = {}, status } = result
  const retrieval = audit_trail.retrieval || {}
  const synthesis = audit_trail.synthesis || {}

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant={statusVariant[status] || 'muted'}>{status || 'unknown'}</Badge>
        {result.run_id && <span className="text-xs font-mono text-text-muted">{result.run_id}</span>}
      </div>

      {query && (
        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Query</h3>
          <p className="text-sm text-text-secondary bg-bg-tertiary rounded p-3 break-words">{query}</p>
        </div>
      )}

      {synthesis.context_truncated > 0 && (
        <div className="border border-warning/30 bg-yellow-900/10 rounded-lg p-3 text-sm text-warning">
          Context truncated: {synthesis.tokens_dropped} tokens dropped
          {synthesis.truncation_reason ? ` (${synthesis.truncation_reason})` : ''}.
        </div>
      )}

      {retrieval.score_collapsed && (
        <div className="border border-warning/30 bg-yellow-900/10 rounded-lg p-3 text-sm text-warning">
          Score collapse detected during reranking — retrieval scores were too close to discriminate confidently.
        </div>
      )}

      {answer && (
        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Answer</h3>
          <p className="text-sm text-text-primary bg-bg-tertiary rounded p-3 break-words whitespace-pre-wrap leading-relaxed">{answer}</p>
        </div>
      )}

      {citations.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Citations ({citations.length})</h3>
          <div className="space-y-2">
            {citations.map((c, i) => (
              <div key={c.chunk_id || i} className="bg-bg-tertiary rounded p-3">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-xs font-mono text-info truncate">[{i + 1}] {c.source}</span>
                  <Badge variant={confidenceVariant(c.confidence)}>
                    {formatPercent(c.confidence)}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary break-words">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-tertiary rounded p-3">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Confidence</p>
          <p className={`text-lg font-semibold ${confidenceTextClass[confidenceVariant(confidence)]}`}>{formatPercent(confidence)}</p>
        </div>
        <div className="bg-bg-tertiary rounded p-3">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Retrieval Quality</p>
          <p className={`text-lg font-semibold ${confidenceTextClass[confidenceVariant(retrieval_quality)]}`}>{formatPercent(retrieval_quality)}</p>
        </div>
      </div>

      <Disclosure title="Cost Breakdown" badge={<span className="text-cost text-xs font-mono">{formatCost(cost.total_cost)}</span>}>
        <InfoRow label="Embedding" value={formatCost(cost.embedding_cost)} />
        <InfoRow label="Retrieval" value={formatCost(cost.retrieval_cost)} />
        <InfoRow label="Reranking" value={formatCost(cost.reranking_cost)} />
        <InfoRow label="Generation" value={formatCost(cost.generation_cost)} />
        <InfoRow label="Total" value={<span className="text-cost">{formatCost(cost.total_cost)}</span>} />
      </Disclosure>

      <Disclosure title="Retrieval Audit">
        <InfoRow label="Dense chunks" value={formatNumber(retrieval.dense_chunks)} />
        <ScoreList label="Dense scores" scores={retrieval.dense_scores} />
        <InfoRow label="Sparse chunks" value={formatNumber(retrieval.sparse_chunks)} />
        <ScoreList label="Sparse scores" scores={retrieval.sparse_scores} />
        <InfoRow label="Reranked top-k" value={formatNumber(retrieval.reranked_top_k)} />
        <ScoreList label="Reranked scores" scores={retrieval.reranked_scores} />
        <InfoRow label="Score collapsed" value={<Badge variant={retrieval.score_collapsed ? 'warning' : 'success'}>{retrieval.score_collapsed ? 'yes' : 'no'}</Badge>} />
      </Disclosure>

      <Disclosure title="Context / Synthesis Audit">
        <InfoRow label="Context assembled" value={formatNumber(synthesis.context_assembled)} />
        <InfoRow label="Context truncated" value={formatNumber(synthesis.context_truncated)} />
        <InfoRow label="Tokens dropped" value={formatNumber(synthesis.tokens_dropped)} />
        <InfoRow label="Truncation reason" value={synthesis.truncation_reason || 'none'} />
        <InfoRow label="Tokens used" value={formatNumber(synthesis.tokens_used)} />
      </Disclosure>

      <Disclosure title="Reproducibility">
        <InfoRow label="Corpus version" value={reproducibility.corpus_version} />
        <InfoRow label="Embedder model" value={<span className="font-mono">{reproducibility.embedder_model}</span>} />
        <InfoRow label="LLM model" value={<span className="font-mono">{reproducibility.llm_model}</span>} />
        <InfoRow label="Run timestamp" value={formatDateTime(reproducibility.run_timestamp)} />
        {reproducibility.retrieval_config && (
          <div className="mt-2">
            <p className="text-xs text-text-muted mb-1">Retrieval config</p>
            <pre className="text-xs font-mono text-text-secondary bg-bg-tertiary rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
              {safeJsonStringify(reproducibility.retrieval_config)}
            </pre>
          </div>
        )}
        {reproducibility.synthesis_config && (
          <div className="mt-2">
            <p className="text-xs text-text-muted mb-1">Synthesis config</p>
            <pre className="text-xs font-mono text-text-secondary bg-bg-tertiary rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
              {safeJsonStringify(reproducibility.synthesis_config)}
            </pre>
          </div>
        )}
      </Disclosure>
    </div>
  )
}

export default RunResultView
