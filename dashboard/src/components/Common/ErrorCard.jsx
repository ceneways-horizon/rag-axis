import { safeJsonStringify } from '../../utils/helpers'

// Renders a fatal RagAxisError envelope: { type, message, degraded, context }
export function ErrorCard({ error, title = 'Request failed' }) {
  if (!error) return null

  const type = error.type || 'TransportError'
  const message = error.message || String(error)
  const context = error.context

  return (
    <div className="border border-error/30 bg-red-900/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 text-error flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-semibold text-error">{title}</span>
        <span className="ml-auto text-xs font-mono text-error/80 bg-error/10 px-2 py-0.5 rounded">{type}</span>
      </div>
      <p className="text-sm text-text-secondary mt-1">{message}</p>
      {context && (
        <pre className="mt-2 text-xs font-mono text-text-muted bg-bg-tertiary rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
          {safeJsonStringify(context)}
        </pre>
      )}
    </div>
  )
}

export default ErrorCard
