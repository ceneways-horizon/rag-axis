import { useState } from 'react'

export function Disclosure({ title, defaultOpen = false, badge, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-border-color rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-bg-tertiary/60 hover:bg-bg-tertiary transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
          {title}
          {badge}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 py-3 border-t border-border-color">{children}</div>}
    </div>
  )
}

export default Disclosure
