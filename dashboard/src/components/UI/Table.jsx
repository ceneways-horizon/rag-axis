export function Table({ columns, data, onRowClick, emptyMessage = 'No data' }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-color">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  border-b border-border-color/50
                  ${idx % 2 === 1 ? 'bg-bg-tertiary/30' : ''}
                  ${onRowClick ? 'cursor-pointer hover:bg-bg-tertiary/60' : 'hover:bg-bg-tertiary/30'}
                  transition-colors
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-text-secondary">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
