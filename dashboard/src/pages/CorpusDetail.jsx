import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '../components/UI/Card'
import { Badge } from '../components/UI/Badge'
import { Button } from '../components/UI/Button'
import { Table } from '../components/UI/Table'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { IngestModal, ErrorCard } from '../components/Common'
import { useCorpus } from '../hooks'
import { formatNumber, formatDate } from '../utils/format'

const docColumns = [
  { key: 'filename', label: 'File' },
  { key: 'chunks', label: 'Chunks', render: (v) => formatNumber(v) },
  { key: 'tokens', label: 'Tokens', render: (v) => formatNumber(v) },
  { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
  { key: 'ingested_at', label: 'Ingested', render: (v) => formatDate(v) },
]

export function CorpusDetail() {
  const { corpusId } = useParams()
  const { corpus, loading, error, refetch } = useCorpus(corpusId)
  const [showReindex, setShowReindex] = useState(false)

  if (loading) return <LoadingSpinner size="lg" className="mt-16" />
  if (error) return <ErrorCard error={error} title="Failed to load corpus" />
  if (!corpus) return null

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/corpora" className="text-sm text-text-muted hover:text-text-primary">Corpora</Link>
            <span className="text-text-muted">/</span>
            <h1 className="text-xl font-semibold text-text-primary">{corpus.corpus_name}</h1>
            <Badge status={corpus.status}>{corpus.status}</Badge>
            {corpus.stale && <Badge variant="warning">stale</Badge>}
          </div>
          <p className="text-sm text-text-secondary font-mono">{corpus.corpus_id}</p>
        </div>
        <Button onClick={() => setShowReindex(true)}>Re-index</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><Card.Body>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Documents</p>
          <p className="text-2xl font-semibold text-text-primary">{formatNumber(corpus.documents)}</p>
        </Card.Body></Card>
        <Card><Card.Body>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Chunks</p>
          <p className="text-2xl font-semibold text-text-primary">{formatNumber(corpus.chunks)}</p>
        </Card.Body></Card>
        <Card><Card.Body>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Tokens</p>
          <p className="text-2xl font-semibold text-text-primary">{formatNumber(corpus.tokens)}</p>
        </Card.Body></Card>
        <Card><Card.Body>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Embedder</p>
          <p className="text-sm font-mono text-text-primary mt-1.5 truncate">{corpus.embedder_model}</p>
        </Card.Body></Card>
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-sm font-semibold text-text-primary">Documents</h2>
        </Card.Header>
        <Table columns={docColumns} data={corpus.documents_detail || []} emptyMessage="No documents" />
      </Card>

      <IngestModal
        open={showReindex}
        onClose={() => setShowReindex(false)}
        onComplete={refetch}
        corpusId={corpus.corpus_id}
        title={`Re-index ${corpus.corpus_name}`}
      />
    </div>
  )
}

export default CorpusDetail
