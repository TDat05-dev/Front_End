import {useEffect, useRef, useState, type FormEvent,} from 'react'
import NavBar from '../../components/NavBar'
import { auth } from '../../auth/auth'
import {on, request, send,} from '../../services/socket'
import type { Contact } from '../../data/contacts'
import styles from '../../assets/css/ChatPage.module.scss'

type Message = {
  id?: number
  name: string
  to: string
  mes: string
  type: 0 | 1
  createAt?: string
}

type DisplayMessage = Message & {
  localKey: string
  pending?: boolean
}

function normalize(value: string) {
  return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
}

function conversationKey(contact: Pick<Contact, 'name' | 'type'>) {
  return `${contact.type}:${contact.name}`
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseMessage(value: unknown): Message | null {
  if (!isRecord(value)) return null

  const type = Number(value.type)

  if (
      typeof value.name !== 'string' ||
      typeof value.to !== 'string' ||
      typeof value.mes !== 'string' ||
      (type !== 0 && type !== 1)
  ) {
    return null
  }

  return {
    name: value.name,
    to: value.to,
    mes: value.mes,
    type,
    id: typeof value.id === 'number' ? value.id : undefined,
    createAt:
        typeof value.createAt === 'string'
            ? value.createAt
            : undefined,
  }
}

function belongsTo(
    message: Message,
    contact: Contact,
    currentUser: string,
) {
  if (contact.type === 1) {
    return message.type === 1 && message.to === contact.name
  }
  return message.type === 0 && (
      (message.name === currentUser && message.to === contact.name) || (message.name === contact.name && message.to === currentUser)
  )
}

function toDisplay(message: Message): DisplayMessage {
  return {
    ...message,
    localKey: crypto.randomUUID(),
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi'
}

export default function ChatPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selected, setSelected] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [keyword, setKeyword] = useState('')
  const [draft, setDraft] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const selectedRef = useRef<Contact | null>(null)
  const historyBusyRef = useRef(false)
  const mountedRef = useRef(false)
  const endRef = useRef<HTMLDivElement>(null)
  const currentUser = auth.user ?? ''
  useEffect(() => {
    mountedRef.current = true
    const offMessage = on('SEND_CHAT', (response) => {
      if (!mountedRef.current) return
      if (response.status !== 'success') {
        setChatError(response.mes || 'Máy chủ từ chối gửi tin nhắn',)
        return
      }
      const message = parseMessage(response.data)
      const me = auth.user
      if (!message || !me) return
      const contactName = message.type === 1 ? message.to : message.name === me ? message.to : message.name
      const contact: Contact = {
        name: contactName,
        type: message.type,
        actionTime: message.createAt ?? '',
      }
      setContacts((previous) => [
        contact,
        ...previous.filter(
            (item) =>
                conversationKey(item) !== conversationKey(contact),
        ),
      ])

      const active = selectedRef.current
      if (!active || !belongsTo(message, active, me)) return
      setMessages((previous) => {

        const pendingIndex = message.name === me ? previous.findIndex((item) => item.pending && item.name === message.name && item.to === message.to && item.type === message.type && item.mes === message.mes,) : -1
        if (pendingIndex >= 0) {
          return previous.map((item, index) =>
              index === pendingIndex ?
                  {
                    ...message,
                    localKey: item.localKey,
                  }
                  : item,
          )
        }
        if (message.id !== undefined && previous.some((item) => item.id === message.id)) {
          return previous
        }
        return [...previous, toDisplay(message)]
      })
    })

    const offRateLimit = on('RATE_LIMIT', (response) => {
      setChatError(
          response.mes ||
          'Bạn thao tác quá nhanh. Hãy chờ rồi thử lại.',
      )
    })
    const offSpam = on('BLOCK_SPAM', (response) => {
      setChatError(response.mes || 'Bạn đã bị chặn thao tác.')
    })

    const offAuth = on('AUTH', (response) => {
      if (response.status === 'error') {
        setNotice('Đang xác thực lại kết nối...')
      }
    })

    const offRelogin = on('RE_LOGIN', (response) => {
      if (response.status === 'success') {
        setNotice('Kết nối đã phục hồi. Tải lại hội thoại và tin nhắn để đồng bộ.')
      } else {
        setChatError('Phiên đã hết hạn. Vui lòng đăng nhập lại.')
      }
    })
    return () => {
      mountedRef.current = false
      offMessage()
      offRateLimit()
      offSpam()
      offAuth()
      offRelogin()
    }
  }, [])
  useEffect(() => {
    let ignore = false
    void loadContacts(() => ignore)
    return () => {
      ignore = true
    }
  }, [])
  useEffect(() => {
    endRef.current?.scrollIntoView({
      block: 'end',
    })
  }, [messages])
  async function loadContacts(
      isIgnored: () => boolean = () => !mountedRef.current,
  ) {
    setLoadingList(true)
    setListError(null)
    try {
      const response = await request<unknown>('GET_USER_LIST')
      if (isIgnored()) return
      if (response.status !== 'success') {
        throw new Error(
            response.mes || 'Không tải được danh sách hội thoại',
        )
      }
      if (!Array.isArray(response.data)) {
        throw new Error(
            'Danh sách hội thoại không đúng định dạng',
        )
      }
      const list: Contact[] = []
      for (const item of response.data) {
        if (!isRecord(item)) continue
        const type = Number(item.type)
        if (
            typeof item.name !== 'string' ||
            !item.name.trim() ||
            (type !== 0 && type !== 1)
        ) {
          continue
        }
        const contact: Contact = {
          name: item.name,
          type,
          actionTime:
              typeof item.actionTime === 'string' ? item.actionTime : ''
        }
        const exists = list.some(
            (existing) =>
                conversationKey(existing) === conversationKey(contact),
        )
        if (!exists) list.push(contact)
      }
      list.sort((a, b) =>
          b.actionTime.localeCompare(a.actionTime),
      )
      setContacts(list)
    } catch (error: unknown) {
      if (!isIgnored()) {
        setListError(getErrorMessage(error))
      }
    } finally {
      if (!isIgnored()) {
        setLoadingList(false)
      }
    }
  }
  async function openConversation(contact: Contact) {
    if (historyBusyRef.current) return
    historyBusyRef.current = true

    const sameConversation = selectedRef.current !== null && conversationKey(selectedRef.current) === conversationKey(contact)

    selectedRef.current = contact
    setSelected(contact)
    setLoadingHistory(true)
    setChatError(null)
    setNotice(null)

    if (!sameConversation) {
      setMessages([])
      setDraft('')
    }

    try {
      const event = contact.type === 1 ? 'GET_ROOM_CHAT_MES' : 'GET_PEOPLE_CHAT_MES'

      const response = await request<unknown>(event, {
        name: contact.name,
        page: 1,
      })

      if (!mountedRef.current) return

      if (response.status !== 'success') {
        throw new Error(response.mes || 'Không tải được lịch sử tin nhắn',)
      }

      let rawMessages: unknown

      if (contact.type === 1) {
        if (!isRecord(response.data) || response.data.name !== contact.name) {
          throw new Error('Dữ liệu phòng chat không đúng định dạng',)
        }
        rawMessages = response.data.chatMess
      } else {
        rawMessages = response.data
      }
      if (!Array.isArray(rawMessages)) {
        throw new Error('Lịch sử tin nhắn không đúng định dạng',)
      }

      const history = rawMessages
          .map(parseMessage)
          .filter((message): message is Message =>
              message !== null && belongsTo(message, contact, currentUser),
          )
          .sort((a, b) =>
              (a.createAt ?? '').localeCompare(b.createAt ?? '') || (a.id ?? 0) - (b.id ?? 0),
          )
          .map(toDisplay)

      setMessages((previous) => {
        if (sameConversation) {
          return history
        }

        const extra = previous.filter((live) =>
            !history.some((saved) =>
                saved.id !== undefined &&
                live.id !== undefined &&
                saved.id === live.id,
            ),
        )
        return [...history, ...extra]
      })
    } catch (error: unknown) {
      if (mountedRef.current) {
        setChatError(getErrorMessage(error))
      }
    } finally {
      historyBusyRef.current = false

      if (mountedRef.current) {
        setLoadingHistory(false)
      }
    }
  }
  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    const contact = selectedRef.current
    if (
        !contact ||
        !text ||
        loadingHistory ||
        !auth.isAuthenticated ||
        !auth.user
    ) {
      return
    }
    setChatError(null)
    try {
      send('SEND_CHAT', {
        type: contact.type === 1 ? 'room' : 'people',
        to: contact.name,
        mes: text,
      })
    } catch {
      setChatError(
          'Không thể gửi tin nhắn. Nội dung nhập vẫn được giữ lại.',
      )
      return
    }
    setMessages((previous) => [
      ...previous,
      {
        localKey: crypto.randomUUID(),
        pending: true,
        name: auth.user!,
        to: contact.name,
        mes: text,
        type: contact.type,
      },
    ])
    setContacts((previous) => [
      contact,
      ...previous.filter(
          (item) =>
              conversationKey(item) !== conversationKey(contact),
      ),
    ])
    setDraft('')
  }
  const filteredContacts = contacts.filter((contact) =>
      normalize(contact.name).includes(
          normalize(keyword.trim()),
      ),
  )
  return (
      <>
        <NavBar />
        <div className={styles.page}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarTop}>
              <h1>Đoạn chat</h1>
              <button type="button" className={styles.iconButton} aria-label="Tải lại hội thoại" disabled={loadingList} onClick={() => void loadContacts()}>
                <i className="fa-solid fa-rotate-right" aria-hidden="true"/>
              </button>
            </div>
            <label className={styles.search}>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true"/>
              <input type="search" placeholder="Tìm hội thoại" aria-label="Tìm hội thoại" value={keyword} onChange={(event) => setKeyword(event.target.value)}/>
            </label>
            <div className={styles.chatList}>
              {loadingList && (
                  <p className={styles.empty}>
                    Đang tải hội thoại...
                  </p>
              )}
              {listError && (
                  <p className={styles.error} role="alert">
                    {listError}
                  </p>
              )}
              {!loadingList &&
                  !listError &&
                  filteredContacts.length === 0 && (
                      <p className={styles.empty}>
                        Không có hội thoại phù hợp
                      </p>
                  )}
              {filteredContacts.map((contact) => {
                const active = selected !== null &&
                    conversationKey(selected) === conversationKey(contact)
                return (
                    <button key={conversationKey(contact)} type="button" disabled={loadingHistory} className={`${styles.chatItem} ${active ? styles.chatItemActive : ''}`} onClick={() => void openConversation(contact)}>
                  <span className={styles.avatar}>
                    {contact.type === 1 ? (
                        <i className="fa-solid fa-users" aria-hidden="true"/>
                    ) : (
                        initials(contact.name)
                    )}
                  </span>
                      <span className={styles.chatInfo}>
                    <span className={styles.name}>
                      {contact.name}
                    </span>
                    <span className={styles.lastMessage}>
                      {contact.type === 1 ? 'Phòng chat' : 'Chat cá nhân'}
                    </span>
                  </span>
                    </button>
                )
              })}
            </div>
          </aside>
          <main className={styles.content}>
            {!selected ? (
                <p className={styles.empty}>
                  Chọn một hội thoại để bắt đầu
                </p>
            ) : (
                <>
                  <header className={styles.header}>
                    <div className={styles.headerUser}>
                  <span className={styles.avatar}>
                    {selected.type === 1 ? (<i className="fa-solid fa-users" aria-hidden="true"/>) : (initials(selected.name))}
                  </span>
                      <div className={styles.headerInfo}>
                        <h2>{selected.name}</h2>
                        <span>{selected.type === 1 ? 'Phòng chat' : 'Chat cá nhân'}</span>
                      </div>
                    </div>
                    <button type="button" className={styles.iconButton} aria-label="Tải lại tin nhắn" disabled={loadingHistory} onClick={() => void openConversation(selected)}>
                      <i className="fa-solid fa-rotate-right" aria-hidden="true"/>
                    </button>
                  </header>
                  {notice && (
                      <p className={styles.notice}>
                        {notice}
                      </p>
                  )}
                  {chatError && (
                      <p className={styles.error} role="alert">
                        {chatError}
                      </p>
                  )}
                  <section className={styles.chatBody}>
                    <div className={styles.messageArea} aria-busy={loadingHistory}>
                      {loadingHistory && (
                          <p className={styles.empty}>
                            Đang tải tin nhắn...
                          </p>
                      )}
                      {!loadingHistory &&
                          !chatError &&
                          messages.length === 0 && (
                              <p className={styles.empty}>
                                Chưa có tin nhắn
                              </p>
                          )}
                      {messages.map((message) => (
                          <div key={message.localKey} className={`${styles.messageRow} ${message.name === currentUser ? styles.mine : ''}`}>
                            <div className={styles.bubble}>
                              {selected.type === 1 &&
                                  message.name !== currentUser && (
                                      <strong className={styles.sender}>
                                        {message.name}
                                      </strong>
                                  )}
                              <p className={styles.messageText}>
                                {message.mes}
                              </p>
                              <small className={styles.messageMeta}>
                                {message.pending ? 'Chờ xác nhận từ máy chủ' : message.createAt ?? ''}
                              </small>
                            </div>
                          </div>
                      ))}
                      <div ref={endRef} />
                    </div>
                    <form className={styles.messageInput} onSubmit={handleSend}>
                      <label className={styles.inputWrapper}>
                        <input type="text" placeholder="Nhập tin nhắn..." aria-label="Nhập tin nhắn" autoComplete="off" value={draft} disabled={loadingHistory} onChange={(event) => setDraft(event.target.value)}/>
                      </label>
                      <button type="submit" className={styles.inputButton} aria-label="Gửi tin nhắn" disabled={loadingHistory || !draft.trim()}>
                        <i className="fa-solid fa-paper-plane" aria-hidden="true"/>
                      </button>
                    </form>
                  </section>
                </>
            )}
          </main>
        </div>
      </>
  )
}