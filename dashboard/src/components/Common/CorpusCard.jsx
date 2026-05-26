import { Card } from '../UI/Card'
import { Badge } from '../UI/Badge'
import { formatNumber } from '../../utils/format'

export function CorpusCard({ corpus, selected, onClick }) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-colors h-full ${selected ? 'border-info/60 bg-info/5' : ''}`}
    >
      <Card.Body>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-text-primary text-sm leading-tight">{corpus.name}</h3>
          <Badge status={corpus.status}>{corpus.status || 'draft'}</Badge>
        </div>

        {corpus.embedding_model_id && (
          <p className="text-xs text-text-muted mb-3 font-mono truncate">{corpus.embedding_model_id}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span>{formatNumber(corpus.document_count ?? 0)} docs</span>
          <span>{formatNumber(corpus.chunk_count ?? 0)} chunks</span>
        </div>
      </Card.Body>
    </Card>
  )
}

export default CorpusCard
