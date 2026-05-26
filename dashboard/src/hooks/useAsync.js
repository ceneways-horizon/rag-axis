import { useState, useCallback } from 'react'

export function useAsync() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (asyncFn) => {
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFn()
      return result
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, execute }
}
