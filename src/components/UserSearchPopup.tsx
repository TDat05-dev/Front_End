import { useEffect, useState } from 'react'
import styles from '../assets/css/UserSearchPopup.module.scss'
import { auth } from '../auth/auth'
import { addContact, getAddedContacts } from '../data/addedContacts'
import type { Contact } from '../data/contacts'
import { request } from '../services/socket'

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/
const AVATAR_COLORS = ['#0068ff', '#12b76a', '#f79009', '#ee46bc', '#7a5af8', '#06aed4']

type LookupState = 'idle' | 'loading' | 'found' | 'notFound' | 'error'

interface UserSearchPopupProps {
  contacts: Contact[]
  loading: boolean
  onClose: () => void
  onAdded: () => void
}

function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function initials(name: string) {
  const words = name.split(/[_-]+/).filter(Boolean)
  if (words.length > 1) return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default function UserSearchPopup({ contacts, loading, onClose, onAdded }: UserSearchPopupProps) {
  const me = auth.user ?? ''
  const [keyword, setKeyword] = useState('')
  const [added, setAdded] = useState(() => getAddedContacts(me).map((c) => c.name))
  const [lookup, setLookup] = useState<{ name: string; state: LookupState; message?: string }>({ name: '', state: 'idle' })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const query = keyword.trim()
  const users = [...new Set([...contacts.filter((c) => c.type === 0).map((c) => c.name), ...added])]
    .filter((name) => name !== me)
    .sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }))
  const filtered = users.filter((name) => normalize(name).includes(normalize(query)))

  const canLookup =
    USERNAME_PATTERN.test(query) &&
    query.toLowerCase() !== me.toLowerCase() &&
    !loading &&
    !users.some((name) => name.toLowerCase() === query.toLowerCase())

  useEffect(() => {
    if (!canLookup) return
    let ignore = false
    const timer = setTimeout(() => {
      setLookup({ name: query, state: 'loading' })
      request<{ status: boolean }>('CHECK_USER_EXIST', { user: query })
        .then((res) => {
          if (ignore) return
          if (res.status !== 'success') {
            setLookup({ name: query, state: 'error', message: res.mes || 'Máy chủ báo lỗi' })
            return
          }
          setLookup({ name: query, state: res.data?.status === true ? 'found' : 'notFound' })
        })
        .catch((err: Error) => {
          if (!ignore) setLookup({ name: query, state: 'error', message: err.message })
        })
    }, 500)
    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [query, canLookup])

  const handleAdd = (name: string) => {
    addContact(me, name)
    setAdded((prev) => [...prev, name])
    onAdded()
  }

  const renderRow = (name: string) => {
    const inChat = added.includes(name)
    return (
      <li key={name} className={styles.item}>
        <span className={styles.avatar} style={{ background: AVATAR_COLORS[name.length % AVATAR_COLORS.length] }}>
          {initials(name)}
        </span>
        <div className={styles.info}>
          <span className={styles.name}>{name}</span>
          <span className={styles.sub}>{inChat ? 'Đã thêm vào trò chuyện' : 'Tài khoản Loza'}</span>
        </div>
        {inChat ? (
          <span className={styles.addedIcon} aria-label="Đã thêm">
            <i className="fa-solid fa-check" aria-hidden="true" />
          </span>
        ) : (
          <button type="button" className={styles.addButton} aria-label={`Thêm ${name} vào trò chuyện`} onClick={() => handleAdd(name)}>
            <i className="fa-solid fa-plus" aria-hidden="true" />
          </button>
        )}
      </li>
    )
  }

  const currentLookup = lookup.name === query ? lookup.state : 'loading'

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} role="dialog" aria-modal="true" aria-labelledby="user-search-title" onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 id="user-search-title">Tìm người dùng</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Đóng">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <label className={styles.search}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            placeholder="Nhập tên người dùng"
            aria-label="Nhập tên người dùng"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            autoFocus
          />
        </label>

        <div className={styles.results}>
          {canLookup && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Tìm chính xác</h3>
              {currentLookup === 'found' ? (
                <ul className={styles.list}>{renderRow(query)}</ul>
              ) : (
                <p className={styles.note}>
                  {currentLookup === 'notFound' && <>Không có tài khoản <strong>{query}</strong></>}
                  {currentLookup === 'error' && <>Không kiểm tra được <strong>{query}</strong>: {lookup.message}</>}
                  {currentLookup === 'loading' && <>Đang tìm <strong>{query}</strong>...</>}
                </p>
              )}
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Người dùng ({filtered.length})
            </h3>
            {loading && <p className={styles.note}>Đang tải danh sách người dùng...</p>}
            {!loading && filtered.length === 0 && (
              <p className={styles.note}>
                {query ? 'Không có ai trùng tên' : 'Chưa nhắn tin với ai. Gõ đúng tên đăng nhập để tìm người mới.'}
              </p>
            )}
            {!loading && filtered.length > 0 && <ul className={styles.list}>{filtered.map(renderRow)}</ul>}
          </div>
        </div>
      </div>
    </div>
  )
}
