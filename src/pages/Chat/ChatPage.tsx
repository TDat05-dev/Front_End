import { useState } from 'react'
import NavBar from '../../components/NavBar'
import styles from '../../assets/css/ChatPage.module.scss'
type ChatUser = {
  id: number
  name: string
  avatar?: string
  lastMessage: string
  time: string
  online: boolean
}
const CHATS: ChatUser[] = [
  {
    id: 1,
    name: 'Nguyễn Minh Anh',
    lastMessage: 'Chào bạn, hôm nay bạn thế nào?',
    time: '10:30',
    online: true,
  },
]
const AVATAR_COLORS = ['#0068ff', '#12b76a', '#f79009', '#ee46bc']
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}
function initials(name: string) {
  const words = name.trim().split(/\s+/)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? words[words.length - 1][0] : ''

  return (first + last).toUpperCase()
}
function Avatar({ user }: { user: ChatUser }) {
  if (user.avatar) {
    return (
      <img className={styles.avatar} src={user.avatar} alt=""/>
    )
  }
  return (
    <span className={styles.avatar} style={{background: AVATAR_COLORS[user.id % AVATAR_COLORS.length],}}>
      {initials(user.name)}
    </span>
  )
}
export default function ChatPage() {
  const [keyword, setKeyword] = useState('')
  const [selectedChat, setSelectedChat] = useState<ChatUser>(CHATS[0])
  const filteredChats = CHATS.filter((chat) =>
    normalize(chat.name).includes(normalize(keyword.trim())),
  )
  return (
    <>
      <NavBar />
      <div className={styles.page}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <h1>Đoạn chat</h1>
            <button type="button" className={styles.iconButton} aria-label="Tạo đoạn chat mới">
              <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
            </button>
          </div>
          <label className={styles.search}>
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"/>
            <input type="search" placeholder="Tìm kiếm" aria-label="Tìm kiếm đoạn chat" value={keyword} onChange={(e) => setKeyword(e.target.value)}/>
          </label>
          <div className={styles.chatList}>
            {filteredChats.length === 0 ? (<p className={styles.empty}>Không tìm thấy đoạn chat nào</p>) : (filteredChats.map((chat) => (
                <button key={chat.id} type="button" className={`${styles.chatItem} ${selectedChat.id === chat.id ? styles.chatItemActive : ''}`} onClick={() => setSelectedChat(chat)}>
                  <div className={styles.avatarWrapper}>
                    <Avatar user={chat} />
                    {chat.online && (
                      <span className={styles.online} />
                    )}
                  </div>
                  <div className={styles.chatInfo}>
                    <span className={styles.name}>
                      {chat.name}
                    </span>
                    <span className={styles.lastMessage}>
                      {chat.lastMessage}
                    </span>
                  </div>
                  <span className={styles.time}>
                    {chat.time}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>
        <main className={styles.content}>
          <header className={styles.header}>
            <div className={styles.headerUser}>
              <div className={styles.avatarWrapper}>
                <Avatar user={selectedChat} />
                {selectedChat.online && (
                  <span className={styles.online} />
                )}
              </div>
              <div className={styles.headerInfo}>
                <h2>{selectedChat.name}</h2>
                <span>
                  {selectedChat.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
                </span>
              </div>
            </div>
          </header>
          <section className={styles.chatBody}>
            <div className={styles.messageArea}>
            </div>
            <div className={styles.messageInput}>
              <button type="button" className={styles.inputButton} aria-label="Đính kèm">
                <i className="fa-solid fa-paperclip" aria-hidden="true" />
              </button>
              <button type="button" className={styles.inputButton} aria-label="Icon">
                <i className="fa-solid fa-face-smile" aria-hidden='true'></i>
              </button>
              <label className={styles.inputWrapper}>
                <input type="text" placeholder="Nhập tin nhắn..." aria-label="Nhập tin nhắn"/>
              </label>
              <button type="button" className={styles.inputButton} aria-label="Gửi tin nhắn">
                <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              </button>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
