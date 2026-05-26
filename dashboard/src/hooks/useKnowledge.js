import client from '../api/client'
import { API } from '../api/endpoints'
import { useFetch } from './useFetch'
import { useAsync } from './useAsync'

export function useCorpora(projectId) {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.KNOWLEDGE.CORPUS_LIST(projectId)).then(r => r.data),
    [projectId]
  )
  return { corpora: data || [], loading, error, refetch }
}

export function useCreateCorpus(projectId) {
  const { loading, error, execute } = useAsync()
  const create = (payload) => execute(() => client.post(API.KNOWLEDGE.CORPUS_CREATE(projectId), payload).then(r => r.data))
  return { create, loading, error }
}

export function useDocuments(projectId) {
  const { data, loading, error, refetch } = useFetch(
    () => client.get(API.KNOWLEDGE.DOCS_LIST(projectId)).then(r => r.data),
    [projectId]
  )
  return { documents: data || [], loading, error, refetch }
}

export function useUploadDocument(projectId) {
  const { loading, error, execute } = useAsync()
  const upload = (formData) => execute(() =>
    client.post(API.KNOWLEDGE.DOCS_UPLOAD(projectId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data)
  )
  return { upload, loading, error }
}

export function useDeleteDocument(projectId) {
  const { loading, error, execute } = useAsync()
  const remove = (docId) => execute(() => client.delete(API.KNOWLEDGE.DOC_DELETE(projectId, docId)).then(r => r.data))
  return { remove, loading, error }
}
