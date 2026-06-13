import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Modal } from '../components/UI/Modal'
import { Badge } from '../components/UI/Badge'
import { Table } from '../components/UI/Table'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { useToast } from '../components/UI/Toast'
import { useConfigurations, useCreateConfiguration, usePromoteConfiguration, useDeleteConfiguration } from '../hooks/useConfigurations'
import { formatDate } from '../utils/format'
import { safeJsonParse } from '../utils/helpers'

export function Configurations() {
  const { projectId } = useParams()
  const { configs, loading, error, refetch } = useConfigurations(projectId)
  const { create, loading: creating } = useCreateConfiguration(projectId)
  const { promote, loading: promoting } = usePromoteConfiguration(projectId)
  const { remove, loading: removing } = useDeleteConfiguration(projectId)
  const toast = useToast()

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', version: '', config: '{}' })

  const handleCreate = async () => {
    if (!form.name.trim()) return
    const parsedConfig = safeJsonParse(form.config)
    if (parsedConfig === null && form.config.trim() !== '{}') {
      toast.error('Invalid JSON in config')
      return
    }
    try {
      await create({
        name: form.name.trim(),
        version: form.version.trim() || '1.0.0',
        config: parsedConfig || {},
      })
      toast.success('Configuration created')
      setShowModal(false)
      setForm({ name: '', version: '', config: '{}' })
      refetch()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handlePromote = async (configId) => {
    try {
      await promote(configId)
      toast.success('Configuration promoted')
      refetch()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleDelete = async (cfg) => {
    if (!window.confirm(`Delete config "${cfg.name}"?`)) return
    try {
      await remove(cfg.id)
      toast.success('Configuration deleted')
      refetch()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const columns = [
    { key: 'name', label: 'Name', render: (v) => <span className="font-medium text-text-primary">{v}</span> },
    { key: 'version', label: 'Version', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
    { key: 'created_at', label: 'Created', render: (v) => formatDate(v) },
    { key: 'promoted_at', label: 'Promoted', render: (v) => formatDate(v) },
    {
      key: 'id',
      label: 'Actions',
      render: (v, row) => (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {row.status !== 'production' && (
            <Button
              variant="secondary"
              size="sm"
              loading={promoting}
              onClick={() => handlePromote(v)}
            >
              Promote
            </Button>
          )}
          {row.status !== 'production' && (
            <Button
              variant="danger"
              size="sm"
              loading={removing}
              onClick={() => handleDelete(row)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <Header
        title="Configurations"
        subtitle="Manage pipeline configuration versions"
        actions={
          <Button onClick={() => setShowModal(true)}>New Config</Button>
        }
      />

      {loading && <LoadingSpinner size="lg" className="mt-16" />}

      {error && (
        <div className="text-error text-sm bg-red-900/10 border border-error/20 rounded p-3">{error}</div>
      )}

      {!loading && !error && (
        <Card>
          <Table
            columns={columns}
            data={configs}
            emptyMessage="No configurations yet. Create one to track pipeline config versions."
          />
        </Card>
      )}

      <Modal
        open={showModal}
        title="New Configuration"
        onClose={() => { setShowModal(false); setForm({ name: '', version: '', config: '{}' }) }}
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
              placeholder="Hybrid RRF Config"
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Version</label>
            <input
              type="text"
              value={form.version}
              onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
              placeholder="1.0.0"
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Config (JSON)</label>
            <textarea
              value={form.config}
              onChange={e => setForm(f => ({ ...f, config: e.target.value }))}
              rows={5}
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Configurations
