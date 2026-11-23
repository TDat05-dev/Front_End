import { useEffect, useState, type FormEvent } from 'react'
import styles from '../assets/css/GroupPopup.module.scss'
import { request } from '../services/socket'

type Mode = 'create' | 'join'

interface GroupPopupProps {
  onClose: () => void
  onDone: (name: string) => void
}

interface RoomData {
  name: string
  user?: { id: number; name: string }[]
}

const TEXT = {
  create: {
    event: 'CREATE_ROOM',
    label: 'Tên nhóm mới',
    hint: 'Bạn sẽ là trưởng nhóm. Người khác vào nhóm bằng đúng tên này.',
    button: 'Tạo nhóm',
    success: 'Đã tạo nhóm',
    fail: 'Tên nhóm đã tồn tại, hãy chọn tên khác',
  },
  join: {
    event: 'JOIN_ROOM',
    label: 'Tên nhóm muốn vào',
    hint: 'Nhập chính xác tên nhóm mà bạn bè đã tạo.',
    button: 'Vào nhóm',
    success: 'Đã vào nhóm',
    fail: 'Không tìm thấy nhóm này',
  },
}

export default function GroupPopup({ onClose, onDone }: GroupPopupProps) {
  const [mode, setMode] = useState<Mode>('create')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ name: string; members: number; mode: Mode } | null>(null)
  const text = TEXT[mode]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const changeMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setResult(null)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const roomName = name.trim()
    if (!roomName || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    request<RoomData>(text.event, { name: roomName })
      .then((res) => {
        if (res.status !== 'success') throw new Error(text.fail)
        const savedName = res.data?.name ?? roomName
        setResult({ name: savedName, members: res.data?.user?.length ?? 1, mode })
        setName('')
        onDone(savedName)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} role="dialog" aria-modal="true" aria-labelledby="group-popup-title" onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 id="group-popup-title">Nhóm</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Đóng">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'create'}
            className={`${styles.tab} ${mode === 'create' ? styles.tabActive : ''}`}
            onClick={() => changeMode('create')}
          >
            <i className="fa-solid fa-plus" aria-hidden="true" />
            Tạo nhóm
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'join'}
            className={`${styles.tab} ${mode === 'join' ? styles.tabActive : ''}`}
            onClick={() => changeMode('join')}
          >
            <i className="fa-solid fa-right-to-bracket" aria-hidden="true" />
            Vào nhóm
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="group-name">
            {text.label}
          </label>
          <input
            id="group-name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Nhom_Loza"
            maxLength={50}
            autoFocus
          />
          <p className={styles.hint}>{text.hint}</p>

          {error && <p className={styles.error}>{error}</p>}
          {result && (
            <p className={styles.success}>
              <i className="fa-solid fa-circle-check" aria-hidden="true" />
              {TEXT[result.mode].success} <strong>{result.name}</strong> ({result.members} thành viên)
            </p>
          )}

          <button type="submit" className={styles.submit} disabled={!name.trim() || loading}>
            {loading ? 'Đang xử lý...' : text.button}
          </button>
        </form>
      </div>
    </div>
  )
}
