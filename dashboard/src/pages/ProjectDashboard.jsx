import { useParams, Link } from 'react-router-dom'
import { Card } from '../components/UI/Card'
import { Badge } from '../components/UI/Badge'
import { Table } from '../components/UI/Table'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { useProject } from '../hooks/useProjects'
import { useExperiments } from '../hooks/useExperiments'
import { formatDate, formatDateTime, formatDuration, formatCost, truncate } from '../utils/format'

function StatCard({ label, value, sub }) {
  return (
    <Card>
      <Card.Body>
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-semibold text-text-primary">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </Card.Body>
    </Card>
  )
}

const recentRunColumns = [
  { key: 'query', label: 'Query', render: (v) => <span className="font-mono text-xs">{truncate(v || '', 60)}</span> },
  { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
  { key: 'execution_time_ms', label: 'Duration', render: (v) => formatDuration(v) },
  { key: 'estimated_cost', label: 'Cost', render: (v) => formatCost(v) },
  { key: 'created_at', label: 'Date', render: (v) => formatDateTime(v) },
]

export function ProjectDashboard() {
  const { projectId } = useParams()
  const { project, loading: pLoading, error: pError } = useProject(projectId)
  const { experiments, loading: eLoading } = useExperiments(projectId)

  if (pLoading) return <LoadingSpinner size="lg" className="mt-16" />
  if (pError) return (
    <div className="text-error text-sm bg-red-900/10 border border-error/20 rounded p-3">{pError}</div>
  )
  if (!project) return null

  const allRuns = experiments.flatMap(exp =>
    (exp.recent_runs || []).map(r => ({ ...r, experiment_name: exp.name }))
  ).slice(0, 10)

  const totalRuns = experiments.reduce((acc, e) => acc + (e.run_count || 0), 0)
  const avgCost = experiments.reduce((acc, e) => acc + (e.avg_cost_per_run || 0), 0) / (experiments.length || 1)

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-text-secondary mt-0.5">{project.description}</p>
          )}
          <p className="text-xs text-text-muted mt-1">Created {formatDate(project.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Corpus" value={project.corpus_count ?? 0} />
        <StatCard label="Total Experiments" value={experiments.length} />
        <StatCard label="Total Runs" value={totalRuns} />
        <StatCard label="Avg Cost / Run" value={formatCost(avgCost)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Link to={`/projects/${projectId}/knowledge`}>
          <Card className="hover:border-accent/40 transition-colors">
            <Card.Body className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Knowledge</p>
                <p className="text-xs text-text-muted">Manage corpus & documents</p>
              </div>
            </Card.Body>
          </Card>
        </Link>

        <Link to={`/projects/${projectId}/experiments`}>
          <Card className="hover:border-accent/40 transition-colors">
            <Card.Body className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Experiments</p>
                <p className="text-xs text-text-muted">Run & evaluate RAG pipelines</p>
              </div>
            </Card.Body>
          </Card>
        </Link>

        <Link to={`/projects/${projectId}/configs`}>
          <Card className="hover:border-accent/40 transition-colors">
            <Card.Body className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Configurations</p>
                <p className="text-xs text-text-muted">Manage pipeline configs</p>
              </div>
            </Card.Body>
          </Card>
        </Link>
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-sm font-semibold text-text-primary">Recent Runs</h2>
        </Card.Header>
        {eLoading ? (
          <LoadingSpinner size="md" className="py-8" />
        ) : (
          <Table
            columns={recentRunColumns}
            data={allRuns}
            emptyMessage="No runs yet. Run an experiment to see results here."
          />
        )}
      </Card>
    </div>
  )
}

export default ProjectDashboard
