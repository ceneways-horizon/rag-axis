import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Modal } from '../components/UI/Modal'
import { Table } from '../components/UI/Table'
import { Badge } from '../components/UI/Badge'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { CorpusCard } from '../components/Common/CorpusCard'
import { useToast } from '../components/UI/Toast'
import { useCorpora, useCreateCorpus, useDocuments, useUploadDocument, useDeleteDocument } from '../hooks/useKnowledge'
import { formatDate, formatBytes } from '../utils/format'

const docColumns = [
  { key: 'filename', label: 'Filename' },
  { key: 'content_type', label: 'Type', render: (v) => <span className="font-mono text-xs">{v || '—'}</span> },
  { key: 'size_bytes', label: 'Size', render: (v) => formatBytes(v) },
  { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
  { key: 'created_at', label: 'Uploaded', render: (v) => formatDate(v) },
]

export function Knowledge() {
  const { projectId } = useParams()
  const { corpora, loading: cLoading, error: cError, refetch: refetchCorpora } = useCorpora(projectId)
  const { documents, loading: dLoading, refetch: refetchDocs } = useDocuments(projectId)
  const { create, loading: creating } = useCreateCorpus(projectId)
  const { upload, loading: uploading } = useUploadDocument(projectId)
  const { remove, loading: removing } = useDeleteDocument(projectId)
  const toast = useToast()
  const fileInputRef = useRef(null)

  const [selectedCorpusId, setSelectedCorpusId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', embedding_model_id: '' })

  const handleCreate = async () => {
    if (!form.name.trim()) return
    try {
      await create({ name: form.name.trim(), embedding_model_id: form.embedding_model_id.trim() })
      toast.success('Corpus created')
      setShowModal(false)
      setForm({ name: '', embedding_model_id: '' })
      refetchCorpora()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    if (selectedCorpusId) formData.append('corpus_id', selectedCorpusId)
    try {
      await upload(formData)
      toast.success('Document uploaded')
      refetchDocs()
    } catch (err) {
      toast.error(err.message)
    }
    e.target.value = ''
  }

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.filename}"?`)) return
    try {
      await remove(doc.id)
      toast.success('Document deleted')
      refetchDocs()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const selectedCorpus = corpora.find(c => c.id === selectedCorpusId)

  const docColumnsWithActions = [
    ...docColumns,
    {
      key: 'id',
      label: '',
      render: (v, row) => (
        <Button
          variant="danger"
          size="sm"
          loading={removing}
          onClick={(e) => { e.stopPropagation(); handleDelete(row) }}
        >
          Delete
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Header
        title="Knowledge"
        subtitle="Corpus and document management"
        actions={
          <Button onClick={() => setShowModal(true)}>New Corpus</Button>
        }
      />

      {cLoading && <LoadingSpinner size="lg" className="mt-16" />}

      {cError && (
        <div className="text-error text-sm bg-red-900/10 border border-error/20 rounded p-3 mb-4">{cError}</div>
      )}

      {!cLoading && corpora.length === 0 && (
        <div className="text-center mt-16">
          <p className="text-text-secondary font-medium">No corpus yet</p>
          <p className="text-text-muted text-sm mt-1 mb-4">Create a corpus to start indexing documents</p>
          <Button onClick={() => setShowModal(true)}>Create Corpus</Button>
        </div>
      )}

      {!cLoading && corpora.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {corpora.map(corpus => (
              <CorpusCard
                key={corpus.id}
                corpus={corpus}
                selected={selectedCorpusId === corpus.id}
                onClick={() => setSelectedCorpusId(prev => prev === corpus.id ? null : corpus.id)}
              />
            ))}
          </div>

          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">
                    Documents{selectedCorpus ? ` — ${selectedCorpus.name}` : ' (All)'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleUpload}
                    accept=".txt,.pdf,.md,.json,.csv"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Document
                  </Button>
                </div>
              </div>
            </Card.Header>
            {dLoading ? (
              <LoadingSpinner size="md" className="py-8" />
            ) : (
              <Table
                columns={docColumnsWithActions}
                data={documents}
                emptyMessage="No documents uploaded yet"
              />
            )}
          </Card>
        </>
      )}

      <Modal
        open={showModal}
        title="New Corpus"
        onClose={() => { setShowModal(false); setForm({ name: '', embedding_model_id: '' }) }}
        onConfirm={handleCreate}
        confirmLabel="Create"
        loading={creating}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="My Corpus"
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Embedding Model ID</label>
            <input
              type="text"
              value={form.embedding_model_id}
              onChange={e => setForm(f => ({ ...f, embedding_model_id: e.target.value }))}
              placeholder="text-embedding-3-small"
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent font-mono"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Knowledge
