import client from '../api/client'
import { API } from '../api/endpoints'
import { useFetch } from './useFetch'
import { useAsync } from './useAsync'

export function useProjects() {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.PROJECTS.LIST).then(r => r.data),
    []
  )
  return { projects: data || [], loading, error, refetch }
}

export function useProject(id) {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.PROJECTS.GET(id)).then(r => r.data),
    [id]
  )
  return { project: data, loading, error, refetch }
}

export function useCreateProject() {
  const { loading, error, execute } = useAsync()
  const create = (payload) => execute(() => client.post(API.PROJECTS.CREATE, payload).then(r => r.data))
  return { create, loading, error }
}

export function useDeleteProject() {
  const { loading, error, execute } = useAsync()
  const remove = (id) => execute(() => client.delete(API.PROJECTS.DELETE(id)).then(r => r.data))
  return { remove, loading, error }
}
