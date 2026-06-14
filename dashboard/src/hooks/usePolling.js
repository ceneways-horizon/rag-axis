import { useState, useRef, useCallback, useEffect } from 'react'

// Polls `pollFn` every `interval` ms until it returns a result for which
// `isDone(result)` is true. Used for the ingest 202 + polling flow (ADR-S5).
export function usePolling(pollFn, isDone, interval = 1200) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [polling, setPolling] = useState(false)
  const timerRef = useRef(null)

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setPolling(false)
  }, [])

  const start = useCallback(() => {
    setPolling(true)
    setError(null)

    const tick = async () => {
      try {
        const result = await pollFn()
        setData(result)
        if (isDone(result)) {
          stop()
        } else {
          timerRef.current = setTimeout(tick, interval)
        }
      } catch (e) {
        setError(e.message)
        stop()
      }
    }

    tick()
  }, [pollFn, isDone, interval, stop])

  useEffect(() => () => stop(), [stop])

  return { data, error, polling, start, stop }
}
