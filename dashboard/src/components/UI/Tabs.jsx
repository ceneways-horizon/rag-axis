export function Tabs({ tabs, activeTab, onTabChange, children }) {
  return (
    <div>
      <div className="flex border-b border-border-color">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
              ${activeTab === tab.id
                ? 'border-info text-info'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{children}</div>
    </div>
  )
}

export default Tabs
