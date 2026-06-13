import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Badge } from '../components/UI/Badge'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { useToast } from '../components/UI/Toast'
import { useProject, useDeleteProject } from '../hooks/useProjects'
import { useHealth } from '../hooks/useMetrics'
import client from '../api/client'
import { API } from '../api/endpoints'

export function Settings() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { project, loading, refetch } = useProject(projectId)
  const { health, loading: hLoading } = useHealth()
  const { remove, loading: deleting } = useDeleteProject()
  const toast = useToast()

  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  useEffect(() => {
    if (project) {
      setForm({ name: project.name || '', description: project.description || '' })
    }
  }, [project])

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await client.patch(API.PROJECTS.GET(projectId), { name: form.name.trim(), description: form.description.trim() })
      toast.success('Project updated')
      refetch()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== project?.name) {
      toast.error('Project name does not match')
      return
    }
    try {
      await remove(projectId)
      toast.success('Project deleted')
      navigate('/projects')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const adapters = health?.adapters || {}

  if (loading) return <LoadingSpinner size="lg" className="mt-16" />

  return (
    <div>
      <Header title="Settings" subtitle="Project configuration and system status" />

      <div className="space-y-6">
        <Card>
          <Card.Header>
            <h2 className="text-sm font-semibold text-text-primary">Adapter Health</h2>
          </Card.Header>
          <Card.Body>
            {hLoading ? (
              <LoadingSpinner size="sm" />
            ) : Object.keys(adapters).length === 0 ? (
              <p className="text-text-muted text-sm">No adapter health data available</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(adapters).map(([name, status]) => (
                  <div key={name} className="flex items-center justify-between py-1.5 border-b border-border-color/50 last:border-0">
                    <span className="text-sm text-text-secondary capitalize">{name.replace(/_/g, ' ')}</span>
                    <Badge status={status === true || status === 'ok' ? 'active' : 'error'}>
                      {status === true || status === 'ok' ? 'healthy' : 'error'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-sm font-semibold text-text-primary">Project Details</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent max-w-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-none max-w-md"
              />
            </div>
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </Card.Body>
        </Card>

        <Card className="border-error/30">
          <Card.Header className="border-error/20">
            <h2 className="text-sm font-semibold text-error">Danger Zone</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            <p className="text-sm text-text-secondary">
              Deleting this project will permanently remove all associated corpus, experiments, runs, and configurations. This action cannot be undone.
            </p>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Type <span className="font-mono text-text-primary">{project?.name}</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="Project name..."
                className="w-full bg-bg-tertiary border border-error/30 rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-error max-w-md"
              />
            </div>
            <Button
              variant="danger"
              loading={deleting}
              disabled={deleteConfirm !== project?.name}
              onClick={handleDelete}
            >
              Delete Project
            </Button>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Settings
