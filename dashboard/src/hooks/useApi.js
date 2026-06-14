import { useFetch } from './useFetch'
import * as api from '../api'

export function useOverview() {
  const { data, loading, error, refetch } = useFetch(() => api.getOverview(), [])
  return { overview: data, loading, error, refetch }
}

export function useCorpora() {
  const { data, loading, error, refetch } = useFetch(() => api.getCorpora(), [])
  return { corpora: data?.corpora || [], loading, error, refetch }
}

export function useCorpus(corpusId) {
  const { data, loading, error, refetch } = useFetch(() => api.getCorpus(corpusId), [corpusId])
  return { corpus: data, loading, error, refetch }
}

export function useExperiments() {
  const { data, loading, error, refetch } = useFetch(() => api.getExperiments(), [])
  return { experiments: data?.experiments || [], loading, error, refetch }
}

export function useExperiment(expId) {
  const { data, loading, error, refetch } = useFetch(() => api.getExperiment(expId), [expId])
  return { experiment: data, loading, error, refetch }
}

export function useRuns(filters = {}) {
  const key = JSON.stringify(filters)
  const { data, loading, error, refetch } = useFetch(() => api.getRuns(filters), [key])
  return { runs: data?.runs || [], total: data?.total || 0, loading, error, refetch }
}

export function useRun(runId) {
  const { data, loading, error, refetch } = useFetch(
    () => (runId ? api.getRun(runId) : Promise.resolve(null)),
    [runId]
  )
  return { run: data, loading, error, refetch }
}

export function useHealth() {
  const { data, loading, error, refetch } = useFetch(() => api.getHealth(), [])
  return { health: data, loading, error, refetch }
}

export function useConfig() {
  const { data, loading, error, refetch } = useFetch(() => api.getConfig(), [])
  return { config: data, loading, error, refetch }
}
