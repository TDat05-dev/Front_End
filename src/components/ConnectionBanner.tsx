import { useEffect, useRef, useState } from 'react'
import styles from '../assets/css/ConnectionBanner.module.scss'
import { useConnectionStatus } from '../hooks/useConnectionStatus'
import { reconnectNow } from '../services/socket'

export default function ConnectionBanner() {
  const { state, retryAt, retryDelay } = useConnectionStatus()
  const [now, setNow] = useState(() => Date.now())
  const [showRestored, setShowRestored] = useState(false)
  const wasDown = useRef(false)

  useEffect(() => {
    if (state !== 'reconnecting') return
    const timer = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(timer)
  }, [state])

  useEffect(() => {
    if (state === 'reconnecting' || state === 'offline') {
      wasDown.current = true
      return
    }
    if (state !== 'online' || !wasDown.current) return

    wasDown.current = false
    const showTimer = setTimeout(() => setShowRestored(true), 0)
    const hideTimer = setTimeout(() => setShowRestored(false), 2500)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [state])

  if (state === 'offline') {
    return (
      <div className={`${styles.banner} ${styles.offline}`} role="status">
        <i className="fa-solid fa-wifi" aria-hidden="true" />
        <span>Không có kết nối Internet</span>
      </div>
    )
  }

  if (state === 'reconnecting') {
    const seconds = retryAt ? Math.max(0, Math.min(Math.ceil((retryAt - now) / 1000), retryDelay / 1000)) : 0
    return (
      <div className={`${styles.banner} ${styles.warning}`} role="status">
        <i className="fa-solid fa-plug-circle-exclamation" aria-hidden="true" />
        <span>
          Mất kết nối tới máy chủ. {seconds > 0 ? `Thử lại sau ${seconds} giây` : 'Đang kết nối lại...'}
        </span>
        <button type="button" className={styles.retry} onClick={reconnectNow}>
          Thử lại ngay
        </button>
      </div>
    )
  }

  if (showRestored && state === 'online') {
    return (
      <div className={`${styles.banner} ${styles.success}`} role="status">
        <i className="fa-solid fa-circle-check" aria-hidden="true" />
        <span>Đã kết nối lại</span>
      </div>
    )
  }

  return null
}
