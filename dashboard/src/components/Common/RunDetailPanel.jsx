import { SidePanel } from '../UI/SidePanel'
import { LoadingSpinner } from '../UI/LoadingSpinner'
import { ErrorCard } from './ErrorCard'
import { RunResultView } from './RunResultView'
import { useRun } from '../../hooks/useApi'

export function RunDetailPanel({ runId, open, onClose }) {
  const { run, loading, error } = useRun(open ? runId : null)

  return (
    <SidePanel open={open} title="Run Detail" onClose={onClose}>
      {loading && <LoadingSpinner size="lg" className="mt-10" />}
      {error && <ErrorCard error={error} title="Failed to load run" />}
      {!loading && !error && run && <RunResultView result={run} />}
    </SidePanel>
  )
}

export default RunDetailPanel
