import { LoadingSpinner } from './LoadingSpinner'

const variantClasses = {
  primary: 'bg-info text-white hover:bg-blue-600 border border-transparent',
  secondary: 'bg-bg-tertiary text-text-primary hover:bg-bg-secondary border border-border-color',
  danger: 'bg-error text-white hover:bg-red-600 border border-transparent',
}

const sizeClasses = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-8 px-4 text-sm',
  lg: 'h-9 px-5 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded font-medium
        transition-colors duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading && <LoadingSpinner size="sm" className="inline-flex" />}
      {children}
    </button>
  )
}

export default Button
