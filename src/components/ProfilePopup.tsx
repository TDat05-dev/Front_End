import styles from '../assets/css/ProfilePopup.module.scss'

type ProfilePopupProps = {
  onClose: () => void
}
type UserProfile = {
  username: string
  avatar?: string
}
const USER: UserProfile = {
  username: 'Thanh Tùng',
}
function initials(name: string) {
  const words = name.trim().split(/\s+/)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export default function ProfilePopup({ onClose }: ProfilePopupProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>Thông tin cá nhân</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Đóng">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>
          <div className={styles.profile}>
          <div className={styles.avatarWrapper}>
            {USER.avatar ? (
              <img className={styles.avatar} src={USER.avatar} alt="Avatar"/>)
                : (
              <span className={styles.avatar}>
                {initials(USER.username)}
              </span>
            )}
          </div>
          <h3 className={styles.username}>
            {USER.username}
          </h3>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.editButton}>
            <i className="fa-solid fa-pen" aria-hidden="true" />
            Chỉnh sửa thông tin
          </button>
        </div>
      </div>
    </div>
  )
}
