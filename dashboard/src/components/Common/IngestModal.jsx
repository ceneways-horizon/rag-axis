import { useState, useCallback, useEffect } from 'react'
import { Modal } from '../UI/Modal'
import { FormInput } from '../UI/FormInput'
import { ProgressBar } from '../UI/ProgressBar'
import { Badge } from '../UI/Badge'
import * as api from '../../api'
import { usePolling } from '../../hooks/usePolling'
import { useToast } from '../UI/Toast'

const EMBEDDERS = ['text-embedding-3-large', 'text-embedding-3-small', 'cohere-embed-v3']
const VECTOR_STORES = ['pinecone', 'pgvector', 'qdrant']
const CHUNKING_STRATEGIES = ['fixed', 'semantic', 'structural', 'parent-child']

const initialForm = {
  corpus_name: '',
  embedder: EMBEDDERS[0],
  vector_store: VECTOR_STORES[0],
  chunking_strategy: CHUNKING_STRATEGIES[0],
  chunk_size: 512,
  overlap: 64,
}

export function IngestModal({ open, onClose, onComplete, corpusId, title = 'Ingest Corpus' }) {
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [job, setJob] = useState(null)
  const toast = useToast()

  const pollFn = useCallback(() => api.getIngestJob(job.job_id), [job])
  const isDone = useCallback((result) => result.status !== 'processing', [])
  const { data: progress, error: pollError, polling, start } = usePolling(pollFn, isDone)

  useEffect(() => {
    if (job && !progress) start()
  }, [job, progress, start])

  useEffect(() => {
    if (progress && progress.status === 'completed') {
      toast.success(`Ingest complete: ${progress.documents_ingested} documents, ${progress.chunks_created} chunks`)
      onComplete?.()
    }
    if (progress && progress.status === 'failed') {
      toast.error(progress.error || 'Ingest job failed')
    }
  }, [progress]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setForm(initialForm)
    setFiles([])
    setJob(null)
    setSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (corpusId) {
      // re-index: no form fields needed
      setSubmitting(true)
      try {
        const res = await api.reindexCorpus(corpusId)
        setJob(res)
      } catch (e) {
        toast.error(e.message)
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (!form.corpus_name.trim()) {
      toast.error('Corpus name is required')
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('corpus_name', form.corpus_name.trim())
      fd.append('embedder', form.embedder)
      fd.append('vector_store', form.vector_store)
      fd.append('chunking_strategy', form.chunking_strategy)
      fd.append('chunk_size', String(form.chunk_size))
      fd.append('overlap', String(form.overlap))
      files.forEach(f => fd.append('files', f))

      const res = await api.ingestCorpus(fd)
      setJob(res)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const isRunning = !!job && (!progress || progress.status === 'processing')

  return (
    <Modal
      open={open}
      title={title}
      onClose={handleClose}
      onConfirm={!job ? handleSubmit : undefined}
      confirmLabel={corpusId ? 'Re-index' : 'Start Ingest'}
      loading={submitting}
    >
      {!job && !corpusId && (
        <div className="space-y-4">
          <FormInput
            label="Corpus name"
            value={form.corpus_name}
            onChange={e => setForm(f => ({ ...f, corpus_name: e.target.value }))}
            placeholder="investment-guidelines-v2"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Embedder" as="select"
              value={form.embedder}
              onChange={e => setForm(f => ({ ...f, embedder: e.target.value }))}
            >
              {EMBEDDERS.map(e => <option key={e} value={e}>{e}</option>)}
            </FormInput>
            <FormInput
              label="Vector store" as="select"
              value={form.vector_store}
              onChange={e => setForm(f => ({ ...f, vector_store: e.target.value }))}
            >
              {VECTOR_STORES.map(v => <option key={v} value={v}>{v}</option>)}
            </FormInput>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormInput
              label="Chunking strategy" as="select"
              value={form.chunking_strategy}
              onChange={e => setForm(f => ({ ...f, chunking_strategy: e.target.value }))}
            >
              {CHUNKING_STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
            </FormInput>
            <FormInput
              label="Chunk size" type="number"
              value={form.chunk_size}
              onChange={e => setForm(f => ({ ...f, chunk_size: Number(e.target.value) }))}
            />
            <FormInput
              label="Overlap" type="number"
              value={form.overlap}
              onChange={e => setForm(f => ({ ...f, overlap: Number(e.target.value) }))}
            />
          </div>
          <FormInput
            label="Files"
            type="file"
            multiple
            onChange={e => setFiles(Array.from(e.target.files || []))}
          />
          {files.length > 0 && (
            <p className="text-xs text-text-muted">{files.length} file(s) selected</p>
          )}
        </div>
      )}

      {corpusId && !job && (
        <p className="text-sm text-text-secondary">
          Re-index this corpus with its existing configuration. This will re-embed and re-chunk all documents.
        </p>
      )}

      {job && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              {progress?.current_file
                ? `Processing ${progress.current_file}`
                : progress?.status === 'completed'
                  ? 'Ingest complete'
                  : progress?.status === 'failed'
                    ? 'Ingest failed'
                    : 'Starting…'}
            </span>
            {progress && <Badge status={progress.status}>{progress.status}</Badge>}
          </div>
          <ProgressBar
            value={progress?.progress ?? 0}
            color={progress?.status === 'failed' ? 'error' : progress?.status === 'completed' ? 'success' : 'accent'}
          />
          <p className="text-xs text-text-muted">{progress?.progress ?? 0}% complete</p>

          {progress?.status === 'completed' && (
            <div className="text-xs text-text-secondary space-y-1 bg-bg-tertiary rounded p-3">
              <div>Documents ingested: {progress.documents_ingested}</div>
              <div>Chunks created: {progress.chunks_created}</div>
              <div>Tokens indexed: {progress.tokens_indexed}</div>
              <div>Total cost: ${progress.cost?.total_cost?.toFixed(4)}</div>
            </div>
          )}

          {pollError && <p className="text-sm text-error">{pollError}</p>}

          {!isRunning && (
            <div className="flex justify-end pt-2">
              <button onClick={handleClose} className="text-sm text-accent hover:underline">Close</button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

export default IngestModal
