export function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`bg-bg-secondary rounded-lg border border-border-color ${onClick ? 'cursor-pointer hover:border-info/50 transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 border-b border-border-color ${className}`}>
      {children}
    </div>
  )
}

Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  )
}

export default Card
