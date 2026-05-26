import client from '../api/client'
import { API } from '../api/endpoints'
import { useFetch } from './useFetch'
import { useAsync } from './useAsync'

export function useRuns(projectId, experimentId) {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.EXPERIMENTS.RUNS_LIST(projectId, experimentId)).then(r => r.data),
    [projectId, experimentId]
  )
  return { runs: data || [], loading, error, refetch }
}

export function useRun(projectId, experimentId, runId) {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.EXPERIMENTS.RUN_GET(projectId, experimentId, runId)).then(r => r.data),
    [projectId, experimentId, runId]
  )
  return { run: data, loading, error, refetch }
}

export function useFetchRun() {
  const { loading, error, execute } = useAsync()
  const fetch = (projectId, experimentId, runId) =>
    execute(() => client.get(API.EXPERIMENTS.RUN_GET(projectId, experimentId, runId)).then(r => r.data))
  return { fetch, loading, error }
}
