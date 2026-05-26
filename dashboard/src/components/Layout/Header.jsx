import { useParams } from 'react-router-dom'

export function Header({ title, subtitle, actions }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  )
}

export default Header
