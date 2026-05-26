import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Modal } from '../components/UI/Modal'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { useToast } from '../components/UI/Toast'
import { useProjects, useCreateProject } from '../hooks/useProjects'
import { formatDate } from '../utils/format'

export function Projects() {
  const { projects, loading, error, refetch } = useProjects()
  const { create, loading: creating } = useCreateProject()
  const toast = useToast()

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const handleCreate = async () => {
    if (!form.name.trim()) return
    try {
      await create({ name: form.name.trim(), description: form.description.trim() })
      toast.success('Project created')
      setShowModal(false)
      setForm({ name: '', description: '' })
      refetch()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div>
      <Header
        title="Projects"
        subtitle="Manage your RAG pipeline projects"
        actions={
          <Button onClick={() => setShowModal(true)}>New Project</Button>
        }
      />

      {loading && <LoadingSpinner size="lg" className="mt-16" />}

      {error && (
        <div className="text-error text-sm bg-red-900/10 border border-error/20 rounded p-3">
          {error}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-24 text-center">
          <div className="w-12 h-12 bg-bg-tertiary rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-text-secondary font-medium">No projects yet</p>
          <p className="text-text-muted text-sm mt-1 mb-4">Create your first project to get started</p>
          <Button onClick={() => setShowModal(true)}>Create Project</Button>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`} className="block">
              <Card className="hover:border-info/40 transition-colors h-full">
                <Card.Body>
                  <div className="mb-3">
                    <h2 className="font-semibold text-text-primary">{project.name}</h2>
                    {project.description && (
                      <p className="text-sm text-text-muted mt-1 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{project.experiment_count ?? 0} experiments</span>
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </Card.Body>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        title="New Project"
        onClose={() => { setShowModal(false); setForm({ name: '', description: '' }) }}
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
              placeholder="My RAG Project"
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-info"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description..."
              rows={3}
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-info resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Projects
