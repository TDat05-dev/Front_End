import { useState } from 'react'
import NavBar from '../../components/NavBar'
import styles from '../../assets/css/SettingsPage.module.scss'
import { useTheme } from '../../hooks/useTheme'
import type { Theme } from '../../utils/theme'

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
  const { theme, setTheme } = useTheme()

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
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={tab.icon} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className={styles.content}>
          {activeTab === 'account' && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Thông tin tài khoản</h2>

              <div className={styles.avatarRow}>
                <span className={styles.avatar}>NA</span>
                <div>
                  <button type="button" className={styles.secondaryButton}>
                    <i className="fa-solid fa-camera" aria-hidden="true" /> Đổi ảnh đại diện
                  </button>
                  <p className={styles.hint}>JPG, PNG hoặc WEBP, tối đa 2MB</p>
                </div>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Tên đăng nhập</span>
                <input className={styles.input} defaultValue="nguyenvana" disabled />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Tên hiển thị</span>
                <input className={styles.input} name="displayName" defaultValue="Nguyễn Văn A" />
              </label>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Ngày sinh</span>
                  <input className={styles.input} type="date" name="birthday" defaultValue="2005-01-01" />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Giới tính</span>
                  <select className={styles.input} name="gender" defaultValue="male">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Giới thiệu bản thân</span>
                <textarea className={`${styles.input} ${styles.textarea}`} name="bio" placeholder="Viết vài dòng về bạn..." />
              </label>

              <div className={styles.actions}>
                <button type="button" className={styles.primaryButton}>Lưu thay đổi</button>
              </div>
            </section>
          )}

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
                <button type="button" className={styles.dangerButton}>
                  <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Đăng xuất
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  )
}
