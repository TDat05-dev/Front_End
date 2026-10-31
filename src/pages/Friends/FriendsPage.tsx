import { useMemo, useState } from 'react'
import NavBar from '../../components/NavBar'
import styles from '../../assets/css/FriendsPage.module.scss'
import { FRIENDS, type Friend } from '../../data/friends'

type SortOrder = 'asc' | 'desc'

const MENU = [
  { key: 'friends', icon: 'fa-solid fa-user-group', label: 'Danh sách bạn bè' },
  { key: 'groups', icon: 'fa-solid fa-users', label: 'Danh sách nhóm và cộng đồng' },
  { key: 'friendRequests', icon: 'fa-solid fa-user-plus', label: 'Lời mời kết bạn' },
  { key: 'groupInvites', icon: 'fa-solid fa-envelope-open-text', label: 'Lời mời vào nhóm và cộng đồng' },
]

const AVATAR_COLORS = ['#0068ff', '#12b76a', '#f79009', '#ee46bc', '#7a5af8', '#06aed4']

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

function Avatar({ friend }: { friend: Friend }) {
  if (friend.avatar) {
    return <img className={styles.avatar} src={friend.avatar} alt="" />
  }
  return (
    <span className={styles.avatar} style={{ background: AVATAR_COLORS[friend.id % AVATAR_COLORS.length] }}>
      {initials(friend.name)}
    </span>
  )
}

export default function FriendsPage() {
  const [keyword, setKeyword] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const groups = useMemo(() => {
    const query = normalize(keyword.trim())
    const sorted = FRIENDS
      .filter((f) => normalize(f.name).includes(query))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi') * (sortOrder === 'asc' ? 1 : -1))

    const result: { letter: string; friends: Friend[] }[] = []
    for (const friend of sorted) {
      const letter = normalize(friend.name)[0].toUpperCase()
      const last = result[result.length - 1]
      if (last && last.letter === letter) {
        last.friends.push(friend)
      } else {
        result.push({ letter, friends: [friend] })
      }
    }
    return result
  }, [keyword, sortOrder])

  return (
    <>
      <NavBar />

      <div className={styles.page}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <label className={styles.search}>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input type="search" placeholder="Tìm kiếm" aria-label="Tìm kiếm" />
            </label>
            <button type="button" className={styles.iconButton} aria-label="Thêm bạn">
              <i className="fa-solid fa-user-plus" aria-hidden="true" />
            </button>
            <button type="button" className={styles.iconButton} aria-label="Tạo nhóm">
              <i className="fa-solid fa-users" aria-hidden="true" />
            </button>
          </div>

          <nav className={styles.menu}>
            {MENU.map((item) => (
              <a
                key={item.key}
                href="#"
                className={`${styles.menuItem} ${item.key === 'friends' ? styles.menuItemActive : ''}`}
                aria-current={item.key === 'friends' ? 'page' : undefined}
              >
                <i className={item.icon} aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <main className={styles.content}>
          <header className={styles.header}>
            <i className="fa-solid fa-user-group" aria-hidden="true" />
            <h1>Danh sách bạn bè</h1>
          </header>

          <div className={styles.body}>
            <h2 className={styles.count}>Bạn bè ({FRIENDS.length})</h2>

            <section className={styles.panel}>
              <div className={styles.toolbar}>
                <label className={styles.filter}>
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Tìm bạn"
                    aria-label="Tìm bạn"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </label>

                <label className={styles.select}>
                  <i className="fa-solid fa-arrow-down-a-z" aria-hidden="true" />
                  <select
                    aria-label="Sắp xếp"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  >
                    <option value="asc">Tên (A-Z)</option>
                    <option value="desc">Tên (Z-A)</option>
                  </select>
                </label>
              </div>

              {groups.length === 0 ? (
                <p className={styles.empty}>Không tìm thấy bạn bè nào</p>
              ) : (
                groups.map((group) => (
                  <div key={group.letter} className={styles.group}>
                    <h3 className={styles.letter}>{group.letter}</h3>
                    <ul className={styles.list}>
                      {group.friends.map((friend) => (
                        <li key={friend.id} className={styles.item}>
                          <Avatar friend={friend} />
                          <span className={styles.name}>{friend.name}</span>
                          <button type="button" className={styles.more} aria-label={`Tùy chọn cho ${friend.name}`}>
                            <i className="fa-solid fa-ellipsis" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  )
}
