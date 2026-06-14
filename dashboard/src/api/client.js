import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Normalizes the RagAxisError envelope: { error: { type, message, degraded, context } }
client.interceptors.response.use(
  res => res,
  err => {
    const envelope = err.response?.data?.error
    const message = envelope?.message || err.message || 'Unknown error'
    const normalized = new Error(message)
    normalized.type = envelope?.type || 'TransportError'
    normalized.degraded = envelope?.degraded ?? false
    normalized.context = envelope?.context ?? null
    normalized.status = err.response?.status ?? null
    return Promise.reject(normalized)
  }
)

export default client
