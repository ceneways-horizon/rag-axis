import client from '../api/client'
import { API } from '../api/endpoints'
import { useFetch } from './useFetch'
import { useAsync } from './useAsync'

export function useExperiments(projectId) {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.EXPERIMENTS.LIST(projectId)).then(r => r.data),
    [projectId]
  )
  return { experiments: data || [], loading, error, refetch }
}

export function useExperiment(projectId, experimentId) {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.EXPERIMENTS.GET(projectId, experimentId)).then(r => r.data),
    [projectId, experimentId]
  )
  return { experiment: data, loading, error, refetch }
}

export function useCreateExperiment(projectId) {
  const { loading, error, execute } = useAsync()
  const create = (payload) => execute(() => client.post(API.EXPERIMENTS.CREATE(projectId), payload).then(r => r.data))
  return { create, loading, error }
}

export function useRunExperiment(projectId, experimentId) {
  const { loading, error, execute } = useAsync()
  const run = (payload) => execute(() => client.post(API.EXPERIMENTS.RUN(projectId, experimentId), payload).then(r => r.data))
  return { run, loading, error }
}

export function useExperimentMetrics(projectId, experimentId) {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.EXPERIMENTS.METRICS(projectId, experimentId)).then(r => r.data),
    [projectId, experimentId]
  )
  return { metrics: data, loading, error, refetch }
}
