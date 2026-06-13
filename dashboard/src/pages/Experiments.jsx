import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Button } from '../components/UI/Button'
import { Modal } from '../components/UI/Modal'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { ExperimentCard } from '../components/Common/ExperimentCard'
import { useToast } from '../components/UI/Toast'
import { useExperiments, useCreateExperiment } from '../hooks/useExperiments'
import { useCorpora } from '../hooks/useKnowledge'
import { safeJsonStringify, safeJsonParse } from '../utils/helpers'

export function Experiments() {
  const { projectId } = useParams()
  const { experiments, loading, error, refetch } = useExperiments(projectId)
  const { create, loading: creating } = useCreateExperiment(projectId)
  const { corpora } = useCorpora(projectId)
  const toast = useToast()

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    corpus_id: '',
    config: '{}',
  })

  const handleCreate = async () => {
    if (!form.name.trim()) return
    const parsedConfig = safeJsonParse(form.config)
    if (parsedConfig === null && form.config.trim() !== '{}') {
      toast.error('Invalid JSON in config field')
      return
    }
    try {
      await create({
        name: form.name.trim(),
        description: form.description.trim(),
        corpus_id: form.corpus_id || undefined,
        config: parsedConfig || {},
      })
      toast.success('Experiment created')
      setShowModal(false)
      setForm({ name: '', description: '', corpus_id: '', config: '{}' })
      refetch()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div>
      <Header
        title="Experiments"
        subtitle="Design and run RAG pipeline experiments"
        actions={
          <Button onClick={() => setShowModal(true)}>New Experiment</Button>
        }
      />

      {loading && <LoadingSpinner size="lg" className="mt-16" />}

      {error && (
        <div className="text-error text-sm bg-red-900/10 border border-error/20 rounded p-3">{error}</div>
      )}

      {!loading && !error && experiments.length === 0 && (
        <div className="text-center mt-16">
          <p className="text-text-secondary font-medium">No experiments yet</p>
          <p className="text-text-muted text-sm mt-1 mb-4">Create an experiment to start evaluating your RAG pipeline</p>
          <Button onClick={() => setShowModal(true)}>Create Experiment</Button>
        </div>
      )}

      {!loading && !error && experiments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiments.map(exp => (
            <ExperimentCard key={exp.id} experiment={exp} projectId={projectId} />
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        title="New Experiment"
        onClose={() => { setShowModal(false); setForm({ name: '', description: '', corpus_id: '', config: '{}' }) }}
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
              placeholder="Hybrid Retrieval v1"
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Corpus</label>
            <select
              value={form.corpus_id}
              onChange={e => setForm(f => ({ ...f, corpus_id: e.target.value }))}
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="">Select corpus...</option>
              {corpora.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Config (JSON)</label>
            <textarea
              value={form.config}
              onChange={e => setForm(f => ({ ...f, config: e.target.value }))}
              rows={4}
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Experiments
