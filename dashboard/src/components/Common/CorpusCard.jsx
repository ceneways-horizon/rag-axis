import { Link } from 'react-router-dom'
import { Card } from '../UI/Card'
import { Badge } from '../UI/Badge'
import { formatNumber, formatDate } from '../../utils/format'

export function CorpusCard({ corpus }) {
  return (
    <Link to={`/corpora/${corpus.corpus_id}`} className="block h-full">
      <Card className="hover:border-accent/40 transition-colors h-full">
        <Card.Body>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-text-primary text-sm leading-tight">{corpus.corpus_name}</h3>
            <Badge status={corpus.status}>{corpus.status}</Badge>
          </div>

          {corpus.embedder_model && (
            <p className="text-xs text-text-muted mb-3 font-mono truncate">{corpus.embedder_model}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-text-muted mb-2">
            <span>{formatNumber(corpus.documents)} docs</span>
            <span>{formatNumber(corpus.chunks)} chunks</span>
            <span>{formatNumber(corpus.tokens)} tokens</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            {corpus.stale ? (
              <Badge variant="warning">stale</Badge>
            ) : (
              <span className="text-text-muted">up to date</span>
            )}
            <span className="text-text-muted">{formatDate(corpus.created_at)}</span>
          </div>
        </Card.Body>
      </Card>
    </Link>
  )
}

export default CorpusCard
