import { useState } from 'react'
import { Header } from '../components/Layout/Header'
import { Button } from '../components/UI/Button'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { CorpusCard, IngestModal, ErrorCard } from '../components/Common'
import { useCorpora } from '../hooks'

export function Corpora() {
  const { corpora, loading, error, refetch } = useCorpora()
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <Header
        title="Corpora"
        subtitle="Ingest, inspect, and re-index document corpora"
        actions={<Button onClick={() => setShowModal(true)}>Ingest Corpus</Button>}
      />

      {loading && <LoadingSpinner size="lg" className="mt-16" />}
      {error && <ErrorCard error={error} title="Failed to load corpora" />}

      {!loading && !error && corpora.length === 0 && (
        <div className="text-center mt-16">
          <p className="text-text-secondary font-medium">No corpora yet</p>
          <p className="text-text-muted text-sm mt-1 mb-4">Ingest a corpus to start running queries against it</p>
          <Button onClick={() => setShowModal(true)}>Ingest Corpus</Button>
        </div>
      )}

      {!loading && !error && corpora.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {corpora.map(c => (
            <CorpusCard key={c.corpus_id} corpus={c} />
          ))}
        </div>
      )}

      <IngestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onComplete={refetch}
      />
    </div>
  )
}

export default Corpora
