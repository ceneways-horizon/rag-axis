export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = item[key]
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})
}

export function sortBy(arr, key, dir = 'asc') {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return dir === 'asc' ? -1 : 1
    if (a[key] > b[key]) return dir === 'asc' ? 1 : -1
    return 0
  })
}

export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

export function safeJsonStringify(obj, indent = 2) {
  try {
    return JSON.stringify(obj, null, indent)
  } catch {
    return ''
  }
}
