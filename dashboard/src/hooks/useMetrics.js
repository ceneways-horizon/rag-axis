import client from '../api/client'
import { API } from '../api/endpoints'
import { useFetch } from './useFetch'

export function useMetrics(projectId, experimentId) {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.EXPERIMENTS.METRICS(projectId, experimentId)).then(r => r.data),
    [projectId, experimentId]
  )
  return { metrics: data, loading, error, refetch }
}

export function useHealth() {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.HEALTH).then(r => r.data),
    []
  )
  return { health: data, loading, error, refetch }
}

export function useTelemetry() {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.TELEMETRY).then(r => r.data),
    []
  )
  return { telemetry: data, loading, error, refetch }
}
