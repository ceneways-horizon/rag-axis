import client from '../api/client'
import { API } from '../api/endpoints'
import { useFetch } from './useFetch'
import { useAsync } from './useAsync'

export function useConfigurations(projectId) {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.CONFIGS.LIST(projectId)).then(r => r.data),
    [projectId]
  )
  return { configs: data || [], loading, error, refetch }
}

export function useCreateConfiguration(projectId) {
  const { loading, error, execute } = useAsync()
  const create = (payload) => execute(() => client.post(API.CONFIGS.CREATE(projectId), payload).then(r => r.data))
  return { create, loading, error }
}

export function usePromoteConfiguration(projectId) {
  const { loading, error, execute } = useAsync()
  const promote = (configId) => execute(() => client.post(API.CONFIGS.PROMOTE(projectId, configId)).then(r => r.data))
  return { promote, loading, error }
}

export function useDeleteConfiguration(projectId) {
  const { loading, error, execute } = useAsync()
  const remove = (configId) => execute(() => client.delete(API.CONFIGS.DELETE(projectId, configId)).then(r => r.data))
  return { remove, loading, error }
}
