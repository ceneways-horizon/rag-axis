import { Link } from 'react-router-dom'
import { Card } from '../UI/Card'
import { Badge } from '../UI/Badge'
import { formatDate } from '../../utils/format'

export function ExperimentCard({ experiment, projectId }) {
  return (
    <Link to={`/projects/${projectId}/experiments/${experiment.id}`} className="block">
      <Card className="hover:border-info/40 transition-colors h-full">
        <Card.Body>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-medium text-text-primary text-sm leading-tight">{experiment.name}</h3>
            <Badge status={experiment.status}>{experiment.status || 'draft'}</Badge>
          </div>

          {experiment.description && (
            <p className="text-xs text-text-muted mb-3 line-clamp-2">{experiment.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>{experiment.run_count ?? 0} runs</span>
            {experiment.corpus_name && (
              <span className="truncate max-w-[120px]">Corpus: {experiment.corpus_name}</span>
            )}
            <span className="ml-auto">{formatDate(experiment.created_at)}</span>
          </div>
        </Card.Body>
      </Card>
    </Link>
  )
}

export default ExperimentCard
