import { useState } from 'react'
import NavBar from '../../components/NavBar'
import styles from '../../assets/css/FriendsPage.module.scss'
import { useSocket } from '../../hooks/useSocket'
import type { Contact, ContactType } from '../../data/contacts'

type SortOrder = 'asc' | 'desc'
type TabKey = 'all' | ContactType

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
  const words = name.split(/[_-]+/).filter(Boolean)
  if (words.length > 1) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function Avatar({ contact }: { contact: Contact }) {
  return (
      <span className={styles.avatar} style={{ background: AVATAR_COLORS[contact.name.length % AVATAR_COLORS.length] }}>
      {contact.type === 1 ? <i className="fa-solid fa-users" aria-hidden="true" /> : initials(contact.name)}
    </span>
  )
}

export default function FriendsPage() {
  const [keyword, setKeyword] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [tab, setTab] = useState<TabKey>('all')
  const { data, loading, error } = useSocket<Contact[]>('GET_USER_LIST')

  const contacts: Contact[] = (data ?? []).map((c) => ({ ...c, type: Number(c.type) as ContactType }))

  const query = keyword.trim()
  const peopleCount = contacts.filter((c) => c.type === 0).length
  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: contacts.length },
    { key: 0, label: 'Cá nhân', count: peopleCount },
    { key: 1, label: 'Nhóm', count: contacts.length - peopleCount },
  ]

  const sorted = contacts
      .filter((c) => tab === 'all' || c.type === tab)
      .filter((c) => normalize(c.name).includes(normalize(query)))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }) * (sortOrder === 'asc' ? 1 : -1))

  const sections: { letter: string; contacts: Contact[] }[] = []
  for (const contact of sorted) {
    const letter = normalize(contact.name)[0].toUpperCase()
    const last = sections[sections.length - 1]
    if (last && last.letter === letter) {
      last.contacts.push(contact)
    } else {
      sections.push({ letter, contacts: [contact] })
    }
  }

  return (
      <>
        <NavBar />

        <div className={styles.page}>
          <header className={styles.header}>
            <i className="fa-solid fa-address-book" aria-hidden="true" />
            <h1>Danh bạ</h1>
          </header>

          <div className={styles.body}>
            <div className={styles.tabs} role="tablist" aria-label="Lọc danh bạ">
              {tabs.map((t) => (
                  <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={tab === t.key}
                      className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
                      onClick={() => setTab(t.key)}
                  >
                    {t.label} ({t.count})
                  </button>
              ))}
            </div>

            <section className={styles.panel}>
              <div className={styles.toolbar}>
                <label className={styles.filter}>
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                  <input
                      type="search"
                      placeholder={tab === 1 ? 'Tìm nhóm' : 'Tìm theo tên người dùng'}
                      aria-label="Tìm trong danh bạ"
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

              {query && tab !== 1 && (
                  <div className={styles.lookup}>
                <span className={styles.lookupText}>
                  Tìm tài khoản <strong>{query}</strong> trên Loza
                </span>
                    <button type="button" className={styles.primaryButton}>
                      <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Tìm
                    </button>
                  </div>
              )}

              {loading && <p className={styles.empty}>Đang tải danh bạ...</p>}
              {error && <p className={styles.empty}>{error}</p>}

              {!loading && !error && sections.length === 0 && !(query && tab !== 1) && (
                  <p className={styles.empty}>{query ? 'Không có kết quả phù hợp' : 'Danh bạ trống'}</p>
              )}

              {sections.map((section) => (
                  <div key={section.letter} className={styles.group}>
                    <h3 className={styles.letter}>{section.letter}</h3>
                    <ul className={styles.list}>
                      {section.contacts.map((contact) => (
                          <li key={`${contact.type}-${contact.name}`} className={styles.item}>
                            <Avatar contact={contact} />
                            <div className={styles.info}>
                              <span className={styles.name}>{contact.name}</span>
                              <span className={styles.sub}>{contact.type === 1 ? 'Nhóm' : 'Cá nhân'}</span>
                            </div>
                          </li>
                      ))}
                    </ul>
                  </div>
              ))}
            </section>
          </div>
        </div>
      </>
  )
}
