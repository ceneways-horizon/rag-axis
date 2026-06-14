export const STATUS_COLORS = {
  active: 'success',
  ready: 'success',
  indexed: 'success',
  completed: 'success',
  healthy: 'success',
  success: 'success',
  error: 'error',
  unhealthy: 'error',
  failed: 'error',
  indexing: 'warning',
  processing: 'warning',
  degraded: 'warning',
  draft: 'muted',
  staging: 'info',
  production: 'success',
  running: 'info',
  pending: 'muted',
}

export const TOAST_DURATION = 3500

export const RECHARTS_COLORS = {
  primary: '#4285f4',
  success: '#34a853',
  error: '#ea4335',
  warning: '#fbbc04',
  cost: '#ff6d00',
  grid: '#2d3748',
  text: '#9aa0a6',
}

// Per-citation confidence is a signal, not decoration — both the citation
// badges and the result-level confidence/retrieval-quality cards read off
// this single threshold definition.
export const CONFIDENCE_THRESHOLDS = {
  high: 0.8,
  medium: 0.5,
}

export function confidenceVariant(confidence) {
  if (confidence == null) return 'muted'
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'success'
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return 'warning'
  return 'error'
}
