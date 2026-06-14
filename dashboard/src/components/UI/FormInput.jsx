export function FormInput({ label, error, className = '', as = 'input', children, ...props }) {
  const fieldClass = `w-full bg-bg-tertiary border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors ${
    error ? 'border-error' : 'border-border-color'
  } ${className}`

  return (
    <div>
      {label && <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>}
      {as === 'textarea' && <textarea className={`${fieldClass} resize-none`} {...props} />}
      {as === 'select' && <select className={fieldClass} {...props}>{children}</select>}
      {as === 'input' && <input className={fieldClass} {...props} />}
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  )
}

export default FormInput
