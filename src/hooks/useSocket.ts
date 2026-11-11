import { useEffect, useState } from 'react'
import { request } from '../services/socket'

export function useSocket<T>(event: string, params: object = {}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const payload = JSON.stringify(params)

  useEffect(() => {
    let ignore = false

    request<T>(event, JSON.parse(payload))
      .then((res) => {
        if (ignore) return
        if (res.status !== 'success') {
          throw new Error(res.mes || 'Không lấy được dữ liệu')
        }
        setData(res.data ?? null)
        setLoading(false)
      })
      .catch((err: Error) => {
        if (ignore) return
        setError(err.message)
        setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [event, payload])

  return { data, loading, error }
}
