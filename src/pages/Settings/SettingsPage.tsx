import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/NavBar'
import AccountSection from './AccountSection'
import styles from '../../assets/css/SettingsPage.module.scss'
import { useTheme } from '../../hooks/useTheme'
import type { Theme } from '../../utils/theme'
import { logout } from '../../services/socket'

type TabKey = 'account' | 'appearance' | 'logout'

const THEME_OPTIONS: { value: Theme; icon: string; label: string }[] = [
  { value: 'light', icon: 'fa-regular fa-sun', label: 'Sáng' },
  { value: 'dark', icon: 'fa-regular fa-moon', label: 'Tối' },
]

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'account', icon: 'fa-regular fa-user', label: 'Thông tin tài khoản' },
  { key: 'appearance', icon: 'fa-solid fa-palette', label: 'Giao diện' },
  { key: 'logout', icon: 'fa-solid fa-right-from-bracket', label: 'Đăng xuất' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('account')
  const [loggingOut, setLoggingOut] = useState(false)
  const logoutBusyRef = useRef(false)
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  async function handleLogout() {
    if (logoutBusyRef.current) return
    logoutBusyRef.current = true
    setLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <NavBar />

      <div className={styles.page}>
        <aside className={styles.sidebar}>
          <header className={styles.sidebarHeader}>
            <h1>Cài đặt</h1>
          </header>

          <nav className={styles.menu} aria-label="Mục cài đặt">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`${styles.menuItem} ${activeTab === tab.key ? styles.menuItemActive : ''}`}
                aria-current={activeTab === tab.key ? 'page' : undefined}
                disabled={loggingOut}
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={tab.icon} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className={styles.content}>
          {activeTab === 'account' && <AccountSection />}

          {activeTab === 'appearance' && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Giao diện</h2>
              <p className={styles.description}>Chọn chế độ hiển thị cho Loza</p>

              <div className={styles.themeOptions} role="radiogroup" aria-label="Chế độ giao diện">
                {THEME_OPTIONS.map((option) => (
                <button key={option.value} type="button" role="radio" aria-checked={theme === option.value}
                    className={`${styles.themeOption} ${theme === option.value ? styles.themeOptionActive : ''}`}
                    onClick={() => setTheme(option.value)}>
                    <span className={`${styles.themePreview} ${option.value === 'dark' ? styles.themePreviewDark : ''}`}>
                      <i className={option.icon} aria-hidden="true" />
                    </span>
                    <span>{option.label}</span>
                </button>
                ))}
              </div>
            </section>
          )}

          {/* ---------- Đăng xuất ---------- */}
          {activeTab === 'logout' && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Đăng xuất</h2>
              <p className={styles.description}>
                Đăng xuất khỏi tài khoản trên thiết bị này. Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng.
              </p>
              <div className={styles.actions}>
                <button type="button" className={styles.dangerButton} disabled={loggingOut} aria-busy={loggingOut} onClick={() => void handleLogout()}>
                  <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  )
}
