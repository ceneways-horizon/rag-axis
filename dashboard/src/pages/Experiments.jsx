import { useState } from 'react'
import { Header } from '../components/Layout/Header'
import { Button } from '../components/UI/Button'
import { Modal } from '../components/UI/Modal'
import { FormInput } from '../components/UI/FormInput'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { useToast } from '../components/UI/Toast'
import { ExperimentCard, ErrorCard } from '../components/Common'
import { useExperiments, useCorpora, useAsync } from '../hooks'
import * as api from '../api'

const RERANKERS = ['none', 'cohere', 'cross-encoder']
const LLMS = ['openai:gpt-4', 'openai:gpt-4o-mini', 'anthropic:claude-sonnet']

const initialForm = {
  name: '',
  description: '',
  corpus_id: '',
  k: 10,
  dense_weight: 0.7,
  sparse_weight: 0.3,
  reranker: 'cohere',
  context_budget_tokens: 2048,
  temperature: 0.7,
  llm: LLMS[0],
}

export function Experiments() {
  const { experiments, loading, error, refetch } = useExperiments()
  const { corpora } = useCorpora()
  const { loading: creating, execute } = useAsync()
  const toast = useToast()

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialForm)

  const handleCreate = async () => {
    if (!form.name.trim() || !form.corpus_id) {
      toast.error('Name and corpus are required')
      return
    }
    try {
      await execute(() => api.createExperiment({
        name: form.name.trim(),
        description: form.description.trim(),
        frozen_config: {
          corpus_id: form.corpus_id,
          retrieval: {
            k: Number(form.k),
            dense_weight: Number(form.dense_weight),
            sparse_weight: Number(form.sparse_weight),
            reranker: form.reranker,
          },
          synthesis: {
            context_budget_tokens: Number(form.context_budget_tokens),
            temperature: Number(form.temperature),
            llm: form.llm,
          },
        },
      }))
      toast.success('Experiment created')
      setShowModal(false)
      setForm(initialForm)
      refetch()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div>
      <Header
        title="Experiments"
        subtitle="Named, frozen configs that runs accumulate under (ADR-S6)"
        actions={<Button onClick={() => setShowModal(true)}>New Experiment</Button>}
      />

      {loading && <LoadingSpinner size="lg" className="mt-16" />}
      {error && <ErrorCard error={error} title="Failed to load experiments" />}

      {!loading && !error && experiments.length === 0 && (
        <div className="text-center mt-16">
          <p className="text-text-secondary font-medium">No experiments yet</p>
          <p className="text-text-muted text-sm mt-1 mb-4">Create an experiment to freeze a config and start running queries</p>
          <Button onClick={() => setShowModal(true)}>Create Experiment</Button>
        </div>
      )}

      {!loading && !error && experiments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiments.map(exp => (
            <ExperimentCard key={exp.exp_id} experiment={exp} />
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        title="New Experiment"
        onClose={() => { setShowModal(false); setForm(initialForm) }}
        onConfirm={handleCreate}
        confirmLabel="Create"
        loading={creating}
      >
        <div className="space-y-4">
          <FormInput
            label="Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Hybrid Retrieval v2"
            autoFocus
          />
          <FormInput
            label="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Optional description"
          />
          <FormInput
            label="Corpus" as="select"
            value={form.corpus_id}
            onChange={e => setForm(f => ({ ...f, corpus_id: e.target.value }))}
          >
            <option value="">Select corpus…</option>
            {corpora.map(c => <option key={c.corpus_id} value={c.corpus_id}>{c.corpus_name}</option>)}
          </FormInput>

          <p className="text-xs font-medium text-text-muted uppercase tracking-wider pt-1">Retrieval</p>
          <div className="grid grid-cols-3 gap-3">
            <FormInput label="k" type="number" value={form.k} onChange={e => setForm(f => ({ ...f, k: e.target.value }))} />
            <FormInput label="Dense weight" type="number" step="0.1" value={form.dense_weight} onChange={e => setForm(f => ({ ...f, dense_weight: e.target.value }))} />
            <FormInput label="Sparse weight" type="number" step="0.1" value={form.sparse_weight} onChange={e => setForm(f => ({ ...f, sparse_weight: e.target.value }))} />
          </div>
          <FormInput label="Reranker" as="select" value={form.reranker} onChange={e => setForm(f => ({ ...f, reranker: e.target.value }))}>
            {RERANKERS.map(r => <option key={r} value={r}>{r}</option>)}
          </FormInput>

          <p className="text-xs font-medium text-text-muted uppercase tracking-wider pt-1">Synthesis</p>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Context budget (tokens)" type="number" value={form.context_budget_tokens} onChange={e => setForm(f => ({ ...f, context_budget_tokens: e.target.value }))} />
            <FormInput label="Temperature" type="number" step="0.1" value={form.temperature} onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))} />
          </div>
          <FormInput label="LLM" as="select" value={form.llm} onChange={e => setForm(f => ({ ...f, llm: e.target.value }))}>
            {LLMS.map(l => <option key={l} value={l}>{l}</option>)}
          </FormInput>
        </div>
      </Modal>
    </div>
  )
}

export default Experiments
