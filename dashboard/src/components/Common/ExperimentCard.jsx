import { Link } from 'react-router-dom'
import { Card } from '../UI/Card'
import { Badge } from '../UI/Badge'
import { formatCost, formatDuration, formatPercent, formatDate } from '../../utils/format'

export function ExperimentCard({ experiment }) {
  const retrieval = experiment.frozen_config?.retrieval || {}
  const synthesis = experiment.frozen_config?.synthesis || {}

  return (
    <Link to={`/experiments/${experiment.exp_id}`} className="block h-full">
      <Card className="hover:border-accent/40 transition-colors h-full">
        <Card.Body>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-medium text-text-primary text-sm leading-tight">{experiment.name}</h3>
            <Badge variant={experiment.success_rate >= 0.95 ? 'success' : experiment.success_rate >= 0.7 ? 'warning' : 'error'}>
              {formatPercent(experiment.success_rate)}
            </Badge>
          </div>

          {experiment.description && (
            <p className="text-xs text-text-muted mb-3 line-clamp-2">{experiment.description}</p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {synthesis.llm && <span className="text-xs font-mono bg-bg-tertiary text-text-secondary px-2 py-0.5 rounded">{synthesis.llm}</span>}
            {retrieval.reranker && <span className="text-xs font-mono bg-bg-tertiary text-text-secondary px-2 py-0.5 rounded">reranker: {retrieval.reranker}</span>}
            {retrieval.k != null && <span className="text-xs font-mono bg-bg-tertiary text-text-secondary px-2 py-0.5 rounded">k={retrieval.k}</span>}
          </div>

          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>{experiment.run_count ?? 0} runs</span>
            <span>{formatCost(experiment.avg_cost)} avg</span>
            <span>{formatDuration(experiment.avg_latency_ms)} avg</span>
            <span className="ml-auto">{formatDate(experiment.created_at)}</span>
          </div>
        </Card.Body>
      </Card>
    </Link>
  )
}

export default ExperimentCard
