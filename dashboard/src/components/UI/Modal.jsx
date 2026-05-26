import { useEffect } from 'react'
import { Button } from './Button'

export function Modal({ open, title, onClose, children, onConfirm, confirmLabel = 'Save', confirmVariant = 'primary', loading = false }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-bg-secondary border border-border-color rounded-lg w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {children}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-color">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          {onConfirm && (
            <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal
